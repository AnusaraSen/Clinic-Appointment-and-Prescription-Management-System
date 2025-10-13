import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle,
  Clock,
  Calendar,
  Package,
  User,
  Download
} from 'lucide-react';
import PharmacistSidebar from '../components/PharmacistSidebar';
import { getStatusOverride, PRESCRIPTION_CHANGED_EVENT } from '../../../utils/prescriptionEvents';
import '../pages/PharmacistDashboard.css';

const PrescriptionSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    new: 0,
    dispensed: 0,
    total: 0
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const reportContentRef = useRef();

  useEffect(() => {
    fetchPrescriptionData();
  }, []);

  // Add body class for fixed navbar
  useEffect(() => {
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

  // Listen for prescription updates from dispensing module
  useEffect(() => {
    const handlePrescriptionUpdate = () => {
      console.log('Prescription update detected, refreshing summary data...');
      fetchPrescriptionData();
    };

    // Listen for both prescription update and change events
    window.addEventListener('prescriptionUpdated', handlePrescriptionUpdate);
    window.addEventListener(PRESCRIPTION_CHANGED_EVENT, handlePrescriptionUpdate);
    
    return () => {
      window.removeEventListener('prescriptionUpdated', handlePrescriptionUpdate);
      window.removeEventListener(PRESCRIPTION_CHANGED_EVENT, handlePrescriptionUpdate);
    };
  }, []);

  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  const handleTabChange = (tabId) => {
    // Navigate based on tab selection
    const routeMap = {
      'dashboard': '/pharmacist/dashboard',
      'prescriptions': '/pharmacist/prescriptions',
      'dispensing': '/pharmacist/dispensing',
      'reports': '/pharmacist/reports',
      'profile': '/pharmacist/profile'
    };
    navigate(routeMap[tabId] || '/pharmacist/dashboard');
  };

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true);
      // Try multiple possible API endpoints
      let response;
      try {
        response = await axios.get('http://localhost:5000/api/prescriptions');
      } catch (err) {
        // If first endpoint fails, try alternative
        response = await axios.get('http://localhost:5000/prescriptions');
      }
      
      console.log('API Response:', response.data);
      
      // Handle different response structures
      let allPrescriptions = [];
      if (Array.isArray(response.data)) {
        allPrescriptions = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        allPrescriptions = response.data.data;
      } else if (response.data.prescriptions && Array.isArray(response.data.prescriptions)) {
        allPrescriptions = response.data.prescriptions;
      }
      
      // Apply status overrides from localStorage (dispensing module updates)
      allPrescriptions = allPrescriptions.map(p => {
        const id = (p._id || p.id || '').toString();
        const statusOverride = getStatusOverride(id);
        if (statusOverride) {
          console.log(`Applying status override for ${id}: ${p.status} -> ${statusOverride}`);
          return { ...p, status: statusOverride };
        }
        return p;
      });
      
      console.log('Processed prescriptions with overrides:', allPrescriptions);
      console.log('Total count:', allPrescriptions.length);
      
      // Debug: Log available date fields
      if (allPrescriptions.length > 0) {
        console.log('Sample prescription data:', allPrescriptions[0]);
        console.log('Available date fields:', {
          dateIssued: allPrescriptions[0].dateIssued,
          date_Issued: allPrescriptions[0].date_Issued,
          createdAt: allPrescriptions[0].createdAt,
          prescriptionDate: allPrescriptions[0].prescriptionDate,
          date: allPrescriptions[0].date,
          allKeys: Object.keys(allPrescriptions[0])
        });
      }
      
      // Calculate statistics - check for various status field names and values
      // Log all prescriptions with their statuses for debugging
      console.log('All prescriptions with statuses:', allPrescriptions.map(p => ({
        id: p.id || p._id,
        status: p.status || p.Status,
        patient: p.patientName || p.patient_name
      })));
      
      const newCount = allPrescriptions.filter(p => {
        const status = (p.status || p.Status || '').toString().toLowerCase().trim();
        const isNew = status === 'new' || status === 'pending';
        if (isNew) console.log('Found new prescription:', p.id || p._id, status);
        return isNew;
      }).length;
      
      const dispensedCount = allPrescriptions.filter(p => {
        const status = (p.status || p.Status || '').toString().toLowerCase().trim();
        const isDispensed = status === 'dispensed' || status === 'completed' || status === 'fulfilled';
        if (isDispensed) console.log('Found dispensed prescription:', p.id || p._id, status);
        return isDispensed;
      }).length;
      
      console.log('New prescriptions:', newCount);
      console.log('Dispensed prescriptions:', dispensedCount);
      
      setSummaryData({
        new: newCount,
        dispensed: dispensedCount,
        total: allPrescriptions.length
      });
      
      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error fetching prescription data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    setIsGeneratingCSV(true);
    
    try {
      // Calculate summary statistics
      const newCount = prescriptions.filter(p => {
        const status = getCurrentStatus(p).toLowerCase();
        return status === 'new' || status === 'pending';
      }).length;
      
      const dispensedCount = prescriptions.filter(p => {
        const status = getCurrentStatus(p).toLowerCase();
        return status === 'dispensed' || status === 'completed' || status === 'fulfilled';
      }).length;
      
      const totalCount = prescriptions.length;
      const needToDispense = totalCount - dispensedCount;
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Summary Section
      const summaryData = [
        ['PRESCRIPTION SUMMARY REPORT'],
        ['Generated on:', new Date().toLocaleString()],
        [''],
        ['SUMMARY STATISTICS'],
        ['Total Prescriptions:', totalCount],
        ['Dispensed Prescriptions:', dispensedCount],
        ['Prescriptions Need to be Dispensed:', needToDispense],
        ['New/Pending Prescriptions:', newCount],
        [''],
        ['']
      ];
      
      // Headers
      const headers = [
        'Prescription ID',
        'Patient Name',
        'Doctor Name',
        'Medicines',
        'Date Issued',
        'Status'
      ];
      
      // Data rows - keep dates as formatted strings for now
      const dataRows = prescriptions.map((prescription, index) => {
        // Check multiple possible date field names (Date is the primary field from backend model)
        const dateString = prescription.Date || 
                          prescription.date ||
                          prescription.dateIssued || 
                          prescription.date_Issued || 
                          prescription.createdAt || 
                          prescription.prescriptionDate ||
                          prescription.created_at ||
                          prescription.issuedDate;
        let dateValue = 'N/A';
        
        // Format date for display
        if (dateString) {
          try {
            const date = new Date(dateString);
            // Check if date is valid
            if (!isNaN(date.getTime())) {
              // Format as: Oct 13, 2025
              dateValue = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (e) {
            dateValue = 'N/A';
          }
        }
        
        return [
          extractPrescriptionId(prescription, index),
          extractPatientName(prescription),
          extractDoctorName(prescription),
          extractMedicines(prescription),
          dateValue,
          getCurrentStatus(prescription)
        ];
      });
      
      // Combine all data
      const wsData = [...summaryData, headers, ...dataRows];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Now manually update date cells with proper Excel serial dates
      prescriptions.forEach((prescription, index) => {
        // Check multiple possible date field names (Date is the primary field from backend model)
        const dateString = prescription.Date || 
                          prescription.date ||
                          prescription.dateIssued || 
                          prescription.date_Issued || 
                          prescription.createdAt || 
                          prescription.prescriptionDate ||
                          prescription.created_at ||
                          prescription.issuedDate;
        
        console.log(`Prescription ${index} date fields:`, {
          dateIssued: prescription.dateIssued,
          date_Issued: prescription.date_Issued,
          createdAt: prescription.createdAt,
          prescriptionDate: prescription.prescriptionDate,
          date: prescription.date,
          selectedDate: dateString
        });
        
        if (dateString) {
          try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
              // Row index in worksheet: summaryData.length (summary rows) + 1 (header) + index (data row)
              const rowIdx = summaryData.length + 1 + index;
              const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: 4 }); // Column E (index 4) is Date Issued
              
              console.log(`✅ Setting date for row ${rowIdx}, cell ${cellRef}: ${date.toLocaleDateString()}`);
              
              // Convert JavaScript date to Excel serial number
              // Excel dates are stored as days since 1/1/1900
              const excelSerialDate = (date - new Date(1899, 11, 30)) / (24 * 60 * 60 * 1000);
              
              // Set cell as number with date format
              ws[cellRef] = {
                t: 'n', // number type
                v: excelSerialDate, // Excel serial date number
                z: 'mmm dd, yyyy', // Excel date format
                w: date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) // Display value
              };
            } else {
              console.warn(`❌ Invalid date for prescription ${index}:`, dateString);
            }
          } catch (e) {
            console.error(`❌ Date conversion error for prescription ${index}:`, e);
          }
        } else {
          console.warn(`❌ No date found for prescription ${index}`);
        }
      });
      
      // Set column widths
      ws['!cols'] = [
        { wch: 18 }, // Prescription ID
        { wch: 20 }, // Patient Name
        { wch: 20 }, // Doctor Name
        { wch: 40 }, // Medicines
        { wch: 15 }, // Date Issued
        { wch: 12 }  // Status
      ];
      
      // Style the summary title (row 1)
      if (!ws['A1']) ws['A1'] = { t: 's', v: '' };
      ws['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "0D9488" } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
      
      // Merge title row
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } } // Merge A1:F1 for title
      ];
      
      // Style summary statistics labels (rows 4-8)
      const summaryRowIndices = [3, 4, 5, 6, 7]; // Rows 4-8 (0-indexed: 3-7)
      summaryRowIndices.forEach(rowIdx => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: 0 });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: "E0F2F1" } }
        };
      });
      
      // Style the data headers (row 11, 0-indexed: 10)
      const headerRowIdx = summaryData.length;
      headers.forEach((header, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c: colIdx });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: header };
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
          fill: { fgColor: { rgb: "0D9488" } }, // Teal color
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      });
      
      // Add borders to all data cells
      dataRows.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx + 1 + rowIdx, c: colIdx });
          
          // Apply border styling (preserve existing cell data and type)
          if (ws[cellRef]) {
            if (!ws[cellRef].s) ws[cellRef].s = {};
            ws[cellRef].s = {
              ...ws[cellRef].s,
              border: {
                top: { style: 'thin', color: { rgb: "CCCCCC" } },
                bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
                left: { style: 'thin', color: { rgb: "CCCCCC" } },
                right: { style: 'thin', color: { rgb: "CCCCCC" } }
              }
            };
          }
        });
      });
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Prescription Summary');
      
      // Generate filename with current date
      const filename = `Prescription_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);
      
      console.log('Excel file generated successfully');
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Failed to generate Excel file. Please try again.');
    } finally {
      setIsGeneratingCSV(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper function to get current status with override
  const getCurrentStatus = (prescription) => {
    const id = (prescription._id || prescription.id || '').toString();
    const statusOverride = getStatusOverride(id);
    return statusOverride || prescription.status || prescription.Status || 'N/A';
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toString().toLowerCase();
    switch (statusLower) {
      case 'new':
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispensed':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const extractPatientName = (prescription) => {
    return prescription.patientName || 
           prescription.patient_name || 
           prescription.patient?.name || 
           prescription.patient?.patientName ||
           'N/A';
  };

  const extractDoctorName = (prescription) => {
    return prescription.doctorName || 
           prescription.doctor_Name || 
           prescription.doctor?.name || 
           prescription.doctor?.doctorName ||
           'N/A';
  };

  const extractPrescriptionId = (prescription, index) => {
    return prescription.prescriptionId || 
           prescription.prescription_ID || 
           prescription.id || 
           prescription._id || 
           `PRX-${String(index + 1).padStart(3, '0')}`;
  };

  const extractMedicines = (prescription) => {
    // Check for various medicine field formats
    if (prescription.medicines && Array.isArray(prescription.medicines)) {
      return prescription.medicines.map(m => 
        m.medicineName || m.Medicine_Name || m.name || m
      ).join(', ');
    } else if (prescription.Medicines && Array.isArray(prescription.Medicines)) {
      return prescription.Medicines.map(m => 
        m.Medicine_Name || m.medicineName || m.name || m
      ).join(', ');
    } else if (prescription.medication) {
      return prescription.medication;
    }
    return 'N/A';
  };

  const extractDate = (prescription) => {
    return prescription.Date || 
           prescription.date || 
           prescription.createdAt || 
           prescription.created_at ||
           prescription.dateIssued ||
           prescription.date_Issued;
  };

  const filterPrescriptionsByStatus = (statusFilter) => {
    const filtered = prescriptions.filter(p => {
      // Get the latest status from localStorage override if available
      const id = (p._id || p.id || '').toString();
      const statusOverride = getStatusOverride(id);
      const currentStatus = statusOverride || p.status || p.Status || '';
      const status = currentStatus.toString().toLowerCase().trim();
      const matches = statusFilter.includes(status);
      if (matches) console.log('Matched prescription:', id, 'with status:', status, 'against filters:', statusFilter);
      return matches;
    });
    console.log(`Filtered ${filtered.length} prescriptions for statuses:`, statusFilter);
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prescription data...</p>
        </div>
      </div>
    );
  }

  const newPrescriptions = filterPrescriptionsByStatus(['new', 'pending']);
  const dispensedPrescriptions = filterPrescriptionsByStatus(['dispensed', 'completed']);

  return (
    <div className="dashboard-wrapper">
      <div className="pharmacist-dashboard">
        <PharmacistSidebar 
          activeTab="reports"
          onTabChange={handleTabChange}
          onSidebarToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div className="bg-gray-50">
            {/* Header - Hidden when printing */}
            <div className="no-print bg-white shadow-sm border-b">
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => navigate('/pharmacist/dashboard')}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadCSV}
                    disabled={isGeneratingCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isGeneratingCSV ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating Excel...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Excel</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div ref={reportContentRef} className="max-w-7xl mx-auto p-6 print-content">
        {/* System Header with Logo */}
        <div className="system-header mb-6 pb-3 border-b border-gray-300">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '70%', verticalAlign: 'middle', padding: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#0d9488',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText style={{ width: '28px', height: '28px', color: 'white' }} />
                    </div>
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        Family Clinic
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        Pharmacy Department - Prescription Summary
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ width: '30%', textAlign: 'right', verticalAlign: 'middle', padding: 0 }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Generated on:</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Prescriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Prescriptions</h3>
                <p className="text-3xl font-bold text-purple-600">{summaryData.total}</p>
              </div>
            </div>
          </div>

          {/* New Prescriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">New Prescriptions</h3>
                <p className="text-3xl font-bold text-blue-600">{summaryData.new}</p>
              </div>
            </div>
          </div>

          {/* Dispensed Prescriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Dispensed</h3>
                <p className="text-3xl font-bold text-green-600">{summaryData.dispensed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Prescriptions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            New Prescriptions ({newPrescriptions.length})
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicines</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newPrescriptions.length > 0 ? (
                  newPrescriptions.map((prescription, index) => (
                    <tr key={prescription._id || prescription.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {extractPrescriptionId(prescription, index)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {extractPatientName(prescription)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {extractDoctorName(prescription)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(extractDate(prescription))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {extractMedicines(prescription)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(getCurrentStatus(prescription))}`}>
                          {getCurrentStatus(prescription)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                      No new prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispensed Prescriptions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Dispensed Prescriptions ({dispensedPrescriptions.length})
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicines</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dispensedPrescriptions.length > 0 ? (
                  dispensedPrescriptions.map((prescription, index) => (
                    <tr key={prescription._id || prescription.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {extractPrescriptionId(prescription, index)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {extractPatientName(prescription)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {extractDoctorName(prescription)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(extractDate(prescription))}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {extractMedicines(prescription)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(getCurrentStatus(prescription))}`}>
                          {getCurrentStatus(prescription)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                      No dispensed prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Footer */}
        <div className="print-only mt-8 pt-4 border-t border-gray-300" style={{ 
          display: 'none',
          pageBreakInside: 'avoid',
          marginTop: '2rem'
        }}>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#4b5563',
            margin: '0 0 0.5rem 0'
          }}>
            This report is computer-generated and does not require a signature.
          </p>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.75rem', 
            color: '#6b7280',
            margin: 0
          }}>
            © 2025 Family Clinic - Pharmacy Department
          </p>
        </div>

        {/* Print Styles */}
        <style>{`
        /* PDF Generation Styles */
        .print-content {
          background: white !important;
          box-sizing: border-box;
        }
        
        .print-content * {
          box-sizing: border-box;
        }
        
        .print-content table {
          page-break-inside: auto;
        }
        
        .print-content tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        @media print {
          .no-print,
          .pharmacist-sidebar,
          .sidebar {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .print-content {
            max-width: 100% !important;
            padding: 0.5rem !important;
          }
          
          /* System header */
          .system-header {
            margin-bottom: 0.75rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .system-header div[style*="width: 48px"] {
            width: 36px !important;
            height: 36px !important;
          }
          
          .system-header svg {
            width: 20px !important;
            height: 20px !important;
          }
          
          .system-header div[style*="fontSize: 20px"] {
            font-size: 14px !important;
          }
          
          .system-header div[style*="fontSize: 14px"] {
            font-size: 11px !important;
          }
          
          /* Statistics cards */
          .grid.grid-cols-3 {
            gap: 1rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .grid.grid-cols-3 > div {
            padding: 0.75rem !important;
          }
          
          .grid.grid-cols-3 .w-12 {
            width: 2rem !important;
            height: 2rem !important;
          }
          
          .grid.grid-cols-3 svg {
            width: 1.25rem !important;
            height: 1.25rem !important;
          }
          
          .grid.grid-cols-3 h3 {
            font-size: 0.7rem !important;
          }
          
          .grid.grid-cols-3 p {
            font-size: 1.5rem !important;
          }
          
          /* Section headings */
          h2 {
            font-size: 1rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          h2 svg {
            width: 1rem !important;
            height: 1rem !important;
          }
          
          /* Tables */
          table {
            font-size: 0.7rem !important;
          }
          
          th {
            padding: 0.4rem !important;
            font-size: 0.65rem !important;
          }
          
          td {
            padding: 0.4rem !important;
          }
          
          .mb-8 {
            margin-bottom: 1.5rem !important;
          }
          
          /* Page breaks */
          .bg-white.rounded-lg {
            page-break-inside: avoid;
          }
          
          /* Footer */
          .print-only.mt-8 {
            margin-top: 1.5rem !important;
          }
        }
        `}</style>
      </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PrescriptionSummary;
