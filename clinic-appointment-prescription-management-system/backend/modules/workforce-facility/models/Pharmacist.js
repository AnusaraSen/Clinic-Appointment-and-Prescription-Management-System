const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pharmacistSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  // Professional Information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    uppercase: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Clinical Pharmacy',
      'Hospital Pharmacy',
      'Community Pharmacy',
      'Industrial Pharmacy',
      'Regulatory Affairs',
      'Pharmaceutical Research',
      'Other'
    ]
  },
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    default: 'Pharmacy'
  },
  shift: {
    type: String,
    required: [true, 'Shift is required'],
    enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Rotating']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Junior Pharmacist', 'Senior Pharmacist', 'Chief Pharmacist', 'Pharmacy Manager'],
    default: 'Junior Pharmacist'
  },

  // Permissions and Access
  permissions: {
    canDispenseMedicine: {
      type: Boolean,
      default: true
    },
    canViewPrescriptions: {
      type: Boolean,
      default: true
    },
    canManageInventory: {
      type: Boolean,
      default: false
    },
    canGenerateReports: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  },

  // Status and Availability
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Suspended'],
    default: 'Active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },

  // Profile and Settings
  profileImage: {
    type: String,
    default: null
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },

  // Audit and Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loginHistory: [{
    loginTime: Date,
    ipAddress: String,
    userAgent: String,
    location: String
  }],

  // Additional Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
pharmacistSchema.index({ email: 1 });
pharmacistSchema.index({ licenseNumber: 1 });
pharmacistSchema.index({ status: 1 });
pharmacistSchema.index({ department: 1 });
pharmacistSchema.index({ createdAt: -1 });

// Virtual for full name
pharmacistSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Encrypt password before saving
pharmacistSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
pharmacistSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// Match user entered password to hashed password in database
pharmacistSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
pharmacistSchema.methods.updateLastLogin = async function(ipAddress, userAgent, location = 'Unknown') {
  this.lastLogin = Date.now();
  this.isOnline = true;
  
  // Add to login history (keep last 10 logins)
  this.loginHistory.unshift({
    loginTime: Date.now(),
    ipAddress,
    userAgent,
    location
  });
  
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }
  
  await this.save();
};

// Set offline status
pharmacistSchema.methods.setOffline = async function() {
  this.isOnline = false;
  await this.save();
};

// Check if pharmacist has specific permission
pharmacistSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Get pharmacist summary for responses
pharmacistSchema.methods.getSummary = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    licenseNumber: this.licenseNumber,
    specialization: this.specialization,
    department: this.department,
    role: this.role,
    status: this.status,
    isOnline: this.isOnline,
    permissions: this.permissions
  };
};

module.exports = mongoose.model('Pharmacist', pharmacistSchema);