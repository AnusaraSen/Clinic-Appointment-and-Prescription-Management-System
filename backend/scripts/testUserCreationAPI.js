const axios = require('axios');

const testUserCreationAPI = async () => {
  try {
    const userData = {
      name: 'Dr. API Test Supervisor',
      email: 'api.test.supervisor@lab.com',
      password: 'Test123!@#',
      role: 'LabSupervisor',
      department: 'Laboratory',
      phone: '+1-555-1111',
      age: 42,
      gender: 'Female'
    };

    console.log('🧪 Testing LabSupervisor creation via API...');
    console.log('API URL: http://localhost:5000/api/users');
    console.log('User data:', JSON.stringify(userData, null, 2));

    const response = await axios.post('http://localhost:5000/api/users', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ API Error:', error.response?.status);
    console.error('❌ Error Message:', error.response?.data?.message || error.message);
    console.error('❌ Full Error Response:', JSON.stringify(error.response?.data, null, 2));
  }
};

testUserCreationAPI();