import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Users, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Resident', status: 'Active', joinDate: '2023-05-15', community: 'Green Valley' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager', status: 'Active', joinDate: '2023-04-22', community: 'Sunset Hills' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Resident', status: 'Pending', joinDate: '2023-06-10', community: 'Oakwood Park' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Admin', status: 'Active', joinDate: '2023-03-18', community: 'All Communities' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'Resident', status: 'Inactive', joinDate: '2023-01-30', community: 'Pine Grove' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-900 text-green-300">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-900 text-yellow-300">Pending</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-900 text-gray-300">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge className="bg-red-900 text-red-300">{role}</Badge>;
      case 'Manager':
        return <Badge className="bg-blue-900 text-blue-300">{role}</Badge>;
      case 'Resident':
        return <Badge className="bg-purple-900 text-purple-300">{role}</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-100 mb-2">Users Management</h1>
            <p className="text-gray-400">Manage all users, their roles, and access permissions</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users by name, email, or community..."
              className="pl-10 bg-gray-900 border-emerald-700 text-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Roles</Button>
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Status</Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800 border-emerald-900/30">
        <CardHeader className="border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <Users className="w-5 h-5 text-emerald-500" />
              All Users
            </h3>
            <p className="text-sm text-gray-400">Showing {users.length} users</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-emerald-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-700 text-white font-semibold">
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
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.community}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-emerald-100">1,234</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-emerald-100">1,102</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Users</p>
                <p className="text-2xl font-bold text-emerald-100">89</p>
              </div>
              <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">43</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersManagement;