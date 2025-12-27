const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Load test data from JSON file
 * @param {string} fileName - Name of the test data file
 * @returns {Object} Parsed test data
 */
function loadTestData(fileName = 'testData.json') {
  const filePath = path.join(__dirname, '..', 'data', fileName);
  const rawData = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(rawData);
  data = replaceEnvVariables(data);
  return data;
}

/**
 * Recursively replace environment variable placeholders in object
 * @param {*} obj - Object to process
 * @returns {*} Processed object
 */
function replaceEnvVariables(obj) {
  if (typeof obj === 'string') {
    const matches = obj.match(/\$\{([^}]+)\}/g);
    if (matches) {
      let result = obj;
      matches.forEach((match) => {
        const varName = match.slice(2, -1);
        const envValue = process.env[varName] || '';
        result = result.replace(match, envValue);
      });
      return result;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceEnvVariables(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = replaceEnvVariables(obj[key]);
    }
    return result;
  }

  return obj;
}

/**
 * Generate unique email address
 * @param {string} prefix - Email prefix
 * @returns {string} Unique email
 */
function generateUniqueEmail(prefix = 'testuser') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@test.com`;
}

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate expected total from items
 * @param {Array} items - Array of items with price and quantity
 * @returns {number} Calculated total
 */
function calculateExpectedTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Round to 2 decimal places
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
function roundToTwoDecimals(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Compare two prices with tolerance
 * @param {number} actual - Actual price
 * @param {number} expected - Expected price
 * @param {number} tolerance - Tolerance (default 0.01)
 * @returns {boolean} Whether prices match within tolerance
 */
function comparePrices(actual, expected, tolerance = 0.01) {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format date for logging
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date = new Date()) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value
 * @returns {string} Environment value or fallback
 */
function getEnvVar(key, fallback = '') {
  return process.env[key] || fallback;
}

/**
 * Log test step completion
 * @param {string} stepName - Name of the step
 * @param {string} status - Status of the step (SUCCESS, FAILED, etc.)
 */
function logStep(stepName, status = 'SUCCESS') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✓ STEP: ${stepName} - ${status}`);
}

/**
 * Log action completion
 * @param {string} actionName - Name of the action
 * @param {string} details - Additional details about the action
 */
function logAction(actionName, details = '') {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` | ${details}` : '';
  console.log(`[${timestamp}] ▶ ACTION: ${actionName}${detailsStr}`);
}

/**
 * Log assertion result
 * @param {string} assertionName - Name of the assertion
 * @param {boolean} passed - Whether assertion passed
 * @param {string} details - Additional details
 */
function logAssertion(assertionName, passed = true, details = '') {
  const timestamp = new Date().toISOString();
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const detailsStr = details ? ` | ${details}` : '';
  console.log(`[${timestamp}] ${status}: ${assertionName}${detailsStr}`);
}

module.exports = {
  loadTestData,
  generateUniqueEmail,
  generateRandomString,
  calculateExpectedTotal,
  roundToTwoDecimals,
  comparePrices,
  sleep,
  formatDate,
  getEnvVar,
  logStep,
  logAction,
  logAssertion,
};
