const fs = require('fs');
const path = require('path');
const pgPromise = require('pg-promise');
const config = require('../config/env');
const logger = require('../utils/logger');

const pgp = pgPromise();
const db = pgp(config.database.url);

async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Read schema file
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    
    // Execute schema
    await db.none(schema);
    logger.info('✓ Database schema created successfully');
    
    // Verify tables exist
    const tables = await db.manyOrNone(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    
    logger.info(`✓ Created ${tables.length} tables:`);
    tables.forEach(t => logger.info(`  - ${t.table_name}`));
    
    await pgp.end();
    logger.info('✓ Database initialization complete');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
