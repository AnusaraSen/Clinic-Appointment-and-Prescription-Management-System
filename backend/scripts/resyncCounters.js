/**
 * Resync Counter Script
 * 
 * This script resyncs the counter collection with the actual highest IDs in the database.
 * Run this if you're getting duplicate key errors due to counter desync.
 * 
 * Usage: node scripts/resyncCounters.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('../modules/workforce-facility/models/User');
const Counter = require('../models/Counter');

async function resyncCounters() {
  try {
    console.log('🔄 Starting counter resync...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the highest user_id number currently in the database
    const highestUser = await User.findOne()
      .sort({ user_id: -1 })
      .select('user_id')
      .lean();

    if (!highestUser || !highestUser.user_id) {
      console.log('ℹ️ No users found in database. Setting counter to 0.');
      await Counter.findOneAndUpdate(
        { _id: 'user_id' },
        { seq: 0 },
        { upsert: true }
      );
      console.log('✅ Counter reset to 0');
      return;
    }

    // Extract the numeric part from user_id (e.g., "USR-0006" -> 6)
    const match = highestUser.user_id.match(/USR-(\d+)/);
    if (!match) {
      console.error('❌ Invalid user_id format:', highestUser.user_id);
      return;
    }

    const highestNumber = parseInt(match[1], 10);
    console.log(`📊 Highest user_id in database: ${highestUser.user_id} (number: ${highestNumber})`);

    // Get current counter value
    const currentCounter = await Counter.findOne({ _id: 'user_id' }).lean();
    const currentSeq = currentCounter ? currentCounter.seq : 0;
    console.log(`📊 Current counter value: ${currentSeq}`);

    if (highestNumber >= currentSeq) {
      // Counter is behind, update it
      await Counter.findOneAndUpdate(
        { _id: 'user_id' },
        { seq: highestNumber },
        { upsert: true }
      );
      console.log(`✅ Counter updated from ${currentSeq} to ${highestNumber}`);
      console.log(`✅ Next user will be: USR-${String(highestNumber + 1).padStart(4, '0')}`);
    } else {
      // Counter is ahead (which is fine)
      console.log(`✅ Counter is already ahead of highest user ID. No update needed.`);
      console.log(`✅ Next user will be: USR-${String(currentSeq + 1).padStart(4, '0')}`);
    }

    console.log('✅ Counter resync complete!');

  } catch (error) {
    console.error('❌ Error resyncing counters:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the resync
resyncCounters();
