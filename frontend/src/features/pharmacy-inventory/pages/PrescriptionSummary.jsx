import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  CheckCircle,
  Clock,
  Calendar,
  Package,
  User,
  Download
} from 'lucide-react';
import PharmacistSidebar from '../components/PharmacistSidebar';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  const handleTabChange = (tabId) => {
    // Navigate based on tab selection
    const routeMap = {
      'dashboard': '/pharmacist-dashboard',
      'prescriptions': '/pharmacist/prescriptions',
      'dispensing': '/pharmacist/dispensing',
      'profile': '/pharmacist/profile'
    };
    navigate(routeMap[tabId] || '/pharmacist-dashboard');
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
      
      console.log('Processed prescriptions:', allPrescriptions);
      console.log('Total count:', allPrescriptions.length);
      
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Clone the content to avoid modifying the original DOM
      const originalElement = reportContentRef.current;
      const clonedElement = originalElement.cloneNode(true);
      
      // Convert oklch colors to rgb in the cloned element
      const convertOklchToRgb = (element) => {
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          
          // Get all color-related properties
          const colorProperties = [
            'color', 
            'backgroundColor', 
            'borderColor', 
            'borderTopColor', 
            'borderBottomColor', 
            'borderLeftColor', 
            'borderRightColor'
          ];
          
          colorProperties.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value.includes('oklch')) {
              // Apply the computed RGB value directly
              const rgbValue = computedStyle[prop];
              el.style[prop] = rgbValue;
            }
          });
        });
      };
      
      convertOklchToRgb(clonedElement);
      
      // Generate filename with current date
      const filename = `Prescription_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // PDF options
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Temporarily add cloned element to DOM
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);
      
      // Generate PDF from cloned element
      await html2pdf()
        .set(options)
        .from(clonedElement)
        .save();
      
      // Remove cloned element
      document.body.removeChild(clonedElement);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
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
    return prescription.date || 
           prescription.Date || 
           prescription.createdAt || 
           prescription.created_at;
  };

  const filterPrescriptionsByStatus = (statusFilter) => {
    const filtered = prescriptions.filter(p => {
      const status = (p.status || p.Status || '').toString().toLowerCase().trim();
      const matches = statusFilter.includes(status);
      if (matches) console.log('Matched prescription:', p.id || p._id, 'with status:', status, 'against filters:', statusFilter);
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
          activeTab="prescriptions"
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
                  onClick={() => navigate('/pharmacist-dashboard')}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    <Printer className="w-5 h-5" />
                    Print
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(prescription.status || prescription.Status)}`}>
                          {prescription.status || prescription.Status || 'N/A'}
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(prescription.status || prescription.Status)}`}>
                          {prescription.status || prescription.Status || 'N/A'}
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
