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
          const activitiesResponse = await adminApi.getRecentActivities({ limit: 6 });
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
          setRecentActivities(activities);
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
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-1 md:mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-xs md:text-sm lg:text-base">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6">
        {formattedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-300 bg-white">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg bg-gray-800 flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <Badge className={`bg-gray-300 text-gray-800 text-xs`}>
                    {stat.change}%
                  </Badge>
                </div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-black mb-1">{stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {/* Recent Users */}
        <Card className="xl:col-span-2 bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300 p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base md:text-lg lg:text-xl flex items-center gap-2 text-black">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                Recent Users
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">User</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Role</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Joined</th>
                    <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-semibold text-black uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.length === 0 ? (
                    <tr>

                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No recent users found. Create communities and add users to see them here.

                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((user, index) => (
                    <tr key={user._id || index} className="hover:bg-gray-50 transition-colors">

                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar className="w-8 h-8 md:w-10 md:h-10">
                            <AvatarFallback className="bg-gray-800 text-white font-semibold text-xs md:text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}

                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs md:text-sm text-black">{user.name}</p>
                            <p className="text-xs text-gray-600 hidden sm:table-cell">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <Badge className="bg-gray-800 text-white text-xs md:text-sm">{user.role}</Badge>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <Badge className={`text-xs md:text-sm ${user.status === 'Active' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <Button variant="ghost" size="sm" className="text-black hover:text-black hover:bg-gray-100 p-1 md:p-2 text-xs md:text-sm">View</Button>
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
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300 p-3 md:p-4 lg:p-6">
            <h3 className="font-bold text-base md:text-lg lg:text-xl flex items-center gap-2 text-black">
              <Activity className="w-4 h-4 md:w-5 md:h-5" />
              Recent Activities
            </h3>
          </CardHeader>
          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="space-y-3 md:space-y-4">
              {recentActivities.length === 0 ? (

                <div className="text-center py-4 md:py-8 text-gray-500">
                  No recent activities found
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-2 md:gap-3 pb-3 md:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-800">
                    {activity.type === 'user' && <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                    {activity.type === 'community' && <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                    {activity.type === 'event' && <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-black">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user}{activity.community ? ` in ${activity.community}` : ''}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>

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