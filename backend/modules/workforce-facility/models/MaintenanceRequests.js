const mongoose = require('mongoose');

/**
 * Maintenance Request Model - When stuff breaks, this tracks the fix! 🔧
 * 
 * Think of this as a digital work order. Someone reports a problem,
 * we assign it to a technician, track the progress, and log the cost.
 * Pretty straightforward, but super important for keeping things running!
 */
const maintenanceRequestSchema = new mongoose.Schema({
  request_id: { 
    type: String, 
    // required: true,  // Temporarily commented - let pre-save hook generate it
    uppercase: true, 
    trim: true 
    // We'll auto-generate this as MR-1001, MR-1002, etc.
    // Note: Removed unique: true here since we define it in schema.index() below
  },
  title: { 
    type: String, 
    required: [true, 'What needs fixing? Give it a title!'], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Tell us more about the problem'], 
    trim: true 
  },
  status: {
    type: String,
    enum: {
      values: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      message: 'Status must be one of: Open, In Progress, Completed, or Cancelled'
    },
    default: 'Open'
  },
  priority: {
    type: String,
    enum: {
      values: ['Critical','High', 'Medium', 'Low'],
      message: 'Priority should be High, Medium, or Low'
    },
    default: 'Medium'  // Most things are medium priority
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Who reported this issue?'] 
  },
  cost: { 
    type: Number, 
    min: [0, 'Cost can\'t be negative'], 
    default: 0  // Start at zero, update when we know the actual cost
  },
  // Category for the work request (maintenance, repair, inspection, etc.)
  category: {
    type: String,
    trim: true,
    default: 'maintenance'
  },
  // Estimated hours to complete the request
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours must be non-negative'],
    default: null
  },
  // Free-form notes or additional instructions
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Technician', 
    default: null  // Unassigned initially
  },
  time: { 
    type: String, 
    trim: true 
    // For preferred time like "09:30" - could add validation later
  },
  date: { 
    type: Date, 
    default: null  // When should this be done?
  },
  equipment: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipment' 
    // What equipment is involved? Could be multiple items
  }]
}, {
  timestamps: true,  // Tracks when created and last modified
  versionKey: false,  // Don't need the __v field
  toJSON: {
    virtuals: true,  // Include virtual fields in JSON output
    transform(doc, ret) {
      // Clean up the output - use 'id' instead of '_id'
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Auto-generate request ID when creating new requests
// Creates IDs like MR-1001, MR-1002, etc.
maintenanceRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.request_id) {
    try {
      // Find the highest existing request ID to get the next number
      const lastRequest = await this.constructor.findOne(
        { request_id: { $regex: /^MR-\d{4}$/ } }, 
        { request_id: 1 }
      ).sort({ request_id: -1 });
      
      let nextNumber = 1001;  // Start at 1001
      if (lastRequest && lastRequest.request_id) {
        const currentNumber = parseInt(lastRequest.request_id.split('-')[1], 10);
        if (!isNaN(currentNumber)) {
          nextNumber = currentNumber + 1;
        }
      }
      
      this.request_id = `MR-${String(nextNumber).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

maintenanceRequestSchema.index({ request_id: 1 }, { unique: true });
maintenanceRequestSchema.index({ status: 1, priority: 1, date: -1 });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema, 'maintenance_requests');

module.exports = MaintenanceRequest;