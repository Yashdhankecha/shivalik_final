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
  AlertCircle, RefreshCw, Eye, MessageSquare, Calendar, DollarSign, UserPlus,
  Activity, Building2
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
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
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'User' });
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    activeEvents: 0,
    totalReports: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
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
      
      // Fetch moderation dashboard data
      const moderationResponse = await managerApi.getModerationDashboard(communityId);
      const moderationData = moderationResponse?.data || moderationResponse?.result || moderationResponse;
      setDashboardData(moderationData);

      // Fetch dashboard stats (similar to admin dashboard)
      try {
        const statsResponse = await managerApi.getDashboardStats(communityId);
        console.log('Stats response:', statsResponse);
        
        // Handle different response formats
        let statsData;
        if (statsResponse?.result) {
          statsData = statsResponse.result;
        } else if (statsResponse?.data?.result) {
          statsData = statsResponse.data.result;
        } else if (statsResponse?.data) {
          statsData = statsResponse.data;
        } else {
          statsData = statsResponse;
        }
        
        console.log('Parsed stats data:', statsData);
        
        setStats({
          totalMembers: statsData?.totalMembers || 0,
          pendingRequests: statsData?.pendingRequests || 0,
          activeEvents: statsData?.activeEvents || 0,
          totalReports: statsData?.totalReports || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }

      // Fetch recent users (similar to admin dashboard)
      try {
        const usersResponse = await managerApi.getAllUsers(communityId, { limit: 5, page: 1 });
        console.log('Users response:', usersResponse);
        
        // Handle different response formats
        let usersData;
        if (usersResponse?.data?.result) {
          usersData = usersResponse.data.result;
        } else if (usersResponse?.result) {
          usersData = usersResponse.result;
        } else if (usersResponse?.data) {
          usersData = usersResponse.data;
        } else {
          usersData = usersResponse;
        }
        
        // Handle both array and object with users property
        const users = Array.isArray(usersData) 
          ? usersData 
          : (usersData?.users || usersData?.data || []);
        
        // Format users for display
        const formattedUsers = users
          .slice(0, 5)
          .map((user: any) => ({
            name: user.name || user.username || 'Unknown User',
            email: user.email || 'No email',
            role: user.role || 'User',
            status: user.status || 'Pending',
            joinDate: user.createdAt || user.created_at || user.joinedAt
              ? new Date(user.createdAt || user.created_at || user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'N/A',
            _id: user._id || user.id || Math.random().toString()
          }));
        setRecentUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching recent users:', error);
        setRecentUsers([]);
      }

      // Fetch recent activities from moderation dashboard data
      try {
        const activities: any[] = [];
        
        // Add pending user requests as activities
        if (moderationData?.pendingItems?.users?.length > 0) {
          moderationData.pendingItems.users.slice(0, 2).forEach((user: any) => {
            activities.push({
              type: 'user',
              action: 'New join request',
              user: user.userId?.name || 'Unknown User',
              time: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'
            });
          });
        }
        
        // Add pending pulses as activities
        if (moderationData?.pendingItems?.pulses?.length > 0) {
          moderationData.pendingItems.pulses.slice(0, 1).forEach((pulse: any) => {
            activities.push({
              type: 'pulse',
              action: 'New pulse pending approval',
              user: pulse.userId?.name || 'Unknown User',
              time: pulse.createdAt ? new Date(pulse.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'
            });
          });
        }
        
        setRecentActivities(activities.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
      }
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
          await managerApi.approvePulse(communityId, item._id);
          toast({
            title: "Success",
            description: "Pulse approved successfully",
          });
        } else {
          await managerApi.rejectPulse(communityId, item._id, comment || 'No reason provided');
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

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await managerApi.addUserToCommunity(communityId, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
      
      toast({
        title: "Success",
        description: "User added to community successfully",
      });
      
      setShowAddUserDialog(false);
      setNewUser({ name: '', email: '', role: 'User' });
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to add user",
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

  // Format stats for display (combining moderation stats with dashboard stats)
  const moderationStats = dashboardData?.stats || {
    pendingUsers: 0,
    pendingPulses: 0,
    pendingListings: 0,
    totalPending: 0
  };

  // Format stats for display with real change percentages (similar to admin dashboard)
  const formattedStats = [
    { 
      title: 'Total Members', 
      value: stats.totalMembers.toLocaleString(), 
      change: '+0',
      icon: Users 
    },
    { 
      title: 'Pending Requests', 
      value: stats.pendingRequests.toLocaleString(), 
      change: '+0',
      icon: Clock 
    },
    { 
      title: 'Active Events', 
      value: stats.activeEvents.toLocaleString(), 
      change: '+0',
      icon: Calendar 
    },
    { 
      title: 'Total Reports', 
      value: stats.totalReports.toLocaleString(), 
      change: '+0',
      icon: AlertCircle 
    }
  ];

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

      {/* Stats Grid - Responsive (similar to admin dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {formattedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-900 flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <Badge className={`bg-gray-200 text-gray-800 text-xs`}>
                    {stat.change}%
                  </Badge>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{loading ? '--' : stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Moderation Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Users</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : moderationStats.pendingUsers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : moderationStats.pendingPulses}</p>
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
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : moderationStats.pendingListings}</p>
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
                <p className="text-2xl font-bold text-gray-900">{loading ? '--' : moderationStats.totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content based on active tab from navbar */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Main Content Grid - Responsive (similar to admin dashboard) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Recent Users */}
            <Card className="lg:col-span-2 bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200 p-3 md:p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base md:text-lg lg:text-xl flex items-center gap-2 text-gray-900">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                    Recent Users
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto -mx-3 md:mx-0">
                  <table className="w-full min-w-[640px] md:min-w-0">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden sm:table-cell">Role</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider hidden md:table-cell">Joined</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 md:px-4 py-6 md:py-8 text-center text-gray-500 text-sm">
                            {loading ? 'Loading users...' : 'No recent users found.'}
                          </td>
                        </tr>
                      ) : (
                        recentUsers.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-4 py-3 md:py-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                                <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs md:text-sm">
                                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-xs md:text-sm text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-600 truncate hidden sm:block">{user.email}</p>
                                <div className="sm:hidden mt-1">
                                  <Badge className="bg-gray-900 text-white text-xs mr-1">{user.role}</Badge>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 hidden sm:table-cell">
                            <Badge className="bg-gray-900 text-white text-xs">{user.role}</Badge>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4">
                            <Badge className={`text-xs ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">{user.joinDate}</td>
                          <td className="px-3 md:px-4 py-3 md:py-4">
                            <Button variant="ghost" size="sm" className="text-gray-900 hover:text-gray-900 hover:bg-gray-100 p-1.5 md:p-2 text-xs md:text-sm h-7 md:h-8">View</Button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200 p-3 md:p-4">
                <h3 className="font-bold text-base md:text-lg flex items-center gap-2 text-gray-900">
                  <Activity className="w-4 h-4 md:w-5 md:h-5" />
                  Recent Activities
                </h3>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <div className="space-y-2.5 md:space-y-3">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-4 md:py-6 text-gray-500 text-xs md:text-sm">
                      {loading ? 'Loading activities...' : 'No recent activities found'}
                    </div>
                  ) : (
                    recentActivities.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex gap-2.5 md:gap-3 pb-2.5 md:pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-900">
                        {activity.type === 'user' && <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                        {activity.type === 'pulse' && <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                        {activity.type === 'event' && <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                        {activity.type === 'listing' && <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 break-words leading-tight">{activity.action}</p>
                        <p className="text-xs text-gray-600 break-words leading-tight">{activity.user}{activity.community ? ` in ${activity.community}` : ''}</p>
                        <p className="text-xs text-gray-500 leading-tight">{activity.time}</p>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
          {/* Add User Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* User list will be added here */}
              <div className="text-center py-8 text-gray-500 text-sm">
                User list functionality - to be implemented
              </div>
            </CardContent>
          </Card>

          {/* Pending User Approvals */}
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

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Community</DialogTitle>
            <DialogDescription>
              Add a new user to this community. The user will be automatically activated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email *</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter user email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              >
                <option value="User">User</option>
                <option value="Resident">Resident</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddUserDialog(false);
              setNewUser({ name: '', email: '', role: 'User' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationDashboard;

