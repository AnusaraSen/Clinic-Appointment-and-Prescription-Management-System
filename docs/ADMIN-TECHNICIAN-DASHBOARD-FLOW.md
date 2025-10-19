# Equipment Maintenance System - Dashboard Flow Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [Admin Dashboard Flow](#admin-dashboard-flow)
4. [Technician Dashboard Flow](#technician-dashboard-flow)
5. [API Endpoints](#api-endpoints)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Component Relationships](#component-relationships)
8. [Database Models](#database-models)
9. [Key Features](#key-features)

---

## 🎯 System Overview

The Equipment Maintenance Management System is a full-stack web application designed to manage clinic equipment maintenance, work requests, and technician assignments. It consists of two main dashboard types:

- **Admin Dashboard**: Complete oversight of maintenance operations, equipment status, user management, and analytics
- **Technician Dashboard**: Personal workspace for technicians to view assigned tasks, update status, and manage schedules

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │  Admin Dashboard     │         │ Technician Dashboard │     │
│  │  - Statistics        │         │  - Assigned Tasks    │     │
│  │  - Equipment Mgmt    │         │  - Schedule View     │     │
│  │  - User Management   │         │  - Status Updates    │     │
│  │  - Reports           │         │  - Work Requests     │     │
│  └──────────┬───────────┘         └──────────┬───────────┘     │
│             │                                 │                  │
│             └─────────────┬───────────────────┘                  │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │  API Layer  │                              │
│                    │  (Axios)    │                              │
│                    └──────┬──────┘                              │
└────────────────────────────┼───────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼───────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Controllers                           │  │
│  │  ┌─────────────┬──────────────┬────────────────────────┐ │  │
│  │  │ Dashboard   │ Maintenance  │ Equipment  │ Technician │ │  │
│  │  │ Statistics  │ Request      │ Controller │ Controller │ │  │
│  │  └─────────────┴──────────────┴────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                        Services                           │  │
│  │  - Equipment Status Service                               │  │
│  │  - Notification Service                                   │  │
│  │  - User Creation Service                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                         Models                            │  │
│  │  - Equipment                                              │  │
│  │  - MaintenanceRequest                                     │  │
│  │  - Technician                                             │  │
│  │  - ScheduledMaintenance                                   │  │
│  │  - User                                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Atlas  │
                    │    Database     │
                    └─────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   Login     │
│   Page      │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ {email, password}
       ▼
┌─────────────────┐
│  Auth Middleware│
│  - Validates    │
│  - Generates JWT│
└──────┬──────────┘
       │
       │ Returns: {token, user}
       ▼
┌─────────────────┐
│  AuthContext    │
│  - Stores user  │
│  - Stores token │
└──────┬──────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌─────────────────┐
│ Admin        │   │  Technician     │
│ Dashboard    │   │  Dashboard      │
│ (role: admin)│   │ (role: technician)│
└──────────────┘   └─────────────────┘
```

---

## 👨‍💼 Admin Dashboard Flow

### 1. Dashboard Initialization

```javascript
// File: frontend/src/features/admin-management/pages/AdminDashboardPage.jsx
// Entry Point

User logs in with admin role
    ↓
AdminDashboardPage component renders
    ↓
Wrapped in ProfessionalLayout (navigation, header)
    ↓
Renders AdminDashboard component
```

### 2. Data Fetching Flow

```javascript
// File: frontend/src/features/admin-management/components/Dashboard.jsx

useEffect() triggers on mount
    ↓
fetchAndBuildDashboard() executes
    ↓
┌─────────────────────────────────────────┐
│ API Call 1: fetchDashboardStatistics() │
│ GET /api/dashboard/statistics           │
│                                         │
│ Returns:                                │
│ - User metrics (total, by role)        │
│ - Equipment metrics (status, types)    │
│ - Maintenance request metrics           │
│ - Work request statistics               │
│ - Technician availability               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│ API Call 2: GET /api/maintenance-requests│
│                                         │
│ Returns:                                │
│ - All maintenance requests (list)       │
│ - Populated with:                       │
│   * Equipment details                   │
│   * Assigned technician info            │
│   * Reporter information                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
    Data stored in state (setDashboardData, setMaintenanceRequests)
```

### 3. Dashboard Components Structure

```
AdminDashboard (Main Container)
│
├─── Header Section
│    ├── Refresh Button (manual refresh)
│    ├── Last Refresh Time
│    └── System Status Indicators
│
├─── EnhancedKPICards
│    │   // File: frontend/src/features/admin-management/components/EnhancedKPICards.jsx
│    │
│    ├── Total Users Card
│    │   └── Shows: Total users count, breakdown by role
│    │
│    ├── Equipment Status Card
│    │   ├── Operational count
│    │   ├── Under Maintenance count
│    │   ├── Out of Service count
│    │   └── Critical Equipment count
│    │
│    ├── Maintenance Requests Card
│    │   ├── Total requests
│    │   ├── Pending (Open status)
│    │   ├── In Progress
│    │   └── Completed
│    │
│    └── Technician Availability Card
│        ├── Available technicians
│        ├── Busy technicians
│        └── Unavailable technicians
│
├─── MaintenanceOverviewSection
│    │   // File: frontend/src/features/equipment-maintenance/components/MaintenanceOverviewSection.jsx
│    │
│    ├── Tab Navigation
│    │   ├── Work Requests Tab
│    │   ├── Equipment Tab
│    │   └── Maintenance Schedule Tab
│    │
│    ├── Work Requests Tab
│    │   ├── WorkRequestKPICards (mini stats)
│    │   ├── WorkRequestFilters (status, priority, date)
│    │   ├── WorkRequestsTable
│    │   │   ├── Request ID
│    │   │   ├── Title
│    │   │   ├── Equipment
│    │   │   ├── Status Badge
│    │   │   ├── Priority Badge
│    │   │   ├── Assigned Technician
│    │   │   └── Actions:
│    │   │       ├── View Details
│    │   │       ├── Assign Technician
│    │   │       └── Edit Request
│    │   └── Create New Request Button
│    │       └── Opens: CreateWorkRequestModal
│    │
│    ├── Equipment Tab
│    │   ├── EquipmentKPICards (equipment stats)
│    │   ├── Search & Filter Controls
│    │   ├── EquipmentListTable
│    │   │   ├── Equipment ID
│    │   │   ├── Name
│    │   │   ├── Type
│    │   │   ├── Location
│    │   │   ├── Status Badge
│    │   │   ├── Last Maintenance Date
│    │   │   ├── Next Maintenance Date
│    │   │   └── Actions:
│    │   │       ├── View Details
│    │   │       ├── Edit Equipment
│    │   │       └── Delete Equipment
│    │   └── Add Equipment Button
│    │       └── Opens: AddEquipmentModal
│    │
│    └── Maintenance Schedule Tab
│        ├── SimplifiedMaintenanceSchedule
│        │   ├── Calendar View (upcoming maintenance)
│        │   ├── Task Cards (scheduled maintenance)
│        │   │   ├── Equipment Name
│        │   │   ├── Maintenance Type
│        │   │   ├── Scheduled Date & Time
│        │   │   ├── Assigned Technician
│        │   │   ├── Status Badge
│        │   │   └── Priority Indicator
│        │   └── Create Schedule Button
│        │       └── Opens: MaintenanceTaskModal
│        └── Filter by technician/date/status
│
└─── UserManagementSection
     │   // File: frontend/src/features/admin-management/components/UserManagementSection.jsx
     │
     ├── UserStatisticsCards
     │   ├── Total Users
     │   ├── Active Users
     │   ├── Recent Registrations
     │   └── User by Role Distribution
     │
     ├── LatestUsersTable
     │   ├── User Avatar/Name
     │   ├── Email
     │   ├── Role Badge
     │   ├── Status (Active/Inactive)
     │   ├── Registration Date
     │   └── Actions:
     │       ├── View Details
     │       ├── Edit User
     │       ├── Deactivate User
     │       └── Delete User
     │
     └── Add User Button
         └── Opens: AddUserModal
```

### 4. Admin Actions Flow

#### 4.1 Creating a Maintenance Request

```
Admin clicks "Create Request" button
    ↓
CreateWorkRequestModal opens
    ↓
Admin fills form:
    - Title
    - Description
    - Equipment (select from dropdown)
    - Priority (Low/Medium/High/Critical)
    - Category (Repair/Preventive/Inspection)
    - Date & Time
    - Estimated Hours
    ↓
Form validation (Joi schema)
    ↓
POST /api/maintenance-requests
    {
        title, description, equipment,
        priority, category, date, time,
        estimatedHours, reportedBy
    }
    ↓
Backend: MaintenanceRequestController.createRequest()
    ↓
    1. Validates request data
    2. Creates MaintenanceRequest document
    3. Auto-updates equipment status (if urgent)
    4. Creates notification for admin/technician
    ↓
Response: { success: true, data: newRequest }
    ↓
Frontend updates:
    - Closes modal
    - Refreshes maintenance requests list
    - Shows success notification
    - Updates KPI cards
```

#### 4.2 Assigning Technician to Request

```
Admin clicks "Assign" button on request
    ↓
AssignTechnicianModal opens
    ↓
Fetches available technicians:
    GET /api/technicians
    ↓
Displays technician cards with:
    - Name & specialization
    - Current workload bar
    - Assigned requests count
    - Availability status
    - Match score (based on equipment type & skills)
    ↓
Admin selects technician
    ↓
POST /api/maintenance-requests/:id/assign
    { technicianId }
    ↓
Backend: MaintenanceRequestController.assignRequest()
    ↓
    1. Validates technician availability
    2. Checks if request already assigned:
       - If YES: Removes from previous technician's array
       - Updates previous technician's workload
    3. Adds request to new technician's assignedRequests array
    4. Updates request status to "In Progress"
    5. Sets startedAt timestamp
    6. Creates notification for technician
    ↓
Response: { success: true, data: updatedRequest }
    ↓
Frontend updates:
    - Closes modal
    - Updates request status in table
    - Shows technician name
    - Technician's workload count updates
    - Success notification shown
```

#### 4.3 Adding Equipment

```
Admin clicks "Add Equipment" button
    ↓
AddEquipmentModal opens
    ↓
Admin fills form:
    - Equipment ID (EQ-XXXX format)
    - Name
    - Type (X-Ray Machine, ECG, etc.)
    - Location
    - Status (Operational/Under Maintenance/etc.)
    - Manufacturer
    - Model Number
    - Serial Number
    - Purchase Date
    - Warranty Expiry
    - Maintenance Interval (in days)
    - Critical Equipment checkbox
    - Notes
    ↓
Form validation
    ↓
POST /api/equipment
    { equipment data }
    ↓
Backend: EquipmentController.createEquipment()
    ↓
    1. Creates Equipment document with basic fields
    2. Updates additional fields via MongoDB collection.updateOne()
    3. IF maintenanceInterval provided:
       - Calculates nextMaintenance date (today + interval days)
       - Calls autoScheduleForEquipment()
           - Creates ScheduledMaintenance record
           - Sets scheduled_date = today + interval
           - Updates equipment.nextMaintenance field
    4. Sets status to "Operational" by default
    ↓
Response: { success: true, data: newEquipment }
    ↓
Frontend updates:
    - Closes modal
    - Adds equipment to table
    - Updates equipment KPIs
    - Shows success notification
```

#### 4.4 Viewing Reports

```
Admin clicks "Reports" navigation
    ↓
MaintenanceReportsPage loads
    ↓
Displays:
    - Date Range Picker
    - Technician Filter (dropdown)
    - Status Filter
    - Priority Filter
    ↓
Admin selects filters and clicks "Generate Report"
    ↓
POST /api/maintenance-requests/reports/export
    {
        dateRange: { start, end },
        assignedTo: technicianId,
        status,
        priority
    }
    ↓
Backend: MaintenanceRequestController.exportFilteredMaintenanceRequests()
    ↓
    1. Builds MongoDB query from filters
    2. Fetches matching maintenance requests
    3. Populates equipment, technician, reporter data
    4. Generates Excel file using ExcelJS
       - Summary Sheet (statistics)
       - Details Sheet (full data)
       - Charts and formatting
    ↓
Response: Excel file download
    ↓
Frontend:
    - Triggers file download
    - Shows success notification
```

---

## 👨‍🔧 Technician Dashboard Flow

### 1. Dashboard Initialization

```javascript
// File: frontend/src/features/equipment-maintenance/pages/TechnicianDashboard.jsx

User logs in with technician role
    ↓
TechnicianDashboard component renders
    ↓
useAuth() hook provides: user object { id, email, name, role }
    ↓
useEffect() triggers fetchTechnicianDashboard()
```

### 2. Technician Data Fetching Flow

```javascript
fetchTechnicianDashboard() {
    
    // STEP 1: Find Technician Record
    GET /api/technicians
        ↓
    Response: { data: [all technicians] }
        ↓
    Filter: find technician where tech.user === userId
        ↓
    Extract: technicianId
    
    // STEP 2: Get Assigned Tasks
    GET /api/maintenance-requests
        ↓
    Response: { data: [all maintenance requests] }
        ↓
    Filter: requests where assignedTo._id === technicianId
        ↓
    Store: assignedTasks[]
    
    // STEP 3: Get Scheduled Maintenance
    GET /api/technicians/:technicianId
        ↓
    Response: { 
        data: {
            technician details,
            scheduledMaintenance: [array of scheduled tasks]
        }
    }
        ↓
    Store: upcomingSchedule[]
    
    // STEP 4: Calculate Dashboard Statistics
    calculateDashboardStats(assignedTasks) {
        total = assignedTasks.length
        pending = tasks where status is 'Open'
        inProgress = tasks where status is 'In Progress'
        completed = tasks where status is 'Completed'
        high_priority = tasks where priority is 'High' or 'Critical'
    }
        ↓
    Store: dashboardData
}
```

### 3. Technician Dashboard Components Structure

```
TechnicianDashboard (Main Container)
│
├─── Header Section
│    ├── Welcome Message (Hi, [Technician Name]!)
│    ├── Refresh Button
│    ├── Last Refresh Time
│    └── System Status
│
├─── TechnicianKPICards
│    │   // File: frontend/src/features/equipment-maintenance/components/TechnicianKPICards.jsx
│    │
│    ├── Total Tasks Card
│    │   └── Count of all assigned tasks
│    │
│    ├── Pending Tasks Card
│    │   └── Count where status = 'Open'
│    │
│    ├── In Progress Card
│    │   └── Count where status = 'In Progress'
│    │
│    └── Completed Card
│        └── Count where status = 'Completed'
│
├─── Tab Navigation
│    ├── Tasks Tab (default)
│    └── Schedule Tab
│
├─── Tasks Tab View
│    │
│    ├── AssignedTasksList
│    │   │   // File: frontend/src/features/equipment-maintenance/components/AssignedTasksList.jsx
│    │   │
│    │   ├── TaskCard (for each assigned task)
│    │   │   ├── Task Header
│    │   │   │   ├── Request ID badge
│    │   │   │   ├── Priority badge
│    │   │   │   └── Status badge
│    │   │   │
│    │   │   ├── Task Body
│    │   │   │   ├── Title
│    │   │   │   ├── Description (truncated)
│    │   │   │   ├── Equipment icon + name
│    │   │   │   ├── Location icon + location
│    │   │   │   ├── Calendar icon + scheduled date/time
│    │   │   │   └── Cost display (if available)
│    │   │   │
│    │   │   └── Task Actions
│    │   │       ├── View Details Button
│    │   │       │   └── Opens: WorkRequestDetailsModal
│    │   │       │       (Read-only view of full request details
│    │   │       │        including technician notes section)
│    │   │       │
│    │   │       └── Update Status Button
│    │   │           └── Opens: TaskStatusModal
│    │   │
│    │   └── Empty State (if no tasks)
│    │       └── Shows: "No tasks assigned yet" message
│    │
│    └── Statistics Summary
│        ├── Total tasks today
│        ├── High priority tasks
│        └── Average completion time
│
└─── Schedule Tab View
     │
     └── TechnicianScheduleView
         │   // File: frontend/src/features/equipment-maintenance/components/TechnicianScheduleView.jsx
         │
         ├── Calendar/Timeline View
         │   └── Shows upcoming scheduled maintenance
         │
         ├── Schedule Cards (for each scheduled task)
         │   ├── Equipment Information
         │   │   ├── Equipment Name
         │   │   ├── Equipment ID
         │   │   └── Location
         │   │
         │   ├── Maintenance Details
         │   │   ├── Title
         │   │   ├── Description
         │   │   ├── Maintenance Type (Preventive/Repair)
         │   │   ├── Priority level
         │   │   └── Estimated Duration
         │   │
         │   ├── Schedule Information
         │   │   ├── Scheduled Date
         │   │   ├── Scheduled Time
         │   │   └── Status badge
         │   │
         │   └── Actions
         │       ├── View Details
         │       └── Update Status
         │           └── Opens: TaskStatusModal (for scheduled maintenance)
         │
         └── Filter Options
             ├── Filter by date
             ├── Filter by status
             └── Filter by priority
```

### 4. Technician Actions Flow

#### 4.1 Viewing Task Details

```
Technician clicks "View Details" on a task card
    ↓
WorkRequestDetailsModal opens
    │   // File: frontend/src/features/equipment-maintenance/components/WorkRequestDetailsModal.jsx
    ↓
Displays in two-column layout:

LEFT COLUMN:
    - Request Overview
        * Request ID
        * Status badge
        * Priority badge
        * Category
    - Equipment Information
        * Equipment name
        * Equipment type
        * Location
        * Current status
    - Schedule Information
        * Reported date
        * Scheduled date/time
        * Started at timestamp
        * Completed at timestamp
    - Technician Notes Section (Read-Only)
        * Shows notes added by technician
        * Cannot be edited by admin
        * Timestamped entries

RIGHT COLUMN:
    - Request Details
        * Title
        * Full description
        * Estimated hours
    - Cost Breakdown
        * Individual cost items
        * Total cost
    - Personnel Information
        * Reported by (name, role)
        * Assigned to (technician name)
    - Additional Notes
        * Admin notes
        * Special instructions

FOOTER:
    - Close button
    - Update Status button (if technician owns the task)
```

#### 4.2 Updating Task Status

```
Technician clicks "Update Status" button
    ↓
TaskStatusModal opens
    │   // File: frontend/src/features/equipment-maintenance/components/TaskStatusModal.jsx
    ↓
Displays form with:
    - Current Status display
    - New Status dropdown:
        * Open
        * In Progress
        * Completed
        * On Hold
    - Notes textarea (for technician notes)
    - Cost input (if completing)
    ↓
Technician fills form and clicks "Update"
    ↓
Validation:
    - Status is required
    - Notes recommended for status change
    ↓
PUT /api/maintenance-requests/:id
    {
        status: newStatus,
        notes: technicianNotes,
        cost: totalCost
    }
    ↓
Backend: MaintenanceRequestController.updateRequest()
    ↓
    1. Gets existing request to compare changes
    2. IF assignedTo is changing:
       - Removes from previous technician's assignedRequests[]
       - Adds to new technician's assignedRequests[]
    3. Updates maintenance request fields
    4. Validates allowed fields (notes is allowed)
    5. IF status = "In Progress":
       - Sets startedAt timestamp
       - Updates equipment status to "Under Maintenance"
    6. IF status = "Completed":
       - Sets completedAt timestamp
       - Calls equipmentStatusService.updateEquipmentStatusOnMaintenanceCompletion()
           - Checks if equipment has other active requests
           - If none, sets equipment status back to "Operational"
       - Removes request from technician's assignedRequests array
       - Creates completion notification
    7. Saves updated request
    8. Creates status update notification
    ↓
Response: { success: true, data: updatedRequest }
    ↓
Frontend updates:
    - Closes modal
    - Updates task card in the list
    - Updates status badge
    - Refreshes KPI cards
    - Shows success notification
    - If completed: removes from active tasks list
```

#### 4.3 Updating Scheduled Maintenance Status

```
Technician clicks "Update Status" on scheduled maintenance
    ↓
TaskStatusModal opens (different context)
    ↓
Similar form but for ScheduledMaintenance
    ↓
Technician changes status and adds notes
    ↓
PUT /api/scheduled-maintenance/:id/status
    {
        status: newStatus,
        notes: technicianNotes
    }
    ↓
Backend: ScheduledMaintenanceController.updateMaintenanceStatus()
    ↓
    1. Validates status (Scheduled/Assigned/In Progress/Completed/Cancelled)
    2. Updates status
    3. IF status = "In Progress":
       - Finds equipment using equipment_id (string like "EQ-1234")
       - Changes: Equipment.findOne({ equipment_id: scheduledMaintenance.equipment_id })
       - Sets equipment status to "Under Maintenance"
    4. IF status = "Completed":
       - Sets completed_at timestamp
       - Calls equipmentStatusService to reset equipment to "Operational"
       - IF recurrence is enabled:
           - Calculates next due date
           - Creates new ScheduledMaintenance record
       - Creates completion notification
    5. Adds technician notes
    6. Updates status_updated_by field
    7. Saves changes
    ↓
Response: { success: true, data: updatedMaintenance }
    ↓
Frontend updates:
    - Closes modal
    - Updates schedule card
    - Updates status badge
    - Refreshes schedule list
    - Shows success notification
```

#### 4.4 Adding Technician Notes

```
While viewing task details OR updating status
    ↓
Technician enters notes in textarea
    ↓
Notes field is part of status update
    ↓
PUT /api/maintenance-requests/:id
    { notes: "Technician's observation and work done" }
    ↓
Backend validation:
    - Joi schema allows 'notes' field (max 1000 characters)
    - Notes field is in allowedFields array
    ↓
Saves to MaintenanceRequest.notes field
    ↓
Admin can view these notes in read-only mode
    ↓
Displayed in WorkRequestDetailsModal:
    - Left column
    - "Technician Notes" section
    - Styled differently from admin notes
    - Clearly marked as technician's input
```

---

## 🔌 API Endpoints Reference

### Dashboard Statistics
```
GET /api/dashboard/statistics
    - Returns comprehensive dashboard metrics
    - Used by: Admin Dashboard
    - Controller: DashboardStatisticsController.getDashboardStatistics()
```

### Maintenance Requests
```
GET /api/maintenance-requests
    - Returns all maintenance requests
    - Query params: status, priority, assignedTo
    - Used by: Both dashboards

POST /api/maintenance-requests
    - Creates new maintenance request
    - Body: { title, description, equipment, priority, category, date, time }
    - Used by: Admin Dashboard

GET /api/maintenance-requests/:id
    - Gets single request details
    - Used by: Detail modals

PUT /api/maintenance-requests/:id
    - Updates maintenance request
    - Body: { status, notes, cost, assignedTo, etc. }
    - Used by: Both dashboards

POST /api/maintenance-requests/:id/assign
    - Assigns technician to request
    - Body: { technicianId }
    - Used by: Admin Dashboard

PUT /api/maintenance-requests/:id/complete
    - Marks request as completed
    - Body: { cost, notes }
    - Used by: Technician Dashboard

DELETE /api/maintenance-requests/:id
    - Deletes maintenance request
    - Used by: Admin Dashboard

POST /api/maintenance-requests/reports/export
    - Generates Excel report with filters
    - Body: { dateRange, assignedTo, status, priority }
    - Used by: Admin Reports Page
```

### Equipment
```
GET /api/equipment
    - Returns all equipment
    - Query params: status, type, location, isCritical
    - Used by: Both dashboards

POST /api/equipment
    - Creates new equipment
    - Body: { equipment_id, name, type, location, maintenanceInterval, etc. }
    - Auto-schedules preventive maintenance
    - Used by: Admin Dashboard

GET /api/equipment/:id
    - Gets single equipment details
    - Used by: Detail modals

PUT /api/equipment/:id
    - Updates equipment
    - Recalculates nextMaintenance if interval changed
    - Used by: Admin Dashboard

DELETE /api/equipment/:id
    - Deletes equipment
    - Used by: Admin Dashboard
```

### Technicians
```
GET /api/technicians
    - Returns all technicians
    - Used by: Both dashboards

POST /api/technicians
    - Creates new technician
    - Body: { name, specialization, phone, email, skills }
    - Used by: Admin Dashboard

GET /api/technicians/:id
    - Gets technician details with assigned tasks and schedule
    - Used by: Technician Dashboard

PUT /api/technicians/:id
    - Updates technician information
    - Used by: Admin Dashboard

DELETE /api/technicians/:id
    - Deletes technician
    - Used by: Admin Dashboard
```

### Scheduled Maintenance
```
GET /api/scheduled-maintenance
    - Returns all scheduled maintenance tasks
    - Query params: technician, equipment_id, status
    - Used by: Both dashboards

POST /api/scheduled-maintenance
    - Creates scheduled maintenance
    - Auto-assigns to technician if specified
    - Used by: Admin Dashboard

PUT /api/scheduled-maintenance/:id
    - Updates scheduled maintenance
    - Handles technician reassignment
    - Used by: Admin Dashboard

PUT /api/scheduled-maintenance/:id/status
    - Updates only status of scheduled maintenance
    - Used by: Technician Dashboard

DELETE /api/scheduled-maintenance/:id
    - Deletes scheduled maintenance
    - Used by: Admin Dashboard
```

### Users
```
GET /api/users
    - Returns all users
    - Used by: Admin Dashboard (User Management)

POST /api/users
    - Creates new user
    - Body: { name, email, password, role }
    - Used by: Admin Dashboard

PUT /api/users/:id
    - Updates user information
    - Used by: Admin Dashboard

DELETE /api/users/:id
    - Deletes user (soft delete)
    - Used by: Admin Dashboard
```

### Notifications
```
GET /api/notifications/unread
    - Returns unread notifications for current user
    - Used by: NotificationBell component

PUT /api/notifications/:id/read
    - Marks notification as read
    - Used by: NotificationBell component

GET /api/notifications
    - Returns all notifications for current user
    - Used by: Notifications page
```

---

## 📊 Data Flow Diagrams

### Complete Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────┘

1. CREATION (Admin Dashboard)
   ┌──────────────┐
   │ Admin creates│
   │   request    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      ┌──────────────────┐
   │ MaintenanceRe│─────▶│ Equipment status │
   │ quest created│      │ may auto-update  │
   └──────┬───────┘      └──────────────────┘
          │
          ▼
   Status: "Open"
   assignedTo: null

2. ASSIGNMENT (Admin Dashboard)
   ┌──────────────┐
   │ Admin assigns│
   │  technician  │
   └──────┬───────┘
          │
          ▼
   ┌─────────────────────────┐
   │ Check if reassigning:   │
   │ - Remove from old tech  │
   │ - Add to new tech       │
   └──────┬──────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Technician.assignedReqs[]│
   │ updated                  │
   └──────┬───────────────────┘
          │
          ▼
   Status: "In Progress"
   assignedTo: technicianId
   startedAt: timestamp

3. WORK IN PROGRESS (Technician Dashboard)
   ┌──────────────┐
   │ Technician   │
   │ views task   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Technician   │
   │ updates      │
   │ status/notes │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Equipment status =       │
   │ "Under Maintenance"      │
   └──────────────────────────┘

4. COMPLETION (Technician Dashboard)
   ┌──────────────┐
   │ Technician   │
   │ completes    │
   │ task         │
   └──────┬───────┘
          │
          ▼
   ┌───────────────────────────┐
   │ Check equipment:          │
   │ - Any other active reqs?  │
   │   NO → Operational        │
   │   YES → Keep current      │
   └──────┬────────────────────┘
          │
          ▼
   ┌───────────────────────────┐
   │ Remove from technician's  │
   │ assignedRequests[]        │
   └──────┬────────────────────┘
          │
          ▼
   Status: "Completed"
   completedAt: timestamp
   cost: final cost

5. NOTIFICATIONS
   ┌─────────────────────────┐
   │ At each stage:          │
   │ - Assignment → notify   │
   │ - Status change → notify│
   │ - Completion → notify   │
   └─────────────────────────┘
```

### Equipment Maintenance Scheduling

```
┌─────────────────────────────────────────────────────────────────┐
│            AUTOMATED MAINTENANCE SCHEDULING                      │
└─────────────────────────────────────────────────────────────────┘

WHEN: Equipment is created with maintenanceInterval

Admin creates equipment
    ↓
Equipment.maintenanceInterval = 30 (days)
    ↓
EquipmentController.createEquipment()
    ↓
Saves equipment to database
    ↓
Calls: autoScheduleForEquipment(equipment_id, 'Preventive')
    ↓
ScheduledMaintenanceController.autoScheduleForEquipment()
    ↓
Calculates next maintenance date:
    nextDate = today + equipment.maintenanceInterval days
    ↓
Creates ScheduledMaintenance:
    {
        equipment_id: "EQ-1234",
        scheduled_date: nextDate,
        maintenance_type: "Preventive",
        status: "Scheduled",
        recurrence: {
            type: "monthly",
            interval: calculated from days
        }
    }
    ↓
Updates Equipment:
    equipment.nextMaintenance = nextDate
    ↓
RESULT:
    - Equipment has nextMaintenance date set
    - Scheduled maintenance record created
    - Will appear in admin's maintenance schedule
    - Technician will see it after assignment

WHEN: Scheduled maintenance is completed

Technician completes scheduled maintenance
    ↓
IF recurrence is enabled:
    ↓
Calculate next occurrence:
    next_date = current_date + recurrence.interval
    ↓
Create new ScheduledMaintenance record
    {
        same details,
        scheduled_date: next_date,
        status: "Scheduled"
    }
    ↓
Update equipment.nextMaintenance
    ↓
RESULT: Maintenance automatically reschedules
```

---

## 🗄️ Database Models

### MaintenanceRequest Schema
```javascript
{
  _id: ObjectId,
  requestId: String,              // Auto-generated: MR-001, MR-002...
  title: String,                  // Required
  description: String,
  status: String,                 // Open, In Progress, Completed, On Hold, Cancelled
  priority: String,               // Low, Medium, High, Critical
  category: String,               // Repair, Preventive, Inspection, Installation
  equipment: [ObjectId],          // Reference to Equipment
  assignedTo: ObjectId,           // Reference to Technician
  reportedBy: ObjectId,           // Reference to User
  date: Date,                     // Scheduled/reported date
  time: String,                   // Scheduled time
  startedAt: Date,                // When work actually started
  completedAt: Date,              // When work was completed
  estimatedHours: Number,
  cost: Number,                   // Total cost
  costs: [{                       // Breakdown of costs
    description: String,
    cost: Number
  }],
  notes: String,                  // Technician notes (max 1000 chars)
  technicianNotes: String,        // Alternative field name
  createdAt: Date,
  updatedAt: Date
}
```

### Equipment Schema
```javascript
{
  _id: ObjectId,
  equipment_id: String,           // EQ-1234 format, unique
  name: String,                   // Required
  type: String,                   // X-Ray Machine, ECG, etc.
  location: String,               // Required
  status: String,                 // Operational, Under Maintenance, Out of Service, Needs Repair
  isCritical: Boolean,            // Is this critical equipment?
  manufacturer: String,
  modelNumber: String,
  serialNumber: String,
  purchaseDate: Date,
  warrantyExpiry: Date,
  maintenanceInterval: Number,    // In days, optional
  lastMaintenance: Date,
  nextMaintenance: Date,          // Auto-calculated from maintenanceInterval
  downtimeHours: Number,          // Cumulative downtime
  activeMaintenanceRequests: [ObjectId], // References to active requests
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Technician Schema
```javascript
{
  _id: ObjectId,
  technicianId: String,           // Auto-generated: TECH-001
  name: String,                   // Required
  firstName: String,
  lastName: String,
  email: String,                  // Unique
  phone: String,
  specialization: String,         // Electronics, Mechanical, etc.
  skills: [String],               // Array of equipment types
  availability: String,           // Available, Busy, Unavailable, On Leave
  isCurrentlyEmployed: Boolean,
  assignedRequests: [ObjectId],   // References to MaintenanceRequests
  scheduledMaintenance: [ObjectId], // References to ScheduledMaintenance
  maxConcurrentRequests: Number,  // Default: 5
  user: ObjectId,                 // Reference to User (for login)
  notes: String,
  createdAt: Date,
  updatedAt: Date
}

// Virtual Methods:
canAcceptNewRequest() → Boolean    // Checks if under capacity and available
```

### ScheduledMaintenance Schema
```javascript
{
  _id: ObjectId,
  maintenance_id: String,         // Auto-generated: SM-001
  equipment_id: String,           // Equipment ID (not ObjectId!)
  title: String,
  description: String,
  scheduled_date: Date,           // Required
  scheduled_time: String,         // HH:mm format
  maintenance_type: String,       // Preventive, Repair, Inspection, Calibration
  priority: String,               // Low, Medium, High
  status: String,                 // Scheduled, Assigned, In Progress, Completed, Cancelled
  assigned_technician: ObjectId,  // Reference to Technician
  assigned_technician_name: String,
  estimated_duration: Number,     // In hours
  equipment_name: String,
  equipment_location: String,
  recurrence: {
    type: String,                 // none, daily, weekly, monthly, quarterly, yearly
    interval: Number,             // Repeat every X units
    end_date: Date,
    next_due_date: Date
  },
  completed_at: Date,
  technician_notes: String,
  status_updated_by: ObjectId,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,                   // Required
  email: String,                  // Required, unique
  password: String,               // Hashed
  role: String,                   // admin, technician, doctor, patient, etc.
  status: String,                 // active, inactive
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Component Relationships

### Admin Dashboard Component Tree
```
AdminDashboardPage
 └── ProfessionalLayout
      └── AdminDashboard
           ├── EnhancedKPICards
           │    ├── Uses: dashboardData
           │    └── Displays: User, Equipment, Request, Technician stats
           │
           ├── MaintenanceOverviewSection
           │    ├── Tab: Work Requests
           │    │    ├── WorkRequestKPICards
           │    │    ├── WorkRequestFilters
           │    │    ├── WorkRequestsTable
           │    │    │    └── Row actions →
           │    │    │         ├── WorkRequestDetailsModal
           │    │    │         ├── AssignTechnicianModal
           │    │    │         └── EditMaintenanceRequestModal
           │    │    └── CreateWorkRequestModal (button)
           │    │
           │    ├── Tab: Equipment
           │    │    ├── EquipmentKPICards
           │    │    ├── EquipmentListTable
           │    │    │    └── Row actions →
           │    │    │         ├── ViewEquipmentModal
           │    │    │         ├── EditEquipmentModal
           │    │    │         └── DeleteEquipmentModal
           │    │    └── AddEquipmentModal (button)
           │    │
           │    └── Tab: Maintenance Schedule
           │         ├── SimplifiedMaintenanceSchedule
           │         │    └── Task cards →
           │         │         └── MaintenanceTaskModal (view/edit)
           │         └── MaintenanceTaskModal (create button)
           │
           └── UserManagementSection
                ├── UserStatisticsCards
                ├── LatestUsersTable
                │    └── Row actions →
                │         ├── UserDetailsModal
                │         ├── EditUserModal
                │         ├── DeactivateUserModal
                │         └── DeleteUserModal
                └── AddUserModal (button)
```

### Technician Dashboard Component Tree
```
TechnicianDashboard
 ├── TechnicianKPICards
 │    ├── Uses: dashboardData (calculated from assignedTasks)
 │    └── Displays: Total, Pending, InProgress, Completed counts
 │
 ├── Tab: Tasks
 │    └── AssignedTasksList
 │         └── TaskCard (for each task)
 │              ├── Task info display
 │              └── Actions →
 │                   ├── WorkRequestDetailsModal (read-only)
 │                   └── TaskStatusModal (update status/notes)
 │
 └── Tab: Schedule
      └── TechnicianScheduleView
           └── Schedule Card (for each scheduled maintenance)
                ├── Schedule info display
                └── Actions →
                     └── TaskStatusModal (update status/notes)
```

---

## 🎨 Key Features Summary

### Admin Dashboard Features
1. **Comprehensive Statistics**
   - Real-time KPI cards for users, equipment, requests, technicians
   - Automatic refresh capability
   - System health monitoring

2. **Maintenance Request Management**
   - Create new requests with full details
   - Assign technicians based on availability and skills
   - View detailed request information
   - Edit and update requests
   - Track request lifecycle
   - Generate filtered reports

3. **Equipment Management**
   - Add equipment with automatic maintenance scheduling
   - View equipment status and history
   - Edit equipment details
   - Delete equipment (with confirmation)
   - Track critical equipment
   - Monitor maintenance intervals

4. **Maintenance Scheduling**
   - Create preventive maintenance schedules
   - Auto-scheduling based on equipment intervals
   - Recurring maintenance tasks
   - Assign technicians to schedules
   - Calendar view of upcoming maintenance

5. **User Management**
   - Add new users with role assignment
   - View user statistics
   - Edit user details
   - Deactivate/activate users
   - Delete users (soft delete)
   - Track user activity

6. **Reporting & Analytics**
   - Generate Excel reports with filters
   - Filter by date range, technician, status, priority
   - Summary statistics in reports
   - Detailed data export
   - Charts and visualizations

### Technician Dashboard Features
1. **Personal Task Management**
   - View all assigned maintenance requests
   - Filter tasks by status
   - Update task status in real-time
   - Add work notes and observations
   - Track task completion

2. **Schedule Management**
   - View upcoming scheduled maintenance
   - See calendar of assigned tasks
   - Update scheduled maintenance status
   - Track preventive maintenance tasks

3. **Status Updates**
   - Change request status (Open → In Progress → Completed)
   - Add technician notes with each update
   - Enter cost information on completion
   - Automatic equipment status synchronization

4. **Work Documentation**
   - Add detailed notes about work performed
   - Document issues found
   - Record parts used and costs
   - Track time spent on tasks

5. **Workload Visibility**
   - See assigned request count
   - View pending vs completed tasks
   - Monitor high-priority items
   - Track personal performance metrics

---

## 🔐 Security & Authorization

### Role-Based Access Control
```
Admin Role:
  ✓ Full access to all features
  ✓ Create/edit/delete equipment
  ✓ Create/assign/manage all requests
  ✓ Manage users and technicians
  ✓ View all data and reports
  ✓ System configuration

Technician Role:
  ✓ View only assigned tasks
  ✓ Update status of own tasks
  ✓ Add notes to own tasks
  ✓ View own schedule
  ✗ Cannot create requests
  ✗ Cannot assign tasks
  ✗ Cannot access user management
  ✗ Cannot delete data
```

### Authentication Flow
```
1. User enters credentials
2. POST /api/auth/login
3. Backend validates credentials
4. Generate JWT token with:
   - userId
   - email
   - role
   - expiration (24h)
5. Store token in localStorage
6. Include token in all API requests:
   Header: Authorization: Bearer <token>
7. Backend authMiddleware validates token
8. Checks user role for protected routes
9. Token expiration handling:
   - 401 error triggers logout
   - Redirect to login page
   - Clear localStorage
```

---

## 🐛 Error Handling

### Frontend Error Handling
```javascript
// API calls wrapped in try-catch
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly notification
  // Set error state for display
}

// 401 Handling (token expired)
if (response.status === 401) {
  localStorage.clear();
  navigate('/login');
}
```

### Backend Error Handling
```javascript
// Consistent error response format
res.status(errorCode).json({
  success: false,
  message: 'User-friendly error message',
  error: process.env.NODE_ENV === 'development' ? error.message : undefined
});

// Validation errors (400)
// Not found errors (404)
// Server errors (500)
// All logged to console with detailed info
```

---

## 📱 Responsive Design

Both dashboards are fully responsive:
- **Desktop**: Full multi-column layout
- **Tablet**: Adjusted grid, side-by-side cards
- **Mobile**: Stacked layout, mobile-optimized tables

---

## 🚀 Performance Optimizations

1. **Data Caching**
   - Dashboard statistics cached on backend
   - Manual refresh button to update cache
   - Automatic cache invalidation on data changes

2. **Lazy Loading**
   - Components loaded on demand
   - Modals rendered only when opened
   - Large lists paginated

3. **Optimistic UI Updates**
   - Immediate feedback on actions
   - Background API calls
   - Rollback on errors

4. **Debounced Searches**
   - Search inputs debounced (300ms)
   - Reduces API calls
   - Improves performance

---

## 📝 Notes for Viva Presentation

### Key Points to Emphasize:

1. **Clear Separation of Concerns**
   - Admin handles oversight and management
   - Technicians handle execution and updates
   - Role-based access control enforced

2. **Real-Time Synchronization**
   - Admin assignments immediately visible to technicians
   - Status updates reflect across both dashboards
   - Equipment status automatically managed

3. **Automated Workflows**
   - Equipment maintenance auto-scheduled
   - Notifications sent on status changes
   - Workload automatically balanced

4. **Data Integrity**
   - Technician workload properly tracked
   - Request lifecycle enforced
   - Equipment status synchronized with requests

5. **User Experience**
   - Consistent UI/UX across dashboards
   - Intuitive navigation
   - Clear visual feedback
   - Mobile-responsive design

6. **Technical Excellence**
   - RESTful API design
   - Modular component architecture
   - Comprehensive error handling
   - Security best practices

### Demo Flow Suggestion:

1. **Start with Admin Dashboard**
   - Show statistics overview
   - Create equipment (demonstrate auto-scheduling)
   - Create maintenance request
   - Assign to technician

2. **Switch to Technician Dashboard**
   - Show assigned task appears
   - Update status to "In Progress"
   - Add technician notes
   - Mark as completed

3. **Back to Admin Dashboard**
   - Show updated statistics
   - Show completed request
   - Generate report

4. **Highlight Key Features**
   - Reassignment workload handling
   - Equipment status synchronization
   - Scheduled maintenance automation

---

## 🔗 Related Documentation

- [NIC Diagnose Workflow](./nic-diagnose-workflow.md)
- [Diagnose Workflow](./diagnose-workflow.md)
- [API Documentation](./api-docs.md) (if exists)
- [Database Schema](./database-schema.md) (if exists)

---

## 📞 Support & Maintenance

**Developer**: [Your Name]
**Last Updated**: October 14, 2025
**Version**: 1.0.0

---

**End of Documentation**
