import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Settings as SettingsIcon, Save, Mail, Bell, Shield, Palette, Globe, User, Building2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-100 mb-2">System Settings</h1>
        <p className="text-gray-400">Manage your system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={`flex items-center gap-2 ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800' : 'border-emerald-700 text-emerald-300 hover:bg-emerald-900/30'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30">
              <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
                <SettingsIcon className="w-5 h-5 text-emerald-500" />
                {tabs.find(tab => tab.id === activeTab)?.label} Settings
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">System Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">System Name</label>
                        <Input defaultValue="Shivalik Community Management System" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Version</label>
                        <Input defaultValue="v1.2.5" disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Default Language</label>
                        <select className="w-full px-3 py-2 border border-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-900 text-emerald-100">
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Marathi</option>
                          <option>Gujarati</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Timezone</label>
                        <select className="w-full px-3 py-2 border border-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-900 text-emerald-100">
                          <option>UTC+5:30 (India Standard Time)</option>
                          <option>UTC+0:00 (GMT)</option>
                          <option>UTC-5:00 (EST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Support Email</label>
                        <Input type="email" defaultValue="support@shivalikgroup.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Admin Email</label>
                        <Input type="email" defaultValue="admin@shivalikgroup.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Phone Number</label>
                        <Input type="tel" defaultValue="+91 9876543210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Address</label>
                        <Input defaultValue="Shivalik Group, Mumbai, Maharashtra" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-100">New User Registration</p>
                          <p className="text-sm text-gray-400">Send email when a new user registers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-100">Community Events</p>
                          <p className="text-sm text-gray-400">Send email for upcoming community events</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-100">Maintenance Alerts</p>
                          <p className="text-sm text-gray-400">Send email for maintenance notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Push Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-100">App Notifications</p>
                          <p className="text-sm text-gray-400">Enable push notifications in the mobile app</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Authentication</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Session Timeout (minutes)</label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Password Policy</label>
                        <select className="w-full px-3 py-2 border border-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-900 text-emerald-100">
                          <option>Standard (8+ characters)</option>
                          <option>Strong (12+ characters, special chars)</option>
                          <option>Very Strong (16+ characters, mixed case, numbers, special chars)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-100">Require 2FA for Admins</p>
                        <p className="text-sm text-gray-600">Mandatory two-factor authentication for admin users</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Theme Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="cursor-pointer border-2 border-indigo-500">
                        <CardContent className="p-4">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-24 rounded-lg mb-2"></div>
                          <p className="font-medium text-center">Default Theme</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer">
                        <CardContent className="p-4">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 h-24 rounded-lg mb-2"></div>
                          <p className="font-medium text-center">Ocean Theme</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer">
                        <CardContent className="p-4">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 h-24 rounded-lg mb-2"></div>
                          <p className="font-medium text-center">Nature Theme</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-emerald-100 mb-4">Customization</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
                          <Input defaultValue="#6366f1" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2">Logo</label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <Button variant="outline">Upload New Logo</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30">
              <h3 className="font-bold text-lg text-emerald-100">System Status</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Database</span>
                  <Badge className="bg-green-900 text-green-300">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">API Server</span>
                  <Badge className="bg-green-900 text-green-300">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Email Service</span>
                  <Badge className="bg-green-900 text-green-300">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Storage</span>
                  <Badge className="bg-yellow-900 text-yellow-300">85%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30">
              <h3 className="font-bold text-lg text-emerald-100">Recent Activity</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-emerald-100">Settings updated</p>
                  <p className="text-gray-400">General settings modified by Admin</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-emerald-100">New user registered</p>
                  <p className="text-gray-400">John Doe joined the platform</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-emerald-100">Report generated</p>
                  <p className="text-gray-400">Monthly financial report created</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;