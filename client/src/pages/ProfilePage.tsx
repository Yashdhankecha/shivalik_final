import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showMessage } from '../utils/Constant';
import apiClient from '../apis/apiService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Building, Calendar,
  Edit2, Save, X, Upload, Camera
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // In production: fetch from API
      // const response = await apiClient.get('/user/profile');
      // setProfileData(response.data);
      
      // For now, use data from auth context
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        bio: ''
      });
    } catch (error: any) {
      showMessage(error.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In production: save to API
      // await apiClient.put('/user/profile', profileData);
      
      updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });
      
      showMessage('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (error: any) {
      showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Responsive */}
      <div className="bg-white backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-1 sm:gap-2 text-gray-700 hover:text-black hover:bg-gray-100 px-2 py-1 sm:px-4 sm:py-2">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-black">My Profile</h1>
            <div className="w-20 sm:w-32"></div>
          </div>
        </div>
      </div>

      {/* Profile Content - Responsive */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header Card - Responsive */}
        <Card className="mb-4 sm:mb-6 overflow-hidden bg-white border-gray-200">
          <div className="h-24 sm:h-32 bg-gradient-to-r from-gray-100 to-gray-200"></div>
          <CardContent className="p-4 sm:p-6 -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white text-2xl sm:text-4xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 shadow-lg">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
              <div className="flex-1 mt-4 sm:mt-8 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold text-black">{profileData.name || 'User'}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{profileData.email}</p>
                  </div>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} className="gap-1 sm:gap-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                      <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Edit Profile</span>
                      <span className="xs:hidden">Edit</span>
                    </Button>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }} className="gap-1 sm:gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Cancel</span>
                        <span className="xs:hidden">X</span>
                      </Button>
                      <Button onClick={handleSave} className="gap-1 sm:gap-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Save</span>
                        <span className="xs:hidden">✓</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3 sm:pb-4">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1 sm:gap-2 text-black">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                Personal Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!editing}
                    className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!editing}
                    className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!editing}
                    className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3 sm:pb-4">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1 sm:gap-2 text-black">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                Address Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Street Address</label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter your street address"
                  className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black placeholder:text-gray-600' : 'bg-white border-gray-300 text-black placeholder:text-gray-500'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City</label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    disabled={!editing}
                    placeholder="City"
                    className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black placeholder:text-gray-600' : 'bg-white border-gray-300 text-black placeholder:text-gray-500'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">State</label>
                  <Input
                    value={profileData.state}
                    onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    disabled={!editing}
                    placeholder="State"
                    className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black placeholder:text-gray-600' : 'bg-white border-gray-300 text-black placeholder:text-gray-500'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">ZIP Code</label>
                <Input
                  value={profileData.zipCode}
                  onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                  disabled={!editing}
                  placeholder="ZIP Code"
                  className={`text-xs sm:text-sm ${!editing ? 'border-0 bg-transparent text-black placeholder:text-gray-600' : 'bg-white border-gray-300 text-black placeholder:text-gray-500'}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="md:col-span-2 bg-white border-gray-200">
            <CardHeader className="pb-3 sm:pb-4">
              <h3 className="font-bold text-base sm:text-lg text-black">About Me</h3>
            </CardHeader>
            <CardContent>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!editing}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none resize-none ${
                  !editing ? 'border-0 bg-transparent text-black placeholder:text-gray-600' : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                }`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;