const fetch = require('node-fetch'); // You might need to install: npm install node-fetch@2

async function testAvailabilityToggle() {
  try {
    // First, get current staff data
    console.log('1. Getting current lab staff data...');
    const getResponse = await fetch('http://localhost:5000/api/labtasks/lab-staff');
    const staffData = await getResponse.json();
    
    console.log('Current staff data:');
    staffData.forEach(staff => {
      console.log(`- ${staff.user.name} (${staff.lab_staff_id}): ${staff.availability}`);
    });
    
    // Pick the first staff member for testing
    const testStaff = staffData[0];
    console.log(`\n2. Testing availability toggle for: ${testStaff.user.name}`);
    console.log(`Current availability: ${testStaff.availability}`);
    
    // Toggle availability
    const newAvailability = testStaff.availability === 'Available' ? 'Not Available' : 'Available';
    console.log(`Changing to: ${newAvailability}`);
    
    const updateResponse = await fetch(`http://localhost:5000/api/labtasks/lab-staff/${testStaff.id}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availability: newAvailability }),
    });
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Update successful:', updateResult.message);
      
      // Verify the change
      console.log('\n3. Verifying the change...');
      const verifyResponse = await fetch('http://localhost:5000/api/labtasks/lab-staff');
      const updatedStaffData = await verifyResponse.json();
      
      const updatedStaff = updatedStaffData.find(s => s.id === testStaff.id);
      console.log(`${updatedStaff.user.name} availability is now: ${updatedStaff.availability}`);
      
      if (updatedStaff.availability === newAvailability) {
        console.log('✅ Toggle functionality working correctly!');
      } else {
        console.log('❌ Toggle failed - availability not updated');
      }
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Update failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing availability toggle:', error);
  }
}

testAvailabilityToggle();