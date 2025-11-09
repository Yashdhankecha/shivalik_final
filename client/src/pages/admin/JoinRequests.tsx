import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Users, Search, Check, X, AlertCircle, Clock, CheckCircle, XCircle, Building2, MapPin, Mail, User
} from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface JoinRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  communityId: {
    _id: string;
    name: string;
    logo?: string;
    location?: {
      city: string;
      state: string;
    };
  };
  message?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

const JoinRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getJoinRequests({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      setRequests(response.result?.requests || response.data?.requests || []);
      setPagination(response.result?.pagination || response.data?.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching join requests:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch join requests",
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await adminApi.approveJoinRequest(requestId);
      toast({
        title: "Success",
        description: "Join request approved successfully. User has been added to the community.",
      });
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve join request",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminApi.rejectJoinRequest(selectedRequest._id, rejectionReason);
      toast({
        title: "Success",
        description: "Join request rejected. The user will be notified with the reason.",
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject join request",
        variant: "destructive"
      });
    }
  };

  const openRejectModal = (request: JoinRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Community Join Requests</h1>
        <p className="text-gray-600">Review and manage join requests for your communities</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by user name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Join Requests</h3>
          <p className="text-gray-600">There are no join requests matching your filters</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gray-800 text-white">
                        {request.userId.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-black">{request.userId.name}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{request.userId.email}</span>
                        </div>
                        {request.userId.role && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Role: {request.userId.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-black">{request.communityId.name}</h4>
                  </div>
                  {request.communityId.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 ml-8">
                      <MapPin className="w-4 h-4" />
                      <span>{request.communityId.location.city}, {request.communityId.location.state}</span>
                    </div>
                  )}
                </div>

                {/* User Message */}
                {request.message && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">User Message: </span>
                      {request.message}
                    </p>
                  </div>
                )}

                {/* Rejection Reason (if rejected) */}
                {request.status === 'Rejected' && request.reviewNotes && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Rejection Reason: </span>
                      {request.reviewNotes}
                    </p>
                    {request.reviewedBy && (
                      <p className="text-xs text-red-600 mt-1">
                        Reviewed by: {request.reviewedBy.name} on {formatDateToDDMMYYYY(request.reviewedAt || '')}

                      </p>
                    )}
                  </div>
                )}

                {/* Approval Info (if approved) */}
                {request.status === 'Approved' && request.reviewedBy && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      Approved by: {request.reviewedBy.name} on {formatDateToDDMMYYYY(request.reviewedAt || '')}

                    </p>
                  </div>
                )}

                {/* Request Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Requested on: {new Date(request.createdAt).toLocaleString()}
                </div>

                {/* Action Buttons */}
                {request.status === 'Pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(request._id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectModal(request)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reject Join Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this join request. The user will be notified with this message.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">User:</p>
                <p className="text-black">{selectedRequest.userId.name} ({selectedRequest.userId.email})</p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Community:</p>
                <p className="text-black">{selectedRequest.communityId.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this join request is being rejected..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the user explaining why their request was rejected.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  disabled={!rejectionReason.trim()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoinRequests;

