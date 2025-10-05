import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  User
} from 'lucide-react';

const PharmacistDashboardPage = () => {
  const navigate = useNavigate();
  
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'P-001',
      patient: 'John Smith',
      time: '10:25 AM',
      status: 'Pending'
    },
    {
      id: 'P-002', 
      patient: 'Sarah Johnson',
      time: '09:45 AM',
      status: 'Pending'
    }
  ]);

  const [lowStockMedications, setLowStockMedications] = useState([
    {
      name: 'Amoxicillin',
      currentStock: '3 capsules',
      batch: 'BATCH002'
    },
    {
      name: 'Iavanya',
      currentStock: '11 capsules', 
      batch: 'BATCH-2025-04'
    },
    {
      name: 'Amoxicillin',
      currentStock: 'Expired: 1/30/2025',
      batch: null,
      expired: true
    }
  ]);

  return (
    <div className="pharmacist-dashboard-page" style={{ 
        padding: '24px 32px', 
        paddingTop: '104px',
        background: '#f8fafc', 
        minHeight: '100vh' 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          background: 'white',
          padding: '24px 32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '600', 
              color: '#2d3748', 
              margin: '0 0 4px 0' 
            }}>
              Pharmacist Dashboard
            </h1>
            <p style={{ 
              color: '#718096', 
              fontSize: '0.9rem', 
              margin: 0 
            }}>
              Tuesday, September 3, 2024
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#718096',
            fontSize: '0.9rem'
          }}>
            <User size={16} />
            Pharmacist
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {/* Pending Prescriptions */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f6ad55'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Clock size={20} color="#f6ad55" />
              <span style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>
                Pending Prescriptions
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748' }}>12</div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Requires attention</div>
          </div>

          {/* Dispensed Today */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #48bb78'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle size={20} color="#48bb78" />
              <span style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>
                Dispensed Today
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748' }}>28</div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>91% vs yesterday</div>
          </div>

          {/* Low Stock Medicines */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f56565'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={20} color="#f56565" />
              <span style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>
                Low Stock Medicines
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748' }}>4</div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>2 critical</div>
          </div>

          {/* New Patients */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #4299e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Users size={20} color="#4299e1" />
              <span style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>
                New Patients
              </span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748' }}>156</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Prescriptions */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                color: '#2d3748', 
                margin: 0
              }}>
                Recent Prescriptions
              </h2>
              <button style={{
                color: '#4299e1',
                background: 'none',
                border: 'none',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                View All
              </button>
            </div>
            
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              padding: '16px 24px',
              background: '#f7fafc',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#718096',
              textTransform: 'uppercase'
            }}>
              <div>PATIENT</div>
              <div>ID</div>
              <div>TIME</div>
              <div>STATUS</div>
              <div>ACTION</div>
            </div>

            {/* Table Rows */}
            {prescriptions.map((prescription, index) => (
              <div key={prescription.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: '500', color: '#2d3748' }}>
                  {prescription.patient}
                </div>
                <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                  {prescription.id}
                </div>
                <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                  {prescription.time}
                </div>
                <div>
                  <span style={{
                    background: '#fbb6ce',
                    color: '#97266d',
                    padding: '4px 8px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {prescription.status}
                  </span>
                </div>
                <div>
                  <button style={{
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}>
                    Process
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Low Stock Medications */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: '#fed7d7',
                color: '#c53030',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                🔺 Alert
              </span>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#2d3748', 
                margin: 0
              }}>
                Low Stock Medications
              </h3>
              <div style={{
                background: '#fbb6ce',
                color: '#97266d',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '600',
                marginLeft: 'auto'
              }}>
                Low Stock (2)
              </div>
              <div style={{
                background: '#fed7d7',
                color: '#c53030',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                Expired (4)
              </div>
            </div>
            
            <div style={{ padding: '16px 20px' }}>
              {lowStockMedications.map((medication, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: index < lowStockMedications.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '32px',
                      background: medication.expired ? '#f56565' : '#f6ad55',
                      borderRadius: '4px'
                    }}></div>
                    <div>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '0.9rem', 
                        color: '#2d3748',
                        marginBottom: '4px'
                      }}>
                        {medication.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#718096',
                        marginBottom: '2px'
                      }}>
                        Current Stock: {medication.currentStock}
                      </div>
                      {medication.batch && (
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                          Batch: {medication.batch}
                        </div>
                      )}
                    </div>
                  </div>
                  <button style={{
                    background: medication.expired ? '#f56565' : '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    {medication.expired ? 'Remove' : 'Update'}
                  </button>
                </div>
              ))}
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '16px' 
              }}>
                <button style={{
                  color: '#4299e1',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}>
                  View All Low Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PharmacistDashboardPage;