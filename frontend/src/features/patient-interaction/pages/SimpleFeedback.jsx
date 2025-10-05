import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimplePatientLayout } from '../components/SimplePatientLayout';

function SimpleFeedback() {
  const [message] = useState("Simple feedback page loaded successfully!");
  const navigate = useNavigate();

  const clearPatientData = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientCode');
    alert('Patient data cleared from localStorage');
  };

  return (
    <SimplePatientLayout currentPage="feedback">
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        margin: '20px 0' 
      }}>
        <h2>My Feedback</h2>
        <p>{message}</p>
        <p>This is a simplified version of the feedback component.</p>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{ 
              backgroundColor: '#008080', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onClick={() => navigate('/feedback/all')}
          >
            View All Feedback
          </button>
          
          <button 
            style={{ 
              backgroundColor: '#20b2aa', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onClick={() => navigate('/feedback/add')}
          >
            Add New Feedback
          </button>
          
          <button 
            style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            onClick={clearPatientData}
          >
            Clear Patient Data
          </button>
        </div>
      </div>
    </SimplePatientLayout>
  );
}

export default SimpleFeedback;
