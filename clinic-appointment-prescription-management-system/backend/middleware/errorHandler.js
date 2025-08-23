// Central error handler. Ensure this is the last non-process middleware.
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: 'Internal server error' });
};
