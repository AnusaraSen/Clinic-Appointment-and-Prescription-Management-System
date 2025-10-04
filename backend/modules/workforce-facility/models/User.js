// ...existing code...
const mongoose = require("mongoose");

/**
 * User Model - The people who use our system! 👤
 * 
 * This represents everyone from patients to doctors to admin staff.
 * Enhanced with authentication fields for secure login system.
 * Includes password hashing, tokens, and security features.
 */
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, 'Every user needs an ID!'],
    uppercase: true,
    trim: true,
    match: [/^USR-\d{4}$/, 'User ID should look like USR-1234']
    // Note: Removed unique: true here since we define it in schema.index() below
  },
  name: {
    type: String,
    required: [true, 'We need to know what to call you!'],
    trim: true,
    maxlength: [100, 'Name is a bit too long - keep it under 100 characters']
  },
  age: {
    type: Number,
    min: [0, 'Age can\'t be negative!'],
    max: [150, 'That age seems a bit unrealistic...']
  },
  gender: {
    type: String,
    enum: {
      values: ['Male','Female','Other','Prefer not to say'],
      message: 'Please pick from the available gender options'
    }
  },
  dob: { 
    type: Date,
    // Could add validation here to make sure birth date isn't in the future
  },
  address: { 
    type: String, 
    trim: true, 
    maxlength: [500, 'Address is getting quite long - maybe summarize?'] 
  },
  email: {
    type: String,
    required: [true, 'Email is required for important updates'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'That doesn\'t look like a valid email address']
    // Note: Removed unique: true here since we define it in schema.index() below
  },
  phone: { 
    type: String, 
    trim: true 
    // TODO: Add phone number validation pattern
  },
  role: {
    type: String,
    required: [true, 'We need to know what role this user has'],
    enum: {
      values: ["Patient", "Doctor", "Pharmacist", "Admin", "LabStaff", "InventoryManager", "LabSupervisor", "Technician"],
      message: 'That role isn\'t recognized in our system'
    }
  },

  // 🔐 Authentication Fields
  password: {
    type: String,
    required: function() {
      // Password required for all roles except Patient (they can set it later)
      return this.role !== 'Patient';
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    // Note: Password will be hashed before saving, so no max length needed
  },

  // 🔄 Token Management
  refreshToken: {
    type: String,
    default: null
    // Stores current refresh token for this user session
  },

  // 👤 Account Status
  isActive: {
    type: Boolean,
    default: true,
    // Admin can deactivate accounts if needed
  },

  // 🔐 Password Security
  passwordChangedAt: {
    type: Date,
    default: null
    // Track when password was last changed
  },

  passwordResetToken: {
    type: String,
    default: null
    // Temporary token for password reset process
  },

  passwordResetExpires: {
    type: Date,
    default: null
    // When the password reset token expires
  },

  // 📊 Login Tracking
  lastLogin: {
    type: Date,
    default: null
    // Track when user last logged in
  },

  loginAttempts: {
    type: Number,
    default: 0
    // Track failed login attempts for security
  },

  lockUntil: {
    type: Date,
    default: null
    // Account lockout timestamp after too many failed attempts
  },

  // 🎯 User Preferences
  isFirstLogin: {
    type: Boolean,
    default: true
    // Force password change on first login
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      // expose id, hide internal fields
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

/* Indexes */
userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ refreshToken: 1 }); // For token cleanup
userSchema.index({ passwordResetToken: 1 }); // For password reset
userSchema.index({ isActive: 1, role: 1 }); // For user queries

/* Authentication Methods */
const { hashPassword, comparePassword } = require('../../../utils/passwordUtils');

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    this.password = await hashPassword(this.password);
    this.passwordChangedAt = new Date();
    console.log('🔐 Password hashed for user:', this.email);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await comparePassword(candidatePassword, this.password);
};

/**
 * Check if account is locked
 */
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Increment login attempts
 */
userSchema.methods.incLoginAttempts = function() {
  // Max 5 attempts before 15-minute lockout
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Previous lock expired, reset attempts
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
    console.log('🔒 Account locked for user:', this.email);
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

/* Optional virtuals or methods can be added here */

/* Export model */
const User = mongoose.model("User", userSchema, 'users');
module.exports = User;
// ...existing code...