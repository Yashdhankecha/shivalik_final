import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Search, Users, X, Trash2 } from 'lucide-react';
import { managerApi } from '../../apis/manager';
import { useToast } from '../../hooks/use-toast';

const ManagerMembers = () => {
  const { communityId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!communityId) {
      toast({
        title: "Error",
        description: "Community ID is required",
        variant: "destructive"
      });
      return;
    }
    
    fetchMembers();
  }, [communityId, pagination.page, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getCommunityMembers(communityId!, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      // Handle different response structures
      let membersData = [];
      let paginationData = pagination;
      
      if (response?.data?.members) {
        membersData = response.data.members;
        paginationData = response.data.pagination || pagination;
      } else if (response?.result?.members) {
        membersData = response.result.members;
        paginationData = response.result.pagination || pagination;
      } else if (response?.members) {
        membersData = response.members;
        paginationData = response.pagination || pagination;
      } else if (Array.isArray(response?.data)) {
        membersData = response.data;
        paginationData = {
          ...pagination,
          total: membersData.length,
          totalPages: Math.ceil(membersData.length / pagination.limit)
        };
      } else if (Array.isArray(response)) {
        membersData = response;
        paginationData = {
          ...pagination,
          total: membersData.length,
          totalPages: Math.ceil(membersData.length / pagination.limit)
        };
      }
      
      setMembers(membersData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching community members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch community members",
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
      case 'User':
        return <Badge className="bg-gray-500 text-white">Resident</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-800">{role}</Badge>;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await managerApi.removeCommunityMember(communityId!, memberId);
      toast({
        title: "Success",
        description: "Member removed successfully"
      });
      setShowRemoveModal(false);
      setSelectedMember(null);
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const openRemoveModal = (member: any) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading community members...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Community Members</h1>
            <p className="text-gray-600">Manage members in your community</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search members by name or email..."
              className="pl-10 border border-gray-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              Members
            </h3>
            <p className="text-sm text-gray-600">Showing {members.length} members</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No members found. {pagination.total === 0 ? 'There are no members in your community.' : 'Try adjusting your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  members.map((member: any) => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-800 text-white font-semibold">
                              {member.name ? member.name.split(' ').map(n => n[0]).join('') : 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-black">{member.name || 'Unknown Member'}</p>
                            <p className="text-xs text-gray-600">{member.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(member.role || 'User')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(member.status || 'Pending')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openRemoveModal(member)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* Remove Member Modal */}
      {showRemoveModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Remove Member</h3>
                <Button variant="ghost" onClick={() => setShowRemoveModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to remove <span className="font-semibold">{selectedMember.name || 'this member'}</span> from the community?
                </p>
                <p className="text-xs text-gray-500">
                  This action will remove the member from the community but will not delete their account.
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleRemoveMember(selectedMember._id)}
                >
                  Remove Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-black">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-black">
                  {members.filter(m => (m.status || '').toLowerCase() === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Members</p>
                <p className="text-2xl font-bold text-black">
                  {members.filter(m => (m.status || '').toLowerCase() === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Members</p>
                <p className="text-2xl font-bold text-black">
                  {members.filter(m => (m.status || '').toLowerCase() === 'inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerMembers;