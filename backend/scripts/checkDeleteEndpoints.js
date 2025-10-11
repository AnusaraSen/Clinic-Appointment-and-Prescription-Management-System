require('dotenv').config();
const mongoose = require('mongoose');
const LabTask = require('../modules/lab-workflow/Model/LabTask');

async function checkDeleteEndpoints() {
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
      patient: task.patient
    });
    
    // Test that the task can be fetched (to verify it exists)
    try {
      const getResponse = await fetch(`http://localhost:5000/api/labtasks/${task._id}`);
      console.log('GET Task Response Status:', getResponse.status);
      
      if (getResponse.ok) {
        const taskData = await getResponse.json();
        console.log('✅ Task exists and can be retrieved');
        console.log('Task Status in API:', taskData.status);
      }
      
      // Test that the delete endpoint exists (using OPTIONS method to avoid actual deletion)
      const optionsResponse = await fetch(`http://localhost:5000/api/labtasks/${task._id}`, {
        method: 'OPTIONS'
      });
      console.log('OPTIONS Response Status:', optionsResponse.status);
      
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

checkDeleteEndpoints();