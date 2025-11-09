import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, CheckCircle, XCircle, Clock, Calendar, User, MapPin } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

const EventRegistrationApprovals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.page, searchTerm]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingEventRegistrations({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      // Handle response structure
      const data = response.result || response.data || response;
      setRegistrations(data.registrations || data || []);
      setPagination(data.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch event registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>;
      case 'pending':
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

  const handleApprove = async (approvalId: string) => {
    try {
      await adminApi.approveEventRegistration(approvalId);
      toast({
        title: "Success",
        description: "Event registration approved successfully. User will receive a QR code ticket.",
      });
      fetchRegistrations(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving registration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve event registration",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminApi.rejectEventRegistration(selectedRegistration._id, rejectionReason);
      toast({
        title: "Success",
        description: "Event registration rejected. The user will be notified with the reason.",
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRegistration(null);
      fetchRegistrations(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject event registration",
        variant: "destructive"
      });
    }
  };

  const openRejectModal = (registration: any) => {
    setSelectedRegistration(registration);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRegistration(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Registration Approvals</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user name or event title..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {registrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No pending event registrations found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration: any) => (
                <Card key={registration._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                          <div>
                            <h3 className="font-semibold text-lg">{registration.eventId?.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{registration.userId?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {registration.eventId?.eventDate 
                                  ? formatDateToDDMMYYYY(registration.eventId.eventDate) 
                                  : 'N/A'}

                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{registration.eventId?.location || 'Location not set'}</span>
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(registration.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {registration.status === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleApprove(registration._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => openRejectModal(registration)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
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
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Registration</h2>
            <p className="mb-2">
              Are you sure you want to reject the registration for 
              <span className="font-semibold"> {selectedRegistration.userId?.name}</span> 
              for the event 
              <span className="font-semibold"> {selectedRegistration.eventId?.title}</span>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 h-24"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Registration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationApprovals;