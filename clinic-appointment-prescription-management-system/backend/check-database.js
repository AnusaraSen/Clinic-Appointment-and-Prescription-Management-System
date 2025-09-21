// Script to check what's in your database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if medicines collection exists and count documents
    if (collections.some(col => col.name === 'medicines')) {
      const medicinesCount = await mongoose.connection.db.collection('medicines').countDocuments();
      console.log(`\nMedicines collection contains ${medicinesCount} documents`);
      
      if (medicinesCount > 0) {
        const samples = await mongoose.connection.db.collection('medicines').find({}).limit(3).toArray();
        console.log('\nSample medicines:');
        samples.forEach((med, index) => {
          console.log(`${index + 1}. ${med.medicineName || med.name || 'Unknown'} - ID: ${med._id}`);
        });
      }
    }
    
    // Check lab inventory
    if (collections.some(col => col.name === 'labinventories')) {
      const labCount = await mongoose.connection.db.collection('labinventories').countDocuments();
      console.log(`\nLab inventory collection contains ${labCount} documents`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
