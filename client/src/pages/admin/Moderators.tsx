import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Users, Search, Shield, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';

interface CommunityMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  communityId: {
    _id: string;
    name: string;
    location?: {
      city: string;
      state: string;
    };
  };
  createdAt: string;
}

interface Community {
  _id: string;
  name: string;
}

const Moderators = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, searchTerm, selectedCommunity]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCommunityMembers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        communityId: selectedCommunity !== 'all' ? selectedCommunity : undefined
      });
      
      const data = response.result || response.data || response;
      setMembers(data.members || []);
      setCommunities(data.communities || []);
      setPagination(data.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching community members:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch community members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Manager':
        return <Badge className="bg-blue-600 text-white flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Moderator
        </Badge>;
      case 'Admin':
        return <Badge className="bg-black text-white">Admin</Badge>;
      case 'SuperAdmin':
        return <Badge className="bg-purple-600 text-white">Super Admin</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-800">Member</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-600 text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-400 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-300 text-gray-800">{status}</Badge>;
    }
  };

  const handleAssignModerator = async (member: CommunityMember) => {
    if (member.role === 'Manager') {
      toast({
        title: "Info",
        description: "This user is already a moderator",
        variant: "default"
      });
      return;
    }

    try {
      const communityId = typeof member.communityId === 'object' 
        ? member.communityId._id 
        : member.communityId;
      
      await adminApi.assignModeratorRole(member._id, communityId);
      toast({
        title: "Success",
        description: `${member.name} has been assigned moderator role successfully`,
      });
      fetchMembers(); // Refresh the list
    } catch (error: any) {
      console.error('Error assigning moderator role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign moderator role",
        variant: "destructive"
      });
    }
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
      <div className="mb-4 md:mb-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-1 md:mb-2">Add Moderators</h1>
          <p className="text-sm md:text-base text-gray-600">Assign moderator role to community members</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search members by name or email..."
              className="pl-10 border border-gray-400 text-black text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="w-full md:w-64 border border-gray-400">
              <SelectValue placeholder="Filter by community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
              {communities.map((community) => (
                <SelectItem key={community._id} value={community._id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              Community Members
            </h3>
            <p className="text-sm text-gray-600">Showing {members.length} of {pagination.total} members</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Member</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden sm:table-cell">Community</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden sm:table-cell">Role</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase hidden md:table-cell">Status</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No community members found
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar className="w-8 h-8 md:w-10 md:h-10">
                            <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs md:text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs md:text-sm text-black truncate">{member.name}</p>
                            <p className="text-xs text-gray-600 truncate">{member.email}</p>
                            <div className="sm:hidden mt-1">
                              {getRoleBadge(member.role)}
                              <span className="ml-2">{getStatusBadge(member.status)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell">
                        {typeof member.communityId === 'object' ? member.communityId.name : 'Unknown'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        {member.role !== 'Manager' ? (
                          <Button
                            onClick={() => handleAssignModerator(member)}
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs md:text-sm"
                            size="sm"
                          >
                            <Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            Assign Moderator
                          </Button>
                        ) : (
                          <Badge className="bg-green-600 text-white flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Already Moderator
                          </Badge>
                        )}
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
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
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
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Moderators;

