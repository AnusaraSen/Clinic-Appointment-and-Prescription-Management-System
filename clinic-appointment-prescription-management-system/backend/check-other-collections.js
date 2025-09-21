// Check other medicine-related collections
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkOtherCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB - clinic_db');
    
    // Check medicine_inventory collection
    const medInventoryCount = await mongoose.connection.db.collection('medicine_inventory').countDocuments();
    console.log(`\nmedicine_inventory collection: ${medInventoryCount} documents`);
    
    if (medInventoryCount > 0) {
      const samples = await mongoose.connection.db.collection('medicine_inventory').find({}).limit(3).toArray();
      console.log('Sample data from medicine_inventory:');
      samples.forEach((item, index) => {
        console.log(`${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
    }
    
    // Check lab_inventory collection  
    const labInventoryCount = await mongoose.connection.db.collection('lab_inventory').countDocuments();
    console.log(`\nlab_inventory collection: ${labInventoryCount} documents`);
    
    if (labInventoryCount > 0) {
      const samples = await mongoose.connection.db.collection('lab_inventory').find({}).limit(2).toArray();
      console.log('Sample data from lab_inventory:');
      samples.forEach((item, index) => {
        console.log(`${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOtherCollections();
