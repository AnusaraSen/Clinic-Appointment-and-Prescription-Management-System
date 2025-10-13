# Create Maintenance Request Form - File Connections

## Date: October 13, 2025

---

## Overview

Both the **Admin Dashboard** and **Inventory Manager Dashboard** use the **SAME form component** for creating maintenance requests. This ensures consistency across the application.

---

## Shared Form Component

### Core Form
**`AddMaintenanceRequestForm.jsx`**
- **Path:** `frontend/src/features/equipment-maintenance/components/AddMaintenanceRequestForm.jsx`
- **Purpose:** Main form component for creating maintenance requests
- **Used By:** 
  - Admin Dashboard (MaintenanceManagementPage)
  - Inventory Manager Dashboard (InventoryMaintenanceRequestsSection)
  - Pharmacist Dashboard (PharmacistMaintenanceRequestsSection)
  - Quick Actions Panel
  - Work Requests Table

---

## Admin Dashboard Files

### 1. Main Page
**`MaintenanceManagementPage.jsx`**
- **Path:** `frontend/src/features/equipment-maintenance/pages/MaintenanceManagementPage.jsx`
- **Role:** Admin's main maintenance management interface
- **Features:**
  - Lists all maintenance requests
  - Opens AddMaintenanceRequestForm modal
  - Manages request lifecycle

**Key Code:**
```jsx
import { AddMaintenanceRequestForm } from '../components/AddMaintenanceRequestForm';

// Button to open form
<button onClick={() => setShowAddForm(true)}>
  <span>Add Maintenance Request</span>
</button>

// Modal
<AddMaintenanceRequestForm
  isOpen={showAddForm}
  onClose={() => setShowAddForm(false)}
  onSuccess={handleRequestCreated}
/>
```

### 2. Quick Actions Panel (Also used by Admin)
**`QuickActionsPanel.jsx`**
- **Path:** `frontend/src/shared/components/ui/QuickActionsPanel.jsx`
- **Role:** Provides quick access shortcuts in dashboard
- **Features:**
  - Quick action button to create maintenance request
  - Opens same AddMaintenanceRequestForm

**Key Code:**
```jsx
import { AddMaintenanceRequestForm } from '../../../features/equipment-maintenance/components/AddMaintenanceRequestForm';

actions: [
  {
    description: 'Create new maintenance request',
    // Opens modal
  }
]

<AddMaintenanceRequestForm
  isOpen={showMaintenanceForm}
  onClose={() => setShowMaintenanceForm(false)}
  onSuccess={handleSuccess}
/>
```

---

## Inventory Manager Dashboard Files

### 1. Inventory Maintenance Requests Section
**`InventoryMaintenanceRequestsSection.jsx`**
- **Path:** `frontend/src/features/pharmacy-inventory/components/InventoryMaintenanceRequestsSection.jsx`
- **Role:** Inventory Manager's view of maintenance requests
- **Features:**
  - Lists maintenance requests
  - Button to create new request
  - Opens same AddMaintenanceRequestForm

**Key Code:**
```jsx
import { AddMaintenanceRequestForm } from '../../equipment-maintenance/components/AddMaintenanceRequestForm';

// Button to open form
<button
  onClick={() => setShowAddForm(true)}
  title="Add maintenance request"
>
  <Plus className="w-4 h-4" />
</button>

// Modal
<AddMaintenanceRequestForm
  isOpen={showAddForm}
  onClose={() => setShowAddForm(false)}
  onSuccess={refreshRequests}
/>
```

### 2. Pharmacist Maintenance Requests Section
**`PharmacistMaintenanceRequestsSection.jsx`**
- **Path:** `frontend/src/features/pharmacy-inventory/components/PharmacistMaintenanceRequestsSection.jsx`
- **Role:** Pharmacist's view of maintenance requests
- **Features:** Similar to Inventory Manager section

---

## Backend Files (Shared by Both Dashboards)

### 1. Routes
**`maintenanceRequestRoutes.js`**
- **Path:** `backend/modules/workforce-facility/routes/maintenanceRequestRoutes.js`
- **Role:** Defines API endpoints for maintenance requests
- **Endpoints:**
  - `POST /api/maintenance-requests` - Create new request
  - `GET /api/maintenance-requests` - Get all requests
  - `PUT /api/maintenance-requests/:id` - Update request
  - `DELETE /api/maintenance-requests/:id` - Delete request

**Key Code:**
```javascript
const express = require('express');
const router = express.Router();
const {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  // ... other controllers
} = require('../controllers/MaintenanceRequestController');

router.post('/', createMaintenanceRequest);
router.get('/', getAllMaintenanceRequests);
// ... other routes
```

### 2. Controller
**`MaintenanceRequestController.js`**
- **Path:** `backend/modules/workforce-facility/controllers/MaintenanceRequestController.js`
- **Role:** Handles business logic for maintenance requests
- **Functions:**
  - `createMaintenanceRequest()` - Creates new request in database
  - `getAllMaintenanceRequests()` - Fetches requests with filters
  - `updateMaintenanceRequest()` - Updates existing request
  - `deleteMaintenanceRequest()` - Deletes request

**Key Code:**
```javascript
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      equipment,
      reportedBy,
      dateReported
    } = req.body;

    const maintenanceRequest = new MaintenanceRequest({
      requestId: generatedId,
      title,
      description,
      priority,
      equipment,
      reportedBy,
      dateReported,
      status: 'Open'
    });

    await maintenanceRequest.save();
    
    // Send notification
    await notificationService.notifyNewMaintenanceRequest(maintenanceRequest);
    
    res.status(201).json({
      success: true,
      data: maintenanceRequest
    });
  } catch (error) {
    // Error handling
  }
};
```

### 3. Model
**`MaintenanceRequest.js`**
- **Path:** `backend/modules/workforce-facility/models/MaintenanceRequest.js`
- **Role:** Database schema for maintenance requests
- **Fields:**
  - requestId (auto-generated)
  - title
  - description
  - priority (Low, Medium, High)
  - status (Open, In Progress, Completed, Cancelled)
  - equipment (array of equipment IDs)
  - reportedBy (user ID)
  - dateReported

### 4. Notification Service
**`notificationService.js`**
- **Path:** `backend/services/notificationService.js`
- **Role:** Sends notifications when requests are created
- **Function:** `notifyNewMaintenanceRequest()`

---

## Complete File Structure

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React)                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SHARED COMPONENT (Used by Both)                        │
│  └── AddMaintenanceRequestForm.jsx                      │
│      └── Path: frontend/src/features/equipment-         │
│               maintenance/components/                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ADMIN DASHBOARD                                         │
│  ├── MaintenanceManagementPage.jsx                      │
│  │   └── Path: frontend/src/features/equipment-         │
│  │            maintenance/pages/                         │
│  │                                                       │
│  └── QuickActionsPanel.jsx                              │
│      └── Path: frontend/src/shared/components/ui/       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  INVENTORY MANAGER DASHBOARD                             │
│  └── InventoryMaintenanceRequestsSection.jsx            │
│      └── Path: frontend/src/features/pharmacy-          │
│               inventory/components/                      │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ROUTES                                                  │
│  └── maintenanceRequestRoutes.js                        │
│      └── Path: backend/modules/workforce-facility/      │
│               routes/                                    │
│                                                          │
│  CONTROLLERS                                             │
│  └── MaintenanceRequestController.js                    │
│      └── Path: backend/modules/workforce-facility/      │
│               controllers/                               │
│                                                          │
│  MODELS                                                  │
│  └── MaintenanceRequest.js                              │
│      └── Path: backend/modules/workforce-facility/      │
│               models/                                    │
│                                                          │
│  SERVICES                                                │
│  └── notificationService.js                             │
│      └── Path: backend/services/                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Creating a Maintenance Request:

```
1. USER ACTION (Admin or Inventory Manager)
   ├─> Clicks "Add Maintenance Request" button
   └─> Opens AddMaintenanceRequestForm modal

2. FORM COMPONENT
   └─> AddMaintenanceRequestForm.jsx
       ├─> User fills in:
       │   ├─> Title
       │   ├─> Description
       │   ├─> Priority (Low/Medium/High)
       │   ├─> Equipment (multi-select)
       │   └─> Date
       └─> Submits form

3. FRONTEND → BACKEND
   └─> POST http://localhost:5000/api/maintenance-requests
       └─> Body: {
             title: "...",
             description: "...",
             priority: "High",
             equipment: ["EQ-1234", "EQ-5678"],
             reportedBy: "user_id",
             dateReported: "2025-10-13"
           }

4. BACKEND ROUTING
   └─> maintenanceRequestRoutes.js
       └─> Routes to createMaintenanceRequest()

5. CONTROLLER PROCESSING
   └─> MaintenanceRequestController.js
       ├─> Validates data
       ├─> Generates requestId
       ├─> Creates MaintenanceRequest document
       ├─> Saves to MongoDB
       └─> Sends notification

6. NOTIFICATION
   └─> notificationService.js
       └─> Notifies all Admin users

7. RESPONSE
   └─> Backend returns success
       └─> Frontend closes modal
           └─> Refreshes request list
```

---

## Key Differences Between Dashboards

### Admin Dashboard
- **Access:** Full access to all maintenance requests
- **Permissions:** Can create, view, edit, delete, assign requests
- **Additional Features:**
  - Assign requests to technicians
  - Change status
  - Generate reports
  - View analytics

### Inventory Manager Dashboard
- **Access:** Can view and create maintenance requests
- **Permissions:** Limited to creating and viewing
- **Focus:** Equipment in inventory/pharmacy area
- **Integration:** Part of pharmacy-inventory module

### Common Features
Both use the **same form** with:
- ✅ Same fields (title, description, priority, equipment)
- ✅ Same validation rules
- ✅ Same API endpoint
- ✅ Same backend processing
- ✅ Same notification system

---

## API Endpoint Used

```
POST http://localhost:5000/api/maintenance-requests
```

**Request Body:**
```json
{
  "title": "MRI Machine Issue",
  "description": "MRI machine making unusual noise",
  "priority": "High",
  "equipment": ["670b8b5f123abc456def7890"],
  "reportedBy": "670a1b2c3d4e5f6789abcdef",
  "dateReported": "2025-10-13T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "_id": "670c1d2e3f4a5b6789cdefgh",
    "requestId": "MR-1001",
    "title": "MRI Machine Issue",
    "status": "Open",
    "priority": "High",
    // ... other fields
  }
}
```

---

## Dependencies

### Form Component Dependencies:
```jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
```

### Validation:
- Uses `ValidatedInput`, `ValidatedTextarea`, `ValidatedSelect` components
- Client-side validation for required fields
- Backend validation via Joi schema

---

## How to Modify the Form

### To Change Form Fields:
1. Update `AddMaintenanceRequestForm.jsx` (frontend)
2. Update `MaintenanceRequestController.js` validation (backend)
3. Update `MaintenanceRequest.js` model schema (if adding to DB)

### To Add New Dashboard:
1. Import `AddMaintenanceRequestForm` component
2. Add button to open modal
3. Handle success callback to refresh data
4. No backend changes needed!

---

## Summary

**Both Admin and Inventory Manager dashboards use:**

**Frontend:**
- ✅ Same form: `AddMaintenanceRequestForm.jsx`
- ✅ Same API call: `POST /api/maintenance-requests`

**Backend:**
- ✅ Same route: `maintenanceRequestRoutes.js`
- ✅ Same controller: `MaintenanceRequestController.js`
- ✅ Same model: `MaintenanceRequest.js`
- ✅ Same notifications: `notificationService.js`

**The only differences are:**
- Different parent pages that embed the form
- Different UI layouts around the form
- Different access permissions (enforced by authentication)
