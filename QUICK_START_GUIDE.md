# 🚀 Quick Start Guide - Landing Page

## Prerequisites
- Node.js v16+ installed
- MongoDB running
- npm or yarn package manager

## 🏁 Getting Started (5 Minutes)

### Step 1: Backend Setup (2 mins)

```bash
# Navigate to backend
cd server/services/community-services

# Install dependencies (if not already done)
npm install

# Seed sample data
npm run seed:landing

# Start the server
npm start
```

Expected output:
```
✅ Connected to database
✅ Cleared existing data
✅ Inserted 12 amenities
✅ Inserted 3 communities
✅ Inserted 3 events
✅ Inserted 3 announcements
```

### Step 2: Frontend Setup (2 mins)

```bash
# Navigate to frontend
cd client

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### Step 3: Access Landing Page (1 min)

Open browser and navigate to:
```
http://localhost:5173/landing
```

## 🎯 Quick Test Checklist

### ✅ Visual Verification
- [ ] Hero section displays with blue gradient background
- [ ] "Explore Communities" and "View Events" buttons visible
- [ ] 3 featured communities show in grid layout
- [ ] Community cards show amenities as badges
- [ ] 3 upcoming events display with icons and dates
- [ ] 3 announcements appear with priority colors
- [ ] Amenities section shows categorized items
- [ ] Footer displays with social media icons

### ✅ Functionality Tests

#### Test 1: Unauthenticated Join Request
1. Click "Join Community" on any community card
2. Auth modal should appear
3. Click "Sign In" → redirects to `/login`
4. ✅ Pass

#### Test 2: Navigation
1. Click "Explore Communities" → navigates
2. Click "Sign In" button → goes to `/login`
3. Click "Register" button → goes to `/register`
4. ✅ Pass

#### Test 3: Authenticated Join Request
1. Login first via `/login`
2. Navigate back to `/landing`
3. Click "Join Community"
4. Should see success message: "Join request submitted successfully"
5. ✅ Pass

### ✅ API Verification

Test endpoints in browser or Postman:

```
GET http://localhost:YOUR_PORT/api/v1/community/communities/featured
GET http://localhost:YOUR_PORT/api/v1/community/events/recent
GET http://localhost:YOUR_PORT/api/v1/community/announcements/recent
GET http://localhost:YOUR_PORT/api/v1/community/amenities
```

All should return JSON with data array.

## 🎨 Sample Data Overview

### Communities (3)
1. **Green Valley Residency** (Ahmedabad)
   - 200 units, 8 amenities
   - Smart homes, eco-friendly

2. **Sunshine Apartments** (Gandhinagar)
   - 150 units, 6 amenities
   - Near metro, prime location

3. **Royal Gardens** (Surat)
   - 100 units, 12 amenities
   - Luxury villas, private gardens

### Events (3)
1. Annual Sports Day (7 days from now)
2. Diwali Celebration (14 days from now)
3. Health & Wellness Workshop (3 days from now)

### Announcements (3)
1. Water Supply Maintenance (High priority)
2. New Gym Equipment Installed (Medium priority)
3. Enhanced Security Measures (Urgent, pinned)

### Amenities (12 across 6 categories)
- Sports: Tennis Court, Basketball Court
- Recreation: Swimming Pool, Playground, Garden
- Health: Gym, Jogging Track, Yoga Center
- Social: Club House, Library
- Safety: 24/7 Security
- Convenience: Parking

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: Ensure MongoDB is running and ENTRYTRACKING_DB_URL is set in `.env`

### Issue: "No data showing on landing page"
**Solution**: Run seed script: `npm run seed:landing`

### Issue: "Auth modal not appearing"
**Solution**: Check browser console for errors, verify React components loaded

### Issue: "Join request fails"
**Solution**: 
1. Ensure you're logged in
2. Check auth token in localStorage
3. Verify backend is running

## 📱 Mobile Testing

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device (iPhone 12, iPad, etc.)
4. Verify responsive layout:
   - Mobile: 1 column for communities/events
   - Tablet: 2 columns
   - Desktop: 3 columns

## 🎯 Next Steps After Setup

1. **Customize Styling**: Edit Tailwind classes in components
2. **Add More Data**: Run seed script multiple times or add via admin
3. **Implement Search**: Add search bar for communities
4. **Create Detail Pages**: Community/Event detail views
5. **Add Filters**: Filter by location, amenities, etc.

## 📞 Need Help?

- Check `LANDING_PAGE_IMPLEMENTATION.md` for detailed documentation
- Review component files in `client/src/components/landing/`
- Check API endpoints in `server/services/community-services/src/controllers/communityController.js`

## ✅ Success Criteria

You've successfully set up the landing page when:
- ✅ Landing page loads without errors
- ✅ All 3 communities display
- ✅ All 3 events display
- ✅ All 3 announcements display
- ✅ All 12 amenities categorized and shown
- ✅ Auth modal works for unauthenticated users
- ✅ Join requests work for authenticated users
- ✅ Navigation between pages works
- ✅ Responsive design works on mobile

**Estimated Setup Time**: 5 minutes
**Ready for**: Testing, Demo, Further Development

🎉 **Congratulations! Your landing page is ready!**
