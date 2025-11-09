import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { 
  Users, Search, Check, X, AlertCircle, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

const RoleChangeRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getRoleChangeRequests({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      setRequests(response.data.requests || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching role change requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch role change requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-600 text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>;
      case 'Rejected':
        return <Badge className="bg-red-600 text-white flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>;
      case 'Pending':
      default:
        return <Badge className="bg-yellow-500 text-black flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>;
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await adminApi.approveRoleChangeRequest(requestId);
      toast({
        title: "Success",
        description: "Role change request approved successfully"
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve role change request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminApi.rejectRoleChangeRequest(requestId, rejectionReason);
      toast({
        title: "Success",
        description: "Role change request rejected successfully"
      });
      setShowRejectModal(false);
      setRejectionReason('');
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject role change request",
        variant: "destructive"
      });
    }
  };

  const openRejectModal = (request: any) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading role change requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Role Change Requests</h1>
            <p className="text-gray-600">Manage user requests for role changes and approvals</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search requests by user name or email..."
              className="pl-10 border border-gray-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              Pending Requests
            </h3>
            <p className="text-sm text-gray-600">Showing {requests.length} requests</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Current Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Requested Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Request Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request: any) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-800 text-white font-semibold">
                            {request.userId?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-black">{request.userId?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-600">{request.userId?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(request.currentRole)}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(request.requestedRole)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.communityId?.name || 'Unknown Community'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateToDDMMYYYY(request.createdAt)}

                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'Pending' ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(request._id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => openRejectModal(request)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-gray-400" disabled>
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {requests.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No role change requests</h3>
                <p className="text-gray-500">There are currently no role change requests to display.</p>
              </div>
            )}
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

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Reject Role Change Request</h3>
                <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Request from: <span className="font-semibold">{selectedRequest.userId?.name}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Requested role: <span className="font-semibold">{selectedRequest.requestedRole}</span>
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={4}
                  placeholder="Enter reason for rejecting this request..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleReject(selectedRequest._id)}
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleChangeRequests;