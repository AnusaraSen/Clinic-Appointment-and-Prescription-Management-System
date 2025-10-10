const mongoose = require('mongoose');
require('dotenv').config();

// Import the LabTask model
const LabTask = require('./modules/lab-workflow/Model/LabTask');

async function migrateResultsData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_db');
    console.log('Connected to MongoDB');

    // Find all tasks that have results as an array
    const tasksWithArrayResults = await LabTask.find({
      results: { $type: 'array' }
    });

    console.log(`Found ${tasksWithArrayResults.length} tasks with array-type results`);

    for (const task of tasksWithArrayResults) {
      console.log(`Migrating task ${task._id}`);
      console.log('Current results:', JSON.stringify(task.results, null, 2));

      // Convert array to object structure
      const oldResults = task.results;
      const newResults = {
        testResults: [],
        overallInterpretation: '',
        recommendations: '',
        criticalValues: false,
        physicianNotified: false
      };

      // Try to preserve any existing data
      if (Array.isArray(oldResults) && oldResults.length > 0) {
        // Convert old array data to text in interpretation
        newResults.overallInterpretation = `Legacy data migrated: ${JSON.stringify(oldResults)}`;
      }

      // Update the task
      task.results = newResults;
      await task.save();
      
      console.log(`Migrated task ${task._id} successfully`);
    }

    // Also find tasks that might have results with wrong structure
    const tasksWithObjectResults = await LabTask.find({
      results: { $type: 'object', $exists: true }
    });

    console.log(`Checking ${tasksWithObjectResults.length} tasks with object-type results`);

    let fixedCount = 0;
    for (const task of tasksWithObjectResults) {
      let needsUpdate = false;
      
      if (!task.results.testResults) {
        task.results.testResults = [];
        needsUpdate = true;
      }
      if (task.results.overallInterpretation === undefined) {
        task.results.overallInterpretation = '';
        needsUpdate = true;
      }
      if (task.results.recommendations === undefined) {
        task.results.recommendations = '';
        needsUpdate = true;
      }
      if (task.results.criticalValues === undefined) {
        task.results.criticalValues = false;
        needsUpdate = true;
      }
      if (task.results.physicianNotified === undefined) {
        task.results.physicianNotified = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await task.save();
        fixedCount++;
        console.log(`Fixed object structure for task ${task._id}`);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Fixed ${tasksWithArrayResults.length} tasks with array results`);
    console.log(`- Fixed ${fixedCount} tasks with incomplete object structure`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateResultsData();