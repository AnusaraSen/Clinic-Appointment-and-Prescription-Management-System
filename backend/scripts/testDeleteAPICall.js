async function testDeleteAPI() {
  try {
    // Test the delete endpoint with the actual task ID
    const taskId = '68e84a0d5030374b34a8849e'; // LTASK_DELETE_TEST
    
    const response = await fetch(`http://localhost:5000/api/labtasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success result:', result);
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testDeleteAPI();