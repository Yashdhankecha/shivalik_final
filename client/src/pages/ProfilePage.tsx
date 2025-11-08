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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-emerald-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2 text-emerald-100 hover:text-emerald-300 hover:bg-emerald-900/30">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-emerald-100">My Profile</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6 overflow-hidden bg-gray-800 border-emerald-900/30">
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-green-700"></div>
          <CardContent className="p-6 -mt-16">
            <div className="flex items-end gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-gray-800 shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-green-800 text-white text-4xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 shadow-lg">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex-1 mt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-emerald-100">{profileData.name || 'User'}</h2>
                    <p className="text-gray-400">{profileData.email}</p>
                  </div>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }} className="gap-2 border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader>
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
                <User className="w-5 h-5 text-emerald-500" />
                Personal Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!editing}
                    className={!editing ? 'border-0 bg-transparent text-emerald-100' : 'bg-gray-900 border-gray-700 text-emerald-100'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!editing}
                    className={!editing ? 'border-0 bg-transparent text-emerald-100' : 'bg-gray-900 border-gray-700 text-emerald-100'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!editing}
                    className={!editing ? 'border-0 bg-transparent text-emerald-100' : 'bg-gray-900 border-gray-700 text-emerald-100'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader>
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Address Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Street Address</label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter your street address"
                  className={!editing ? 'border-0 bg-transparent text-emerald-100 placeholder:text-gray-600' : 'bg-gray-900 border-gray-700 text-emerald-100 placeholder:text-gray-500'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    disabled={!editing}
                    placeholder="City"
                    className={!editing ? 'border-0 bg-transparent text-emerald-100 placeholder:text-gray-600' : 'bg-gray-900 border-gray-700 text-emerald-100 placeholder:text-gray-500'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                  <Input
                    value={profileData.state}
                    onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    disabled={!editing}
                    placeholder="State"
                    className={!editing ? 'border-0 bg-transparent text-emerald-100 placeholder:text-gray-600' : 'bg-gray-900 border-gray-700 text-emerald-100 placeholder:text-gray-500'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">ZIP Code</label>
                <Input
                  value={profileData.zipCode}
                  onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                  disabled={!editing}
                  placeholder="ZIP Code"
                  className={!editing ? 'border-0 bg-transparent text-emerald-100 placeholder:text-gray-600' : 'bg-gray-900 border-gray-700 text-emerald-100 placeholder:text-gray-500'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="md:col-span-2 bg-gray-800 border-emerald-900/30">
            <CardHeader>
              <h3 className="font-bold text-lg text-emerald-100">About Me</h3>
            </CardHeader>
            <CardContent>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!editing}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none ${
                  !editing ? 'border-0 bg-transparent text-emerald-100 placeholder:text-gray-600' : 'bg-gray-900 border-gray-700 text-emerald-100 placeholder:text-gray-500'
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
