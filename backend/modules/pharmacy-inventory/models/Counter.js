const mongoose = require('mongoose');

// Generic counter collection for sequential IDs
// { _id: 'medicine', seq: Number }
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Reuse existing compiled model if present to avoid overwrite errors when
// different modules load their own Counter model file.
module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema, 'counters');
