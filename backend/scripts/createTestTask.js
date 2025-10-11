require('dotenv').config();
const mongoose = require('mongoose');
const LabTask = require('../modules/lab-workflow/Model/LabTask');

async function createTestResultsReadyTask() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // First, let's check if we need a patient_id
    const Patient = require('../modules/patient-interaction/models/Patient');
    let patient = await Patient.findOne();
    
    if (!patient) {
      // Create a test patient if none exists
      patient = new Patient({
        name: 'Test Patient for Delete',
        patient_id: 'PAT-DELETE-001',
        email: 'test@example.com',
        phone: '1234567890'
      });
      await patient.save();
      console.log('Created test patient');
    }
    
    // Create a new task with Results Ready status
    const newTask = new LabTask({
      task_id: 'LTASK_DELETE_TEST',
      taskTitle: 'Blood Sugar Test for Delete Demo',
      status: 'Results Ready',
      priority: 'Medium', // Using valid enum value
      patient_id: patient._id, // Using ObjectId reference
      testInformation: {
        testType: 'Blood Glucose',
        specimenType: 'Blood'
      },
      results: {
        testResults: [{
          parameter: 'glucose',
          value: '110',
          unit: 'mg/dL',
          referenceRange: '70-100',
          abnormalFlag: 'H' // Using valid enum value
        }],
        overallInterpretation: 'Test result created for delete functionality testing',
        reviewedBy: 'Test Reviewer',
        approvalDateTime: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newTask.save();
    console.log('✅ Created test task:', newTask.task_id);
    console.log('This task has "Results Ready" status and should show the delete button');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestResultsReadyTask();