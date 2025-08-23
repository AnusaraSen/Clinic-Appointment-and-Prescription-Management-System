const morgan = require('morgan');

// HTTP request logger. In production you might switch to 'combined' or a custom stream.
module.exports = morgan('dev');
