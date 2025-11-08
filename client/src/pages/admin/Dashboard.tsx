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
    { title: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Communities', value: '45', change: '+5%', icon: Building2, color: 'from-purple-500 to-pink-500' },
    { title: 'Active Events', value: '23', change: '+8%', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { title: 'Reports', value: '12', change: '-3%', icon: FileText, color: 'from-orange-500 to-red-500' }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-100 mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-emerald-700/50 bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={`${stat.change.startsWith('+') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-emerald-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-400">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="lg:col-span-2 bg-gray-800 border-emerald-900/30">
          <CardHeader className="border-b border-emerald-900/30">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
                <Users className="w-5 h-5 text-emerald-500" />
                Recent Users
              </h3>
              <Button variant="outline" size="sm" className="gap-2 border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-emerald-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={`bg-gradient-to-br ${
                              index % 3 === 0 ? 'from-blue-500 to-cyan-500' :
                              index % 3 === 1 ? 'from-purple-500 to-pink-500' :
                              'from-green-500 to-emerald-500'
                            } text-white font-semibold`}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-emerald-100">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-emerald-900 text-emerald-300">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={user.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardHeader className="border-b border-emerald-900/30">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <Activity className="w-5 h-5 text-emerald-500" />
              Recent Activities
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-emerald-900/20 last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-900/50' :
                    activity.type === 'community' ? 'bg-purple-900/50' :
                    activity.type === 'event' ? 'bg-green-900/50' :
                    'bg-orange-900/50'
                  }`}>
                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-400" />}
                    {activity.type === 'community' && <Building2 className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'event' && <Calendar className="w-5 h-5 text-green-400" />}
                    {activity.type === 'report' && <FileText className="w-5 h-5 text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-100">{activity.action}</p>
                    <p className="text-xs text-gray-400">by {activity.user}</p>
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
        <Card className="bg-gradient-to-br from-blue-700 to-cyan-800 text-white border border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">78%</h3>
            <p className="text-white/80 text-sm">Platform Engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-700 to-pink-800 text-white border border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">342</h3>
            <p className="text-white/80 text-sm">Active Discussions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-700 to-emerald-800 text-white border border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-1">23</h3>
            <p className="text-white/80 text-sm">Upcoming Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;