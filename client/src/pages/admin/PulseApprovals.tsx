import { useState, useEffect } from 'react';
import { adminApi } from '../../apis/admin';
import { communityApi } from '../../apis/community';
import { showMessage } from '../../utils/Constant';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Image as ImageIcon,
  Clock,
  User,
  Mail,
  Building2
} from 'lucide-react';

interface Pulse {
  _id: string;
  title: string;
  description: string;
  territory: string;
  attachment?: string;
  userId?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  communityId?: {
    _id: string;
    name: string;
  } | string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Helper functions to safely extract properties
const getUserName = (user: Pulse['userId']) => {
  if (typeof user === 'object' && user !== null && 'name' in user) {
    return user.name;
  }
  return 'Unknown User';
};

const getUserEmail = (user: Pulse['userId']) => {
  if (typeof user === 'object' && user !== null && 'email' in user) {
    return user.email;
  }
  return undefined;
};

const getCommunityName = (community: Pulse['communityId']) => {
  if (typeof community === 'object' && community !== null && 'name' in community) {
    return community.name;
  }
  return 'Unknown Community';
};

const PulseApprovals = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchPulses();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchPulses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPulseApprovals({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter
      });
      
      const pulsesData = response.result?.pulses || response.data?.pulses || [];
      setPulses(Array.isArray(pulsesData) ? pulsesData : []);
      
      const paginationData = response.result?.pagination || response.data?.pagination;
      if (paginationData) {
        setPagination({
          page: paginationData.page,
          limit: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        });
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to fetch pulse approvals', 'error');
      setPulses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleApprove = async (pulseId: string) => {
    try {
      await adminApi.approvePulse(pulseId);
      showMessage('Pulse approved successfully', 'success');
      fetchPulses();
    } catch (error: any) {
      showMessage(error.message || 'Failed to approve pulse', 'error');
    }
  };

  const openRejectModal = (pulse: Pulse) => {
    setSelectedPulse(pulse);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedPulse || !rejectionReason.trim()) {
      showMessage('Please provide a rejection reason', 'error');
      return;
    }

    try {
      await adminApi.rejectPulse(selectedPulse._id, rejectionReason);
      showMessage('Pulse rejected successfully', 'success');
      setShowRejectModal(false);
      setSelectedPulse(null);
      setRejectionReason('');
      fetchPulses();
    } catch (error: any) {
      showMessage(error.message || 'Failed to reject pulse', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  if (loading && pulses.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pulse Approvals</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pulses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="">All Statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pulses List */}
      {pulses.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pulses Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'pending' 
              ? 'No pulses match your search criteria' 
              : 'No pulses are currently pending approval'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pulses.map((pulse) => (
            <Card key={pulse._id} className="border-2 hover:border-gray-300 transition-colors rounded-xl shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {pulse.attachment ? (
                      <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img 
                          src={pulse.attachment} 
                          alt={pulse.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{pulse.title}</h3>
                        {getStatusBadge(pulse.status)}
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{pulse.description}</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span>User: {getUserName(pulse.userId)}</span>
                          {getUserEmail(pulse.userId) && (
                            <>
                              <span className="text-gray-400">•</span>
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span>{getUserEmail(pulse.userId)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>Community: {getCommunityName(pulse.communityId)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approval Info (if approved or rejected) */}
                {pulse.status !== 'pending' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {pulse.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(pulse.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {pulse.status === 'pending' && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleApprove(pulse._id)}
                      className="bg-black hover:bg-gray-800 text-white flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectModal(pulse)}
                      variant="outline"
                      className="flex-1 border-gray-300"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} pulses
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 sm:px-4"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 sm:px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Reject Pulse</DialogTitle>
          </DialogHeader>
          {selectedPulse && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Pulse:</p>
                <p className="text-gray-900 font-medium">{selectedPulse.title}</p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">User:</p>
                <p className="text-gray-900">
                  {getUserName(selectedPulse.userId)}
                  {getUserEmail(selectedPulse.userId) && ` (${getUserEmail(selectedPulse.userId)})`}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Community:</p>
                <p className="text-gray-900">{getCommunityName(selectedPulse.communityId)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this pulse is being rejected..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the user explaining why their pulse was rejected.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedPulse(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-black hover:bg-gray-800 w-full sm:w-auto"
                  disabled={!rejectionReason.trim()}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Pulse
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PulseApprovals;