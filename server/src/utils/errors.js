export class AppError extends Error {
  constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with these details already exists.' });
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'An unexpected server error occurred.' : err.message });
}
