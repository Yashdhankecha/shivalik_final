import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Users, Building2, Calendar, UserPlus,
  Activity, TrendingUp, BarChart3, MessageSquare
} from 'lucide-react';
import { adminApi } from '../../apis/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    activeEvents: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await adminApi.getDashboardStats();
        console.log('Stats response:', statsResponse);
        
        // Handle different response formats
        let statsData;
        if (statsResponse?.data?.result) {
          statsData = statsResponse.data.result;
        } else if (statsResponse?.result) {
          statsData = statsResponse.result;
        } else if (statsResponse?.data) {
          statsData = statsResponse.data;
        } else {
          statsData = statsResponse;
        }
        
        setStats({
          totalUsers: statsData?.totalUsers || 0,
          totalCommunities: statsData?.totalCommunities || 0,
          activeEvents: statsData?.activeEvents || 0
        });

        // Fetch recent users
        try {
          const usersResponse = await adminApi.getAllUsers({ limit: 5, page: 1 });
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
          
          // Format users for display and filter out CM user
          const formattedUsers = users
            .filter((user: any) => {
              // Filter out Community Manager with email manager@community.com
              const email = (user.email || '').toLowerCase();
              const name = (user.name || '').toLowerCase();
              return !(email === 'manager@community.com' || name.includes('community manager') || name === 'cm');
            })
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

        // Fetch recent activities
        try {
          const activitiesResponse = await adminApi.getRecentActivities({ limit: 3 });
          console.log('Activities response:', activitiesResponse);
          
          // Handle different response formats
          let activitiesData;
          if (activitiesResponse?.data?.result) {
            activitiesData = activitiesResponse.data.result;
          } else if (activitiesResponse?.result) {
            activitiesData = activitiesResponse.result;
          } else if (activitiesResponse?.data) {
            activitiesData = activitiesResponse.data;
          } else {
            activitiesData = activitiesResponse;
          }
          
          const activities = Array.isArray(activitiesData) 
            ? activitiesData 
            : (activitiesData?.activities || []);
          // Limit to 3 activities for display
          setRecentActivities(activities.slice(0, 3));
        } catch (error) {
          console.error('Error fetching recent activities:', error);
          setRecentActivities([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format stats for display with real change percentages
  const formattedStats = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      change: '+0', // Default value since backend doesn't provide changes
      icon: Users 
    },
    { 
      title: 'Communities', 
      value: stats.totalCommunities.toLocaleString(), 
      change: '+0', // Default value since backend doesn't provide changes
      icon: Building2 
    },
    { 
      title: 'Active Events', 
      value: stats.activeEvents.toLocaleString(), 
      change: '+0', // Default value since backend doesn't provide changes
      icon: Calendar 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-xs md:text-sm lg:text-base">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
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
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                        No recent users found. Create communities and add users to see them here.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((user, index) => (
                    <tr key={user._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                            <AvatarFallback className="bg-gray-900 text-white font-semibold text-xs md:text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
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
                  No recent activities found
                </div>
              ) : (
                recentActivities.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex gap-2.5 md:gap-3 pb-2.5 md:pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-900">
                    {activity.type === 'user' && <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                    {activity.type === 'community' && <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
                    {activity.type === 'event' && <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />}
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
    </div>
  );
};

export default AdminDashboard;