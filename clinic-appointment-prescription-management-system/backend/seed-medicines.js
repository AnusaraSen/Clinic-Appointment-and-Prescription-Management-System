// Check and seed medicine data
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkAndSeedMedicines() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB - clinic_db');
    
    // Check both collections
    console.log('\n=== CHECKING COLLECTIONS ===');
    
    const medicinesCount = await mongoose.connection.db.collection('medicines').countDocuments();
    console.log(`medicines collection: ${medicinesCount} documents`);
    
    const medicineInventoryCount = await mongoose.connection.db.collection('medicine_inventory').countDocuments();
    console.log(`medicine_inventory collection: ${medicineInventoryCount} documents`);
    
    // Show sample data from medicine_inventory if it exists
    if (medicineInventoryCount > 0) {
      console.log('\n=== SAMPLE DATA FROM medicine_inventory ===');
      const samples = await mongoose.connection.db.collection('medicine_inventory').find({}).limit(3).toArray();
      samples.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item._id}`);
        console.log(`   Name: ${item.medicineName || item.name || 'Unknown'}`);
        console.log(`   Fields: ${Object.keys(item).join(', ')}`);
        console.log('');
      });
    } else {
      console.log('\n=== CREATING SAMPLE MEDICINE DATA ===');
      const sampleMedicines = [
        {
          medicine_id: "MED001",
          medicineName: "Paracetamol",
          genericName: "Acetaminophen",
          strength: "500mg",
          unit: "Tablets",
          dosageForm: "Tablet",
          batchNumber: "BTH001",
          expiryDate: new Date("2025-12-31"),
          manufactureDate: new Date("2024-01-15")
        },
        {
          medicine_id: "MED002", 
          medicineName: "Amoxicillin",
          genericName: "Amoxicillin",
          strength: "250mg",
          unit: "Capsules",
          dosageForm: "Capsule",
          batchNumber: "BTH002",
          expiryDate: new Date("2026-06-30"),
          manufactureDate: new Date("2024-02-10")
        },
        {
          medicine_id: "MED003",
          medicineName: "Ibuprofen",
          genericName: "Ibuprofen", 
          strength: "400mg",
          unit: "Tablets",
          dosageForm: "Tablet",
          batchNumber: "BTH003",
          expiryDate: new Date("2025-10-15"),
          manufactureDate: new Date("2024-03-05")
        }
      ];
      
      const result = await mongoose.connection.db.collection('medicine_inventory').insertMany(sampleMedicines);
      console.log(`✅ Inserted ${result.insertedCount} sample medicines`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAndSeedMedicines();
