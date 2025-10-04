const mongoose = require('mongoose');
require('dotenv').config();

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check lab_supervisors collection indexes
    const db = mongoose.connection.db;
    const collection = db.collection('lab_supervisors');
    
    const indexes = await collection.indexes();
    console.log('📋 lab_supervisors collection indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Index:`, JSON.stringify(index, null, 2));
    });

    // Check if there are any documents with wrong field names
    const docs = await collection.find().limit(5).toArray();
    console.log('\n📄 Sample documents in lab_supervisors:');
    docs.forEach((doc, i) => {
      console.log(`${i + 1}.`, JSON.stringify(doc, null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

checkIndexes();