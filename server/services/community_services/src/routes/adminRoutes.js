const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware.js');
const multer = require('multer');

// Using the global fileUpload middleware instead of multer to maintain consistency
// File upload is handled via req.files.bannerImage

// Admin dashboard stats
router.get('/dashboard/stats', auth.verifyToken, auth.verifyAdmin, adminController.getDashboardStats);
router.get('/dashboard/activities', auth.verifyToken, auth.verifyAdmin, adminController.getRecentActivities);

// Admin communities
router.get('/communities', auth.verifyToken, auth.verifyAdmin, adminController.getAdminCommunities);

// Create community
router.post('/communities', 
    auth.verifyToken, 
    auth.verifyAdmin,
    [
        body('name').notEmpty().withMessage('Community name is required'),
        body('description').notEmpty().withMessage('Community description is required')
    ],
    adminController.createCommunity
);

// Update community
router.put('/communities/:id', auth.verifyToken, auth.verifyAdmin, adminController.updateCommunity);

// Delete community
router.delete('/communities/:id', auth.verifyToken, auth.verifyAdmin, adminController.deleteCommunity);

// Community users
router.get('/communities/:communityId/users', auth.verifyToken, auth.verifyAdmin, adminController.getCommunityUsers);

// All users in admin's communities
router.get('/users', auth.verifyToken, auth.verifyAdmin, adminController.getAllUsers);

// Community events
router.get('/communities/:communityId/events', auth.verifyToken, auth.verifyAdmin, adminController.getCommunityEvents);
router.post('/communities/:communityId/events', auth.verifyToken, auth.verifyAdmin, adminController.createCommunityEvent);

// Role change requests
router.post('/role-change-requests', auth.verifyToken, auth.verifyAdmin, adminController.createRoleChangeRequest);
router.get('/role-change-requests', auth.verifyToken, auth.verifyAdmin, adminController.getRoleChangeRequests);
router.put('/role-change-requests/:requestId/approve', auth.verifyToken, auth.verifyAdmin, adminController.approveRoleChangeRequest);
router.put('/role-change-requests/:requestId/reject', 
    auth.verifyToken, 
    auth.verifyAdmin,
    [
        body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
    ],
    adminController.rejectRoleChangeRequest
);

// Community join requests
router.get('/join-requests', auth.verifyToken, auth.verifyAdmin, adminController.getJoinRequests);
router.put('/join-requests/:requestId/approve', auth.verifyToken, auth.verifyAdmin, adminController.approveJoinRequest);
router.put('/join-requests/:requestId/reject', 
    auth.verifyToken, 
    auth.verifyAdmin,
    [
        body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
    ],
    adminController.rejectJoinRequest
);

// Marketplace product listing approvals
router.get('/marketplace/listings', auth.verifyToken, auth.verifyAdmin, adminController.getMarketplaceListings);
router.put('/marketplace/listings/:listingId/approve', auth.verifyToken, auth.verifyAdmin, adminController.approveMarketplaceListing);
router.put('/marketplace/listings/:listingId/reject', 
    auth.verifyToken, 
    auth.verifyAdmin,
    [
        body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
    ],
    adminController.rejectMarketplaceListing
);

// Moderator management
router.get('/moderators/members', auth.verifyToken, auth.verifyAdmin, adminController.getCommunityMembers);
router.put('/moderators/:userId/assign', auth.verifyToken, auth.verifyAdmin, adminController.assignModeratorRole);

// Community join requests
router.get('/community-join-requests', auth.verifyToken, auth.verifyAdmin, adminController.getCommunityJoinRequests);
router.put('/community-join-requests/:requestId/approve', auth.verifyToken, auth.verifyAdmin, adminController.approveCommunityJoinRequest);
router.put('/community-join-requests/:requestId/reject', auth.verifyToken, auth.verifyAdmin, adminController.rejectCommunityJoinRequest);

// Community managers
router.post('/community-managers', auth.verifyToken, auth.verifyAdmin, adminController.assignCommunityManager);
router.delete('/community-managers/:managerId', auth.verifyToken, auth.verifyAdmin, adminController.removeCommunityManager);
router.get('/communities/:communityId/managers', auth.verifyToken, auth.verifyAdmin, adminController.getCommunityManagers);

module.exports = router;