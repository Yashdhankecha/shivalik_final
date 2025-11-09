import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { 
  Users, FileText, ShoppingBag, CheckCircle, XCircle, Clock, 
  AlertCircle, RefreshCw, Eye, MessageSquare, Calendar, DollarSign
} from 'lucide-react';
import { managerApi } from '../../apis/manager';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

const ModerationDashboard = () => {
  const { communityId: urlCommunityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [communityId, setCommunityId] = useState<string>('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    itemType: 'user' | 'pulse' | 'listing' | null;
    item: any;
  }>({
    open: false,
    type: null,
    itemType: null,
    item: null
  });
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  // Fetch manager's communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await managerApi.getManagerCommunities();
        const data = response?.data || response?.result || response;
        const communitiesList = data?.communities || [];
        setCommunities(communitiesList);

        if (urlCommunityId) {
          const community = communitiesList.find((c: any) => c._id === urlCommunityId);
          if (community) {
            setSelectedCommunity(community);
            setCommunityId(urlCommunityId);
          } else {
            toast({
              title: "Error",
              description: "Community not found or you don't have access",
              variant: "destructive"
            });
          }
        } else if (communitiesList.length > 0) {
          navigate(`/manager/${communitiesList[0]._id}/moderation?tab=overview`, { replace: true });
        } else {
          toast({
            title: "No Communities",
            description: "You are not assigned as a manager for any communities",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('Error fetching communities:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch communities",
          variant: "destructive"
        });
      }
    };

    fetchCommunities();
  }, [urlCommunityId, navigate, toast]);

  useEffect(() => {
    if (communityId && communityId !== 'placeholder-community-id') {
      fetchDashboardData();
    }
  }, [communityId]);

  // Sync active tab with URL query params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getModerationDashboard(communityId);
      const data = response?.data || response?.result || response;
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: 'approve' | 'reject', itemType: 'user' | 'pulse' | 'listing', item: any) => {
    setActionDialog({
      open: true,
      type,
      itemType,
      item
    });
    setComment('');
  };

  const handleConfirmAction = async () => {
    if (!actionDialog.item || !actionDialog.type || !actionDialog.itemType) return;

    try {
      const { item, type, itemType } = actionDialog;
      
      if (itemType === 'user') {
        if (type === 'approve') {
          await managerApi.approveCommunityJoinRequest(communityId, item._id, comment || undefined);
          toast({
            title: "Success",
            description: "User request approved successfully",
          });
        } else {
          if (!comment.trim()) {
            toast({
              title: "Error",
              description: "Please provide a reason for rejection",
              variant: "destructive"
            });
            return;
          }
          await managerApi.rejectCommunityJoinRequest(communityId, item._id, comment);
          toast({
            title: "Success",
            description: "User request rejected successfully",
          });
        }
      } else if (itemType === 'pulse') {
        if (type === 'approve') {
          await managerApi.approveCommunityPost(communityId, item._id, comment || undefined);
          toast({
            title: "Success",
            description: "Pulse approved successfully",
          });
        } else {
          await managerApi.rejectCommunityPost(communityId, item._id, comment || undefined);
          toast({
            title: "Success",
            description: "Pulse rejected successfully",
          });
        }
      } else if (itemType === 'listing') {
        if (type === 'approve') {
          await managerApi.approveMarketplaceListing(communityId, item._id, comment || undefined);
          toast({
            title: "Success",
            description: "Listing approved successfully",
          });
        } else {
          if (!comment.trim()) {
            toast({
              title: "Error",
              description: "Please provide a reason for rejection",
              variant: "destructive"
            });
            return;
          }
          await managerApi.rejectMarketplaceListing(communityId, item._id, comment);
          toast({
            title: "Success",
            description: "Listing rejected successfully",
          });
        }
      }

      setActionDialog({ open: false, type: null, itemType: null, item: null });
      setComment('');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform action",
        variant: "destructive"
      });
    }
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCommunityId = e.target.value;
    if (newCommunityId) {
      navigate(`/manager/${newCommunityId}/moderation`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  if (communities.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Communities</h3>
          <p className="mt-2 text-sm text-gray-500">
            You are not assigned as a manager for any communities.
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    pendingUsers: 0,
    pendingPulses: 0,
    pendingListings: 0,
    totalPending: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCommunity 
              ? `Managing: ${selectedCommunity.name}`
              : "Review and moderate community content"}
          </p>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          {communities.length > 1 && (
            <select
              value={communityId}
              onChange={handleCommunityChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">Select Community</option>
              {communities.map((comm: any) => (
                <option key={comm._id} value={comm._id}>
                  {comm.name}
                </option>
              ))}
            </select>
          )}
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : stats.pendingUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Pulses</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : stats.pendingPulses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Listings</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : stats.pendingListings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : stats.totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on active tab from navbar */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Pending Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Users */}
              {dashboardData?.pendingItems?.users?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Pending User Requests ({dashboardData.pendingItems.users.length})
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.pendingItems.users.map((user: any) => (
                      <Card key={user._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{user.userId?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{user.userId?.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Requested: {formatDateToDDMMYYYY(user.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAction('approve', 'user', user)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'user', user)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Pulses */}
              {dashboardData?.pendingItems?.pulses?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Pending Pulses ({dashboardData.pendingItems.pulses.length})
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.pendingItems.pulses.map((pulse: any) => (
                      <Card key={pulse._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{pulse.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{pulse.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              By {pulse.userId?.name} • {formatDateToDDMMYYYY(pulse.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAction('approve', 'pulse', pulse)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'pulse', pulse)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Listings */}
              {dashboardData?.pendingItems?.listings?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
                    Pending Marketplace Listings ({dashboardData.pendingItems.listings.length})
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.pendingItems.listings.map((listing: any) => (
                      <Card key={listing._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm font-semibold text-green-600">
                                <DollarSign className="h-4 w-4 inline mr-1" />
                                {listing.price}
                              </p>
                              <p className="text-xs text-gray-400">
                                By {listing.userId?.name} • {formatDateToDDMMYYYY(listing.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAction('approve', 'listing', listing)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'listing', listing)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(!dashboardData?.pendingItems?.users?.length && 
                !dashboardData?.pendingItems?.pulses?.length && 
                !dashboardData?.pendingItems?.listings?.length) && (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no pending items to review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending User Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : dashboardData?.pendingItems?.users?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.pendingItems.users.map((user: any) => (
                    <Card key={user._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{user.userId?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{user.userId?.email}</p>
                          {user.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{user.message}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Requested: {formatDateToDDMMYYYY(user.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAction('approve', 'user', user)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'user', user)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All user join requests have been processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'pulses' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Pulses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : dashboardData?.pendingItems?.pulses?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.pendingItems.pulses.map((pulse: any) => (
                    <Card key={pulse._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{pulse.title}</p>
                          <p className="text-sm text-gray-600 mt-2">{pulse.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-xs text-gray-400">
                              By {pulse.userId?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDateToDDMMYYYY(pulse.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" onClick={() => handleAction('approve', 'pulse', pulse)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'pulse', pulse)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending pulses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All pulses have been reviewed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Marketplace Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : dashboardData?.pendingItems?.listings?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.pendingItems.listings.map((listing: any) => (
                    <Card key={listing._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{listing.title}</p>
                          <p className="text-sm text-gray-600 mt-2">{listing.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-sm font-semibold text-green-600">
                              <DollarSign className="h-4 w-4 inline mr-1" />
                              {listing.price}
                            </p>
                            <p className="text-xs text-gray-400">
                              By {listing.userId?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDateToDDMMYYYY(listing.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" onClick={() => handleAction('approve', 'listing', listing)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction('reject', 'listing', listing)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending listings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All marketplace listings have been reviewed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'} {actionDialog.itemType}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve' 
                ? 'Add an optional comment for the user.'
                : 'Please provide a reason for rejection (required).'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={actionDialog.type === 'approve' 
                ? 'Optional comment...' 
                : 'Rejection reason (required)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setActionDialog({ open: false, type: null, itemType: null, item: null });
              setComment('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              variant={actionDialog.type === 'reject' ? 'destructive' : 'default'}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationDashboard;

