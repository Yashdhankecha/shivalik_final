import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, Calendar, FileText, TrendingUp, 
  CheckCircle, Clock, XCircle, AlertCircle,
  ChevronRight, BarChart3, Activity, RefreshCw, UserPlus
} from 'lucide-react';
import { managerApi } from '../../apis/manager';
import { useToast } from '../../hooks/use-toast';

const ManagerDashboard = () => {
  const { communityId: urlCommunityId } = useParams<{ communityId?: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingRequests: 0,
    totalEvents: 0,
    recentMembers: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [communityId, setCommunityId] = useState<string>('');
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const { toast } = useToast();

  // Fetch manager's communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await managerApi.getManagerCommunities();
        const data = response?.data || response?.result || response;
        const communitiesList = data?.communities || [];
        setCommunities(communitiesList);

        // If URL has communityId, use it; otherwise use first community
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
          // Redirect to first community's dashboard
          navigate(`/manager/${communitiesList[0]._id}/dashboard`, { replace: true });
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
      fetchDashboardStats();
    }
  }, [communityId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data
      const [membersResponse, eventsResponse, activitiesResponse] = await Promise.all([
        managerApi.getCommunityMemberStats(communityId),
        managerApi.getCommunityEventStats(communityId),
        managerApi.getCommunityJoinRequestStats(communityId) // Using join request stats as a proxy for activities
      ]);

      // Handle members stats
      let membersData = membersResponse;
      if (membersResponse?.data) {
        membersData = membersResponse.data;
      } else if (membersResponse?.result) {
        membersData = membersResponse.result;
      }

      // Handle events stats
      let eventsData = eventsResponse;
      if (eventsResponse?.data) {
        eventsData = eventsResponse.data;
      } else if (eventsResponse?.result) {
        eventsData = eventsResponse.result;
      }

      // Handle activities (using join requests as proxy)
      let activitiesData = activitiesResponse;
      if (activitiesResponse?.data) {
        activitiesData = activitiesResponse.data;
      } else if (activitiesResponse?.result) {
        activitiesData = activitiesResponse.result;
      }

      setStats({
        totalMembers: membersData.total || 0,
        activeMembers: membersData.active || 0,
        pendingRequests: activitiesData.pending || 0,
        totalEvents: eventsData.total || 0,
        recentMembers: Array.isArray(membersData.recent) ? membersData.recent : [],
        recentActivities: Array.isArray(activitiesData.activities) ? activitiesData.activities : []
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCommunityId = e.target.value;
    if (newCommunityId) {
      navigate(`/manager/${newCommunityId}/dashboard`);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCommunity 
              ? `Managing: ${selectedCommunity.name}`
              : "Welcome back! Here's what's happening with your community today."}
          </p>
        </div>
        {communities.length > 1 && (
          <div className="mt-4 md:mt-0">
            <select
              value={communityId}
              onChange={handleCommunityChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Community</option>
              {communities.map((comm: any) => (
                <option key={comm._id} value={comm._id}>
                  {comm.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={fetchDashboardStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-2xl font-bold">{loading ? '--' : stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Members</p>
                <p className="text-2xl font-bold">{loading ? '--' : stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold">{loading ? '--' : stats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold">{loading ? '--' : stats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : stats.recentMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent members</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No new members have joined your community yet.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {stats.recentMembers.map((member: any) => (
                    <li key={member._id} className="py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-800 font-medium">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            {getStatusBadge(member.status)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {member.email}
                          </p>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : stats.recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activities</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No activities have been recorded in your community yet.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {stats.recentActivities.map((activity: any) => (
                    <li key={activity._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {activity.type === 'join_request' ? (
                            <UserPlus className="h-5 w-5 text-blue-500" />
                          ) : activity.type === 'event_created' ? (
                            <Calendar className="h-5 w-5 text-green-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-purple-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;