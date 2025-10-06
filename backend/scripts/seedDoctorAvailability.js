#!/usr/bin/env node
/**
 * Seed availability blocks for a doctor (now referencing User collection).
 *
 * Usage (PowerShell):
 *   node scripts/seedDoctorAvailability.js <USER_DOCTOR_ID> [daysFromToday] [morningStart=09:00] [morningEnd=12:00] [afternoonStart=13:30] [afternoonEnd=16:00]
 *
 * Example:
 *   node scripts/seedDoctorAvailability.js 652fae75e2c1234567890abc 3
 *
 * Will create availability for today and next 2 days.
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Availability = require('../modules/clinical-workflow/models/Availability');
const User = require('../modules/workforce-facility/models/User'); // adjust if user model lives elsewhere

async function main() {
  const [,, userId, daysArg, mStart='09:00', mEnd='12:00', aStart='13:30', aEnd='16:00'] = process.argv;
  if (!userId) {
    console.error('ERROR: Provide a doctor userId');
    process.exit(1);
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('ERROR: Not a valid ObjectId:', userId);
    process.exit(1);
  }
  const days = parseInt(daysArg || '1', 10);

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic';
  console.log('Connecting to', mongoUri);
  await mongoose.connect(mongoUri);

  const user = await User.findById(userId).select('name role');
  if (!user) {
    console.error('No user found for id', userId);
    process.exit(1);
  }
  if (!/doctor/i.test(user.role || '')) {
    console.warn('Warning: User role is not Doctor. Proceeding anyway.');
  }

  const blocks = [];
  const today = new Date();
  for (let i=0; i<days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate()+i);
    d.setHours(0,0,0,0);
    blocks.push({ doctorId: userId, date: d, startTime: mStart, endTime: mEnd, deviationMinutes: 0, status: 'available' });
    blocks.push({ doctorId: userId, date: d, startTime: aStart, endTime: aEnd, deviationMinutes: -5, status: 'available' });
  }

  console.log('Creating', blocks.length, 'availability docs...');
  await Availability.insertMany(blocks);
  console.log('Done.');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
