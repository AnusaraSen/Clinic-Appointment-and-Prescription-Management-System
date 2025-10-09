import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * TechnicianWorkloadChart Component
 * Shows horizontal bar chart of requests per technician
 */
const TechnicianWorkloadChart = ({ data, loading }) => {
  // Sort by request count descending
  const sortedData = [...(data || [])].sort((a, b) => b.requestCount - a.requestCount);

  // Color gradient based on workload
  const getBarColor = (count, maxCount) => {
    const ratio = count / maxCount;
    if (ratio >= 0.8) return '#ef4444'; // red - overloaded
    if (ratio >= 0.6) return '#f59e0b'; // orange - busy
    if (ratio >= 0.4) return '#3b82f6'; // blue - moderate
    return '#10b981'; // green - light load
  };

  const maxCount = Math.max(...sortedData.map(t => t.requestCount), 1);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Assigned Requests: <span className="font-bold">{data.requestCount}</span>
          </p>
          {data.availability && (
            <p className="text-sm text-gray-600">
              Status: <span className={`font-bold ${
                data.availability === 'available' ? 'text-green-600' : 
                data.availability === 'busy' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {data.availability}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests per Technician</h3>
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Requests per Technician</h3>
        <div className="h-72 flex items-center justify-center text-gray-500">
          No technician data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Requests per Technician</h3>
        <div className="text-sm text-gray-600">
          <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Light
          <span className="inline-block w-3 h-3 bg-blue-500 rounded ml-3 mr-1"></span>Moderate
          <span className="inline-block w-3 h-3 bg-orange-500 rounded ml-3 mr-1"></span>Busy
          <span className="inline-block w-3 h-3 bg-red-500 rounded ml-3 mr-1"></span>Overloaded
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="requestCount" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.requestCount, maxCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TechnicianWorkloadChart;
