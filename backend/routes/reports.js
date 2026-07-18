const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get weekly report
router.get('/weekly/:businessId', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { businessId } = req.params;
    const requestingBusinessId = req.businessId;

    // Verify access
    if (businessId !== requestingBusinessId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get this week's data
    const report = await db.one(
      `SELECT 
        COUNT(DISTINCT o.id) as total_conversations,
        COUNT(CASE WHEN o.outcome_type = 'rebooked' THEN 1 END) as rebooked,
        SUM(CASE WHEN o.outcome_type = 'rebooked' THEN o.revenue_recovered ELSE 0 END) as revenue_from_rebooked,
        COUNT(CASE WHEN o.outcome_type = 'paid' THEN 1 END) as paid,
        SUM(CASE WHEN o.outcome_type = 'paid' THEN o.revenue_recovered ELSE 0 END) as revenue_from_paid,
        COUNT(CASE WHEN c.status = 'escalated' THEN 1 END) as escalated,
        COUNT(CASE WHEN c.status = 'active' THEN 1 END) as pending
       FROM outcomes o
       JOIN conversations c ON o.conversation_id = c.id
       WHERE o.business_id = $1
       AND o.created_at >= NOW() - INTERVAL '7 days'`,
      [businessId]
    );

    const total_revenue = (report.revenue_from_rebooked || 0) + (report.revenue_from_paid || 0);

    res.json({
      week_ending: new Date().toISOString().split('T')[0],
      ...report,
      total_revenue_recovered: total_revenue
    });
  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Export data as CSV
router.get('/csv/:businessId', authMiddleware, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { businessId } = req.params;
    const requestingBusinessId = req.businessId;

    // Verify access
    if (businessId !== requestingBusinessId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get data
    const outcomes = await db.manyOrNone(
      `SELECT 
        cust.name as customer_name,
        t.trigger_type,
        c.status,
        o.outcome_type,
        o.revenue_recovered,
        o.created_at
       FROM outcomes o
       JOIN conversations c ON o.conversation_id = c.id
       JOIN triggers t ON o.trigger_id = t.id
       JOIN customers cust ON o.customer_id = cust.id
       WHERE o.business_id = $1
       ORDER BY o.created_at DESC`,
      [businessId]
    );

    // Convert to CSV
    let csv = 'Customer Name,Trigger Type,Status,Outcome,Revenue Recovered,Date\n';
    outcomes.forEach(row => {
      csv += `${row.customer_name},${row.trigger_type},${row.status},${row.outcome_type},${row.revenue_recovered},${row.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
  } catch (error) {
    logger.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
