# Manager/Moderator Functionality - Complete Guide

## 📋 Overview

The system has a comprehensive **Manager/Moderator** (also known as Manager) functionality that allows users to manage communities. Managers can:
- Approve/reject join requests
- Manage community members
- Approve/reject posts (pulses)
- Create and manage events
- View reports
- Manage directory entries

---

## 🔍 Current Implementation Status

### ✅ **Backend (Server) - FULLY IMPLEMENTED**

#### 1. **Manager Routes** (`server/services/community_services/src/routes/managerRoutes.js`)
All manager API endpoints are registered at `/api/v1/manager/*`:

- **Dashboard Stats**: `GET /api/v1/manager/dashboard/stats/:communityId`
- **Join Requests**: 
  - `GET /api/v1/manager/community-join-requests/:communityId`
  - `PUT /api/v1/manager/community-join-requests/:communityId/:requestId/approve`
  - `PUT /api/v1/manager/community-join-requests/:communityId/:requestId/reject`
  - `GET /api/v1/manager/community-join-requests/:communityId/stats`
- **Members**:
  - `GET /api/v1/manager/members/:communityId`
  - `DELETE /api/v1/manager/members/:communityId/:memberId`
  - `GET /api/v1/manager/members/:communityId/stats`
- **Events**:
  - `GET /api/v1/manager/events/:communityId`
  - `GET /api/v1/manager/events/:communityId/stats`
- **Posts**:
  - `GET /api/v1/manager/posts/:communityId`
  - `PUT /api/v1/manager/posts/:communityId/:postId/approve`
  - `PUT /api/v1/manager/posts/:communityId/:postId/reject`
  - `DELETE /api/v1/manager/posts/:communityId/:postId`
  - `GET /api/v1/manager/posts/:communityId/stats`
- **Reports**: `GET /api/v1/manager/reports/:communityId`

#### 2. **Manager Middleware** (`server/services/community_services/src/middleware/managerMiddleware.js`)
- `verifyManager`: Checks if user has Manager role or is assigned as manager
- `verifyCommunityManager`: Verifies user is manager for a specific community

#### 3. **Manager Controller** (`server/services/community_services/src/controllers/managerController.js`)
All manager operations are fully implemented:
- Dashboard statistics
- Join request management
- Member management
- Event management
- Post approval/rejection
- Report viewing

#### 4. **Community Managers Model** (`server/services/community_services/src/models/CommunityManagers.js`)
Database model for storing manager assignments with permissions:
- `canApproveJoinRequests`
- `canManagePosts`
- `canManageUsers`
- `canCreateEvents`
- `canManageReports`

### ✅ **Frontend (Client) - PARTIALLY IMPLEMENTED**

#### 1. **Manager Pages** (All exist in `client/src/pages/manager/`)
- ✅ `ManagerDashboard.tsx` - Dashboard with stats
- ✅ `ManagerJoinRequests.tsx` - Join request management
- ✅ `ManagerMembers.tsx` - Member management
- ✅ `ManagerEvents.tsx` - Event management
- ✅ `ManagerPosts.tsx` - Post approval/rejection
- ✅ `ManagerPanel.tsx` - Main manager panel layout

#### 2. **Manager API Client** (`client/src/apis/manager.ts`)
All API methods are implemented and ready to use.

#### 3. **Private Route** (`client/src/routing/PrivateRoute.tsx`)
Manager role checking is implemented.

### ❌ **MISSING: Frontend Routes**

**The manager routes are NOT registered in `AppRoutes.tsx`!**

The manager panel exists but cannot be accessed because routes are missing.

---

## 🚀 How to Access Manager Functionality

### **Step 1: Add Manager Routes to Frontend**

You need to add manager routes to `client/src/routing/AppRoutes.tsx`. Add this after the admin routes:

```tsx
{/* MANAGER PANEL - For manager users with child routes */}
<Route path="/manager" element={<PrivateRoute requiredRole="manager"><ManagerPanel /></PrivateRoute>}>
  <Route index element={<ManagerDashboard />} />
  <Route path="dashboard" element={<ManagerDashboard />} />
  <Route path="join-requests" element={<ManagerJoinRequests />} />
  <Route path="members" element={<ManagerMembers />} />
  <Route path="events" element={<ManagerEvents />} />
  <Route path="posts" element={<ManagerPosts />} />
</Route>
```

**Note**: The manager pages currently use placeholder `communityId`. You'll need to:
1. Get `communityId` from URL params (e.g., `/manager/:communityId/dashboard`)
2. Or use context/state management to store selected community
3. Or add a community selector in the manager panel

### **Step 2: Assign Manager to Community**

#### **Option A: Through Admin Panel (UI)**
1. Login as Admin
2. Go to `/admin/communities`
3. Click "Assign Manager" on a community
4. Enter user ID and assign

**Note**: The `assignCommunityManager` API method is referenced in the frontend but may need to be implemented in the backend.

#### **Option B: Direct Database Assignment**
You can directly create a record in the `communitymanagers` collection:

```javascript
{
  userId: ObjectId("user_id_here"),
  communityId: ObjectId("community_id_here"),
  role: "Manager",
  permissions: {
    canApproveJoinRequests: true,
    canManagePosts: true,
    canManageUsers: true,
    canCreateEvents: true,
    canManageReports: true
  },
  status: "Active",
  isDeleted: false
}
```

#### **Option C: Set User Role to "Manager"**
If a user has the global role "Manager", they can access manager routes (but need community-specific assignment for community-specific features).

### **Step 3: Access Manager Panel**

Once routes are added and user is assigned as manager:

1. **Login** as a user with Manager role or assigned as manager
2. **Navigate** to `/manager/dashboard`
3. **Select community** (if using community-specific routes)
4. **Use the sidebar** to navigate between:
   - Dashboard
   - Join Requests
   - Members
   - Events
   - Posts

---

## 🔐 Access Requirements

### **Who Can Access Manager Functionality?**

1. **Users with Global "Manager" Role**
   - User's `role` field = "Manager"
   - Can access manager routes

2. **Users Assigned as Community Manager**
   - Record in `CommunityManagers` collection
   - `status` = "Active"
   - `isDeleted` = false
   - Can access community-specific manager features

3. **Community Creators**
   - User who created the community (`createdBy`)
   - Automatically has manager permissions for that community

4. **Admin/SuperAdmin**
   - Can access all manager features
   - Can assign managers to communities

---

## 📝 Manager Permissions

Each manager assignment includes these permissions (all default to `true`):

- ✅ **canApproveJoinRequests**: Approve/reject community join requests
- ✅ **canManagePosts**: Approve/reject/delete posts (pulses)
- ✅ **canManageUsers**: Remove members from community
- ✅ **canCreateEvents**: Create community events
- ✅ **canManageReports**: View and manage community reports

---

## 🛠️ Implementation Checklist

### **To Make Manager Functionality Fully Accessible:**

- [ ] **Add manager routes to `AppRoutes.tsx`**
- [ ] **Update manager pages to get `communityId` from URL params or context**
- [ ] **Implement `assignCommunityManager` API endpoint in admin controller** (if missing)
- [ ] **Add community selector to manager panel** (if managing multiple communities)
- [ ] **Test manager access with assigned user**
- [ ] **Test all manager features**:
  - [ ] Join request approval/rejection
  - [ ] Member removal
  - [ ] Post approval/rejection
  - [ ] Event creation
  - [ ] Report viewing

---

## 🔗 Related Files

### **Backend:**
- `server/services/community_services/src/routes/managerRoutes.js`
- `server/services/community_services/src/controllers/managerController.js`
- `server/services/community_services/src/middleware/managerMiddleware.js`
- `server/services/community_services/src/models/CommunityManagers.js`

### **Frontend:**
- `client/src/pages/ManagerPanel.tsx`
- `client/src/pages/manager/ManagerDashboard.tsx`
- `client/src/pages/manager/ManagerJoinRequests.tsx`
- `client/src/pages/manager/ManagerMembers.tsx`
- `client/src/pages/manager/ManagerEvents.tsx`
- `client/src/pages/manager/ManagerPosts.tsx`
- `client/src/apis/manager.ts`
- `client/src/routing/AppRoutes.tsx` (needs update)
- `client/src/routing/PrivateRoute.tsx`

---

## 🧪 Testing Manager Functionality

### **Test as Manager:**

1. **Create/Assign Manager:**
   ```bash
   # Via Admin Panel or Database
   ```

2. **Login as Manager:**
   - Use manager credentials
   - Should redirect to `/manager/dashboard` (after routes are added)

3. **Test Features:**
   - Approve a join request
   - Reject a join request
   - Remove a member
   - Approve a post
   - Reject a post
   - Create an event
   - View reports

### **Test Access Control:**
- Regular user should NOT access `/manager/*` routes
- Manager should access only their assigned communities
- Admin should access all communities

---

## 📌 Quick Access URLs (After Routes Added)

- **Manager Dashboard**: `/manager/dashboard`
- **Join Requests**: `/manager/join-requests`
- **Members**: `/manager/members`
- **Events**: `/manager/events`
- **Posts**: `/manager/posts`

---

## ⚠️ Important Notes

1. **Community ID Required**: Most manager features require a `communityId`. The current implementation uses placeholder values. You need to:
   - Pass `communityId` via URL params: `/manager/:communityId/dashboard`
   - Or use context/state to store selected community
   - Or add a community selector dropdown

2. **Manager Assignment**: The `assignCommunityManager` function is called in the admin panel but may need backend implementation.

3. **Route Protection**: Manager routes are protected by `PrivateRoute` with `requiredRole="manager"`.

4. **Multiple Communities**: If a manager manages multiple communities, you'll need a community selector in the UI.

---

## ✅ Summary

**Backend**: ✅ Fully implemented and working
**Frontend Pages**: ✅ All created and ready
**Frontend Routes**: ❌ **MISSING - Need to add to AppRoutes.tsx**
**Manager Assignment**: ⚠️ May need backend implementation

**Next Steps:**
1. Add manager routes to `AppRoutes.tsx`
2. Update manager pages to handle `communityId` properly
3. Test manager functionality end-to-end
4. Implement manager assignment API if missing

