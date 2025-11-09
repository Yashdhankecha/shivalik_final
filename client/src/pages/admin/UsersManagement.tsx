import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Users, Search, Edit, Trash2, Eye, UserPlus, X, Building2 } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { communityApi } from '../../apis/community';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [requestedRole, setRequestedRole] = useState('Manager');
  const [selectedModeratorCommunity, setSelectedModeratorCommunity] = useState('');
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [showViewCommunitiesModal, setShowViewCommunitiesModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [viewingUserCommunities, setViewingUserCommunities] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCommunities();
  }, [pagination.page, searchTerm, selectedCommunity]);

  const fetchCommunities = async () => {
    try {
      const response = await adminApi.getAdminCommunities({
        limit: 100 // Fetch all communities
      });
      
      // Handle different response structures
      let communitiesData = [];
      if (response?.data?.communities) {
        communitiesData = response.data.communities;
      } else if (response?.result?.communities) {
        communitiesData = response.result.communities;
      } else if (response?.communities) {
        communitiesData = response.communities;
      } else if (Array.isArray(response?.data)) {
        communitiesData = response.data;
      } else if (Array.isArray(response)) {
        communitiesData = response;
      }
      
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // If a community is selected, fetch users from that specific community
      if (selectedCommunity) {
        const response = await adminApi.getCommunityUsers(selectedCommunity, {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        
        // Handle different response structures for community users
        let usersData = [];
        let paginationData = pagination;
        
        if (response?.data?.users) {
          usersData = response.data.users;
          paginationData = response.data.pagination || pagination;
        } else if (response?.result?.users) {
          usersData = response.result.users;
          paginationData = response.result.pagination || pagination;
        } else if (response?.users) {
          usersData = response.users;
          paginationData = response.pagination || pagination;
        } else if (Array.isArray(response?.data)) {
          usersData = response.data;
          paginationData = {
            ...pagination,
            total: usersData.length,
            totalPages: Math.ceil(usersData.length / pagination.limit)
          };
        } else if (Array.isArray(response)) {
          usersData = response;
          paginationData = {
            ...pagination,
            total: usersData.length,
            totalPages: Math.ceil(usersData.length / pagination.limit)
          };
        }
        
        setUsers(usersData);
        setPagination(paginationData);
      } else {
        // Otherwise, fetch all users
        const response = await adminApi.getAllUsers({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        
        console.log('Users API response:', response);
        
        // Handle different response structures
        let usersData = [];
        let paginationData = pagination;
        
        if (response?.data?.users) {
          usersData = response.data.users;
          paginationData = response.data.pagination || pagination;
        } else if (response?.result?.users) {
          usersData = response.result.users;
          paginationData = response.result.pagination || pagination;
        } else if (response?.users) {
          usersData = response.users;
          paginationData = response.pagination || pagination;
        } else if (Array.isArray(response?.data)) {
          usersData = response.data;
          paginationData = {
            ...pagination,
            total: usersData.length,
            totalPages: Math.ceil(usersData.length / pagination.limit)
          };
        } else if (Array.isArray(response)) {
          usersData = response;
          paginationData = {
            ...pagination,
            total: usersData.length,
            totalPages: Math.ceil(usersData.length / pagination.limit)
          };
        }
        
        setUsers(usersData);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-black text-white">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-gray-500 text-white">Pending</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-300 text-gray-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-800">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge className="bg-black text-white">{role}</Badge>;
      case 'Manager':
        return <Badge className="bg-gray-700 text-white">{role}</Badge>;
      case 'Resident':
        return <Badge className="bg-gray-500 text-white">{role}</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-800">{role}</Badge>;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const openRoleChangeModal = async (user: any) => {
    setSelectedUser(user);
    setRequestedRole('Manager');
    setSelectedModeratorCommunity('');
    setReason('');
    
    // Fetch user's participated communities
    if (user._id) {
      try {
        const response = await adminApi.getUserCommunities(user._id);
        const data = response.result || response.data || response;
        const userComms = data.communities || [];
        
        // Filter to only show communities that admin manages
        const adminCommunityIds = communities.map((c: any) => c._id);
        const filteredComms = userComms.filter((comm: any) => 
          adminCommunityIds.includes(comm._id)
        );
        
        setUserCommunities(filteredComms);
      } catch (error) {
        console.error('Error fetching user communities:', error);
        setUserCommunities([]);
      }
    }
    
    setShowRoleChangeModal(true);
  };

  const handleViewCommunities = async (user: any) => {
    setViewingUser(user);
    try {
      const response = await adminApi.getUserCommunities(user._id);
      const data = response.result || response.data || response;
      const userComms = data.communities || [];
      
      setViewingUserCommunities(userComms);
      setShowViewCommunitiesModal(true);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user's communities",
        variant: "destructive"
      });
      setViewingUserCommunities([]);
    }
  };

  const handleRoleChangeRequest = async () => {
    if (!selectedUser || !reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the role change request",
        variant: "destructive"
      });
      return;
    }

    // If Moderator role is selected, community is required
    if (requestedRole === 'Moderator' && !selectedModeratorCommunity) {
      toast({
        title: "Validation Error",
        description: "Please select a community for moderator role",
        variant: "destructive"
      });
      return;
    }

    try {
      const communityId = requestedRole === 'Moderator' 
        ? selectedModeratorCommunity 
        : (selectedUser.communityId?._id || selectedUser.communityId || '');

      await adminApi.createRoleChangeRequest({
        userId: selectedUser._id,
        requestedRole: requestedRole === 'Moderator' ? 'Manager' : requestedRole, // Use Manager role for Moderator
        communityId: communityId,
        reason
      });

      toast({
        title: "Success",
        description: "Role change request submitted successfully"
      });

      setShowRoleChangeModal(false);
      setSelectedUser(null);
      setRequestedRole('Manager');
      setSelectedModeratorCommunity('');
      setReason('');
      setUserCommunities([]);
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error submitting role change request:', error);
      toast({
        title: "Error",
        description: "Failed to submit role change request",
        variant: "destructive"
      });
    }
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommunity(e.target.value);
    // Reset to first page when changing community
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCommunity('');
    setPagination({ ...pagination, page: 1 });
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-1 md:mb-2">Users Management</h1>
            <p className="text-sm md:text-base text-gray-600">Manage all users, their roles, and access permissions</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"

              placeholder="Search users by name, email, or community..."
              className="pl-10 border border-gray-400 text-black text-sm md:text-base"

              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Community Filter */}
          <div className="flex gap-2">

            <select
              value={selectedCommunity}
              onChange={handleCommunityChange}
              className="border border-gray-400 rounded-md px-3 py-2 text-black"
            >
              <option value="">All Communities</option>
              {communities.map((community) => (
                <option key={community._id} value={community._id}>
                  {community.name}
                </option>
              ))}
            </select>
            
            <Button 
              variant="outline" 
              className="border border-gray-400 text-black hover:bg-gray-100"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>

          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              {selectedCommunity 
                ? `${communities.find(c => c._id === selectedCommunity)?.name || 'Selected Community'} Users` 
                : 'All Users'}
            </h3>
            <p className="text-sm text-gray-600">Showing {users.length} users</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">User</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden sm:table-cell">Role</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden sm:table-cell">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden lg:table-cell">Join Date</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">

                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10">
                          <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs md:text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs md:text-sm text-black truncate">{user.name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          <div className="sm:hidden mt-1">
                            {getRoleBadge(user.role)}
                            <span className="ml-2">{getStatusBadge(user.status)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-black hover:bg-gray-100 p-1 md:p-2 h-7 md:h-8 w-7 md:w-8"
                          onClick={() => handleViewCommunities(user)}
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:bg-blue-50 p-1 md:p-2 h-7 md:h-8 w-7 md:w-8"
                          onClick={() => openRoleChangeModal(user)}
                        >
                          <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100 p-1 md:p-2 h-7 md:h-8 w-7 md:w-8">
                          <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100 p-1 md:p-2 h-7 md:h-8 w-7 md:w-8">
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Next
          </Button>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleChangeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-lg md:text-xl font-bold">Request Role Change</h3>
                <Button variant="ghost" onClick={() => setShowRoleChangeModal(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  User: <span className="font-semibold">{selectedUser.name || 'Unknown User'}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Current Role: <span className="font-semibold">{selectedUser.role || 'User'}</span>
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Role
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => {
                      setRequestedRole(e.target.value);
                      if (e.target.value !== 'Moderator') {
                        setSelectedModeratorCommunity('');
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                    <option value="User">Resident</option>
                  </select>
                </div>

                {requestedRole === 'Moderator' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Community *
                    </label>
                    {userCommunities.length > 0 ? (
                      <select
                        value={selectedModeratorCommunity}
                        onChange={(e) => setSelectedModeratorCommunity(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                      >
                        <option value="">Select a community</option>
                        {userCommunities.map((community: any) => (
                          <option key={community._id} value={community._id}>
                            {community.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500">
                        User has no participated communities. User must join a community first.
                      </p>
                    )}
                  </div>
                )}
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for change *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={4}
                  placeholder="Enter reason for role change..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRoleChangeModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={handleRoleChangeRequest}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Users</p>
                <p className="text-xl md:text-2xl font-bold text-black">{pagination.total || 0}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>

                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-black">
                  {users.filter(u => (u.status || '').toLowerCase() === 'active').length}

                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>

                <p className="text-sm text-gray-600">Pending Users</p>
                <p className="text-2xl font-bold text-black">
                  {users.filter(u => (u.status || '').toLowerCase() === 'pending').length}

                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>

                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-black">
                  {users.filter(u => (u.status || '').toLowerCase() === 'inactive').length}

                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Communities Modal */}
      <Dialog open={showViewCommunitiesModal} onOpenChange={setShowViewCommunitiesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingUser?.name || 'User'}'s Participated Communities
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewingUserCommunities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                This user has not joined any communities yet.
              </p>
            ) : (
              <div className="space-y-3">
                {viewingUserCommunities.map((community: any) => (
                  <Card key={community._id} className="border border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-black">{community.name}</h4>
                          {community.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              {community.location.city && `${community.location.city}, `}
                              {community.location.state}
                            </p>
                          )}
                          {community.joinedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Joined: {new Date(community.joinedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;