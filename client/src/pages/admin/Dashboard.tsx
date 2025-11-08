import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText, Settings,
  Bell, Search, LogOut, ChevronRight, TrendingUp, UserPlus,
  ShieldCheck, Activity, BarChart3, Home, MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12%', icon: Users },
    { title: 'Communities', value: '45', change: '+5%', icon: Building2 },
    { title: 'Active Events', value: '23', change: '+8%', icon: Calendar },
    { title: 'Reports', value: '12', change: '-3%', icon: FileText }
  ];

  const recentUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'Resident', status: 'Active', joinDate: '2 days ago' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active', joinDate: '3 days ago' },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'Resident', status: 'Pending', joinDate: '5 days ago' },
    { name: 'Sarah Williams', email: 'sarah@example.com', role: 'Resident', status: 'Active', joinDate: '1 week ago' }
  ];

  const recentActivities = [
    { action: 'New user registration', user: 'Alice Brown', time: '5 minutes ago', type: 'user' },
    { action: 'Community created', user: 'Admin', time: '1 hour ago', type: 'community' },
    { action: 'Event published', user: 'Mike Chen', time: '2 hours ago', type: 'event' },
    { action: 'Report submitted', user: 'Emily Rodriguez', time: '3 hours ago', type: 'report' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border border-gray-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={`${stat.change.startsWith('+') ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}`}>
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-black mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="lg:col-span-2 bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-black">
                <Users className="w-5 h-5" />
                Recent Users
              </h3>
              <Button variant="outline" size="sm" className="gap-2 border-gray-400 text-black hover:bg-gray-100">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gray-800 text-white font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-black">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-800 text-white">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={user.status === 'Active' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-800'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-black hover:text-black hover:bg-gray-100">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-white border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Activity className="w-5 h-5" />
              Recent Activities
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-800">
                    {activity.type === 'user' && <Users className="w-5 h-5 text-white" />}
                    {activity.type === 'community' && <Building2 className="w-5 h-5 text-white" />}
                    {activity.type === 'event' && <Calendar className="w-5 h-5 text-white" />}
                    {activity.type === 'report' && <FileText className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">{activity.action}</p>
                    <p className="text-xs text-gray-600">by {activity.user}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-white text-black border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">78%</h3>
            <p className="text-gray-600 text-sm">Platform Engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-white text-black border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">342</h3>
            <p className="text-gray-600 text-sm">Active Discussions</p>
          </CardContent>
        </Card>

        <Card className="bg-white text-black border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">23</h3>
            <p className="text-gray-600 text-sm">Upcoming Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;