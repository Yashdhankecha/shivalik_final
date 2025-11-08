const messages = require("../message");
const response = require("../config/response.js");
const { validationResult } = require('express-validator');
const CommunitiesModel = require('../models/Communities.js');
const UsersModel = require('../models/Users.js');
const EventsModel = require('../models/Events.js');
const ReportsModel = require('../models/Reports.js');
const RoleChangeRequestsModel = require('../models/RoleChangeRequests.js');
const mongoose = require('mongoose');
const path = require('path');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get communities created by current admin
        const communitiesCount = await CommunitiesModel.countDocuments({
            createdBy: req.user._id,
            isDeleted: false
        });

        // Get users in communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');

        const communityIds = communities.map(community => community._id);

        // Get all users in these communities (members + managers)
        const usersCount = await UsersModel.countDocuments({
            $or: [
                { communityId: { $in: communityIds } },
                { _id: { $in: communities.map(c => c.managerId) } }
            ],
            isDeleted: false
        });

        // Get events in communities created by current admin
        const eventsCount = await EventsModel.countDocuments({
            communityId: { $in: communityIds },
            isDeleted: false,
            status: { $in: ['Upcoming', 'Ongoing', 'upcoming', 'ongoing'] }
        });

        // Get reports count
        const reportsCount = await ReportsModel.countDocuments({
            communityId: { $in: communityIds },
            isDeleted: false
        });

        const stats = {
            totalUsers: usersCount,
            totalCommunities: communitiesCount,
            activeEvents: eventsCount,
            totalReports: reportsCount
        };

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            stats
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get communities created by current admin
 */
const getAdminCommunities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;

        const filter = {
            createdBy: req.user._id,
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            filter.status = { $in: [statusParam, statusParam.toLowerCase(), statusParam.charAt(0).toUpperCase() + statusParam.slice(1).toLowerCase()] };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.city': { $regex: search, $options: 'i' } }
            ];
        }

        const communities = await CommunitiesModel.find(filter)
            .populate('managerId', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await CommunitiesModel.countDocuments(filter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                communities,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get users in communities created by current admin
 */
const getCommunityUsers = async (req, res) => {
    try {
        const { communityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;

        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: communityId,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Build user filter
        const userFilter = {
            $or: [
                { communityId: communityId },
                { _id: community.managerId }
            ],
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            userFilter.status = statusParam;
        }

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await UsersModel.find(userFilter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await UsersModel.countDocuments(userFilter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get events in communities created by current admin
 */
const getCommunityEvents = async (req, res) => {
    try {
        const { communityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;

        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: communityId,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Build event filter
        const eventFilter = {
            communityId: communityId,
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            eventFilter.status = { $in: [statusParam, statusParam.toLowerCase(), statusParam.charAt(0).toUpperCase() + statusParam.slice(1).toLowerCase()] };
        }

        if (search) {
            eventFilter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await EventsModel.find(eventFilter)
            .populate('createdBy', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ eventDate: -1 })
            .lean();

        const total = await EventsModel.countDocuments(eventFilter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                events,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get all users in communities created by current admin
 */
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;

        // Get communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id managerId');

        const communityIds = communities.map(community => community._id);

        // Build user filter
        const userFilter = {
            $or: [
                { communityId: { $in: communityIds } },
                { _id: { $in: communities.map(c => c.managerId) } }
            ],
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            userFilter.status = statusParam;
        }

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await UsersModel.find(userFilter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await UsersModel.countDocuments(userFilter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get reports for communities created by current admin
 */
const getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;
        const typeParam = req.query.type;

        // Get communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');

        const communityIds = communities.map(community => community._id);

        // Build report filter
        const reportFilter = {
            communityId: { $in: communityIds },
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            reportFilter.status = statusParam;
        }

        // Handle type filter
        if (typeParam) {
            reportFilter.type = typeParam;
        }

        if (search) {
            reportFilter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const reports = await ReportsModel.find(reportFilter)
            .populate('createdBy', 'name')
            .populate('communityId', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await ReportsModel.countDocuments(reportFilter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                reports,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Create a new community
 */
const createCommunity = async (req, res) => {
    try {
        console.log('Create community request body:', req.body);
        console.log('Create community file:', req.file);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(response.toJson(errors.array()[0].msg));
        }

        const {
            name,
            description,
            territory,
            status,
            dynamicFields,
            location
        } = req.body;

        // Parse location data if it's a string (from FormData)
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                parsedLocation = {};
            }
        }

        // Extract location fields
        const address = parsedLocation?.address || '';
        const city = parsedLocation?.city || '';
        const state = parsedLocation?.state || '';
        const zipCode = parsedLocation?.zipCode || '';
        const country = parsedLocation?.country || 'India';

        // Handle file upload using fileUpload middleware pattern
        let bannerImage = null;
        if (req.files && req.files.bannerImage) {
            const file = req.files.bannerImage;
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = 'bannerImage-' + uniqueSuffix + '.' + file.name.split('.').pop();
            const uploadPath = path.join(__dirname, '../uploads/', filename);
            
            // Save file
            await file.mv(uploadPath);
            bannerImage = `/uploads/${filename}`;
        }

        // Check if community with this name already exists
        const existingCommunity = await CommunitiesModel.findOne({
            name: name,
            isDeleted: false
        });

        if (existingCommunity) {
            return res.status(400).send(response.toJson('A community with this name already exists'));
        }

        // Create new community
        const newCommunity = new CommunitiesModel({
            name,
            description,
            bannerImage: bannerImage || null,
            territory: territory || null,
            status: status || 'active',
            managerId: req.user._id, // Always set to current admin
            createdBy: req.user._id,
            location: {
                address: address || '',
                city: city || '',
                state: state || '',
                zipCode: zipCode || '',
                country: country || 'India'
            }
        });

        // Parse and add dynamic fields if provided
        let parsedDynamicFields = dynamicFields;
        if (typeof dynamicFields === 'string') {
            try {
                parsedDynamicFields = JSON.parse(dynamicFields);
            } catch (e) {
                parsedDynamicFields = {};
            }
        }
        
        if (parsedDynamicFields) {
            Object.assign(newCommunity, parsedDynamicFields);
        }

        await newCommunity.save();

        // Populate manager details
        await newCommunity.populate('managerId', 'name email');

        return res.status(201).send(response.toJson(
            'Community created successfully',
            newCommunity
        ));

    } catch (err) {
        console.error('Error creating community:', err.message);
        console.error('Error stack:', err.stack);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Update a community
 */
const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: id,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Update community
        Object.keys(updates).forEach(key => {
            if (key !== '_id' && key !== 'createdBy') {
                community[key] = updates[key];
            }
        });

        await community.save();

        // Populate manager details
        await community.populate('managerId', 'name email');

        return res.status(200).send(response.toJson(
            'Community updated successfully',
            community
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Delete a community
 */
const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: id,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Mark as deleted
        community.isDeleted = true;
        community.deletedAt = new Date();
        await community.save();

        return res.status(200).send(response.toJson(
            'Community deleted successfully'
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Create a role change request
 */
const createRoleChangeRequest = async (req, res) => {
    try {
        const { userId, requestedRole, communityId, reason } = req.body;
        
        // Verify user exists and is in admin's community
        const user = await UsersModel.findOne({
            _id: userId,
            isDeleted: false
        });
        
        if (!user) {
            return res.status(404).send(response.toJson('User not found'));
        }
        
        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: communityId,
            createdBy: req.user._id,
            isDeleted: false
        });
        
        if (!community) {
            return res.status(404).send(response.toJson('Community not found'));
        }
        
        // Check if user is part of this community
        const isUserInCommunity = user.communityId && user.communityId.toString() === communityId;
        if (!isUserInCommunity) {
            return res.status(400).send(response.toJson('User is not part of this community'));
        }
        
        // Check if a pending request already exists
        const existingRequest = await RoleChangeRequestsModel.findOne({
            userId: userId,
            communityId: communityId,
            requestedRole: requestedRole,
            status: 'Pending',
            isDeleted: false
        });
        
        if (existingRequest) {
            return res.status(400).send(response.toJson('A pending request for this role change already exists'));
        }
        
        // Create role change request
        const roleChangeRequest = new RoleChangeRequestsModel({
            userId: userId,
            currentRole: user.role,
            requestedRole: requestedRole,
            communityId: communityId,
            reason: reason
        });
        
        await roleChangeRequest.save();
        
        return res.status(201).send(response.toJson(
            'Role change request created successfully',
            roleChangeRequest
        ));
        
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get all role change requests for admin's communities
 */
const getRoleChangeRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;
        
        // Get communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');
        
        const communityIds = communities.map(community => community._id);
        
        // Build request filter
        const requestFilter = {
            communityId: { $in: communityIds },
            isDeleted: false
        };
        
        // Handle status filter
        if (statusParam) {
            requestFilter.status = statusParam;
        }
        
        if (search) {
            // Search by user name or email
            const users = await UsersModel.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ],
                isDeleted: false
            }).select('_id');
            
            const userIds = users.map(user => user._id);
            requestFilter.userId = { $in: userIds };
        }
        
        const requests = await RoleChangeRequestsModel.find(requestFilter)
            .populate('userId', 'name email role')
            .populate('communityId', 'name')
            .populate('reviewedBy', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
        
        const total = await RoleChangeRequestsModel.countDocuments(requestFilter);
        
        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                requests,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        ));
        
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Approve a role change request
 */
const approveRoleChangeRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        // Find the role change request
        const roleChangeRequest = await RoleChangeRequestsModel.findOne({
            _id: requestId,
            isDeleted: false
        }).populate('userId').populate('communityId');
        
        if (!roleChangeRequest) {
            return res.status(404).send(response.toJson('Role change request not found'));
        }
        
        // Verify community was created by current admin
        if (roleChangeRequest.communityId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send(response.toJson('Not authorized to approve this request'));
        }
        
        // Check if request is already processed
        if (roleChangeRequest.status !== 'Pending') {
            return res.status(400).send(response.toJson(`Request is already ${roleChangeRequest.status.toLowerCase()}`));
        }
        
        // Update the request
        roleChangeRequest.status = 'Approved';
        roleChangeRequest.reviewedBy = req.user._id;
        roleChangeRequest.reviewedAt = new Date();
        roleChangeRequest.approvedAt = new Date();
        
        await roleChangeRequest.save();
        
        // Update user's role
        await UsersModel.findByIdAndUpdate(roleChangeRequest.userId._id, {
            role: roleChangeRequest.requestedRole
        });
        
        return res.status(200).send(response.toJson(
            'Role change request approved successfully',
            roleChangeRequest
        ));
        
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Reject a role change request
 */
const rejectRoleChangeRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;
        
        // Find the role change request
        const roleChangeRequest = await RoleChangeRequestsModel.findOne({
            _id: requestId,
            isDeleted: false
        }).populate('userId').populate('communityId');
        
        if (!roleChangeRequest) {
            return res.status(404).send(response.toJson('Role change request not found'));
        }
        
        // Verify community was created by current admin
        if (roleChangeRequest.communityId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send(response.toJson('Not authorized to reject this request'));
        }
        
        // Check if request is already processed
        if (roleChangeRequest.status !== 'Pending') {
            return res.status(400).send(response.toJson(`Request is already ${roleChangeRequest.status.toLowerCase()}`));
        }
        
        // Update the request
        roleChangeRequest.status = 'Rejected';
        roleChangeRequest.reviewedBy = req.user._id;
        roleChangeRequest.reviewedAt = new Date();
        roleChangeRequest.rejectionReason = rejectionReason;
        
        await roleChangeRequest.save();
        
        return res.status(200).send(response.toJson(
            'Role change request rejected successfully',
            roleChangeRequest
        ));
        
    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

module.exports = {
    getDashboardStats,
    getAdminCommunities,
    getCommunityUsers,
    getCommunityEvents,
    getAllUsers,
    getReports,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    createRoleChangeRequest,
    getRoleChangeRequests,
    approveRoleChangeRequest,
    rejectRoleChangeRequest
};
