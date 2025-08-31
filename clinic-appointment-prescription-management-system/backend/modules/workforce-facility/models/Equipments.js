const mongoose = require('mongoose');

/**
 * Equipment Model - All the stuff that keeps our clinic running! ⚙️
 * 
 * This tracks every piece of equipment from MRI machines to coffee makers.
 * We need to know where it is, what condition it's in, and when it needs maintenance.
 * Because nobody wants the X-ray machine to break down during a busy day!
 */
const equipmentSchema = new mongoose.Schema({
  equipment_id: {
    type: String,
    required: [true, 'Every piece of equipment needs an ID!'],
    uppercase: true,
    match: [/^EQ-\d{4}$/, 'Equipment ID should look like EQ-1234']
    // Note: Removed unique: true here since we define it in schema.index() below
  },
  name: {
    type: String,
    required: [true, 'What do we call this equipment?'],
    trim: true,
    maxLength: [100, 'Equipment name is getting a bit long - try to keep it under 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Where can we find this equipment?'],
    trim: true,
    maxLength: [200, 'Location description is quite detailed - maybe simplify?']
  },
  type: {
    type: String,
    required: [true, 'What kind of equipment is this?'],
    trim: true
    // Could be 'Medical Device', 'IT Equipment', 'Furniture', etc.
  },
  status: {
    type: String,
    enum: {
      values: ['Operational', 'Under Maintenance', 'Out of Service', 'Needs Repair', 'Scheduled for Maintenance'],
      message: 'Equipment status must be one of the predefined options'
    },
    default: 'Operational',  // Most equipment starts working fine
    required: true
  },
  isCritical: { 
    type: Boolean, 
    default: false 
    // Is this equipment essential? (like life support vs. office printer)
  },
  downtimeHours: { 
    type: Number, 
    min: [0, 'Downtime hours can\'t be negative'], 
    default: 0 
    // How long has this been out of service?
  },
  lastMaintenance: { 
    type: Date 
    // When did we last service this?
  },
  nextMaintenance: {
    type: Date,
    validate: {
      validator: function (v) {
        // Either no date set, or it should be a valid date
        return !v || v instanceof Date;
      },
      message: 'Next maintenance date should be a valid date'
    }
  },
  manufacturer: { type: String, trim: true },
  modelNumber: { type: String, trim: true },
  serialNumber: { type: String, trim: true },
  purchaseDate: {
    type: Date,
    validate: {
      validator: function (v) { return !v || v <= new Date(); },
      message: 'purchaseDate cannot be in the future'
    }
  },
  warrantyExpiry: { type: Date },
  maintenanceInterval: { type: Number, min: 1, max: 365, default: 90 },
  activeMaintenanceRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceRequest' }],
  notes: { type: String, trim: true, maxLength: [1000, 'Notes too long'] }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

/* Indexes */
equipmentSchema.index({ equipment_id: 1 }, { unique: true });
equipmentSchema.index({ status: 1, isCritical: -1 });
equipmentSchema.index({ nextMaintenance: 1 });
equipmentSchema.index({ location: 1, type: 1 });

/* Auto-generate equipment_id if not provided */
equipmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.equipment_id) {
    try {
      const last = await this.constructor.findOne({ equipment_id: { $regex: /^EQ-\d{4}$/ } }, { equipment_id: 1 }).sort({ equipment_id: -1 });
      let nextNum = 1001;
      if (last && last.equipment_id) {
        const n = parseInt(last.equipment_id.split('-')[1], 10);
        if (!isNaN(n)) nextNum = n + 1;
      }
      this.equipment_id = `EQ-${String(nextNum).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

/* Instance methods */
equipmentSchema.methods.scheduleNextMaintenance = function (date) {
  this.nextMaintenance = date;
  if (this.status === 'Operational') this.status = 'Scheduled for Maintenance';
  return this.save();
};

equipmentSchema.methods.completeMaintenance = function () {
  this.lastMaintenance = new Date();
  if (this.maintenanceInterval) {
    const d = new Date();
    d.setDate(d.getDate() + this.maintenanceInterval);
    this.nextMaintenance = d;
  }
  this.status = 'Operational';
  return this.save();
};

/* Statics */
equipmentSchema.statics.findDueForMaintenance = function (daysAhead = 7) {
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);
  return this.find({ nextMaintenance: { $lte: future }, status: { $ne: 'Out of Service' } })
    .sort({ isCritical: -1, nextMaintenance: 1 });
};

const Equipment = mongoose.model('Equipment', equipmentSchema, 'equipments');

module.exports = Equipment;
