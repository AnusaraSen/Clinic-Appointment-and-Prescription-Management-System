/**
 * Backfill script to associate legacy prescriptions (without appointment_id) to appointments.
 * Heuristic:
 *  - For each prescription missing appointment_id
 *    * Find appointments whose patient_nic OR patient_id matches prescription.patient_ID (case-insensitive trimmed)
 *    * Among those, pick appointments where prescription.Date is within +-1 day of appointment_date
 *    * If exactly one match -> assign appointment._id to prescription.appointment_id
 *    * If multiple matches on same day/time doctor, pick the closest by absolute time difference
 *    * Log ambiguous scenarios and skip to avoid incorrect linkage
 * Run: node backend/scripts/backfillPrescriptionAppointmentIds.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });

const Prescription = require('../modules/clinical-workflow/models/Prescription');
const Appointment = require('../modules/patient-interaction/models/Appointments');
const db = require('../config/db');

async function connect() {
  await db();
}

function normalize(id) {
  return (id || '').trim().toLowerCase();
}

async function run() {
  await connect();
  const legacy = await Prescription.find({ $or: [ { appointment_id: { $exists: false } }, { appointment_id: null }, { appointment_id: '' } ] });
  console.log(`Found ${legacy.length} legacy prescriptions`);
  let updated = 0, skippedAmbiguous = 0, skippedNoMatch = 0;

  for (const p of legacy) {
    try {
      const pid = normalize(p.patient_ID);
      if (!pid || !p.Date) { skippedNoMatch++; continue; }
      const start = new Date(p.Date); start.setHours(0,0,0,0); start.setDate(start.getDate() - 1);
      const end = new Date(p.Date); end.setHours(23,59,59,999); end.setDate(end.getDate() + 1);

      const appts = await Appointment.find({
        $and: [
          { appointment_date: { $gte: start, $lte: end } },
          { $or: [ { patient_nic: { $regex: `^${pid}$`, $options: 'i' } }, { patient_id: { $regex: `^${pid}$`, $options: 'i' } } ] }
        ]
      });

      if (appts.length === 1) {
        p.appointment_id = appts[0]._id.toString();
        await p.save();
        updated++;
        continue;
      }
      if (appts.length === 0) { skippedNoMatch++; continue; }

      // Multiple matches: choose closest by date/time difference if times exist
      let chosen = null;
      let minDiff = Infinity;
      for (const a of appts) {
        const apptDate = new Date(a.appointment_date);
        if (a.appointment_time) {
          const [hh, mm] = a.appointment_time.split(':').map(n => parseInt(n,10));
          if (!isNaN(hh) && !isNaN(mm)) apptDate.setHours(hh, mm, 0, 0);
        }
        const diff = Math.abs(apptDate.getTime() - p.Date.getTime());
        if (diff < minDiff) { minDiff = diff; chosen = a; }
      }
      if (chosen) {
        // Only apply if difference < 48h to avoid mismatches
        if (minDiff <= 1000 * 60 * 60 * 48) {
          p.appointment_id = chosen._id.toString();
          await p.save();
          updated++;
        } else {
          skippedAmbiguous++;
        }
      } else {
        skippedAmbiguous++;
      }
    } catch (err) {
      console.error('Error processing prescription', p._id, err.message);
      skippedAmbiguous++;
    }
  }

  console.log('Backfill complete');
  console.log({ updated, skippedAmbiguous, skippedNoMatch });
  await mongoose.connection.close();
}

run().catch(err => { console.error(err); process.exit(1); });
