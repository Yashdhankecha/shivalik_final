# Community Pages Access Guide

## 📍 How to Access the Community Pages

### Step 1: Navigate to a Community
1. **Go to User Dashboard**: Visit `/dashboard` (or the root URL if logged in)
2. **Browse Communities**: You'll see a list of available communities
3. **Click on a Community Card**: Click any community card to open its dashboard

### Step 2: Access the Community Dashboard
- **URL Format**: `/community/:communityId`
- **Example**: `/community/507f1f77bcf86cd799439011`

Once on the community dashboard, you'll see **4 tabs** at the top:
- **Pulses** 📰
- **Events** 🎟️
- **Marketplace** 🏘️
- **Directory** 📇

---

## 🔐 Access Conditions

### **Pulses Tab** (Public Access)
- ✅ **No login required** - Anyone can view pulses
- ✅ **View approved pulses** - See all community news/updates
- ⚠️ **Create pulses** - Requires:
  - User must be logged in
  - User must have **joined the community** (approved member)
  - OR user must be a **Community Manager** or **Admin**

### **Events Tab** (Member Access)
- ✅ **View events** - Requires:
  - User must have **joined the community** (approved member)
- ✅ **Register for events** - Requires:
  - User must be logged in
  - User must have **joined the community**
- ✅ **Create events** - Requires:
  - User must be a **Community Manager** or **Admin**

### **Marketplace Tab** (Member Access)
- ✅ **View listings** - Requires:
  - User must have **joined the community** (approved member)
- ✅ **Create listings** - Requires:
  - User must be logged in
  - User must have **joined the community**
- ✅ **Chat with sellers** - Requires:
  - User must be logged in
  - User must have **joined the community**

### **Directory Tab** (Member Access)
- ✅ **View directory** - Requires:
  - User must have **joined the community** (approved member)
- ✅ **Add directory entries** - Requires:
  - User must be a **Community Manager** or **Admin**

---

## 🚪 Join Status Levels

### 1. **Not Joined** (Guest/Not Authenticated)
- Can only view **Pulses** tab
- Cannot access Events, Marketplace, or Directory
- Must click "Join Community" button to request access

### 2. **Requested** (Pending Approval)
- Join request sent, waiting for manager approval
- Can only view **Pulses** tab
- Button shows "Requested" with clock icon
- Cannot access Events, Marketplace, or Directory until approved

### 3. **Joined** (Approved Member)
- Join request approved by community manager
- ✅ Full access to all 4 tabs
- ✅ Can create pulses, register for events, create listings, etc.
- Button shows "Joined" with checkmark icon

---

## 📋 Step-by-Step Access Instructions

### For Regular Users:

1. **Login to the application**
   ```
   Go to: /login
   Enter your credentials
   ```

2. **Navigate to Dashboard**
   ```
   After login, you'll be redirected to /dashboard
   ```

3. **Select a Community**
   ```
   Click on any community card from the list
   You'll be taken to: /community/:communityId
   ```

4. **Join the Community** (if not already joined)
   ```
   Click the "Join Community" button
   Wait for manager approval
   ```

5. **Access the Tabs**
   ```
   Once approved, you can access all 4 tabs:
   - Pulses: View and create community posts
   - Events: View and register for events
   - Marketplace: Browse and create listings
   - Directory: View service providers
   ```

### For Community Managers/Admins:

1. **Login with Manager/Admin account**
2. **Navigate to Community Dashboard**
3. **Full Access** - You can:
   - Create pulses (auto-approved)
   - Create events
   - Approve/reject marketplace listings
   - Add directory entries
   - Manage all community content

---

## 🔑 Role-Based Permissions

### **Regular User (Member)**
- ✅ View all tabs (after joining)
- ✅ Create pulses (requires approval)
- ✅ Register for events
- ✅ Create marketplace listings
- ✅ Chat with other members
- ❌ Cannot approve content
- ❌ Cannot add directory entries

### **Community Manager**
- ✅ All member permissions
- ✅ Create pulses (auto-approved)
- ✅ Create events
- ✅ Approve/reject pulses
- ✅ Approve/reject marketplace listings
- ✅ Add/edit/delete directory entries
- ✅ View attendance lists

### **Admin/SuperAdmin**
- ✅ All manager permissions
- ✅ Access to admin panel
- ✅ Manage all communities
- ✅ Full system access

---

## 🚨 Common Access Issues

### Issue: "Please join the community to access this tab"
**Solution**: 
- Click "Join Community" button
- Wait for manager approval
- Refresh the page after approval

### Issue: Cannot create pulse/listing
**Solution**:
- Ensure you're logged in
- Ensure your join request is approved
- Check if you're on the correct tab

### Issue: Tabs are grayed out
**Solution**:
- You haven't joined the community yet
- Your join request is still pending
- Click "Join Community" and wait for approval

### Issue: Cannot see "Add" buttons
**Solution**:
- Ensure you're logged in
- Ensure you've joined the community
- Some features require manager/admin role

---

## 📝 Quick Reference

| Feature | Guest | Member | Manager | Admin |
|---------|-------|--------|---------|-------|
| View Pulses | ✅ | ✅ | ✅ | ✅ |
| Create Pulse | ❌ | ⚠️* | ✅ | ✅ |
| View Events | ❌ | ✅ | ✅ | ✅ |
| Register Event | ❌ | ✅ | ✅ | ✅ |
| Create Event | ❌ | ❌ | ✅ | ✅ |
| View Marketplace | ❌ | ✅ | ✅ | ✅ |
| Create Listing | ❌ | ✅ | ✅ | ✅ |
| Chat | ❌ | ✅ | ✅ | ✅ |
| View Directory | ❌ | ✅ | ✅ | ✅ |
| Add Directory | ❌ | ❌ | ✅ | ✅ |

*Requires approval from manager

---

## 🎯 Testing the Pages

### Test as Guest:
1. Logout or use incognito mode
2. Visit `/community/:communityId`
3. You should only see **Pulses** tab accessible

### Test as Member:
1. Login with regular user account
2. Join a community (or get approved)
3. Visit `/community/:communityId`
4. All 4 tabs should be accessible

### Test as Manager:
1. Login with manager account
2. Visit `/community/:communityId`
3. You should see "Add" buttons and management options

---

## 🔗 Direct URL Access

You can also access communities directly via URL:
```
/community/507f1f77bcf86cd799439011
```

Replace `507f1f77bcf86cd799439011` with the actual community ID from your database.

---

## 💡 Tips

1. **Check Join Status**: Look at the button in the community banner
   - "Join Community" = Not joined
   - "Requested" = Pending approval
   - "Joined" = Full access

2. **Tab Visibility**: Tabs that are grayed out require community membership

3. **Manager Approval**: Join requests need to be approved by a community manager in the admin panel

4. **Auto-Refresh**: After joining, refresh the page to see updated access

---

## 📞 Need Help?

If you're having trouble accessing the pages:
1. Check your login status
2. Verify your join request status
3. Contact a community manager for approval
4. Check browser console for errors

