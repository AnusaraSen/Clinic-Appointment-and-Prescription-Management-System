# Maintenance Reports - Backend API Requirements

## Overview
This document outlines the backend API endpoints required for the Maintenance Reports feature to function properly.

## Required API Endpoints

### 1. Get Report Metrics (KPIs)
**Endpoint:** `GET /api/maintenance-requests/reports/metrics`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `status` (optional): Open, In Progress, Completed, Cancelled
- `priority` (optional): Critical, High, Medium, Low

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 245,
    "completionRate": 87,
    "avgCompletionTime": 16,
    "activeTechnicians": 12,
    "totalCost": 8450,
    "requestsTrend": {
      "value": "+12%",
      "isPositive": true
    },
    "completionTrend": {
      "value": "+8%",
      "isPositive": true
    },
    "timeTrend": {
      "value": "-2 hrs",
      "isPositive": true
    },
    "techniciansTrend": {
      "value": "+2",
      "isPositive": true
    },
    "costTrend": {
      "value": "+$450",
      "isPositive": false
    }
  }
}
```

### 2. Get Status Distribution
**Endpoint:** `GET /api/maintenance-requests/reports/status-distribution`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "status": "Open",
      "count": 37,
      "percentage": 15
    },
    {
      "status": "In Progress",
      "count": 49,
      "percentage": 20
    },
    {
      "status": "Completed",
      "count": 147,
      "percentage": 60
    },
    {
      "status": "Cancelled",
      "count": 12,
      "percentage": 5
    }
  ]
}
```

### 3. Get Technician Workload
**Endpoint:** `GET /api/technicians/reports/workload`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "technician_id": "T001",
      "name": "John Smith",
      "requestCount": 24,
      "availability": "busy"
    },
    {
      "technician_id": "T002",
      "name": "Maria Garcia",
      "requestCount": 18,
      "availability": "available"
    }
  ]
}
```

### 4. Get Requests Trend
**Endpoint:** `GET /api/maintenance-requests/reports/trend`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `groupBy` (optional): 'month' or 'week', default 'month'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "created": 28,
      "completed": 24
    },
    {
      "month": "Feb",
      "created": 35,
      "completed": 32
    },
    {
      "month": "Mar",
      "created": 42,
      "completed": 40
    }
  ]
}
```

### 5. Get Detailed Requests (Already exists)
**Endpoint:** `GET /api/maintenance-requests`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `status` (optional)
- `priority` (optional)
- `technicianId` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "request_id": "MR-1001",
      "title": "AC not cooling",
      "description": "...",
      "status": "In Progress",
      "priority": "High",
      "reportedBy": {
        "_id": "...",
        "name": "John Doe"
      },
      "assignedTo": {
        "_id": "...",
        "firstName": "Maria",
        "lastName": "Garcia"
      },
      "equipment": [
        {
          "_id": "...",
          "name": "HVAC Unit A"
        }
      ],
      "date": "2025-10-07T00:00:00.000Z",
      "cost": 250,
      "createdAt": "2025-10-05T10:00:00.000Z",
      "updatedAt": "2025-10-06T14:30:00.000Z"
    }
  ]
}
```

## Backend Implementation Notes

### Aggregation Examples

#### For Metrics Endpoint:
```javascript
// Calculate completion rate
const totalRequests = await MaintenanceRequest.countDocuments({ 
  createdAt: { $gte: startDate, $lte: endDate } 
});

const completedRequests = await MaintenanceRequest.countDocuments({ 
  status: 'Completed',
  createdAt: { $gte: startDate, $lte: endDate } 
});

const completionRate = Math.round((completedRequests / totalRequests) * 100);

// Calculate average completion time
const completedWithTime = await MaintenanceRequest.aggregate([
  {
    $match: {
      status: 'Completed',
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $project: {
      completionTime: {
        $divide: [
          { $subtract: ['$updatedAt', '$createdAt'] },
          1000 * 60 * 60 // Convert to hours
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      avgTime: { $avg: '$completionTime' }
    }
  }
]);

const avgCompletionTime = Math.round(completedWithTime[0]?.avgTime || 0);
```

#### For Status Distribution:
```javascript
const distribution = await MaintenanceRequest.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);

const total = distribution.reduce((sum, item) => sum + item.count, 0);

const formattedData = distribution.map(item => ({
  status: item._id,
  count: item.count,
  percentage: Math.round((item.count / total) * 100)
}));
```

#### For Technician Workload:
```javascript
const technicians = await Technician.find()
  .populate('assignedRequests')
  .lean();

const workloadData = technicians.map(tech => ({
  technician_id: tech.technician_id,
  name: `${tech.firstName} ${tech.lastName}`,
  requestCount: tech.assignedRequests?.length || 0,
  availability: tech.availabilityStatus
}));
```

#### For Requests Trend:
```javascript
const trend = await MaintenanceRequest.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      },
      created: { $sum: 1 },
      completed: {
        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
      }
    }
  },
  {
    $sort: { '_id.year': 1, '_id.month': 1 }
  }
]);

// Format month names
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formattedTrend = trend.map(item => ({
  month: monthNames[item._id.month - 1],
  created: item.created,
  completed: item.completed
}));
```

## Next Steps

1. Create these controller methods in your backend
2. Add routes to your Express router
3. Test endpoints with Postman or similar tool
4. The frontend will automatically connect once endpoints return the expected data structure

## Testing the Frontend Without Backend

You can test the frontend with mock data by temporarily modifying `reportsApi.js` to return mock data instead of making API calls.
