# 📚 Landing Page API Documentation

Base URL: `http://localhost:YOUR_PORT/api/v1/community`

## 🌐 Public Endpoints (No Authentication Required)

### 1. Get Featured Communities

**Endpoint**: `GET /communities/featured`

**Query Parameters**:
- `limit` (optional): Number of communities to return (default: 6)

**Example Request**:
```bash
GET /api/v1/community/communities/featured?limit=6
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": [
    {
      "_id": "community_id",
      "name": "Green Valley Residency",
      "description": "Experience luxury living...",
      "shortDescription": "Modern luxury living...",
      "bannerImage": "https://...",
      "logo": "https://...",
      "location": {
        "address": "123 Green Valley Road",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "zipCode": "380015",
        "coordinates": {
          "lat": 23.0225,
          "lng": 72.5714
        }
      },
      "isFeatured": true,
      "highlights": [
        "Gated Community",
        "Smart Homes"
      ],
      "amenityIds": [
        {
          "_id": "amenity_id",
          "name": "Swimming Pool",
          "icon": "🏊"
        }
      ],
      "totalUnits": 200,
      "occupiedUnits": 150,
      "establishedYear": 2020,
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get All Communities

**Endpoint**: `GET /communities`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `search` (optional): Search term for name/description/city
- `status` (optional): Filter by status (default: "Active")

**Example Request**:
```bash
GET /api/v1/community/communities?page=1&limit=12&search=valley&status=Active
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": {
    "communities": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 12,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Community by ID

**Endpoint**: `GET /communities/:id`

**Path Parameters**:
- `id`: Community ID

**Example Request**:
```bash
GET /api/v1/community/communities/507f1f77bcf86cd799439011
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Green Valley Residency",
    "description": "...",
    "amenityIds": [...],
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    ...
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

### 4. Get Recent Events

**Endpoint**: `GET /events/recent`

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 6)

**Example Request**:
```bash
GET /api/v1/community/events/recent?limit=6
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": [
    {
      "_id": "event_id",
      "title": "Annual Sports Day",
      "description": "Join us for a day filled with...",
      "communityId": {
        "_id": "community_id",
        "name": "Green Valley Residency",
        "logo": "https://...",
        "location": {...}
      },
      "eventDate": "2024-12-25T00:00:00.000Z",
      "startTime": "09:00 AM",
      "endTime": "05:00 PM",
      "location": "Community Sports Complex",
      "images": ["https://..."],
      "maxParticipants": 100,
      "registeredParticipants": [],
      "eventType": "Sports",
      "status": "Upcoming",
      "createdBy": {
        "_id": "user_id",
        "name": "Admin User"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Recent Announcements

**Endpoint**: `GET /announcements/recent`

**Query Parameters**:
- `limit` (optional): Number of announcements to return (default: 6)

**Example Request**:
```bash
GET /api/v1/community/announcements/recent?limit=6
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": [
    {
      "_id": "announcement_id",
      "title": "Water Supply Maintenance",
      "content": "Water supply will be temporarily...",
      "communityId": {
        "_id": "community_id",
        "name": "Green Valley Residency",
        "logo": "https://..."
      },
      "priority": "High",
      "category": "Maintenance",
      "images": [],
      "documents": [],
      "publishDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": null,
      "isPinned": true,
      "status": "Published",
      "createdBy": {
        "_id": "user_id",
        "name": "Admin User"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Get All Amenities

**Endpoint**: `GET /amenities`

**Example Request**:
```bash
GET /api/v1/community/amenities
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": [
    {
      "_id": "amenity_id",
      "name": "Swimming Pool",
      "description": "Olympic-sized swimming pool",
      "icon": "🏊",
      "category": "Recreation",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🔒 Protected Endpoints (Authentication Required)

### 7. Create Join Request

**Endpoint**: `POST /join-requests`

**Headers**:
```
Authorization: <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "communityId": "507f1f77bcf86cd799439011",
  "message": "I would like to join this community"
}
```

**Example Request**:
```bash
POST /api/v1/community/join-requests
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "communityId": "507f1f77bcf86cd799439011",
  "message": "I would like to join this community"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Join request submitted successfully",
  "data": {
    "_id": "request_id",
    "userId": "user_id",
    "communityId": "community_id",
    "message": "I would like to join this community",
    "status": "Pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request (Duplicate):
```json
{
  "success": false,
  "message": "You have already requested to join this community"
}
```

401 Unauthorized:
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

### 8. Get User's Join Requests

**Endpoint**: `GET /join-requests/user`

**Headers**:
```
Authorization: <JWT_TOKEN>
```

**Example Request**:
```bash
GET /api/v1/community/join-requests/user
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Details retrieved successfully",
  "data": [
    {
      "_id": "request_id",
      "userId": "user_id",
      "communityId": {
        "_id": "community_id",
        "name": "Green Valley Residency",
        "logo": "https://...",
        "location": {...}
      },
      "message": "I would like to join this community",
      "status": "Pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "reviewNotes": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📋 Data Models

### Community Model
```typescript
{
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  logo?: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  isFeatured: boolean;
  highlights?: string[];
  amenityIds?: Amenity[];
  totalUnits: number;
  occupiedUnits: number;
  establishedYear?: number;
  status: 'Active' | 'Inactive' | 'UnderDevelopment';
  createdAt: string;
  updatedAt: string;
}
```

### Event Model
```typescript
{
  _id: string;
  title: string;
  description: string;
  communityId: { _id: string; name: string; logo?: string };
  eventDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  images?: string[];
  maxParticipants?: number;
  registeredParticipants?: string[];
  eventType: 'Cultural' | 'Sports' | 'Educational' | 'Social' | 'Festival' | 'Meeting' | 'Other';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: { _id: string; name: string };
  createdAt: string;
}
```

### Announcement Model
```typescript
{
  _id: string;
  title: string;
  content: string;
  communityId: { _id: string; name: string; logo?: string };
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'General' | 'Maintenance' | 'Event' | 'Security' | 'Emergency' | 'Other';
  images?: string[];
  documents?: string[];
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  createdBy: { _id: string; name: string };
  createdAt: string;
}
```

### Amenity Model
```typescript
{
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'Sports' | 'Recreation' | 'Health' | 'Safety' | 'Convenience' | 'Social' | 'Other';
  isActive: boolean;
  createdAt: string;
}
```

---

## 🔑 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: <JWT_TOKEN>
```

The token should be obtained via the `/api/v1/auth/login` endpoint.

---

## ⚠️ Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (Validation error, duplicate entry)
- **401**: Unauthorized (Missing or invalid token)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found (Resource doesn't exist)
- **500**: Internal Server Error

---

## 📊 Rate Limiting

Currently no rate limiting is implemented, but recommended for production:
- Public endpoints: 100 requests/minute
- Protected endpoints: 200 requests/minute

---

## 🧪 Testing with cURL

### Get Featured Communities
```bash
curl -X GET "http://localhost:3000/api/v1/community/communities/featured?limit=6"
```

### Create Join Request
```bash
curl -X POST "http://localhost:3000/api/v1/community/join-requests" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"communityId": "COMMUNITY_ID", "message": "Want to join"}'
```

### Get User Join Requests
```bash
curl -X GET "http://localhost:3000/api/v1/community/join-requests/user" \
  -H "Authorization: YOUR_JWT_TOKEN"
```

---

## 📱 Frontend Integration

Using the API client:

```typescript
import { communityApi } from './apis/community';

// Get featured communities
const communities = await communityApi.getFeaturedCommunities(6);

// Get recent events
const events = await communityApi.getRecentEvents(6);

// Create join request (requires auth)
const result = await communityApi.createJoinRequest({
  communityId: 'community_id',
  message: 'I want to join'
});
```

---

**Last Updated**: November 2024
**Version**: 1.0
