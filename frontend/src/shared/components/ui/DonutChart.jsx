import React from 'react';

/**
 * 📊 Professional SVG Donut Chart Component
 * 
 * Features:
 * ✅ SVG-based rendering for crisp graphics
 * ✅ Interactive legend with statistics
 * ✅ Color-coded segments for different statuses
 * ✅ Center text with total count
 * ✅ Responsive design
 * ✅ Smooth animations
 */

export const DonutChart = ({ data, centerText, title, size = 200 }) => {
  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-400 text-2xl">📊</span>
        </div>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  // Calculate angles for each segment
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage: Math.round(percentage),
      startAngle,
      endAngle,
      id: `segment-${index}`
    };
  });

  // SVG path calculation for donut segments
  const createPath = (startAngle, endAngle, outerRadius, innerRadius) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    const x1 = size/2 + outerRadius * Math.cos(startAngleRad);
    const y1 = size/2 + outerRadius * Math.sin(startAngleRad);
    const x2 = size/2 + outerRadius * Math.cos(endAngleRad);
    const y2 = size/2 + outerRadius * Math.sin(endAngleRad);
    
    const x3 = size/2 + innerRadius * Math.cos(endAngleRad);
    const y3 = size/2 + innerRadius * Math.sin(endAngleRad);
    const x4 = size/2 + innerRadius * Math.cos(startAngleRad);
    const y4 = size/2 + innerRadius * Math.sin(startAngleRad);
    
    return [
      'M', x1, y1,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
      'L', x3, y3,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
      'Z'
    ].join(' ');
  };

  const outerRadius = size * 0.4;
  const innerRadius = size * 0.25;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Donut Chart SVG */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => (
            <g key={segment.id}>
              <path
                d={createPath(segment.startAngle, segment.endAngle, outerRadius, innerRadius)}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{centerText || total}</span>
          <span className="text-sm text-gray-500 font-medium">
            {title || 'Total'}
          </span>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <div>
                  <p className="font-medium text-gray-900">{segment.label}</p>
                  <p className="text-sm text-gray-500">{segment.description || `${segment.percentage}% of total`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{segment.value}</p>
                <p className="text-sm text-gray-500">{segment.percentage}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-xl font-bold text-gray-900">{segments.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};