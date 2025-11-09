import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { getImageUrl } from '../../utils/imageUtils';
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
  ShoppingBag, Search, Check, X, AlertCircle, Clock, CheckCircle, XCircle, Building2, MapPin, Mail, User, IndianRupee, Image as ImageIcon
} from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface MarketplaceListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  attachment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'closed';
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  communityId: {
    _id: string;
    name: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

const MarketplaceApprovals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getMarketplaceListings({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      setListings(response.result?.listings || response.data?.listings || []);
      setPagination(response.result?.pagination || response.data?.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching marketplace listings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch product listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-black text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-gray-600 text-white flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>;
      case 'sold':
        return <Badge className="bg-gray-800 text-white flex items-center gap-1">
          Sold
        </Badge>;
      case 'closed':
        return <Badge className="bg-gray-500 text-white flex items-center gap-1">
          Closed
        </Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-400 text-white flex items-center gap-1">
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

  const handleApprove = async (listingId: string) => {
    try {
      await adminApi.approveMarketplaceListing(listingId);
      toast({
        title: "Success",
        description: "Product listing approved successfully. It is now visible to community members.",
      });
      fetchListings(); // Refresh the list
    } catch (error: any) {
      console.error('Error approving listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve product listing",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminApi.rejectMarketplaceListing(selectedListing._id, rejectionReason);
      toast({
        title: "Success",
        description: "Product listing rejected. The seller will be notified with the reason.",
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedListing(null);
      fetchListings(); // Refresh the list
    } catch (error: any) {
      console.error('Error rejecting listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject product listing",
        variant: "destructive"
      });
    }
  };

  const openRejectModal = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Product Listing Approvals</h1>
        <p className="text-gray-600">Review and manage product listings for your communities</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by product title or description..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings List */}
      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Product Listings</h3>
          <p className="text-gray-600">There are no product listings matching your filters</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {listing.attachment ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={getImageUrl(listing.attachment)} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-black">{listing.title}</h3>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-1 text-lg font-bold text-black">
                          <IndianRupee className="w-5 h-5" />
                          <span>{listing.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{listing.description}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Seller: {listing.userId.name}</span>
                          <span className="text-gray-400">•</span>
                          <Mail className="w-4 h-4" />
                          <span>{listing.userId.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>Community: {listing.communityId.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {listing.status === 'rejected' && listing.reviewNotes && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Rejection Reason: </span>
                      {listing.reviewNotes}
                    </p>
                    {listing.reviewedBy && (
                      <p className="text-xs text-gray-600 mt-1">
                        Reviewed by: {listing.reviewedBy.name} on {formatDateToDDMMYYYY(listing.reviewedAt || '')}

                      </p>
                    )}
                  </div>
                )}

                {/* Approval Info (if approved) */}
                {listing.status === 'approved' && listing.reviewedBy && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      Approved by: {listing.reviewedBy.name} on {formatDateToDDMMYYYY(listing.reviewedAt || '')}

                    </p>
                  </div>
                )}

                {/* Listing Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Listed on: {new Date(listing.createdAt).toLocaleString()}
                </div>

                {/* Action Buttons */}
                {listing.status === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(listing._id)}
                      className="bg-black hover:bg-gray-800 text-white flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectModal(listing)}
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
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} listings
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
            <DialogTitle>Reject Product Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product listing. The seller will be notified with this message.
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Product:</p>
                <p className="text-black">{selectedListing.title}</p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Seller:</p>
                <p className="text-black">{selectedListing.userId.name} ({selectedListing.userId.email})</p>
                <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Community:</p>
                <p className="text-black">{selectedListing.communityId.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this product listing is being rejected..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the seller explaining why their listing was rejected.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedListing(null);
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
                  Reject Listing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceApprovals;








