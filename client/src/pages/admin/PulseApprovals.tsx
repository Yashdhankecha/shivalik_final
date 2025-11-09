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
  Building2,
  IndianRupee
} from 'lucide-react';

interface Pulse {
  _id: string;
  title: string;
  description: string;
  territory: string;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  communityId: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

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
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Pulse Approvals</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search pulses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
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
        <Card className="p-12 text-center bg-gray-50 border-2 border-gray-200">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Pulses Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'pending' 
              ? 'No pulses match your search criteria' 
              : 'No pulses are currently pending approval'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pulses.map((pulse) => (
            <Card key={pulse._id} className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {pulse.attachment ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={pulse.attachment} alt={pulse.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-black">{pulse.title}</h3>
                        {getStatusBadge(pulse.status)}
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{pulse.description}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>User: {pulse.userId?.name || 'Unknown User'}</span>
                          {pulse.userId?.email && (
                            <>
                              <span className="text-gray-400">•</span>
                              <Mail className="w-4 h-4" />
                              <span>{pulse.userId.email}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>Community: {pulse.communityId?.name || 'Unknown Community'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approval Info (if approved or rejected) */}
                {pulse.status !== 'pending' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {pulse.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(pulse.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {pulse.status === 'pending' && (
                  <div className="flex gap-3">
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} pulses
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
            <DialogTitle>Reject Pulse</DialogTitle>
          </DialogHeader>
          {selectedPulse && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Pulse:</p>
                <p className="text-black">{selectedPulse.title}</p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">User:</p>
                <p className="text-black">
                  {selectedPulse.userId?.name || 'Unknown User'} 
                  {selectedPulse.userId?.email && ` (${selectedPulse.userId.email})`}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Community:</p>
                <p className="text-black">{selectedPulse.communityId?.name || 'Unknown Community'}</p>
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
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedPulse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  className="bg-black hover:bg-gray-800"
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