import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communityApi } from '../../../apis/community';
import { showMessage } from '../../../utils/Constant';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Plus, Search, Wrench, Lightbulb, Shield, Sparkles, Hammer, Paintbrush, Flower2, Settings, Phone, Mail, Clock, MapPin, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface DirectoryEntry {
  _id: string;
  name: string;
  serviceType: string;
  contactNumber: string;
  alternateContact?: string;
  email?: string;
  availabilityHours: string;
  address?: string;
  verified: boolean;
  rating?: number;
}

const serviceIcons: Record<string, any> = {
  plumber: Wrench,
  electrician: Lightbulb,
  security: Shield,
  housekeeping: Sparkles,
  carpenter: Hammer,
  painter: Paintbrush,
  gardener: Flower2,
  mechanic: Settings,
  other: Settings
};

const serviceColors: Record<string, string> = {
  plumber: 'bg-gray-100 text-gray-700 border-gray-200',
  electrician: 'bg-gray-100 text-gray-700 border-gray-200',
  security: 'bg-gray-100 text-gray-700 border-gray-200',
  housekeeping: 'bg-gray-100 text-gray-700 border-gray-200',
  carpenter: 'bg-gray-100 text-gray-700 border-gray-200',
  painter: 'bg-gray-100 text-gray-700 border-gray-200',
  gardener: 'bg-gray-100 text-gray-700 border-gray-200',
  mechanic: 'bg-gray-100 text-gray-700 border-gray-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200'
};

const DirectoryTab = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'plumber',
    contactNumber: '',
    alternateContact: '',
    email: '',
    availabilityHours: '9 AM - 6 PM',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (communityId) {
      fetchEntries();
    }
  }, [communityId, searchQuery, serviceFilter]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (serviceFilter !== 'all') params.serviceType = serviceFilter;
      
      const response = await communityApi.getDirectoryEntries(communityId!, params);
      // Handle different response structures
      const entriesData = response.result || response.data || response || [];
      // Ensure it's always an array
      setEntries(Array.isArray(entriesData) ? entriesData : []);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load directory entries', 'error');
      setEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!formData.name || !formData.contactNumber) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    try {
      await communityApi.addDirectoryEntry({
        communityId: communityId!,
        ...formData
      });
      showMessage('Directory entry added successfully!', 'success');
      setShowDialog(false);
      setFormData({
        name: '',
        serviceType: 'plumber',
        contactNumber: '',
        alternateContact: '',
        email: '',
        availabilityHours: '9 AM - 6 PM',
        address: '',
        notes: ''
      });
      fetchEntries();
    } catch (error: any) {
      showMessage(error.message || 'Failed to add directory entry', 'error');
    }
  };

  const getServiceIcon = (serviceType: string) => {
    const Icon = serviceIcons[serviceType] || serviceIcons.other;
    return <Icon className="w-5 h-5" />;
  };

  const filteredEntries = entries.filter(entry => {
    if (serviceFilter !== 'all' && entry.serviceType !== serviceFilter) return false;
    if (searchQuery && !entry.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black">Community Directory</h2>
          <p className="text-gray-600 mt-1">Find trusted service providers in your community</p>
        </div>
        {user && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add Directory Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Service Type *</label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumber">Plumber</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="carpenter">Carpenter</SelectItem>
                      <SelectItem value="painter">Painter</SelectItem>
                      <SelectItem value="gardener">Gardener</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number *</label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Alternate Contact</label>
                  <Input
                    value={formData.alternateContact}
                    onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })}
                    placeholder="Enter alternate contact (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability Hours</label>
                  <Input
                    value={formData.availabilityHours}
                    onChange={(e) => setFormData({ ...formData, availabilityHours: e.target.value })}
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address (optional)"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry} className="bg-black hover:bg-gray-800">
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="plumber">Plumber</SelectItem>
            <SelectItem value="electrician">Electrician</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="housekeeping">Housekeeping</SelectItem>
            <SelectItem value="carpenter">Carpenter</SelectItem>
            <SelectItem value="painter">Painter</SelectItem>
            <SelectItem value="gardener">Gardener</SelectItem>
            <SelectItem value="mechanic">Mechanic</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEntries.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border-2 border-gray-200">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Directory Entries</h3>
          <p className="text-gray-600">No service providers found in this community</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const Icon = serviceIcons[entry.serviceType] || serviceIcons.other;
            const colorClass = serviceColors[entry.serviceType] || serviceColors.other;
            
            return (
              <Card key={entry._id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {entry.verified && (
                      <Badge className="bg-black text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-black mb-2">{entry.name}</h3>
                  <Badge variant="outline" className={`mb-3 ${colorClass}`}>
                    {entry.serviceType.charAt(0).toUpperCase() + entry.serviceType.slice(1)}
                  </Badge>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${entry.contactNumber}`} className="text-blue-600 hover:underline">
                        {entry.contactNumber}
                      </a>
                    </div>
                    {entry.alternateContact && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{entry.alternateContact}</span>
                      </div>
                    )}
                    {entry.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a href={`mailto:${entry.email}`} className="text-blue-600 hover:underline">
                          {entry.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{entry.availabilityHours}</span>
                    </div>
                    {entry.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{entry.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {entry.rating && (
                    <div className="flex items-center gap-1 pt-3 border-t">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{entry.rating.toFixed(1)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DirectoryTab;
