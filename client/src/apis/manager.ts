import apiClient from './apiService';

export const managerApi = {
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

  approveCommunityJoinRequest: async (communityId: string, requestId: string) => {
    const response = await apiClient.put(`/api/v1/manager/community-join-requests/${communityId}/${requestId}/approve`);
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

  approveCommunityPost: async (communityId: string, postId: string) => {
    const response = await apiClient.put(`/api/v1/manager/posts/${communityId}/${postId}/approve`);
    return response.data;
  },

  rejectCommunityPost: async (communityId: string, postId: string) => {
    const response = await apiClient.put(`/api/v1/manager/posts/${communityId}/${postId}/reject`);
    return response.data;
  },

  deleteCommunityPost: async (communityId: string, postId: string) => {
    const response = await apiClient.delete(`/api/v1/manager/posts/${communityId}/${postId}`);
    return response.data;
  },

  getCommunityPostStats: async (communityId: string) => {
    const response = await apiClient.get(`/api/v1/manager/posts/${communityId}/stats`);
    return response.data;
  }
};