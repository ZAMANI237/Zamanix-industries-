const { body, validationResult } = require('express-validator');

const validateEmail = () => body('email').isEmail().normalizeEmail();
const validatePassword = () => body('password').isLength({ min: 8 });
const validatePhone = () => body('phone').isMobilePhone();
const validatePhoneNumber = () => body('phoneNumber').isMobilePhone();
const validateMessage = () => body('message').isLength({ min: 1, max: 160 });

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validatePhoneNumber,
  validateMessage,
  handleValidationErrors
};
