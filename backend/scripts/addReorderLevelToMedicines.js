const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic_db');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Migration script to add reorderLevel to all medicines
const addReorderLevel = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('medicine_inventory');
    
    // Get all medicines
    const medicines = await collection.find({}).toArray();
    console.log(`Found ${medicines.length} medicines`);
    
    // Update all medicines that don't have reorderLevel
    let updated = 0;
    for (const medicine of medicines) {
      if (medicine.reorderLevel === undefined || medicine.reorderLevel === null) {
        await collection.updateOne(
          { _id: medicine._id },
          { $set: { reorderLevel: 5 } } // Set default value
        );
        updated++;
        console.log(`Updated medicine: ${medicine.medicineName} (ID: ${medicine._id}) - added reorderLevel: 5`);
      } else {
        console.log(`Medicine: ${medicine.medicineName} (ID: ${medicine._id}) already has reorderLevel: ${medicine.reorderLevel}`);
      }
    }
    
    console.log(`\nMigration complete! Updated ${updated} medicines.`);
    
    // Verify the update
    const verifyMedicines = await collection.find({}).toArray();
    console.log('\n=== Verification ===');
    verifyMedicines.forEach(med => {
      console.log(`${med.medicineName}: reorderLevel = ${med.reorderLevel}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
addReorderLevel();
