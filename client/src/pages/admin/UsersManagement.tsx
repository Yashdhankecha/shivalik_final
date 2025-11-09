import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Users, Search, UserPlus, X, Building2 } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

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
  const [reason, setReason] = useState('');
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
        return <Badge className="bg-gray-900 text-white">Active</Badge>;
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
        return <Badge className="bg-gray-900 text-white">{role}</Badge>;
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

  const openRoleChangeModal = (user: any) => {
    setSelectedUser(user);
    setShowRoleChangeModal(true);
  };

  const closeRoleChangeModal = () => {
    setShowRoleChangeModal(false);
    setSelectedUser(null);
    setRequestedRole('Manager');
    setSelectedModeratorCommunity('');
    setReason('');
  };

  const handleRoleChangeSubmit = async () => {
    try {
      // Directly update user role instead of creating a request
      await adminApi.updateUserRole(
        selectedUser._id,
        requestedRole,
        selectedModeratorCommunity || undefined
      );
      
      toast({
        title: "Success",
        description: `User role updated to ${requestedRole} successfully`
      });
      
      closeRoleChangeModal();
      fetchUsers(); // Refresh the user list to show updated role
    } catch (error: any) {
      console.error('Error updating user role:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user role";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Users Management</h1>
            <p className="text-gray-600 text-xs md:text-sm lg:text-base">Manage all users, their roles, and access permissions</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4 md:w-5 md:h-5" />
            <Input
              type="text"
              placeholder="Search users by name, email..."
              className="pl-9 md:pl-10 border border-gray-300 text-gray-900 text-sm md:text-base h-10 md:h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Community Filter */}
          <div className="flex gap-2">
            <select
              value={selectedCommunity}
              onChange={handleCommunityChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 text-sm md:text-base h-10 md:h-11 flex-1 md:flex-none min-w-[140px]"
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
              className="border border-gray-300 text-gray-900 hover:bg-gray-100 text-sm md:text-base h-10 md:h-11 px-3 md:px-4"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl flex items-center gap-2 text-gray-900">
              <Users className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="truncate">
                {selectedCommunity 
                  ? `${communities.find(c => c._id === selectedCommunity)?.name || 'Selected Community'} Users` 
                  : 'All Users'}
              </span>
            </h3>
            <p className="text-xs sm:text-xs md:text-sm text-gray-600">Showing {users.length} users</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Mobile View - Card Layout */}
              <div className="sm:hidden divide-y divide-gray-200">
                {users.length === 0 ? (
                  <div className="px-3 py-6 text-center text-gray-500 text-xs">
                    No users found. Try adjusting your search or filters.
                  </div>
                ) : (
                  users.map((user: any) => (
                    <div key={user._id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-900 hover:bg-gray-100 p-1.5 h-7 text-xs"
                          onClick={() => openRoleChangeModal(user)}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Change Role
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Joined: {formatDateToDDMMYYYY(user.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View - Table Layout */}
              <table className="hidden sm:table w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden lg:table-cell">Join Date</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                        No users found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0">
                              <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs sm:text-xs md:text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs sm:text-xs md:text-sm text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-600 truncate hidden sm:block">{user.email}</p>
                              <div className="sm:hidden mt-1 flex gap-1.5 flex-wrap">
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.status)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                          {formatDateToDDMMYYYY(user.createdAt)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-900 hover:bg-gray-100 p-1.5 sm:p-1.5 md:p-2 h-7 sm:h-7 md:h-8 w-8 sm:w-8 md:w-8"
                              onClick={() => openRoleChangeModal(user)}
                              title="Change Role"
                            >
                              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
            className="border border-gray-300 text-gray-900 hover:bg-gray-100 text-xs sm:text-sm w-full sm:w-auto px-4 py-2 h-9 sm:h-10"
          >
            Previous
          </Button>
          <span className="text-xs sm:text-sm text-gray-600 text-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border border-gray-300 text-gray-900 hover:bg-gray-100 text-xs sm:text-sm w-full sm:w-auto px-4 py-2 h-9 sm:h-10"
          >
            Next
          </Button>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleChangeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Change User Role</h3>
                <Button variant="ghost" size="sm" onClick={closeRoleChangeModal} className="h-8 w-8 p-0">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">User</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{selectedUser.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Requested Role</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-900 h-9 sm:h-10"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Resident">Resident</option>
                  </select>
                </div>
                
                {requestedRole === 'Manager' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Community</label>
                    <select
                      value={selectedModeratorCommunity}
                      onChange={(e) => setSelectedModeratorCommunity(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-900 h-9 sm:h-10"
                    >
                      <option value="">Select Community</option>
                      {communities.map((community) => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-900"
                    rows={3}
                    placeholder="Enter reason for role change..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={closeRoleChangeModal}
                    className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                  >
                    Cancel
                  </Button>

                  <Button onClick={handleRoleChangeSubmit}>
                    Update Role

                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;