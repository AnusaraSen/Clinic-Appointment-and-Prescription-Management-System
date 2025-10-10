const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

loginEventSchema.index({ timestamp: 1 });

const LoginEvent = mongoose.models.LoginEvent || mongoose.model('LoginEvent', loginEventSchema, 'login_events');
module.exports = LoginEvent;
