require('dotenv').config();
const mongoose = require('mongoose');
const LabTask = require('../modules/lab-workflow/Model/LabTask');

async function testDeleteAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find a task with Results Ready status
    const task = await LabTask.findOne({ status: 'Results Ready' });
    
    if (!task) {
      console.log('No task with Results Ready status found');
      return;
    }
    
    console.log('Found task:', {
      id: task._id,
      task_id: task.task_id,
      status: task.status,
      patient: task.patient?.name
    });
    
    // Test the API endpoints that we'll use for deletion
    console.log('\nTesting delete endpoints...');
    console.log(`Test Result API: DELETE /api/test-results/test/${task._id}`);
    console.log(`Lab Task API: DELETE /api/labtasks/${task._id}`);
    
    // Test with fetch (simulating frontend call)
    try {
      const testResultResponse = await fetch(`http://localhost:5000/api/test-results/test/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Test Result API Response Status:', testResultResponse.status);
      
      if (!testResultResponse.ok) {
        const labTaskResponse = await fetch(`http://localhost:5000/api/labtasks/${task._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Lab Task API Response Status:', labTaskResponse.status);
        
        if (labTaskResponse.ok) {
          console.log('✅ Lab Task deletion successful');
        } else {
          console.log('❌ Both deletion attempts failed');
        }
      } else {
        console.log('✅ Test Result deletion successful');
      }
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError.message);
      console.log('Make sure the backend server is running on port 5000');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testDeleteAPI();