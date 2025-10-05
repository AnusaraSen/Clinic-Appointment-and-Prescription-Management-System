/**
 * User ID Format Migration Script
 * Converts existing user_id from "U001" format to "USR-1234" format
 * 
 * Usage:
 *   node scripts/fixUserIds.js --dry-run    (preview changes)  
 *   node scripts/fixUserIds.js --execute    (apply changes)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/workforce-facility/models/User');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Convert old format to new format
 * U001 → USR-0001
 * U010 → USR-0010
 */
function convertUserId(oldId) {
  // Extract number part (e.g., "001" from "U001")
  const numberPart = oldId.substring(1);
  // Pad to 4 digits and add USR- prefix
  const paddedNumber = numberPart.padStart(4, '0');
  return `USR-${paddedNumber}`;
}

/**
 * Find users with old format user_id
 */
async function findUsersToFix() {
  try {
    // Find users with user_id that doesn't match USR-#### pattern
    const users = await User.find({
      user_id: { $not: /^USR-\d{4}$/ }
    }).select('_id user_id email name');

    console.log(`🔍 Found ${users.length} users with old user_id format`);
    return users;
  } catch (error) {
    console.error('❌ Error finding users:', error.message);
    return [];
  }
}

/**
 * Perform dry run
 */
async function dryRun() {
  console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  console.log('=' .repeat(80));
  
  const users = await findUsersToFix();
  
  if (users.length === 0) {
    console.log('✨ No users need user_id format fixes!');
    return;
  }

  console.log('\n📋 User ID conversions that would be made:\n');
  console.log('| Old ID  | New ID   | Email                    | Name           |');
  console.log('|---------|----------|--------------------------|----------------|');

  const conversions = [];
  
  for (const user of users) {
    const newId = convertUserId(user.user_id);
    conversions.push({ user, oldId: user.user_id, newId });
    
    const oldId = user.user_id.padEnd(7);
    const newIdStr = newId.padEnd(8);
    const email = user.email.padEnd(24);
    const name = user.name.padEnd(14);
    
    console.log(`| ${oldId} | ${newIdStr} | ${email} | ${name} |`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total users to fix: ${users.length}`);
  
  console.log('\n🔧 Conversion examples:');
  console.log('   U001 → USR-0001');
  console.log('   U010 → USR-0010');
  console.log('   U123 → USR-0123');
  
  console.log('\n🚀 To execute migration, run: node scripts/fixUserIds.js --execute');
}

/**
 * Execute the migration
 */
async function executeMigration() {
  console.log('\n🚀 EXECUTING USER ID MIGRATION - Making real changes\n');
  console.log('=' .repeat(80));
  
  const users = await findUsersToFix();
  
  if (users.length === 0) {
    console.log('✨ No users need user_id format fixes!');
    return;
  }

  console.log(`\n📝 Fixing ${users.length} user IDs...\n`);
  
  const results = {
    success: [],
    errors: []
  };

  // Process users one by one to avoid conflicts
  for (const user of users) {
    const oldId = user.user_id;
    const newId = convertUserId(oldId);
    
    try {
      // Use updateOne with validation disabled to avoid the current validation issue
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { user_id: newId } }
      );
      
      results.success.push({ oldId, newId, email: user.email });
      console.log(`   ✅ ${oldId} → ${newId} (${user.email})`);
      
    } catch (error) {
      console.error(`   ❌ Failed to update ${oldId}: ${error.message}`);
      results.errors.push({ user: user._id, oldId, error: error.message });
    }
  }

  // Display results
  console.log('\n📊 Migration Results:');
  console.log(`   ✅ Successfully updated: ${results.success.length}`);
  console.log(`   ❌ Failed updates: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(err => {
      console.log(`   • User ${err.oldId}: ${err.error}`);
    });
  }

  if (results.success.length > 0) {
    console.log('\n✅ Updated user IDs:');
    results.success.forEach(result => {
      console.log(`   • ${result.oldId} → ${result.newId} (${result.email})`);
    });
  }

  console.log('\n✨ User ID migration completed!');
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isExecute = args.includes('--execute');

  if (!isDryRun && !isExecute) {
    console.log('❌ Please specify --dry-run or --execute');
    console.log('\nUsage:');
    console.log('  node scripts/fixUserIds.js --dry-run    (preview changes)');
    console.log('  node scripts/fixUserIds.js --execute    (apply changes)');
    process.exit(1);
  }

  console.log('🔧 User ID Format Migration Script');
  console.log('Converting U001 format to USR-0001 format\n');

  try {
    await connectDB();
    
    if (isDryRun) {
      await dryRun();
    } else if (isExecute) {
      await executeMigration();
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Migration interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
main();
