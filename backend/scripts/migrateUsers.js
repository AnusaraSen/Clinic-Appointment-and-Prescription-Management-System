/**
 * User Migration Script - Step 1C
 * Adds authentication fields to existing users in the database
 * 
 * This script:
 * 1. Finds all existing users without password fields
 * 2. Generates temporary passwords for staff/admin accounts
 * 3. Adds required authentication fields
 * 4. Provides dry-run mode for safety
 * 
 * Usage:
 *   node scripts/migrateUsers.js --dry-run    (preview changes)
 *   node scripts/migrateUsers.js --execute    (apply changes)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/workforce-facility/models/User');
const { generateTempPassword, hashPassword } = require('../utils/passwordUtils');

// Migration configuration
const CONFIG = {
  DEFAULT_TEMP_PASSWORD: 'TempPass123!', // Meets our password requirements
  BATCH_SIZE: 10,
  ADMIN_ROLES: ['Admin'],
  STAFF_ROLES: ['Doctor', 'Pharmacist', 'Technician', 'LabStaff', 'InventoryManager', 'LabSupervisor'],
  PATIENT_ROLES: ['Patient']
};

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
 * Find users that need migration (missing password field)
 */
async function findUsersToMigrate() {
  try {
    const users = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    }).select('_id name email role createdAt');

    console.log(`🔍 Found ${users.length} users needing migration`);
    return users;
  } catch (error) {
    console.error('❌ Error finding users:', error.message);
    return [];
  }
}

/**
 * Generate migration data for a user
 */
function generateMigrationData(user) {
  const isStaff = [...CONFIG.ADMIN_ROLES, ...CONFIG.STAFF_ROLES].includes(user.role);
  const isPatient = CONFIG.PATIENT_ROLES.includes(user.role);
  
  // Generate temporary password
  const tempPassword = isStaff ? 
    generateTempPassword() : 
    CONFIG.DEFAULT_TEMP_PASSWORD;

  return {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name || 'Unknown User',
    tempPassword,
    migrationData: {
      password: tempPassword, // Will be hashed before saving
      isActive: true,
      isFirstLogin: true,
      passwordChangedAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
      refreshToken: null
    }
  };
}

/**
 * Perform dry run - show what would be changed
 */
async function dryRun() {
  console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  console.log('=' .repeat(80));
  
  const users = await findUsersToMigrate();
  
  if (users.length === 0) {
    console.log('✨ No users need migration - all users already have authentication fields!');
    return;
  }

  console.log('\n📋 Users that would be migrated:\n');
  console.log('| Name                 | Email                    | Role           | Temp Password    |');
  console.log('|----------------------|--------------------------|----------------|------------------|');

  const migrationPlan = [];
  
  for (const user of users) {
    const migrationData = generateMigrationData(user);
    migrationPlan.push(migrationData);
    
    const name = migrationData.name.padEnd(20);
    const email = migrationData.email.padEnd(24);
    const role = migrationData.role.padEnd(14);
    const tempPass = migrationData.tempPassword.padEnd(16);
    
    console.log(`| ${name} | ${email} | ${role} | ${tempPass} |`);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total users to migrate: ${users.length}`);
  console.log(`   Staff accounts: ${migrationPlan.filter(u => [...CONFIG.ADMIN_ROLES, ...CONFIG.STAFF_ROLES].includes(u.role)).length}`);
  console.log(`   Patient accounts: ${migrationPlan.filter(u => CONFIG.PATIENT_ROLES.includes(u.role)).length}`);
  
  console.log('\n🔐 Migration will add:');
  console.log('   ✓ Hashed passwords (bcrypt)');
  console.log('   ✓ isActive: true');
  console.log('   ✓ isFirstLogin: true (users must change password)');
  console.log('   ✓ passwordChangedAt: current timestamp');
  console.log('   ✓ Reset login attempts and locks');

  console.log('\n⚠️  Important Notes:');
  console.log('   • Staff will get unique random passwords');
  console.log('   • Patients will get default temporary password');
  console.log('   • All users must change passwords on first login');
  console.log('   • Passwords will be displayed once during execution');
  
  console.log('\n🚀 To execute migration, run: node scripts/migrateUsers.js --execute');
}

/**
 * Execute the migration
 */
async function executeMigration() {
  console.log('\n🚀 EXECUTING MIGRATION - Making real changes\n');
  console.log('=' .repeat(80));
  
  const users = await findUsersToMigrate();
  
  if (users.length === 0) {
    console.log('✨ No users need migration - all users already have authentication fields!');
    return;
  }

  console.log(`\n📝 Migrating ${users.length} users...\n`);
  
  const results = {
    success: [],
    errors: [],
    passwords: [] // Store for final display
  };

  // Process users in batches
  for (let i = 0; i < users.length; i += CONFIG.BATCH_SIZE) {
    const batch = users.slice(i, i + CONFIG.BATCH_SIZE);
    
    console.log(`Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(users.length / CONFIG.BATCH_SIZE)}...`);
    
    for (const user of batch) {
      try {
        const migrationData = generateMigrationData(user);
        
        // Hash the password
        const hashedPassword = await hashPassword(migrationData.tempPassword);
        
        // Update user with authentication fields
        await User.findByIdAndUpdate(user._id, {
          ...migrationData.migrationData,
          password: hashedPassword
        });
        
        results.success.push(user._id);
        results.passwords.push({
          name: migrationData.name,
          email: migrationData.email,
          role: migrationData.role,
          tempPassword: migrationData.tempPassword
        });
        
        console.log(`   ✅ ${migrationData.name} (${migrationData.email})`);
        
      } catch (error) {
        console.error(`   ❌ Failed to migrate ${user.name}: ${error.message}`);
        results.errors.push({ user: user._id, error: error.message });
      }
    }
  }

  // Display results
  console.log('\n📊 Migration Results:');
  console.log(`   ✅ Successfully migrated: ${results.success.length}`);
  console.log(`   ❌ Failed migrations: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(err => {
      console.log(`   • User ${err.user}: ${err.error}`);
    });
  }

  // Display temporary passwords
  if (results.passwords.length > 0) {
    console.log('\n🔑 TEMPORARY PASSWORDS (Save this information!)');
    console.log('=' .repeat(80));
    console.log('| Name                 | Email                    | Role           | Temp Password    |');
    console.log('|----------------------|--------------------------|----------------|------------------|');
    
    results.passwords.forEach(user => {
      const name = user.name.padEnd(20);
      const email = user.email.padEnd(24);
      const role = user.role.padEnd(14);
      const tempPass = user.tempPassword.padEnd(16);
      
      console.log(`| ${name} | ${email} | ${role} | ${tempPass} |`);
    });
    
    console.log('\n⚠️  IMPORTANT: Save these passwords securely!');
    console.log('   • These passwords will not be displayed again');
    console.log('   • Users must change passwords on first login');
    console.log('   • Staff passwords are randomly generated');
    console.log(`   • Patient default password: ${CONFIG.DEFAULT_TEMP_PASSWORD}`);
  }

  console.log('\n✨ Migration completed successfully!');
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
    console.log('  node scripts/migrateUsers.js --dry-run    (preview changes)');
    console.log('  node scripts/migrateUsers.js --execute    (apply changes)');
    process.exit(1);
  }

  console.log('🔐 User Migration Script - Step 1C');
  console.log('Adding authentication fields to existing users\n');

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

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main();