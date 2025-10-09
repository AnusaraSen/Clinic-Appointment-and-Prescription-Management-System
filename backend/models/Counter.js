const mongoose = require('mongoose');

// Generic counter collection for atomic sequential IDs
// Each document: { _id: 'user_id', seq: Number }
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema, 'counters');
