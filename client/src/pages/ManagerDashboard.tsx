import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, Calendar, FileText, MessageSquare, 
  CheckCircle, Clock, XCircle, UserPlus
} from 'lucide-react';
import { managerApi } from '../apis/manager';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!communityId) {
      setError('Community ID is required');
      setLoading(false);
      return;
    }
    
    fetchDashboardStats();
  }, [communityId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch stats from multiple API endpoints since there's no single getDashboardStats method
      const [membersStats, eventsStats, requestsStats] = await Promise.all([
        managerApi.getCommunityMemberStats(communityId!),
        managerApi.getCommunityEventStats(communityId!),
        managerApi.getCommunityJoinRequestStats(communityId!)
      ]);

      // Combine stats from all endpoints
      const response = {
        data: {
          communityName: 'Community', // This would need to be fetched separately
          totalMembers: membersStats?.data?.total || membersStats?.total || 0,
          pendingRequests: requestsStats?.data?.pending || requestsStats?.pending || 0,
          activeEvents: eventsStats?.data?.total || eventsStats?.total || 0,
          totalReports: 0 // This would need to be fetched from another endpoint
        }
      };
      
      // Handle the combined response structure we created
      const statsData = response.data;
      
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Main Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {stats?.communityName || 'Manager Dashboard'}
            </h1>
            <p className="text-gray-600">
              Manage your community: {user?.name}
            </p>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => navigate(`/manager/${communityId}/join-requests`)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Manage Join Requests
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Community Members</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-black">{stats?.totalMembers || 0}</p>
                <p className="text-sm text-gray-600">Active members</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Pending Requests</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-black">{stats?.pendingRequests || 0}</p>
                <p className="text-sm text-gray-600">Join requests</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Active Events</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-black">{stats?.activeEvents || 0}</p>
                <p className="text-sm text-gray-600">Upcoming events</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Reports</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-black">{stats?.totalReports || 0}</p>
                <p className="text-sm text-gray-600">Community reports</p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Member Management</h3>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Manage community members, approve requests, and handle user issues.
            </p>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => navigate(`/manager/${communityId}/members`)}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Members
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Event Management</h3>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Create and manage community events, activities, and gatherings.
            </p>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => navigate(`/manager/${communityId}/events`)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Manage Events
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg text-black">Report Management</h3>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              View and respond to community reports and issues.
            </p>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={() => navigate(`/manager/${communityId}/reports`)}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;