// Test what the frontend API call returns
fetch('http://localhost:5000/api/labtasks')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    if (data.tasks) {
      data.tasks.forEach(task => {
        console.log('Task ID:', task.task_id);
        console.log('MongoDB _id:', task._id);
        console.log('Status:', task.status);
        console.log('Full task structure:', JSON.stringify(task, null, 2));
        console.log('---');
      });
    }
  })
  .catch(error => console.error('Error:', error));