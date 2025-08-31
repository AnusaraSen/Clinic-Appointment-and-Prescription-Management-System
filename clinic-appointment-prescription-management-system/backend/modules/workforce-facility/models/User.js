// ...existing code...
const mongoose = require("mongoose");

/**
 * User Model - The people who use our system! 👤
 * 
 * This represents everyone from patients to doctors to admin staff.
 * We keep the basics here - name, contact info, role, etc.
 * (Add password/auth fields later when we build the login system)
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
      values: ["Patient", "Doctor", "Pharmacist", "Admin", "LabStaff", "InventoryManager", "LabSupervisor"],
      message: 'That role isn\'t recognized in our system'
    }
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

/* Optional virtuals or methods can be added here */

/* Export model */
const User = mongoose.model("User", userSchema, 'users');
module.exports = User;
// ...existing code...