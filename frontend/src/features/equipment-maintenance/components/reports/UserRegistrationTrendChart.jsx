import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * UserRegistrationTrendChart Component
 * Shows monthly user registration trends
 */
const UserRegistrationTrendChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Registration Trend</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No registration data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">User Registration Trend</h3>
        <p className="text-sm text-gray-600">Monthly new user registrations</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="count"
            name="New Users"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Registrations</p>
          <p className="text-xl font-semibold text-gray-900">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Average per Month</p>
          <p className="text-xl font-semibold text-gray-900">
            {Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Peak Month</p>
          <p className="text-xl font-semibold text-gray-900">
            {data.reduce((max, item) => item.count > max.count ? item : max, data[0])?.month || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationTrendChart;
