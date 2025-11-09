import apiClient from './apiService';

export const managerApi = {
  // Get communities where user is a manager
  getManagerCommunities: async () => {
    const response = await apiClient.get('/api/v1/manager/communities');
    return response.data;
  },

  // Community Join Requests
  getCommunityJoinRequests: async (communityId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/api/v1/manager/community-join-requests/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  approveCommunityJoinRequest: async (communityId: string, requestId: string, comment?: string) => {
    const response = await apiClient.put(`/api/v1/manager/community-join-requests/${communityId}/${requestId}/approve`, {
      comment
    });
    return response.data;
  },

  rejectCommunityJoinRequest: async (communityId: string, requestId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/manager/community-join-requests/${communityId}/${requestId}/reject`, {
      rejectionReason
    });
    return response.data;
  },

  getCommunityJoinRequestStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/community-join-requests/${communityId}/stats`);
    return response.data;
  },

  // Community Members
  getCommunityMembers: async (communityId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/api/v1/manager/members/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  removeCommunityMember: async (communityId: string, userId: string) => {
    const response = await apiClient.delete(`/api/v1/manager/members/${communityId}/${userId}`);
    return response.data;
  },

  getCommunityMemberStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/members/${communityId}/stats`);
    return response.data;
  },

  // Community Events
  getCommunityEvents: async (communityId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/api/v1/manager/events/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  deleteCommunityEvent: async (communityId: string, eventId: string) => {
    const response = await apiClient.delete(`/api/v1/manager/events/${communityId}/${eventId}`);
    return response.data;
  },

  getCommunityEventStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/events/${communityId}/stats`);
    return response.data;
  },

  // Community Posts
  getCommunityPosts: async (communityId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/api/v1/manager/posts/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  approveCommunityPost: async (communityId: string, postId: string, comment?: string) => {
    const response = await apiClient.put(`/api/v1/manager/posts/${communityId}/${postId}/approve`, {
      comment
    });
    return response.data;
  },

  rejectCommunityPost: async (communityId: string, postId: string, comment?: string) => {
    const response = await apiClient.put(`/api/v1/manager/posts/${communityId}/${postId}/reject`, {
      comment
    });
    return response.data;
  },

  deleteCommunityPost: async (communityId: string, postId: string) => {
    const response = await apiClient.delete(`/api/v1/manager/posts/${communityId}/${postId}`);
    return response.data;
  },

  getCommunityPostStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/posts/${communityId}/stats`);
    return response.data;
  },

  // Community Reports
  getCommunityReports: async (communityId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    
    const response = await apiClient.get(`/api/v1/manager/reports/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  // Marketplace Listings
  getMarketplaceListings: async (communityId: string, params: {
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
    
    const response = await apiClient.get(`/api/v1/manager/marketplace/listings/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  approveMarketplaceListing: async (communityId: string, listingId: string, comment?: string) => {
    const response = await apiClient.put(`/api/v1/manager/marketplace/listings/${communityId}/${listingId}/approve`, {
      comment
    });
    return response.data;
  },

  rejectMarketplaceListing: async (communityId: string, listingId: string, comment: string) => {
    const response = await apiClient.put(`/api/v1/manager/marketplace/listings/${communityId}/${listingId}/reject`, {
      comment
    });
    return response.data;
  },

  getMarketplaceListingStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/marketplace/listings/${communityId}/stats`);
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/dashboard/stats/${communityId}`);
    return response.data;
  },

  // Moderation Dashboard
  getModerationDashboard: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/moderation-dashboard/${communityId}`);
    return response.data;
  },

  // Pulse approvals (Manager)
  getPulseApprovals: async (communityId: string, params: {
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
    
    const response = await apiClient.get(`/api/v1/manager/pulses/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  approvePulse: async (communityId: string, pulseId: string) => {
    const response = await apiClient.put(`/api/v1/manager/pulses/${communityId}/${pulseId}/approve`);
    return response.data;
  },

  rejectPulse: async (communityId: string, pulseId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/manager/pulses/${communityId}/${pulseId}/reject`, {
      rejectionReason
    });
    return response.data;
  },

  // User management (Manager)
  getAllUsers: async (communityId: string, params: {
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
    
    const response = await apiClient.get(`/api/v1/manager/users/${communityId}?${queryParams.toString()}`);
    return response.data;
  },

  addUserToCommunity: async (communityId: string, data: { email: string; name: string; role?: string }) => {
    const response = await apiClient.post(`/api/v1/manager/users/${communityId}/add`, data);
    return response.data;
  }
};