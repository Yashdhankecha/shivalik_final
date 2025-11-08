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

// Reports
router.get('/reports', auth.verifyToken, auth.verifyAdmin, adminController.getReports);

// Role change requests
router.post('/role-change-requests', auth.verifyToken, auth.verifyAdmin, adminController.createRoleChangeRequest);
router.get('/role-change-requests', auth.verifyToken, auth.verifyAdmin, adminController.getRoleChangeRequests);
router.put('/role-change-requests/:requestId/approve', auth.verifyToken, auth.verifyAdmin, adminController.approveRoleChangeRequest);
router.put('/role-change-requests/:requestId/reject', auth.verifyToken, auth.verifyAdmin, adminController.rejectRoleChangeRequest);

module.exports = router;