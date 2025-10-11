import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Printer, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';

const InventorySummary = () => {
  const navigate = useNavigate();
  const printRef = useRef();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    medicines: { total: 0, lowStock: 0, expired: 0, ok: 0 },
    chemicals: { total: 0, lowStock: 0, expired: 0, ok: 0 },
    equipment: { total: 0, lowStock: 0, expired: 0, ok: 0 }
  });

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all inventory data
      const [medicinesRes, chemicalsRes, equipmentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/medicines'),
        axios.get('http://localhost:5000/api/chemical-inventory'),
        axios.get('http://localhost:5000/api/equipment-inventory')
      ]);

      const medicines = medicinesRes.data.data || [];
      const chemicals = chemicalsRes.data.data || [];
      const equipment = equipmentRes.data.data || [];

      // Calculate statistics for medicines
      const medicineStats = {
        total: medicines.length,
        lowStock: medicines.filter(m => (m.quantity || 0) <= (m.reorderLevel || 10)).length,
        expired: medicines.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date()).length,
        ok: 0
      };
      medicineStats.ok = medicineStats.total - medicineStats.lowStock - medicineStats.expired;

      // Calculate statistics for chemicals
      const chemicalStats = {
        total: chemicals.length,
        lowStock: chemicals.filter(c => (c.quantity || 0) <= (c.reorderLevel || 10)).length,
        expired: chemicals.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length,
        ok: 0
      };
      chemicalStats.ok = chemicalStats.total - chemicalStats.lowStock - chemicalStats.expired;

      // Calculate statistics for equipment
      const equipmentStats = {
        total: equipment.length,
        lowStock: equipment.filter(e => (e.quantity || 0) <= (e.reorderLevel || 10)).length,
        expired: 0, // Equipment typically doesn't expire
        ok: 0
      };
      equipmentStats.ok = equipmentStats.total - equipmentStats.lowStock;

      setSummaryData({
        medicines: medicineStats,
        chemicals: chemicalStats,
        equipment: equipmentStats
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const PieChart = ({ data, colors, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-base font-semibold mb-3 text-gray-800">{title}</h3>
        <svg width="180" height="180" viewBox="0 0 200 200" className="mb-3">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const startX = 100 + 80 * Math.cos((Math.PI * startAngle) / 180);
            const startY = 100 + 80 * Math.sin((Math.PI * startAngle) / 180);
            const endX = 100 + 80 * Math.cos((Math.PI * endAngle) / 180);
            const endY = 100 + 80 * Math.sin((Math.PI * endAngle) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${startX} ${startY}`,
              `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `Z`
            ].join(' ');
            
            currentAngle = endAngle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          <circle cx="100" cy="100" r="50" fill="white" />
          <text x="100" y="95" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#374151">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" fontSize="12" fill="#6b7280">
            Total
          </text>
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[index] }}></div>
              <span className="text-sm text-gray-700">{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChart = ({ categories, title }) => {
    const maxValue = Math.max(
      ...categories.map(cat => cat.total)
    );

    return (
      <div className="w-full">
        <h3 className="text-base font-semibold mb-3 text-gray-800 text-center">{title}</h3>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm font-medium text-gray-700">{category.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-6 rounded-full transition-all duration-500"
                  style={{
                    width: `${(category.total / maxValue) * 100}%`,
                    backgroundColor: category.color
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {category.total > 0 && `${category.total} items`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading summary data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <div className="no-print bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/inventory-dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Printer className="w-5 h-5" />
            Print Summary
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={printRef} className="max-w-7xl mx-auto p-6 print-content">
        {/* Page Title */}
        <div className="mb-6 page-header">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Inventory Summary Report</h1>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Medicine Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Medicines</h3>
                <p className="text-2xl font-bold text-blue-600">{summaryData.medicines.total}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">OK Stock:</span>
                <span className="font-semibold text-green-600">{summaryData.medicines.ok}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-semibold text-orange-600">{summaryData.medicines.lowStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expired:</span>
                <span className="font-semibold text-red-600">{summaryData.medicines.expired}</span>
              </div>
            </div>
          </div>

          {/* Chemical Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chemicals</h3>
                <p className="text-2xl font-bold text-purple-600">{summaryData.chemicals.total}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">OK Stock:</span>
                <span className="font-semibold text-green-600">{summaryData.chemicals.ok}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-semibold text-orange-600">{summaryData.chemicals.lowStock}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expired:</span>
                <span className="font-semibold text-red-600">{summaryData.chemicals.expired}</span>
              </div>
            </div>
          </div>

          {/* Equipment Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Equipment</h3>
                <p className="text-2xl font-bold text-green-600">{summaryData.equipment.total}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">OK Stock:</span>
                <span className="font-semibold text-green-600">{summaryData.equipment.ok}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-semibold text-orange-600">{summaryData.equipment.lowStock}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Medicine Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PieChart
              title="Medicine Status Distribution"
              data={[
                { label: 'OK Stock', value: summaryData.medicines.ok },
                { label: 'Low Stock', value: summaryData.medicines.lowStock },
                { label: 'Expired', value: summaryData.medicines.expired }
              ]}
              colors={['#10b981', '#f59e0b', '#ef4444']}
            />
          </div>

          {/* Chemical Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PieChart
              title="Chemical Status Distribution"
              data={[
                { label: 'OK Stock', value: summaryData.chemicals.ok },
                { label: 'Low Stock', value: summaryData.chemicals.lowStock },
                { label: 'Expired', value: summaryData.chemicals.expired }
              ]}
              colors={['#10b981', '#f59e0b', '#ef4444']}
            />
          </div>

          {/* Equipment Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PieChart
              title="Equipment Status Distribution"
              data={[
                { label: 'OK Stock', value: summaryData.equipment.ok },
                { label: 'Low Stock', value: summaryData.equipment.lowStock }
              ]}
              colors={['#10b981', '#f59e0b']}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <BarChart
            title="Total Inventory Comparison"
            categories={[
              { name: 'Medicines', total: summaryData.medicines.total, color: '#3b82f6' },
              { name: 'Chemicals', total: summaryData.chemicals.total, color: '#8b5cf6' },
              { name: 'Equipment', total: summaryData.equipment.total, color: '#10b981' }
            ]}
          />
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Total Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600">
                {summaryData.medicines.lowStock + summaryData.chemicals.lowStock + summaryData.equipment.lowStock}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 mb-1">Total Expired Items</p>
              <p className="text-3xl font-bold text-red-600">
                {summaryData.medicines.expired + summaryData.chemicals.expired}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total OK Items</p>
              <p className="text-3xl font-bold text-green-600">
                {summaryData.medicines.ok + summaryData.chemicals.ok + summaryData.equipment.ok}
              </p>
            </div>
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
            © 2025 Family Clinic - Inventory Management System
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide non-printable elements */
          .no-print {
            display: none !important;
          }
          
          /* Show print-only elements */
          .print-only {
            display: block !important;
          }
          
          /* Reset body and page styles */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Page setup - Allow multiple pages */
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          
          /* Ensure content fits on page */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Main container - scale down to fit */
          .print-content {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0.5rem !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          
          .max-w-7xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0.5rem !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
          
          /* Page header alignment */
          .page-header {
            width: 100% !important;
            margin-bottom: 0.5rem !important;
            padding: 0 !important;
          }
          
          .page-header h1 {
            font-size: 1.25rem !important;
            margin-bottom: 0.25rem !important;
          }
          
          .page-header p {
            font-size: 0.75rem !important;
          }
          
          /* Ensure all content aligns */
          .print-content > * {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          /* Remove shadows and borders for print */
          .shadow-sm, .shadow {
            box-shadow: none !important;
          }
          
          /* Cards styling */
          .bg-white {
            border: 1px solid #e5e7eb !important;
          }
          
          /* Compact spacing for print */
          .mb-8 {
            margin-bottom: 0.5rem !important;
          }
          
          .mb-6 {
            margin-bottom: 0.5rem !important;
          }
          
          .mb-4 {
            margin-bottom: 0.3rem !important;
          }
          
          .p-6 {
            padding: 0.6rem !important;
          }
          
          .gap-6 {
            gap: 0.5rem !important;
          }
          
          .gap-4 {
            gap: 0.5rem !important;
          }
          
          /* Grid alignment */
          .grid {
            width: 100% !important;
          }
          
          .grid > * {
            box-sizing: border-box !important;
          }
          
          /* Title spacing */
          h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.25rem !important;
            page-break-after: avoid;
          }
          
          h2 {
            font-size: 1.25rem !important;
            margin-bottom: 0.25rem !important;
            page-break-after: avoid;
          }
          
          h3 {
            font-size: 1rem !important;
            margin-bottom: 0.25rem !important;
            page-break-after: avoid;
          }
          
          /* Summary cards - make compact */
          .grid.grid-cols-3 > div {
            padding: 0.5rem !important;
          }
          
          .grid.grid-cols-3 > div > div:first-child {
            margin-bottom: 0.5rem !important;
          }
          
          .grid.grid-cols-3 > div > div:first-child > div:first-child {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }
          
          .grid.grid-cols-3 > div > div:first-child > div:first-child svg {
            width: 1.5rem !important;
            height: 1.5rem !important;
          }
          
          .grid.grid-cols-3 h3 {
            font-size: 0.875rem !important;
          }
          
          .grid.grid-cols-3 p.text-2xl {
            font-size: 1.25rem !important;
          }
          
          /* Charts - make smaller for 3-column layout */
          svg[width="180"] {
            width: 120px !important;
            height: 120px !important;
          }
          
          .grid.grid-cols-2 > div {
            padding: 0.5rem !important;
          }
          
          /* Pie charts in 3 columns */
          .grid.grid-cols-3.gap-4.mb-6 > div {
            padding: 0.4rem !important;
          }
          
          .grid.grid-cols-3.gap-4.mb-6 h3 {
            font-size: 0.7rem !important;
            margin-bottom: 0.2rem !important;
          }
          
          /* Bar chart section */
          .space-y-4 {
            gap: 0.3rem !important;
          }
          
          .h-6 {
            height: 1.25rem !important;
          }
          
          /* Alert section - compact */
          .grid.grid-cols-3.gap-4 > div {
            padding: 0.5rem !important;
          }
          
          .grid.grid-cols-3.gap-4 p.text-3xl {
            font-size: 1.5rem !important;
          }
          
          /* Force print background colors */
          .bg-blue-100, .bg-blue-600, .bg-purple-100, .bg-purple-600, 
          .bg-green-100, .bg-green-600, .bg-orange-50, .bg-red-50, 
          .bg-green-50, .bg-teal-600, .bg-orange-200, .bg-red-200, .bg-green-200 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure chart colors print correctly */
          svg path, svg circle, svg text, svg rect {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Prevent orphan sections */
          .bg-white.rounded-lg {
            page-break-inside: avoid;
          }
          
          /* Scale entire content to fit */
          body > div {
            transform: scale(0.85);
            transform-origin: top center;
            width: 117.65% !important;
            margin: 0 -8.825% !important;
          }
          
          /* Print footer */
          .print-only.mt-8 {
            margin-top: 1rem !important;
            padding-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InventorySummary;
