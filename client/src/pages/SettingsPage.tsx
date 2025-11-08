import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showMessage } from '../utils/Constant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import {
  ArrowLeft, Lock, Bell, Globe, Shield, Eye, EyeOff,
  Smartphone, Mail, Check, AlertCircle
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    communityUpdates: true,
    eventReminders: true,
    marketplaceAlerts: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage('Please fill all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      // In production: call API to change password
      // await apiClient.put('/user/change-password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      
      showMessage('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showMessage(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      // In production: save to API
      // await apiClient.put('/user/notification-settings', notifications);
      
      showMessage('Notification settings saved!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setLoading(true);
      // In production: save to API
      // await apiClient.put('/user/privacy-settings', privacy);
      
      showMessage('Privacy settings saved!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2 text-gray-700 hover:text-black hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-black">Settings</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Security Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <h3 className="font-bold text-lg flex items-center gap-2 text-black">
                <Lock className="w-5 h-5 text-gray-600" />
                Security & Password
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="pl-10 pr-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="pl-10 pr-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="pl-10 pr-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2 text-black">
                  <Bell className="w-5 h-5 text-gray-600" />
                  Notification Preferences
                </h3>
                <Button size="sm" onClick={handleSaveNotifications} disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-gray-200">
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-100">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-100">Push Notifications</p>
                    <p className="text-xs text-gray-500">Get instant alerts on your device</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-100">Community Updates</p>
                    <p className="text-xs text-gray-500">New posts and announcements</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.communityUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, communityUpdates: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-100">Event Reminders</p>
                    <p className="text-xs text-gray-500">Reminders for upcoming events</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.eventReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, eventReminders: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm text-gray-100">Marketplace Alerts</p>
                    <p className="text-xs text-gray-500">New listings and offers</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketplaceAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, marketplaceAlerts: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2 text-black">
                  <Shield className="w-5 h-5 text-gray-600" />
                  Privacy Settings
                </h3>
                <Button size="sm" onClick={handleSavePrivacy} disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-gray-200">
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-medium text-sm text-gray-100">Profile Visibility</p>
                  <p className="text-xs text-gray-500">Make your profile visible to other members</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy({...privacy, profileVisible: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-medium text-sm text-gray-100">Show Email Address</p>
                  <p className="text-xs text-gray-500">Display email on your profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showEmail: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-medium text-sm text-gray-100">Show Phone Number</p>
                  <p className="text-xs text-gray-500">Display phone number on your profile</p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showPhone: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-medium text-sm text-gray-100">Allow Direct Messages</p>
                  <p className="text-xs text-gray-500">Let other members message you</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <h3 className="font-bold text-lg text-red-600">Danger Zone</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-sm text-red-700">Delete Account</p>
                  <p className="text-xs text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-200">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
