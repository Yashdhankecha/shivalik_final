import apiClient from './apiService';

// Admin related API calls
export const adminApi = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/v1/admin/dashboard/stats');
    return response.data;
  },

  // Get communities created by current admin
  getAdminCommunities: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/communities?${queryParams.toString()}`);
    return response.data;
  },

  // Get users in communities created by current admin
  getCommunityUsers: async (communityId: string, params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/communities/${communityId}/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get all users in communities created by current admin
  getAllUsers: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get events in communities created by current admin
  getCommunityEvents: async (communityId: string, params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/communities/${communityId}/events?${queryParams.toString()}`);
    return response.data;
  },

  // Get reports
  getReports: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/reports?${queryParams.toString()}`);
    return response.data;
  },

  // Create new community
  createCommunity: async (data: FormData) => {
    try {
      const response = await apiClient.post('/api/v1/admin/communities', data);
      return response.data;
    } catch (error) {
      // Re-throw the error so it can be handled by the calling function
      throw error;
    }
  },

  // Update community
  updateCommunity: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/v1/admin/communities/${id}`, data);
    return response.data;
  },

  // Delete community
  deleteCommunity: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/admin/communities/${id}`);
    return response.data;
  },

  // Role change requests
  createRoleChangeRequest: async (data: any) => {
    const response = await apiClient.post('/api/v1/admin/role-change-requests', data);
    return response.data;
  },

  getRoleChangeRequests: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/role-change-requests?${queryParams.toString()}`);
    return response.data;
  },

  // Get recent activities for admin dashboard
  getRecentActivities: async (params: {
    limit?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get(`/api/v1/admin/dashboard/activities?${queryParams.toString()}`);
    return response.data;
  },

  approveRoleChangeRequest: async (requestId: string) => {
    const response = await apiClient.put(`/api/v1/admin/role-change-requests/${requestId}/approve`);
    return response.data;
  },

  rejectRoleChangeRequest: async (requestId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/admin/role-change-requests/${requestId}/reject`, { rejectionReason });
    return response.data;
  },

  // Create community event
  createCommunityEvent: async (communityId: string, data: FormData) => {
    try {
      const response = await apiClient.post(`/api/v1/admin/communities/${communityId}/events`, data);
      return response.data;
    } catch (error) {
      // Re-throw the error so it can be handled by the calling function
      throw error;
    }
  },

  // Community join requests
  getJoinRequests: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/join-requests?${queryParams.toString()}`);
    return response.data;
  },

  approveJoinRequest: async (requestId: string) => {
    const response = await apiClient.put(`/api/v1/admin/join-requests/${requestId}/approve`);
    return response.data;
  },

  rejectJoinRequest: async (requestId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/admin/join-requests/${requestId}/reject`, { rejectionReason });
    return response.data;
  },

  // Marketplace product listing approvals
  getMarketplaceListings: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/marketplace/listings?${queryParams.toString()}`);
    return response.data;
  },

  approveMarketplaceListing: async (listingId: string) => {
    const response = await apiClient.put(`/api/v1/admin/marketplace/listings/${listingId}/approve`);
    return response.data;
  },

  rejectMarketplaceListing: async (listingId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/admin/marketplace/listings/${listingId}/reject`, { rejectionReason });
    return response.data;
  },

  // Event registration approvals
  getPendingEventRegistrations: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const response = await apiClient.get(`/api/v1/admin/events/registrations?${queryParams.toString()}`);
    return response.data;
  },

  approveEventRegistration: async (approvalId: string) => {
    const response = await apiClient.put(`/api/v1/admin/events/registrations/${approvalId}/approve`);
    return response.data;
  },

  rejectEventRegistration: async (approvalId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/admin/events/registrations/${approvalId}/reject`, { rejectionReason });
    return response.data;
  },

  // Pulse approvals
  getPulseApprovals: async (params: {
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
    
    const response = await apiClient.get(`/api/v1/admin/pulses?${queryParams.toString()}`);
    return response.data;
  },

  approvePulse: async (pulseId: string) => {
    const response = await apiClient.put(`/api/v1/admin/pulses/${pulseId}/approve`);
    return response.data;
  },

  rejectPulse: async (pulseId: string, rejectionReason: string) => {
    const response = await apiClient.put(`/api/v1/admin/pulses/${pulseId}/reject`, { rejectionReason });
    return response.data;
  }
};

export default adminApi;