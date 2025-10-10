import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import pharmacyDashboardApi from '../../../api/pharmacyDashboardApi';
import prescriptionsApi from '../../../api/prescriptionsApi';
import { getStatusOverride, PRESCRIPTION_CHANGED_EVENT } from '../../../utils/prescriptionEvents';
import PharmacistSidebar from '../components/PharmacistSidebar';
import DashboardStats from '../components/DashboardStats';
import PrescriptionsList from '../components/PrescriptionsList';
import PrescriptionDetails from '../components/PrescriptionDetails';
import DispensingModule from '../components/DispensingModule';
import PharmacistProfileSimple from '../components/PharmacistProfileSimple';
import './PharmacistDashboard.css';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pharmacistInfo, setPharmacistInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  // Add body class for fixed navbar
  useEffect(() => {
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

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

  // Listen for prescription structural changes (update/delete) and refresh lists
  useEffect(() => {
    const handler = (e) => {
      const { id, action } = e.detail || {};
      console.log('Dashboard detected prescription change:', id, action);
      fetchDashboardData();
    };
    window.addEventListener(PRESCRIPTION_CHANGED_EVENT, handler);
    return () => window.removeEventListener(PRESCRIPTION_CHANGED_EVENT, handler);
  }, []);

  // Optional light polling fallback for recent prescriptions
  useEffect(() => {
    const t = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30s
    return () => clearInterval(t);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch aggregated, realistic inventory stats
      const res = await pharmacyDashboardApi.summary();
      const payload = res.data?.data || {};
      const items = Array.isArray(payload.lowExpiredItems) ? payload.lowExpiredItems : [];

      // Build Low Stock Medicines list from server-calculated low/expired items
      const meds = items
        .filter((it) => it.category === 'Medicine')
        .filter((it) => it.reason === 'Low Stock' || it.reason === 'Expired')
        .map((it) => {
          const qty = Number(it.quantity || 0);
          const thr = Number(it.threshold || 0);
          const criticalByThreshold = thr > 0 ? qty <= Math.max(1, Math.floor(thr / 2)) : qty <= 10;
          const status = it.reason === 'Expired' ? 'critical' : (criticalByThreshold ? 'critical' : 'low');
          return {
            name: it.name,
            quantity: qty,
            unit: it.unit, // may be undefined; UI handles it
            category: 'Medicine',
            status,
          };
        })
        .sort((a, b) => a.quantity - b.quantity);

      const dashboardData = {
        // Keep existing non-inventory cards for now; can be wired later
        statistics: {
          totalPrescriptions: 156,
          newPrescriptions: 12,
          pendingPrescriptions: 8,
          dispensedToday: 45,
        },
        recentPrescriptions: [],
        lowStockMedicines: meds,
        inventoryKPIs: payload.kpis || {
          medicines: { total: 0, expired: 0, lowStock: 0, outOfStock: 0 },
          chemicals: { total: 0, expired: 0, lowStock: 0 },
          equipment: { total: 0, lowStock: 0, needsMaintenance: 0, outOfService: 0 },
          orders: { monthCount: 0, pending: 0 },
        },
      };

      setDashboardData(dashboardData);
      console.log('Pharmacy dashboard summary:', payload.kpis);

      // Fetch recent prescriptions (latest 5)
      try {
        const presRes = await prescriptionsApi.list();
        const raw = Array.isArray(presRes.data) ? presRes.data : (presRes.data?.items || presRes.data?.data || []);
        const mapped = raw.map((d) => {
          const id = (d._id || d.id || '').toString();
          const override = getStatusOverride(id);
          return {
            id,
            patient: d.patient_name || d.patientName || d.patient?.name || 'Unknown',
            time: d.Date ? new Date(d.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            status: override || d.status || 'New',
            date: d.Date ? new Date(d.Date).toISOString() : null,
          };
        });
        const sorted = mapped.sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0));
        setRecentPrescriptions(sorted.slice(0, 5));
      } catch (e) {
        console.warn('Failed to fetch recent prescriptions:', e?.message || e);
        setRecentPrescriptions([]);
      }
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
    // Navigate to unified low/expired items page
    navigate('/low-stock-items');
  };

  const handleNavigateToPrescriptionSummary = () => {
    // Navigate to prescription summary page
    navigate('/prescription-summary');
  };

  // Handle URL-based navigation
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/prescriptions')) {
      setActiveTab('prescriptions');
    } else if (path.includes('/dispensing')) {
      setActiveTab('dispensing');
    } else if (path.includes('/profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Navigate to the corresponding route
    const routeMap = {
      'dashboard': '/pharmacist/dashboard',
      'prescriptions': '/pharmacist/prescriptions',
      'dispensing': '/pharmacist/dispensing',
      'profile': '/pharmacist/profile'
    };
    navigate(routeMap[tabId] || '/pharmacist/dashboard');
  };

  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
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
    <div className="dashboard-wrapper">
      <div className="pharmacist-dashboard">
        <PharmacistSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onSidebarToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
            {/* Header */}
            <header style={{
              backgroundColor: 'white',
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#0c5460',
                  margin: '0 0 4px 0'
                }}>
                  Inventory Dashboard
                </h1>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '400'
                }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}>
                <i className="fas fa-bell" style={{
                  fontSize: '20px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}></i>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fas fa-user-circle" style={{
                    fontSize: '24px',
                    color: '#6b7280'
                  }}></i>
                  <span style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    Inventory Manager
                  </span>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="content-area">
              {activeTab === 'dashboard' && (
                <DashboardStats 
                  data={dashboardData} 
                  recentPrescriptions={recentPrescriptions}
                  onRefresh={fetchDashboardData}
                  onPrescriptionClick={handlePrescriptionClick}
                  onNavigateToPrescriptions={handleNavigateToPrescriptions}
                  onNavigateToMedicineInventory={handleNavigateToMedicineInventory}
                  onNavigateToLowStockMedicines={handleNavigateToLowStockMedicines}
                  onNavigateToPrescriptionSummary={handleNavigateToPrescriptionSummary}
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

              {activeTab === 'profile' && (
                <PharmacistProfileSimple />
              )}
            </div>
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