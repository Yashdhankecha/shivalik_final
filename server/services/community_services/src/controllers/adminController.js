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
        let usersCount = 0;
        let communitiesCount = 0;
        let eventsCount = 0;
        let reportsCount = 0;

        // Get communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');

        communitiesCount = communities.length;
        const communityIds = communities.map(community => community._id);

        // If admin has communities, get stats for those communities
        if (communityIds.length > 0) {
            // Get all users in these communities (members + managers)
            usersCount = await UsersModel.countDocuments({
                $or: [
                    { communityId: { $in: communityIds } },
                    { _id: { $in: communities.map(c => c.managerId) } }
                ],
                isDeleted: false
            });

            // Get events in communities created by current admin
            eventsCount = await EventsModel.countDocuments({
                communityId: { $in: communityIds },
                isDeleted: false,
                status: { $in: ['Upcoming', 'Ongoing', 'upcoming', 'ongoing'] }
            });

            // Get reports count
            reportsCount = await ReportsModel.countDocuments({
                communityId: { $in: communityIds },
                isDeleted: false
            });
        } else {
            // If admin has no communities, check if they are an admin user
            if (req.user.role === 'Admin' || req.user.role === 'SuperAdmin') {
                // Admin users get overall stats
                usersCount = await UsersModel.countDocuments({ isDeleted: false });
                eventsCount = await EventsModel.countDocuments({ 
                    isDeleted: false,
                    status: { $in: ['Upcoming', 'Ongoing', 'upcoming', 'ongoing'] }
                });
                reportsCount = await ReportsModel.countDocuments({ isDeleted: false });
                // Get total communities (not just those created by this admin)
                communitiesCount = await CommunitiesModel.countDocuments({ isDeleted: false });
            }
            // Regular users with no communities get zero stats (already initialized to 0)
        }

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
        let userFilter = { isDeleted: false };

        // If admin has communities, get users from those communities
        if (communityIds.length > 0) {
            userFilter.$or = [
                { communityId: { $in: communityIds } },
                { _id: { $in: communities.map(c => c.managerId) } }
            ];
        } else {
            // If admin has no communities, check if they are an admin user (Admin or SuperAdmin)
            // Show all users for any admin user, not just SuperAdmin
            if (req.user.role === 'Admin' || req.user.role === 'SuperAdmin') {
                // Admin users (both Admin and SuperAdmin) get all users
                userFilter = { isDeleted: false };
            } else {
                // Regular user with no communities gets empty result
                return res.status(200).send(response.toJson(
                    messages['en'].common.detail_success,
                    {
                        users: [],
                        pagination: {
                            total: 0,
                            page,
                            limit,
                            totalPages: 0
                        }
                    }
                ));
            }
        }

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
 * Get recent activities for admin dashboard
 */
const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get communities created by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');

        const communityIds = communities.map(community => community._id);

        let recentUsers = [];
        let recentEvents = [];

        // If admin has communities, get activities for those communities
        if (communityIds.length > 0) {
            // Get recent user registrations
            recentUsers = await UsersModel.find({
                $or: [
                    { communityId: { $in: communityIds } },
                    { _id: { $in: communities.map(c => c.managerId) } }
                ],
                isDeleted: false
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

            // Get recent community events
            recentEvents = await EventsModel.find({
                communityId: { $in: communityIds },
                isDeleted: false
            })
            .populate('communityId', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        } else {
            // If admin has no communities, check if they are an admin user
            if (req.user.role === 'Admin' || req.user.role === 'SuperAdmin') {
                // Admin users get all activities
                // Get recent user registrations (all users)
                recentUsers = await UsersModel.find({ isDeleted: false })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .lean();

                // Get recent events (all events)
                recentEvents = await EventsModel.find({ isDeleted: false })
                    .populate('communityId', 'name')
                    .populate('createdBy', 'name')
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .lean();
            }
            // Regular users with no communities get empty activities (already initialized to empty arrays)
        }

        // Format activities
        const userActivities = recentUsers.map(user => ({
            type: 'user',
            action: `New user registered: ${user.name}`,
            user: user.name,
            time: new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: user.createdAt
        }));

        const eventActivities = recentEvents.map(event => ({
            type: 'event',
            action: `New event created: ${event.title}`,
            user: event.createdBy?.name || 'Unknown',
            community: event.communityId?.name || 'Unknown Community',
            time: new Date(event.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: event.createdAt
        }));

        // Combine and sort all activities by timestamp
        const allActivities = [...userActivities, ...eventActivities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            allActivities
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

/**
 * Create a new event for a community
 */
const createCommunityEvent = async (req, res) => {
    try {
        const { communityId } = req.params;
        const {
            title,
            description,
            eventDate,
            startTime,
            endTime,
            location,
            maxParticipants,
            registrationEndDate,
            eventType
        } = req.body;

        // Verify community exists and was created by current admin
        const community = await CommunitiesModel.findOne({
            _id: communityId,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Handle file upload using fileUpload middleware pattern
        let images = [];
        if (req.files && req.files.images) {
            const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            
            for (const file of files) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = 'event-' + uniqueSuffix + '.' + file.name.split('.').pop();
                const uploadPath = path.join(__dirname, '../uploads/', filename);
                
                // Save file
                await file.mv(uploadPath);
                images.push(`/uploads/${filename}`);
            }
        }

        // Create new event
        const newEvent = new EventsModel({
            title,
            description,
            communityId: communityId,
            eventDate: new Date(eventDate),
            startTime,
            endTime,
            location: location || '',
            images: images.length > 0 ? [images[0]] : [], // Only allow one image as per requirements
            maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
            createdBy: req.user._id,
            eventType: eventType || 'Other',
            status: 'Upcoming'
        });

        await newEvent.save();

        // Populate community and creator details
        await newEvent.populate('communityId', 'name');
        await newEvent.populate('createdBy', 'name');

        return res.status(201).send(response.toJson(
            'Event created successfully',
            newEvent
        ));

    } catch (err) {
        console.error('Error creating event:', err.message);
        console.error('Error stack:', err.stack);
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get all community join requests for communities managed by current admin
 */
const getCommunityJoinRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const statusParam = req.query.status;

        // Get communities managed by current admin
        const communities = await CommunitiesModel.find({
            createdBy: req.user._id,
            isDeleted: false
        }).select('_id');

        const communityIds = communities.map(community => community._id);

        // If admin has no communities, return empty result
        if (communityIds.length === 0) {
            return res.status(200).send(response.toJson(
                messages['en'].common.detail_success,
                {
                    requests: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                }
            ));
        }

        // Build filter for join requests
        let filter = {
            communityId: { $in: communityIds },
            isDeleted: false
        };

        // Handle status filter
        if (statusParam) {
            filter.status = statusParam;
        }

        // Handle search
        if (search) {
            // Search in user name, email or community name
            const users = await UsersModel.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ],
                isDeleted: false
            }).select('_id');

            const userIds = users.map(user => user._id);

            filter.$or = [
                { userId: { $in: userIds } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const requests = await CommunityJoinRequestsModel.find(filter)
            .populate('userId', 'name email')
            .populate('communityId', 'name')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await CommunityJoinRequestsModel.countDocuments(filter);

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
 * Approve a community join request
 */
const approveCommunityJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Validate request ID
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).send(response.toJson('Invalid request ID'));
        }

        // Find the join request
        const joinRequest = await CommunityJoinRequestsModel.findOne({
            _id: requestId,
            isDeleted: false
        }).populate('communityId');

        if (!joinRequest) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Check if the admin manages this community
        const community = await CommunitiesModel.findOne({
            _id: joinRequest.communityId._id,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(403).send(response.toJson(messages['en'].auth.not_access));
        }

        // Check if request is already approved
        if (joinRequest.status === 'Approved') {
            return res.status(400).send(response.toJson('Request is already approved'));
        }

        // Update the join request
        joinRequest.status = 'Approved';
        joinRequest.reviewedBy = req.user._id;
        joinRequest.reviewedAt = new Date();
        joinRequest.updatedAt = new Date();

        await joinRequest.save();

        // Add user to community members (this would typically be done in a more complex way)
        // For now, we'll just log that the user should be added to the community
        console.log(`User ${joinRequest.userId} should be added to community ${joinRequest.communityId._id}`);

        return res.status(200).send(response.toJson(
            'Join request approved successfully',
            joinRequest
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Reject a community join request
 */
const rejectCommunityJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;

        // Validate request ID
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).send(response.toJson('Invalid request ID'));
        }

        // Find the join request
        const joinRequest = await CommunityJoinRequestsModel.findOne({
            _id: requestId,
            isDeleted: false
        }).populate('communityId');

        if (!joinRequest) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Check if the admin manages this community
        const community = await CommunitiesModel.findOne({
            _id: joinRequest.communityId._id,
            createdBy: req.user._id,
            isDeleted: false
        });

        if (!community) {
            return res.status(403).send(response.toJson(messages['en'].auth.not_access));
        }

        // Check if request is already rejected
        if (joinRequest.status === 'Rejected') {
            return res.status(400).send(response.toJson('Request is already rejected'));
        }

        // Update the join request
        joinRequest.status = 'Rejected';
        joinRequest.reviewedBy = req.user._id;
        joinRequest.reviewedAt = new Date();
        joinRequest.reviewNotes = rejectionReason || '';
        joinRequest.updatedAt = new Date();

        await joinRequest.save();

        return res.status(200).send(response.toJson(
            'Join request rejected successfully',
            joinRequest
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Assign a manager to a community
 */
const assignCommunityManager = async (req, res) => {
    try {
        const { communityId, userId, role } = req.body;

        // Validate inputs
        if (!communityId || !userId) {
            return res.status(400).send(response.toJson('Community ID and User ID are required'));
        }

        // Validate role
        const validRoles = ['Manager'];
        const managerRole = validRoles.includes(role) ? role : 'Manager';

        // Check if community exists
        const community = await CommunitiesModel.findOne({
            _id: communityId,
            isDeleted: false
        });

        if (!community) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Check if user exists
        const user = await UsersModel.findOne({
            _id: userId,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Check if user is already assigned as manager for this community
        const existingManager = await CommunityManagersModel.findOne({
            userId: userId,
            communityId: communityId,
            isDeleted: false
        });

        if (existingManager) {
            return res.status(400).send(response.toJson('User is already assigned as manager for this community'));
        }

        // Create manager record
        const newManager = new CommunityManagersModel({
            userId: userId,
            communityId: communityId,
            role: managerRole,
            assignedBy: req.user._id,
            permissions: {
                canApproveJoinRequests: true,
                canManagePosts: true,
                canManageUsers: true,
                canCreateEvents: true,
                canManageReports: true
            }
        });

        await newManager.save();

        // Update user role if needed
        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
            await UsersModel.updateOne(
                { _id: userId },
                { 
                    $set: { 
                        role: managerRole,
                        updatedAt: new Date()
                    }
                }
            );
        }

        // Populate and return the manager record
        await newManager.populate([
            { path: 'userId', select: 'name email' },
            { path: 'communityId', select: 'name' },
            { path: 'assignedBy', select: 'name' }
        ]);

        return res.status(201).send(response.toJson(
            'Manager assigned successfully',
            newManager
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Remove a manager from a community
 */
const removeCommunityManager = async (req, res) => {
    try {
        const { managerId } = req.params;

        // Validate manager ID
        if (!mongoose.Types.ObjectId.isValid(managerId)) {
            return res.status(400).send(response.toJson('Invalid manager ID'));
        }

        // Find the manager record
        const managerRecord = await CommunityManagersModel.findOne({
            _id: managerId,
            isDeleted: false
        });

        if (!managerRecord) {
            return res.status(404).send(response.toJson(messages['en'].common.not_exists));
        }

        // Mark as deleted
        managerRecord.isDeleted = true;
        managerRecord.deletedAt = new Date();
        managerRecord.updatedAt = new Date();

        await managerRecord.save();

        // Check if user has other manager roles
        const otherManagerRoles = await CommunityManagersModel.countDocuments({
            userId: managerRecord.userId,
            isDeleted: false
        });

        // If no other manager roles, revert user role to 'User'
        if (otherManagerRoles === 0) {
            const user = await UsersModel.findOne({ _id: managerRecord.userId });
            if (user && user.role !== 'Admin' && user.role !== 'SuperAdmin') {
                await UsersModel.updateOne(
                    { _id: managerRecord.userId },
                    { 
                        $set: { 
                            role: 'User',
                            updatedAt: new Date()
                        }
                    }
                );
            }
        }

        return res.status(200).send(response.toJson(
            'Manager removed successfully'
        ));

    } catch (err) {
        const statusCode = err.statusCode || 500;
        const errMess = err.message || err;
        return res.status(statusCode).send(response.toJson(errMess));
    }
};

/**
 * Get all managers for a community
 */
const getCommunityManagers = async (req, res) => {
    try {
        const { communityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter for managers
        let filter = {
            communityId: communityId,
            isDeleted: false
        };

        const managers = await CommunityManagersModel.find(filter)
            .populate([
                { path: 'userId', select: 'name email role' },
                { path: 'assignedBy', select: 'name' }
            ])
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await CommunityManagersModel.countDocuments(filter);

        return res.status(200).send(response.toJson(
            messages['en'].common.detail_success,
            {
                managers,
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
    rejectRoleChangeRequest,
    createCommunityEvent,
    getRecentActivities,
    getCommunityJoinRequests,
    approveCommunityJoinRequest,
    rejectCommunityJoinRequest,
    assignCommunityManager,
    removeCommunityManager,
    getCommunityManagers
};




















