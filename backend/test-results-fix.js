const axios = require('axios');

async function testResultsSaving() {
  try {
    console.log('Testing results saving fix...');
    
    // First, let's test a task that might exist (you'll need a real task ID)
    const testTaskId = '507f1f77bcf86cd799439011'; // Replace with a real task ID
    
    const testData = {
      summary: 'Test summary from script',
      interpretation: 'Test interpretation',
      recommendations: 'Test recommendations',
      status: 'preliminary',
      technician: 'Test Technician',
      notes: 'Test notes from script'
    };
    
    console.log('Sending POST request to:', `http://localhost:5000/api/labtasks/${testTaskId}/results`);
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(
      `http://localhost:5000/api/labtasks/${testTaskId}/results`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('✅ Results saving test PASSED!');
    
  } catch (error) {
    console.error('❌ Results saving test FAILED!');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

// Also test the test endpoint
async function testEndpoint() {
  try {
    console.log('\nTesting basic endpoint...');
    const response = await axios.get('http://localhost:5000/api/labtasks/test');
    console.log('Test endpoint response:', response.data);
    console.log('✅ Test endpoint PASSED!');
  } catch (error) {
    console.error('❌ Test endpoint FAILED!');
    console.error('Error:', error.message);
  }
}

async function main() {
  await testEndpoint();
  await testResultsSaving();
}

main();