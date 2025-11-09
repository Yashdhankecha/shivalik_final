# Community Modules Implementation Guide

## Overview
This document outlines the complete implementation of 4 main functional modules for the community management system:
1. **Pulses** - Community posts/news feed
2. **Events** - Event registration with QR codes
3. **Marketplace** - Buy/sell properties with chat
4. **Directory** - Service provider directory

## Backend Implementation

### Models Created
- ✅ `EventRegistrations.js` - Stores event registrations with QR codes
- ✅ `MarketplaceChats.js` - Stores chat conversations for marketplace listings
- ✅ `DirectoryEntries.js` - Stores service provider directory entries

### Controllers Created
- ✅ `pulsesController.js` - Full CRUD for pulses with like/comment functionality
- ✅ `eventsController.js` - Event management with QR code generation and attendance tracking
- ✅ `marketplaceController.js` - Listing management with chat functionality
- ✅ `directoryController.js` - Directory entry management

### Routes Created
- ✅ `pulsesRoutes.js` - All pulse-related endpoints
- ✅ `eventsRoutes.js` - All event-related endpoints
- ✅ `marketplaceRoutes.js` - All marketplace-related endpoints
- ✅ `directoryRoutes.js` - All directory-related endpoints

### API Endpoints

#### Pulses Module
- `GET /api/v1/community/pulses/:communityId` - Get pulses by community
- `POST /api/v1/community/pulses/create` - Create pulse (Manager only)
- `PUT /api/v1/community/pulses/approve/:pulseId` - Approve/reject pulse
- `DELETE /api/v1/community/pulses/:pulseId` - Delete pulse
- `POST /api/v1/community/pulses/:pulseId/like` - Like/unlike pulse
- `POST /api/v1/community/pulses/:pulseId/comment` - Add comment

#### Events Module
- `GET /api/v1/community/events/:communityId` - Get events by community
- `POST /api/v1/community/events/create` - Create event (Manager only)
- `POST /api/v1/community/events/register/:eventId` - Register for event
- `GET /api/v1/community/events/registration/:eventId` - Get user registration
- `POST /api/v1/community/events/attendance/mark` - Mark attendance via QR
- `GET /api/v1/community/events/attendance/:eventId` - Get attendance list
- `DELETE /api/v1/community/events/:eventId` - Delete event

#### Marketplace Module
- `GET /api/v1/community/marketplace/:communityId` - Get listings by community
- `GET /api/v1/community/marketplace/listing/:id` - Get single listing
- `POST /api/v1/community/marketplace/listing/create` - Create listing
- `POST /api/v1/community/marketplace/chat/:listingId` - Start chat
- `POST /api/v1/community/marketplace/chat/message/:listingId` - Send message
- `GET /api/v1/community/marketplace/chat/:listingId` - Get chat messages
- `GET /api/v1/community/marketplace/chats/user` - Get user's chats
- `PUT /api/v1/community/marketplace/listing/:id/status` - Update listing status
- `DELETE /api/v1/community/marketplace/listing/:id` - Delete listing

#### Directory Module
- `GET /api/v1/community/directory/:communityId` - Get directory entries
- `GET /api/v1/community/directory/entry/:id` - Get single entry
- `POST /api/v1/community/directory/add` - Add entry (Manager only)
- `PUT /api/v1/community/directory/:id` - Update entry
- `DELETE /api/v1/community/directory/:id` - Delete entry

## Frontend Implementation

### Components Created
- ✅ `PulsesTab.tsx` - Complete pulses feed with create, like, comment
- ✅ `EventsTab.tsx` - Events list with registration and QR code display
- ⏳ `MarketplaceTab.tsx` - Marketplace with listings and chat (to be created)
- ⏳ `DirectoryTab.tsx` - Directory with search and filter (to be created)

### API Service Updated
- ✅ All API methods added to `client/src/apis/community.ts`

## Next Steps

### Remaining Frontend Components

1. **MarketplaceTab.tsx** - Needs to be created with:
   - Listing grid view
   - Create listing form
   - Chat modal/overlay
   - Buy/Sell tabs

2. **DirectoryTab.tsx** - Needs to be created with:
   - Directory table view
   - Search and filter by service type
   - Add/Edit entry forms (Manager only)

3. **Update CommunityDashboard.tsx** to:
   - Import and use the new tab components
   - Update routing to support nested routes if needed
   - Ensure proper tab navigation

### Testing Checklist
- [ ] Test pulse creation and approval flow
- [ ] Test event registration and QR code generation
- [ ] Test marketplace listing creation and chat
- [ ] Test directory entry management
- [ ] Test role-based permissions (Manager vs User)
- [ ] Test file uploads for images
- [ ] Test QR code scanning for attendance

### Environment Setup
Ensure the following packages are installed:
- `qrcode` - Already in package.json ✅
- File upload handling - Using `express-fileupload` ✅

## Notes
- All routes are mounted under `/api/v1/community/`
- Authentication is handled via `auth.verifyToken` middleware
- File uploads use `express-fileupload` middleware
- QR codes are generated using the `qrcode` npm package
- All models include soft delete functionality (`isDeleted` flag)

