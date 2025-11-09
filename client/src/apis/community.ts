import apiClient from './apiService';

// Community related API calls
export const communityApi = {
    // Get featured communities for landing page
    getFeaturedCommunities: async (limit: number = 6) => {
        const response = await apiClient.get(`/api/v1/community/communities/featured?limit=${limit}`);
        return response.data;
    },

    // Get all communities with pagination
    getAllCommunities: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        
        const response = await apiClient.get(`/api/v1/community/communities?${queryParams.toString()}`);
        return response.data;
    },

    // Get community by ID
    getCommunityById: async (id: string) => {
        const response = await apiClient.get(`/api/v1/community/communities/${id}`);
        // API returns: { message: "...", result: community }
        // Return the full response.data so frontend can access both result and data
        return response.data;
    },

    // Get pulses for a community
    getCommunityPulses: async (communityId: string, params: {
        page?: number;
        limit?: number;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const response = await apiClient.get(`/api/v1/community/communities/${communityId}/pulses?${queryParams.toString()}`);
        return response.data;
    },

    // Get marketplace listings for a community
    getCommunityMarketplaceListings: async (communityId: string, params: {
        page?: number;
        limit?: number;
        type?: 'want' | 'offer';
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.type) queryParams.append('type', params.type);
        
        const response = await apiClient.get(`/api/v1/community/communities/${communityId}/marketplace?${queryParams.toString()}`);
        return response.data;
    },

    // Get members for a community
    getCommunityMembers: async (communityId: string) => {
        const response = await apiClient.get(`/api/v1/community/communities/${communityId}/members`);
        return response.data;
    },

    // Get events for a community
    getCommunityEvents: async (communityId: string, params: {
        page?: number;
        limit?: number;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const response = await apiClient.get(`/api/v1/community/communities/${communityId}/events?${queryParams.toString()}`);
        return response.data;
    },

    // Get recent events
    getRecentEvents: async (limit: number = 6) => {
        const response = await apiClient.get(`/api/v1/community/events/recent?limit=${limit}`);
        return response.data;
    },

    // Get recent announcements
    getRecentAnnouncements: async (limit: number = 6) => {
        const response = await apiClient.get(`/api/v1/community/announcements/recent?limit=${limit}`);
        return response.data;
    },

    // Get all amenities
    getAllAmenities: async () => {
        const response = await apiClient.get('/api/v1/community/amenities');
        return response.data;
    },

    // Create join request (requires authentication)
    createJoinRequest: async (data: {
        communityId: string;
        message?: string;
    }) => {
        const response = await apiClient.post('/api/v1/community/join-requests', data);
        return response.data;
    },

    // Get user's join requests (requires authentication)
    getUserJoinRequests: async () => {
        const response = await apiClient.get('/api/v1/community/join-requests/user');
        return response.data;
    },

    // Check if user is a member of a community (requires authentication)
    checkCommunityMembership: async (communityId: string) => {
        const response = await apiClient.get(`/api/v1/community/communities/${communityId}/membership`);
        return response.data;
    },

    // ========== PULSES MODULE ==========
    createPulse: async (data: FormData) => {
        const response = await apiClient.post('/api/v1/community/pulses/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getPulsesByCommunity: async (communityId: string, params: {
        page?: number;
        limit?: number;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        const response = await apiClient.get(`/api/v1/community/pulses/${communityId}?${queryParams.toString()}`);
        return response.data;
    },

    approvePulse: async (pulseId: string, status: 'approved' | 'rejected') => {
        const response = await apiClient.put(`/api/v1/community/pulses/approve/${pulseId}`, { status });
        return response.data;
    },

    deletePulse: async (pulseId: string) => {
        const response = await apiClient.delete(`/api/v1/community/pulses/${pulseId}`);
        return response.data;
    },

    toggleLikePulse: async (pulseId: string) => {
        const response = await apiClient.post(`/api/v1/community/pulses/${pulseId}/like`);
        return response.data;
    },

    addCommentToPulse: async (pulseId: string, text: string) => {
        const response = await apiClient.post(`/api/v1/community/pulses/${pulseId}/comment`, { text });
        return response.data;
    },

    // ========== EVENTS MODULE ==========
    createEvent: async (data: FormData) => {
        const response = await apiClient.post('/api/v1/community/events/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getEventsByCommunity: async (communityId: string, params: {
        page?: number;
        limit?: number;
        status?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status) queryParams.append('status', params.status);
        const response = await apiClient.get(`/api/v1/community/events/${communityId}?${queryParams.toString()}`);
        return response.data;
    },

    registerForEvent: async (eventId: string) => {
        const response = await apiClient.post(`/api/v1/community/events/register/${eventId}`);
        return response.data;
    },

    getUserRegistration: async (eventId: string) => {
        const response = await apiClient.get(`/api/v1/community/events/registration/${eventId}`);
        return response.data;
    },

    // Get user's registration status (new method for approval workflow)
    getUserRegistrationStatus: async (eventId: string) => {
        const response = await apiClient.get(`/api/v1/community/events/registration/status/${eventId}`);
        return response.data;
    },

    markAttendance: async (qrData: string) => {
        const response = await apiClient.post('/api/v1/community/events/attendance/mark', { qrData });
        return response.data;
    },

    getEventAttendance: async (eventId: string) => {
        const response = await apiClient.get(`/api/v1/community/events/attendance/${eventId}`);
        return response.data;
    },

    deleteEvent: async (eventId: string) => {
        const response = await apiClient.delete(`/api/v1/community/events/${eventId}`);
        return response.data;
    },

    // ========== MARKETPLACE MODULE ==========
    createListing: async (data: FormData) => {
        const response = await apiClient.post('/api/v1/community/marketplace/listing/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getListingsByCommunity: async (communityId: string, params: {
        page?: number;
        limit?: number;
        type?: 'buy' | 'sell';
        status?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        const response = await apiClient.get(`/api/v1/community/marketplace/${communityId}?${queryParams.toString()}`);
        return response.data;
    },

    getListingById: async (id: string) => {
        const response = await apiClient.get(`/api/v1/community/marketplace/listing/${id}`);
        return response.data;
    },

    startChat: async (listingId: string) => {
        const response = await apiClient.post(`/api/v1/community/marketplace/chat/${listingId}`);
        return response.data;
    },

    sendMessage: async (listingId: string, text: string) => {
        const response = await apiClient.post(`/api/v1/community/marketplace/chat/message/${listingId}`, { text });
        return response.data;
    },

    getChatMessages: async (listingId: string) => {
        const response = await apiClient.get(`/api/v1/community/marketplace/chat/${listingId}`);
        return response.data;
    },

    getUserChats: async () => {
        const response = await apiClient.get('/api/v1/community/marketplace/chats/user');
        return response.data;
    },

    updateListingStatus: async (id: string, status: 'pending' | 'approved' | 'rejected' | 'sold' | 'closed') => {
        const response = await apiClient.put(`/api/v1/community/marketplace/listing/${id}/status`, { status });
        return response.data;
    },

    deleteListing: async (id: string) => {
        const response = await apiClient.delete(`/api/v1/community/marketplace/listing/${id}`);
        return response.data;
    },

    // ========== DIRECTORY MODULE ==========
    getDirectoryEntries: async (communityId: string, params: {
        serviceType?: string;
        search?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.serviceType) queryParams.append('serviceType', params.serviceType);
        if (params.search) queryParams.append('search', params.search);
        const response = await apiClient.get(`/api/v1/community/directory/${communityId}?${queryParams.toString()}`);
        return response.data;
    },

    getDirectoryEntryById: async (id: string) => {
        const response = await apiClient.get(`/api/v1/community/directory/entry/${id}`);
        return response.data;
    },

    addDirectoryEntry: async (data: {
        communityId: string;
        name: string;
        serviceType: string;
        contactNumber: string;
        alternateContact?: string;
        email?: string;
        availabilityHours?: string;
        address?: string;
        notes?: string;
    }) => {
        const response = await apiClient.post('/api/v1/community/directory/add', data);
        return response.data;
    },

    updateDirectoryEntry: async (id: string, data: {
        name?: string;
        serviceType?: string;
        contactNumber?: string;
        alternateContact?: string;
        email?: string;
        availabilityHours?: string;
        address?: string;
        notes?: string;
        verified?: boolean;
    }) => {
        const response = await apiClient.put(`/api/v1/community/directory/${id}`, data);
        return response.data;
    },

    deleteDirectoryEntry: async (id: string) => {
        const response = await apiClient.delete(`/api/v1/community/directory/${id}`);
        return response.data;
    }
};

export default communityApi;