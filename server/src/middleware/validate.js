import { AppError } from '../utils/errors.js';
export function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '');
    if (missing.length) return next(new AppError(`Required fields: ${missing.join(', ')}`, 400));
    next();
  };
}
