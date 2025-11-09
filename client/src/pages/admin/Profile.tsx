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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2">Admin Profile</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your profile information and account settings</p>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card - Responsive */}
        <div className="xl:col-span-1">
          <Card className="bg-white border border-gray-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-gray-300">
                    <AvatarFallback className="bg-gray-800 text-white text-xl sm:text-2xl font-bold">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full p-1.5 sm:p-2 bg-white shadow-md border border-gray-400"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold text-black mt-3 sm:mt-4">{adminData.name}</h2>
                <p className="text-gray-700 font-medium text-sm sm:text-base">{adminData.role}</p>
                
                <div className="mt-4 sm:mt-6 w-full space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{adminData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{adminData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{adminData.address}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Joined: {adminData.joinDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4 sm:mt-6 bg-white border border-gray-300">
            <CardHeader className="border-b border-gray-200 pb-2 sm:pb-3">
              <h3 className="font-bold text-base sm:text-lg">Account Security</h3>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <Button variant="outline" className="w-full justify-start border border-gray-400 text-black hover:bg-gray-100 text-xs sm:text-sm h-8 sm:h-10">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start border border-gray-400 text-black hover:bg-gray-100 text-xs sm:text-sm h-8 sm:h-10">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start text-black hover:bg-gray-100 border border-gray-400 text-xs sm:text-sm h-8 sm:h-10">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Details - Responsive */}
        <div className="xl:col-span-2">
          <Card className="bg-white border border-gray-300">
            <CardHeader className="border-b border-gray-300 pb-2 sm:pb-3">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1 sm:gap-2 text-black">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Profile Information
              </h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Full Name</label>
                  {isEditing ? (
                    <Input defaultValue={adminData.name} className="border border-gray-400 text-black text-xs sm:text-sm" />
                  ) : (
                    <p className="text-black text-xs sm:text-sm">{adminData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Email Address</label>
                  {isEditing ? (
                    <Input type="email" defaultValue={adminData.email} className="border border-gray-400 text-black text-xs sm:text-sm" />
                  ) : (
                    <p className="text-black text-xs sm:text-sm truncate">{adminData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Phone Number</label>
                  {isEditing ? (
                    <Input type="tel" defaultValue={adminData.phone} className="border border-gray-400 text-black text-xs sm:text-sm" />
                  ) : (
                    <p className="text-black text-xs sm:text-sm">{adminData.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Role</label>
                  <p className="text-black text-xs sm:text-sm">{adminData.role}</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Address</label>
                  {isEditing ? (
                    <Input defaultValue={adminData.address} className="border border-gray-400 text-black text-xs sm:text-sm" />
                  ) : (
                    <p className="text-black text-xs sm:text-sm truncate">{adminData.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Join Date</label>
                  <p className="text-black text-xs sm:text-sm">{adminData.joinDate}</p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Last Login</label>
                  <p className="text-black text-xs sm:text-sm">{adminData.lastLogin}</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end mt-4 sm:mt-6">
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Log - Responsive */}
          <Card className="mt-4 sm:mt-6 bg-white border border-gray-300">
            <CardHeader className="border-b border-gray-300 pb-2 sm:pb-3">
              <h3 className="font-bold text-base sm:text-lg text-black">Recent Activity</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                <div className="p-3 sm:p-4">
                  <p className="font-medium text-black text-xs sm:text-sm">Logged in to admin panel</p>
                  <p className="text-xs text-gray-600">IP: 192.168.1.100 • Mumbai, India</p>
                  <p className="text-xs text-gray-500 mt-1">Today, 14:30</p>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-medium text-black text-xs sm:text-sm">Updated community settings</p>
                  <p className="text-xs text-gray-600">Modified Green Valley Apartments configuration</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday, 16:45</p>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-medium text-black text-xs sm:text-sm">Generated monthly report</p>
                  <p className="text-xs text-gray-600">Created November financial summary</p>
                  <p className="text-xs text-gray-500 mt-1">Dec 5, 2023, 10:15</p>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-medium text-black text-xs sm:text-sm">Added new user</p>
                  <p className="text-xs text-gray-600">Registered John Doe as Resident</p>
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