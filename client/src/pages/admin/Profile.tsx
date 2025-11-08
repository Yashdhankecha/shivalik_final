import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Save, Lock, Camera } from 'lucide-react';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock admin data
  const adminData = {
    name: 'Admin User',
    email: 'admin@shivalikgroup.com',
    phone: '+91 9876543210',
    address: 'Shivalik Group, Mumbai, Maharashtra',
    joinDate: '2023-01-15',
    role: 'Super Administrator',
    lastLogin: '2023-12-08 14:30:22',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-100 mb-2">Admin Profile</h1>
            <p className="text-gray-400">Manage your profile information and account settings</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-indigo-100">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl font-bold">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full p-2 bg-white shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-emerald-100 mt-4">{adminData.name}</h2>
                <p className="text-emerald-500 font-medium">{adminData.role}</p>
                
                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{adminData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{adminData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{adminData.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Joined: {adminData.joinDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader className="border-b border-gray-200 pb-3">
              <h3 className="font-bold text-lg">Account Security</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                  <Lock className="w-4 h-4 mr-2 text-emerald-400" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                  <User className="w-4 h-4 mr-2 text-emerald-400" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border-red-700">
                  <Lock className="w-4 h-4 mr-2" />
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
                <User className="w-5 h-5 text-emerald-500" />
                Profile Information
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <Input defaultValue={adminData.name} className="bg-gray-900 border-emerald-700 text-emerald-100" />
                  ) : (
                    <p className="text-emerald-100">{adminData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Email Address</label>
                  {isEditing ? (
                    <Input type="email" defaultValue={adminData.email} className="bg-gray-900 border-emerald-700 text-emerald-100" />
                  ) : (
                    <p className="text-emerald-100">{adminData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Phone Number</label>
                  {isEditing ? (
                    <Input type="tel" defaultValue={adminData.phone} className="bg-gray-900 border-emerald-700 text-emerald-100" />
                  ) : (
                    <p className="text-emerald-100">{adminData.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Role</label>
                  <p className="text-emerald-100">{adminData.role}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Address</label>
                  {isEditing ? (
                    <Input defaultValue={adminData.address} className="bg-gray-900 border-emerald-700 text-emerald-100" />
                  ) : (
                    <p className="text-emerald-100">{adminData.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Join Date</label>
                  <p className="text-emerald-100">{adminData.joinDate}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">Last Login</label>
                  <p className="text-emerald-100">{adminData.lastLogin}</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end mt-6">
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Log */}
          <Card className="mt-6 bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30">
              <h3 className="font-bold text-lg text-emerald-100">Recent Activity</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                <div className="p-4">
                  <p className="font-medium text-emerald-100">Logged in to admin panel</p>
                  <p className="text-sm text-gray-400">IP: 192.168.1.100 • Mumbai, India</p>
                  <p className="text-xs text-gray-500 mt-1">Today, 14:30</p>
                </div>
                <div className="p-4">
                  <p className="font-medium text-emerald-100">Updated community settings</p>
                  <p className="text-sm text-gray-400">Modified Green Valley Apartments configuration</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday, 16:45</p>
                </div>
                <div className="p-4">
                  <p className="font-medium text-emerald-100">Generated monthly report</p>
                  <p className="text-sm text-gray-400">Created November financial summary</p>
                  <p className="text-xs text-gray-500 mt-1">Dec 5, 2023, 10:15</p>
                </div>
                <div className="p-4">
                  <p className="font-medium text-emerald-100">Added new user</p>
                  <p className="text-sm text-gray-400">Registered John Doe as Resident</p>
                  <p className="text-xs text-gray-500 mt-1">Dec 4, 2023, 09:30</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;