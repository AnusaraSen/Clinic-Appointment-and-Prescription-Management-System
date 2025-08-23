const cors = require('cors');

// Configure CORS. Adjust origin whitelist as needed for production.
module.exports = cors({ origin: true, credentials: true });
