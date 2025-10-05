// 404 handler for unmatched routes.
module.exports = (req, res, next) => {
  res.status(404).json({ message: 'Not found' });
};
