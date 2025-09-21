# Lab Inventory API Documentation

## Base URL
`/api/lab-inventory`

## Authentication
All endpoints require authentication with inventory manager role (when auth is enabled).

## Response Format
All responses follow this format:
```json
{
  "success": true|false,
  "message": "descriptive message",
  "data": {}, // response data
  "code": "ERROR_CODE" // only for errors
}
```

## Endpoints

### 1. Create Lab Item
**POST** `/`

**Request Body:**
```json
{
  "lab_item_id": "LAB001",
  "itemName": "Disposable Syringes",
  "quantity": 100,
  "unit": "pieces",
  "location": "Storage Room A",
  "expiryDate": "2025-12-31",
  "inventory": "ObjectId" // optional
}
```

**Validation:**
- `lab_item_id`: Required, unique, string
- `itemName`: Required, 2-100 characters
- `quantity`: Required, number >= 0
- `unit`: Required, 1-20 characters
- `location`: Optional, max 100 characters
- `expiryDate`: Optional, future date
- `inventory`: Optional, valid MongoDB ObjectId

### 2. Get All Items (with filtering & search)
**GET** `/`

**Query Parameters:**
- `search`: Text search across itemName, lab_item_id, location, unit
- `category`: Filter by category
- `location`: Filter by location (partial match)
- `lowStock`: "1" to show only low stock items
- `expired`: "1" to show only expired items
- `expiringSoon`: "1" to show items expiring within 30 days
- `threshold`: Custom low stock threshold (default: 5)
- `sortBy`: Sort field (itemName, quantity, expiryDate, createdAt)
- `sortOrder`: "asc" or "desc" (default: desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example:**
```
GET /api/lab-inventory?search=syringe&lowStock=1&page=1&limit=20
```

### 3. Advanced Search
**POST** `/search`

**Request Body:**
```json
{
  "q": "search term",
  "filters": {
    "quantityRange": {
      "min": 0,
      "max": 100
    },
    "expiryDateRange": {
      "from": "2025-01-01",
      "to": "2025-12-31"
    }
  }
}
```

### 4. Get Single Item
**GET** `/:id`

Returns detailed item information with populated inventory reference.

### 5. Update Item
**PUT** `/:id`

**Request Body:** Same as create, but all fields optional.

### 6. Delete Item
**DELETE** `/:id`

### 7. Bulk Create
**POST** `/bulk`

**Request Body:**
```json
{
  "items": [
    {
      "lab_item_id": "LAB001",
      "itemName": "Item 1",
      "quantity": 50,
      "unit": "pieces"
    },
    {
      "lab_item_id": "LAB002",
      "itemName": "Item 2",
      "quantity": 30,
      "unit": "ml"
    }
  ]
}
```

**Limits:** Maximum 100 items per request.

### 8. Get Low Stock Items
**GET** `/alerts/low-stock?threshold=5`

Returns items with quantity <= threshold.

### 9. Get Expired Items
**GET** `/alerts/expired`

Returns items past their expiry date.

### 10. Get Expiring Soon Items
**GET** `/alerts/expiring-soon?days=30`

Returns items expiring within specified days.

### 11. Monthly Report
**GET** `/report/monthly?month=9&year=2025`

Returns comprehensive monthly analytics:
- Total items created
- Low stock count
- Expired count
- Items by unit breakdown
- Daily creation chart data
- Recent items list

### 12. Dashboard Summary
**GET** `/dashboard/summary`

Returns overview data for dashboard:
- Total items count
- Low stock alerts count
- Expired items count
- Items expiring soon count
- Recently added items
- Top categories by count

### 13. Basic Summary (Legacy)
**GET** `/summary/basic`

Returns simple counts for backward compatibility.

## Error Codes

- `INVALID_ID`: Invalid MongoDB ObjectId format
- `DUPLICATE_LAB_ITEM_ID`: Lab item ID already exists
- `ITEM_NOT_FOUND`: Requested item doesn't exist
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_FIELD`: Duplicate value for unique field
- `INVALID_SEARCH_QUERY`: Search query too short
- `INVALID_BULK_DATA`: Invalid bulk operation data
- `BULK_LIMIT_EXCEEDED`: Too many items in bulk operation
- `INVALID_MONTH`: Invalid month parameter
- `INVALID_TOKEN`: Authentication token invalid
- `TOKEN_EXPIRED`: Authentication token expired

## Examples

### Create a new lab item:
```bash
curl -X POST http://localhost:5000/api/lab-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "lab_item_id": "LAB001",
    "itemName": "Disposable Syringes",
    "quantity": 100,
    "unit": "pieces",
    "location": "Storage Room A",
    "expiryDate": "2025-12-31"
  }'
```

### Search items:
```bash
curl -X GET "http://localhost:5000/api/lab-inventory?search=syringe&lowStock=1&page=1&limit=10"
```

### Get monthly report:
```bash
curl -X GET "http://localhost:5000/api/lab-inventory/report/monthly?month=9&year=2025"
```

### Advanced search:
```bash
curl -X POST http://localhost:5000/api/lab-inventory/search \
  -H "Content-Type: application/json" \
  -d '{
    "q": "syringe",
    "filters": {
      "quantityRange": {"min": 10, "max": 200}
    }
  }'
```
