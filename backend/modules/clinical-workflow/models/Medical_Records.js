const mongoose = require('mongoose');

const schema = mongoose.Schema;

const patientSchema = new schema({
  patient_ID: { 
    type: String,
    required: true 
},

  patient_name: {
     type: String, 
     required: true 
    },

  patient_age: { 
    type: Number, 
    required: true 
},

  

  Gender: { 
    type: String, 
    required: true
},

  Email: { 
    type: String, 
    required: true 
},

  Emergency_Contact: { type: String,
    required: true
   },

  Allergies: { type: String},
  
  Current_medical_conditions: { type: String },

  Past_surgeries: { type: String },

  Blood_group: { type: String },

  Smoking_status: { type: String },

  Alcohol_consumption: { type: String },

  // Store photo as base64 string (from file upload or webcam)
  photo: {
    type: String,
    validate: {
      validator: v => !v || v.startsWith('data:image/'),
      message: props => `${props.value} is not a valid base64 image string`
    }
  },
  mimeType: { type: String },
  size: { type: Number },
  createdAt: { type: Date, default: Date.now }
});


// Pre-save hook to set mimeType and size if photo is set
patientSchema.pre('save', function(next) {
  if (this.isModified('photo') && this.photo) {
    const matches = this.photo.match(/^data:(.+?);base64,/);
    this.mimeType = matches ? matches[1] : 'application/octet-stream';
    this.size = Buffer.byteLength(this.photo, 'utf8');
  }
  next();
});

const patient = mongoose.model('Medical_Records', patientSchema);
module.exports = patient;