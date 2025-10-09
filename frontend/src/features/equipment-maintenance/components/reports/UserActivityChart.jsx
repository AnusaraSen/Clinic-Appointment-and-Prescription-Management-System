import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * UserActivityChart Component
 * Shows login traffic over time (Day/Week/Month views)
 */
const UserActivityChart = ({ data, loading }) => {
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'

  // Helper function to generate sample data
  const generateSampleData = (range) => {
    const now = new Date();
    const sampleData = [];

    if (range === 'day') {
      // Last 24 hours, hourly buckets
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        sampleData.push({
          time: hour.getHours() + ':00',
          logins: Math.floor(Math.random() * 15) + 1
        });
      }
    } else if (range === 'week') {
      // Last 7 days, daily buckets
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        sampleData.push({
          time: days[day.getDay()],
          logins: Math.floor(Math.random() * 30) + 5
        });
      }
    } else {
      // Last 30 days, daily buckets
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        sampleData.push({
          time: `${day.getMonth() + 1}/${day.getDate()}`,
          logins: Math.floor(Math.random() * 25) + 3
        });
      }
    }

    return sampleData;
  };

  const aggregateLoginsByTimeRange = (loginEvents, range) => {
    const now = new Date();
  const buckets = new Map();

    if (range === 'day') {
      // Initialize all 24 hours with 0
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourKey = hour.getHours();
        const displayKey = `${hourKey.toString().padStart(2, '0')}:00`;
        buckets.set(hourKey, { time: displayKey, logins: 0, sortOrder: 23 - i });
      }

      // Count actual logins
      loginEvents.forEach(loginDate => {
        const hoursDiff = Math.floor((now - loginDate) / (1000 * 60 * 60));
        if (hoursDiff >= 0 && hoursDiff < 24) {
          const hourKey = loginDate.getHours();
          if (buckets.has(hourKey)) {
            buckets.get(hourKey).logins++;
          }
        }
      });

      // Convert to sorted array
      return Array.from(buckets.values()).sort((a, b) => a.sortOrder - b.sortOrder);

    } else if (range === 'week') {
      // Initialize all 7 days with 0
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayMap = new Map();
      
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const dateKey = day.toDateString(); // Unique key for each date
        dayMap.set(dateKey, {
          time: days[day.getDay()],
          logins: 0,
          sortOrder: 6 - i,
          date: day
        });
      }

      // Count actual logins
      loginEvents.forEach(loginDate => {
        // Normalize login date to start of day for comparison
        const loginDay = new Date(loginDate);
        loginDay.setHours(0, 0, 0, 0);
        const dateKey = loginDay.toDateString();
        
        if (dayMap.has(dateKey)) {
          dayMap.get(dateKey).logins++;
        }
      });

      return Array.from(dayMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

    } else {
      // Initialize all 30 days with 0
      const dateMap = new Map();
      
      for (let i = 29; i >= 0; i--) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        const dateKey = day.toDateString();
        const displayKey = `${day.getMonth() + 1}/${day.getDate()}`;
        dateMap.set(dateKey, {
          time: displayKey,
          logins: 0,
          sortOrder: 29 - i,
          date: day
        });
      }

      // Count actual logins
      loginEvents.forEach(loginDate => {
        // Normalize login date to start of day for comparison
        const loginDay = new Date(loginDate);
        loginDay.setHours(0, 0, 0, 0);
        const dateKey = loginDay.toDateString();
        
        if (dateMap.has(dateKey)) {
          dateMap.get(dateKey).logins++;
        }
      });

      return Array.from(dateMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    }
  };

  // Process data into time-series format
  // Expected input: array of user objects with loginTimestamps array or lastLoginDate
  // If not available, we'll generate mock data for demonstration
  const processLoginData = useMemo(() => {
    console.log('UserActivityChart: Received data prop:', data);
    console.log('UserActivityChart: data type:', Array.isArray(data) ? 'array' : typeof data, '| length:', data?.length);
    
    if (!data || data.length === 0) {
      console.warn('UserActivityChart: No data provided, showing sample data');
      return generateSampleData(timeRange);
    }

    const now = new Date();
    const loginEvents = [];

    // Extract login timestamps from data
    data.forEach(user => {
      // Check for loginTimestamps array (preferred)
      if (user.loginTimestamps && Array.isArray(user.loginTimestamps)) {
        user.loginTimestamps.forEach(timestamp => {
          const loginDate = new Date(timestamp);
          if (!isNaN(loginDate.getTime())) {
            loginEvents.push(loginDate);
          }
        });
      } 
      // Fallback: use lastLoginDate if available
      else if (user.lastLoginDate || user.lastLogin) {
        const loginDate = new Date(user.lastLoginDate || user.lastLogin);
        if (!isNaN(loginDate.getTime())) {
          loginEvents.push(loginDate);
        }
      }
      // Fallback: use daysSinceLogin to approximate
      else if (user.daysSinceLogin !== null && user.daysSinceLogin !== undefined) {
        const loginDate = new Date(now.getTime() - user.daysSinceLogin * 24 * 60 * 60 * 1000);
        loginEvents.push(loginDate);
      }
    });

    console.log('UserActivityChart: Extracted', loginEvents.length, 'login events');
    console.log('UserActivityChart: Time range:', timeRange);
    console.log('UserActivityChart: Sample events:', loginEvents.slice(0, 3).map(d => d.toISOString()));

    // If no events, show empty chart with all zeros instead of sample data
    if (loginEvents.length === 0) {
      console.warn('UserActivityChart: No valid login events found in data');
      // Return zero-filled buckets instead of sample data
      return aggregateLoginsByTimeRange([], timeRange);
    }

    // Aggregate by time range
    const aggregated = aggregateLoginsByTimeRange(loginEvents, timeRange);
    console.log('UserActivityChart: Aggregated data points:', aggregated.length);
    console.log('UserActivityChart: Total logins:', aggregated.reduce((sum, d) => sum + d.logins, 0));
    return aggregated;
  }, [data, timeRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.time}</p>
          <p className="text-sm font-medium text-blue-600">
            {data.logins} {data.logins === 1 ? 'login' : 'logins'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = processLoginData;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Login Traffic</h3>
          <p className="text-sm text-gray-600">Number of user logins over time</p>
        </div>
        
        {/* Time Range Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No login data available for this time range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
              angle={timeRange === 'month' ? -45 : 0}
              textAnchor={timeRange === 'month' ? 'end' : 'middle'}
              height={timeRange === 'month' ? 60 : 30}
            />
            <YAxis 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }} 
              allowDecimals={false}
              label={{ value: 'Logins', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="logins"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Logins"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
        {timeRange === 'day' && 'Showing hourly login counts for the last 24 hours'}
        {timeRange === 'week' && 'Showing daily login counts for the last 7 days'}
        {timeRange === 'month' && 'Showing daily login counts for the last 30 days'}
      </div>
    </div>
  );
};

export default UserActivityChart;
