/**
 * notFound
 * Catches any request that did not match a registered route and
 * returns a clean 404 JSON response instead of an HTML Express error page.
 */
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * errorHandler
 * Global error-handling middleware.
 * Express identifies this as error middleware because it accepts 4 arguments (err, req, res, next).
 * Place this LAST in app.js, after all routes.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('🔥  Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
}
