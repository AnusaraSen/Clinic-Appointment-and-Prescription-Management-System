// Test delete functionality directly
fetch('http://localhost:5000/api/labtasks/68e84bd72e46f7ae60749859', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => console.log('Result:', data))
.catch(error => console.error('Error:', error));