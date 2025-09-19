import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardStats from '../../components/DashboardStats';
import PrescriptionsList from '../../components/PrescriptionsList';
import PrescriptionDetails from '../../components/PrescriptionDetails';
import DispensingModule from '../../components/DispensingModule';
import './PharmacistDashboard.css';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pharmacistInfo, setPharmacistInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Initialize with mock pharmacist info
  useEffect(() => {
    const mockPharmacist = {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@pharmacy.com',
      phone: '+1 (555) 123-4567',
      address: '123 Medical Center Drive, Healthcare City, HC 12345',
      dateOfBirth: '1985-03-15',
      emergencyContact: '+1 (555) 987-6543',
      licenseNumber: 'PH12345',
      qualification: 'PharmD',
      specialization: 'Clinical Pharmacy',
      yearsOfExperience: '8',
      department: 'Pharmacy',
      employeeId: 'EMP001',
      role: 'Senior Pharmacist'
    };
    
    setPharmacistInfo(mockPharmacist);
    fetchDashboardData();
  }, []);

  // Listen for prescription updates from the dispensing module
  useEffect(() => {
    const handlePrescriptionUpdate = (event) => {
      const updatedPrescription = event.detail;
      console.log('Prescription updated in dashboard:', updatedPrescription);
      
      // Refresh dashboard data to reflect new dispensing statistics
      fetchDashboardData();
      
      // Update recent prescriptions list if available
      if (dashboardData?.recentPrescriptions) {
        setDashboardData(prev => ({
          ...prev,
          recentPrescriptions: prev.recentPrescriptions.map(prescription => 
            prescription.id === updatedPrescription.id || prescription.prescriptionId === updatedPrescription.id
              ? { ...prescription, status: updatedPrescription.status }
              : prescription
          ),
          statistics: {
            ...prev.statistics,
            dispensedToday: prev.statistics.dispensedToday + 1,
            pendingPrescriptions: Math.max(0, prev.statistics.pendingPrescriptions - 1)
          }
        }));
      }
    };

    window.addEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    
    return () => {
      window.removeEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    };
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      // Define thresholds for low stock alerts
      const LOW_STOCK_THRESHOLD = 50;
      const CRITICAL_STOCK_THRESHOLD = 20;

      // Fetch medicine inventory data
      const medicineResponse = await axios.get('http://localhost:5000/api/medicines');
      const medicines = medicineResponse.data.data || medicineResponse.data; // Handle both response structures

      // Filter and categorize low stock medicines
      const lowStockMedicines = medicines
        .filter(medicine => medicine.quantity <= LOW_STOCK_THRESHOLD)
        .map(medicine => ({
          ...medicine,
          status: medicine.quantity <= CRITICAL_STOCK_THRESHOLD ? 'critical' : 'low'
        }))
        .sort((a, b) => a.quantity - b.quantity); // Sort by quantity, lowest first

      // Mock data for other statistics (replace with real API calls later)
      const dashboardData = {
        statistics: {
          totalPrescriptions: 156,
          newPrescriptions: 12,
          pendingPrescriptions: 8,
          dispensedToday: 45
        },
        recentPrescriptions: [
          {
            id: 'P-001',
            patientName: 'John Smith',
            prescriptionId: 'RX-2024-001',
            doctorName: 'Dr. Brown',
            status: 'Pending',
            dateIssued: new Date().toISOString()
          },
          {
            id: 'P-002',
            patientName: 'Sarah Wilson',
            prescriptionId: 'RX-2024-002',
            doctorName: 'Dr. Johnson',
            status: 'Dispensed',
            dateIssued: new Date().toISOString()
          }
        ],
        lowStockMedicines: lowStockMedicines
      };
      
      setDashboardData(dashboardData);
      console.log('Dashboard data loaded with real medicine inventory:', {
        totalMedicines: medicines.length,
        lowStockCount: lowStockMedicines.length,
        criticalStockCount: lowStockMedicines.filter(m => m.status === 'critical').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      const mockData = {
        statistics: {
          totalPrescriptions: 156,
          newPrescriptions: 12,
          pendingPrescriptions: 8,
          dispensedToday: 45
        },
        recentPrescriptions: [],
        lowStockMedicines: []
      };
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleProfileUpdate = (updatedProfile) => {
    // Update the pharmacist info with the new profile data
    setPharmacistInfo(prev => ({
      ...prev,
      ...updatedProfile.personalInfo,
      ...updatedProfile.professionalInfo
    }));
    console.log('Profile updated:', updatedProfile);
  };

  const handlePrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  const handlePrescriptionUpdate = () => {
    // Refresh dashboard data after prescription update
    fetchDashboardData();
    closePrescriptionModal();
  };

  const handleLogout = () => {
    // Navigate back to the dashboard (or home page)
    setActiveTab('dashboard');
    // You can also navigate to a different route if needed
    // navigate('/');
  };

  // Navigation functions for dashboard buttons
  const handleNavigateToPrescriptions = () => {
    setActiveTab('prescriptions');
  };

  const handleNavigateToMedicineInventory = () => {
    // Navigate to medicine inventory page
    navigate('/medicine/list');
  };

  const handleNavigateToLowStockMedicines = () => {
    // Navigate to medicine inventory with low stock filter applied
    navigate('/medicine/list?filter=lowStock');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pharmacist-dashboard">
      {/* Navigation Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="header-content">
            <h2>Pharmacist Dashboard</h2>
            <button className="toggle-btn" onClick={toggleSidebar}>
              <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <i className="fas fa-tachometer-alt"></i>
            <span className="nav-text">Dashboard</span>
          </div>
          
          <div
            className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
            title="Prescriptions"
          >
            <i className="fas fa-prescription"></i>
            <span className="nav-text">Prescriptions</span>
          </div>
          
          <div
            className={`nav-item ${activeTab === 'dispensing' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispensing')}
            title="Dispensing Module"
          >
            <i className="fas fa-pills"></i>
            <span className="nav-text">Dispensing Module</span>
          </div>
          
          <div
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/pharmacist-profile')}
            title="Profile"
          >
            <i className="fas fa-user-circle"></i>
            <span className="nav-text">Profile</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Pharmacist Dashboard</h1>
            <div className="current-date">
              Tuesday, September 3, 2024
            </div>
          </div>
          
          <div className="header-right">
            <div className="pharmacist-info">
              <i className="fas fa-user-md"></i>
              <span>Pharmacist</span>
            </div>
            
            
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'dashboard' && (
            <DashboardStats 
              data={dashboardData} 
              onRefresh={fetchDashboardData}
              onPrescriptionClick={handlePrescriptionClick}
              onNavigateToPrescriptions={handleNavigateToPrescriptions}
              onNavigateToMedicineInventory={handleNavigateToMedicineInventory}
              onNavigateToLowStockMedicines={handleNavigateToLowStockMedicines}
            />
          )}
          
          {activeTab === 'prescriptions' && (
            <PrescriptionsList 
              onPrescriptionClick={handlePrescriptionClick}
              onRefresh={fetchDashboardData}
            />
          )}
          
          {activeTab === 'dispensing' && (
            <DispensingModule 
              onPrescriptionClick={handlePrescriptionClick}
            />
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionDetails
          prescription={selectedPrescription}
          onClose={closePrescriptionModal}
          onUpdate={handlePrescriptionUpdate}
          pharmacistInfo={pharmacistInfo}
        />
      )}
    </div>
  );
};

export default PharmacistDashboard;