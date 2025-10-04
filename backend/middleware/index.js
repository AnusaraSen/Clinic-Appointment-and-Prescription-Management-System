// Aggregate export for middleware modules to simplify imports in server.js
module.exports = {
  corsMiddleware: require('./cors'),
  parsers: require('./parsers'),
  logger: require('./logger'),
  notFound: require('./notFound'),
  errorHandler: require('./errorHandler'),
  validation: require('./validation'),
  queryProcessing: require('./queryProcessing'),
  responseFormatting: require('./responseFormatting'),
  resourceValidation: require('./resourceValidation')
};
