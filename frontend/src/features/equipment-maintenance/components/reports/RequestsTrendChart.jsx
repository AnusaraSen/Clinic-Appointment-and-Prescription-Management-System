import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * RequestsTrendChart Component
 * Shows line chart of maintenance requests created vs completed over time
 */
const RequestsTrendChart = ({ data, loading }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Requests Trend</h3>
        <div className="h-72 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Requests Trend</h3>
        <div className="h-72 flex items-center justify-center text-gray-500">
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Maintenance Requests Trend</h3>
          <p className="text-sm text-gray-600">Monthly request volume and completion rate</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Created"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              name="Completed"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Summary stats below chart */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Created</p>
          <p className="text-xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + (item.created || 0), 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Completed</p>
          <p className="text-xl font-bold text-green-600">
            {data.reduce((sum, item) => sum + (item.completed || 0), 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Backlog</p>
          <p className="text-xl font-bold text-orange-600">
            {data.reduce((sum, item) => sum + (item.created || 0) - (item.completed || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestsTrendChart;
