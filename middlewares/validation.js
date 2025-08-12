import { body, param, query } from 'express-validator';
import { WasteType, ReportStatus } from '../models/WasteReport.js';

/**
 * Core validation error formatter
 */
const formatValidationError = (error) => ({
  field: error.path,
  value: error.value,
  message: error.msg,
  type: error.type
});

/**
 * Central error handler for validation chains
 */
export const validate = (validations) => [
  validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: 'Validation failed',
        details: errors.array().map(formatValidationError)
      });
    }
    next();
  }
];

// ==================== Waste-Specific Validators ====================

export const validateWasteReport = validate([
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters')
    .escape(),
  
  body('location')
    .isObject()
    .withMessage('Location must be a valid GeoJSON object')
    .custom((value) => {
      if (!value.coordinates || !Array.isArray(value.coordinates)) {
        throw new Error('Invalid location format');
      }
      return true;
    }),
    
  body('wasteType')
    .isIn(Object.values(WasteType))
    .withMessage(`Invalid waste type. Valid types: ${Object.values(WasteType).join(', ')}`),
    
  body('quantity')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Quantity must be between 0.1 and 1000 kg')
]);

export const validatePickupSchedule = validate([
  body('collectorId')
    .isMongoId()
    .withMessage('Invalid collector ID format'),
    
  body('scheduledDate')
    .isISO8601()
    .withMessage('Invalid date format (ISO8601 required)')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Pickup date must be in the future');
      }
      return true;
    }),
    
  body('pointsUsed')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Points must be between 1-1000')
]);

export const validateReportId = validate([
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID format')
]);

export const validateReportStatusUpdate = validate([
  body('status')
    .isIn(Object.values(ReportStatus))
    .withMessage(`Invalid status. Valid statuses: ${Object.values(ReportStatus).join(', ')}`),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
]);

export const validateReportQuery = validate([
  query('status')
    .optional()
    .isIn(Object.values(ReportStatus))
    .withMessage(`Invalid status filter`),
    
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Radius must be between 0.1-50 km'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100')
]);

// ==================== User-Specific Validators ====================

export const validateUserLocation = validate([
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Invalid coordinates format'),
    
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be numbers')
]);

// ==================== Reusable Validators ====================

export const validateMongoId = (field) => validate([
  param(field)
    .isMongoId()
    .withMessage('Invalid ID format')
]);

export const validatePagination = validate([
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100')
]);