import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityApi } from '../apis/community';
import { Community } from '../types/CommunityTypes';
import { showMessage } from '../utils/Constant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, Users, MapPin, Building2, Plus, Send, Heart,
  MessageCircle, Share2, ShoppingBag, Calendar, UserCheck,
  Clock, CheckCircle, Upload, QrCode, ScanLine, X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface Pulse {
  _id: string;
  title: string;
  description: string;
  territory: string;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
  };
  likes: string[];
  comments: Array<{
    userId: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MarketplaceListing {
  _id: string;
  type: 'want' | 'offer';
  title: string;
  description: string;
  price: number;
  attachment?: string;
  userId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'sold' | 'closed';
}

interface Member {
  _id: string;
  name: string;
  email?: string;
  role: string;
  isManager: boolean;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  registeredParticipants?: string[];
  eventType: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const CommunityDashboard = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState('pulses');
  const [loading, setLoading] = useState(true);
  const [joinStatus, setJoinStatus] = useState<'not-joined' | 'requested' | 'joined'>('not-joined');

  // Tab data
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Pagination
  const [pulsesPage, setPulsesPage] = useState(1);
  const [marketplacePage, setMarketplacePage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [pulsesTotalPages, setPulsesTotalPages] = useState(1);
  const [marketplaceTotalPages, setMarketplaceTotalPages] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);

  // Dialogs
  const [showPulseDialog, setShowPulseDialog] = useState(false);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Forms
  const [pulseForm, setPulseForm] = useState({
    title: '',
    description: '',
    territory: '',
    attachment: null as File | null
  });

  const [listingForm, setListingForm] = useState({
    type: 'offer' as 'want' | 'offer',
    title: '',
    description: '',
    price: '',
    attachment: null as File | null
  });

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
      checkJoinStatus();
    }
  }, [communityId]);

  useEffect(() => {
    if (joinStatus === 'joined') {
      fetchTabData();
    }
  }, [activeTab, joinStatus, pulsesPage, marketplacePage, eventsPage]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getCommunityById(communityId!);
      setCommunity(response.data);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load community', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const checkJoinStatus = async () => {
    if (!isAuthenticated) {
      setJoinStatus('not-joined');
      return;
    }

    try {
      const response = await communityApi.getUserJoinRequests();
      const request = response.data.find((r: any) => 
        r.communityId?._id === communityId || r.communityId === communityId
      );

      if (request) {
        setJoinStatus(request.status === 'Approved' ? 'joined' : 'requested');
      }
    } catch (error) {
      console.log('Could not check join status');
    }
  };

  const fetchTabData = async () => {
    if (activeTab === 'pulses') {
      await fetchPulses();
    } else if (activeTab === 'marketplace') {
      await fetchMarketplace();
    } else if (activeTab === 'directory') {
      await fetchMembers();
    } else if (activeTab === 'events') {
      await fetchEvents();
    }
  };

  const fetchPulses = async () => {
    try {
      const response = await communityApi.getCommunityPulses(communityId!, {
        page: pulsesPage,
        limit: 10
      });
      setPulses(response.data.pulses);
      setPulsesTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load pulses', 'error');
    }
  };

  const fetchMarketplace = async () => {
    try {
      const response = await communityApi.getCommunityMarketplaceListings(communityId!, {
        page: marketplacePage,
        limit: 10
      });
      setMarketplace(response.data.listings);
      setMarketplaceTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load marketplace listings', 'error');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await communityApi.getCommunityMembers(communityId!);
      setMembers(response.data);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load members', 'error');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await communityApi.getCommunityEvents(communityId!, {
        page: eventsPage,
        limit: 10
      });
      setEvents(response.data.events);
      setEventsTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load events', 'error');
    }
  };

  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      showMessage('Please login to join communities', 'error');
      navigate('/login');
      return;
    }

    try {
      await communityApi.createJoinRequest({ communityId: communityId! });
      setJoinStatus('requested');
      showMessage('Join request sent! Waiting for manager approval.', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to send join request', 'error');
    }
  };

  const handleCreatePulse = async () => {
    if (!pulseForm.title || !pulseForm.description || !pulseForm.territory) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    try {
      // In production: upload image and create pulse via API
      // const formData = new FormData();
      // formData.append('title', pulseForm.title);
      // formData.append('description', pulseForm.description);
      // formData.append('territory', pulseForm.territory);
      // formData.append('communityId', communityId!);
      // if (pulseForm.attachment) formData.append('attachment', pulseForm.attachment);
      // await apiClient.post('/community/pulses', formData);

      showMessage('Pulse submitted for approval!', 'success');
      setShowPulseDialog(false);
      setPulseForm({ title: '', description: '', territory: '', attachment: null });
    } catch (error: any) {
      showMessage(error.message || 'Failed to create pulse', 'error');
    }
  };

  const handleCreateListing = async () => {
    if (!listingForm.title || !listingForm.description || !listingForm.price) {
      showMessage('Please fill all required fields', 'error');
      return;
    }

    try {
      showMessage('Listing submitted for approval!', 'success');
      setShowListingDialog(false);
      setListingForm({ type: 'offer', title: '', description: '', price: '', attachment: null });
    } catch (error: any) {
      showMessage(error.message || 'Failed to create listing', 'error');
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      showMessage('Please login to register for events', 'error');
      navigate('/login');
      return;
    }

    try {
      // await apiClient.post(`/community/events/${eventId}/register`);
      showMessage('Registration request sent!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to register for event', 'error');
    }
  };

  const handleMarkAttendance = (event: Event) => {
    setSelectedEvent(event);
    setShowQRDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Community Not Found</div>
          <p className="text-gray-600 mb-4">The requested community could not be found.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Community</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Community Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold">
                {community.logo ? (
                  <img src={community.logo} alt={community.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  community.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
                <p className="text-white/90 mb-2">
                  {community.shortDescription || community.description?.substring(0, 120) + '...'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {community.totalUnits} Units
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {community.location.city}, {community.location.state}
                  </span>
                  {community.establishedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Established {community.establishedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Button 
              className={`px-6 font-semibold ${
                joinStatus === 'joined' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : joinStatus === 'requested'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
              onClick={handleJoinCommunity}
              disabled={joinStatus !== 'not-joined'}
            >
              {joinStatus === 'joined' && <CheckCircle className="w-4 h-4 mr-2" />}
              {joinStatus === 'requested' && <Clock className="w-4 h-4 mr-2" />}
              {joinStatus === 'joined' ? 'Joined' : joinStatus === 'requested' ? 'Requested' : 'Join Community'}
            </Button>
          </div>
        </div>
      </div>

      {/* Community Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
              <div className="flex items-center gap-2 overflow-x-auto py-3">
                {['Pulses', 'Marketplace', 'Directory', 'Events'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (joinStatus !== 'joined' && tab.toLowerCase() !== 'pulses') {
                        showMessage('Please join the community to access this tab', 'error');
                        return;
                      }
                      setActiveTab(tab.toLowerCase());
                    }}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                      activeTab === tab.toLowerCase()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${joinStatus !== 'joined' && tab.toLowerCase() !== 'pulses' ? 'opacity-50' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {joinStatus !== 'joined' && activeTab !== 'pulses' ? (
              <Card className="p-12 text-center mt-6">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join to Access</h3>
                <p className="text-gray-600 mb-4">You need to join this community to view {activeTab}</p>
                <Button onClick={handleJoinCommunity} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Join Community
                </Button>
              </Card>
            ) : (
              <>
                {/* Pulses Tab */}
                {activeTab === 'pulses' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Community Pulses</h2>
                      {joinStatus === 'joined' && (
                        <Dialog open={showPulseDialog} onOpenChange={setShowPulseDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Pulse
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Create New Pulse</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Territory</label>
                                <Select value={pulseForm.territory} onValueChange={(value) => setPulseForm({...pulseForm, territory: value})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select territory" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="block-a">Block A</SelectItem>
                                    <SelectItem value="block-b">Block B</SelectItem>
                                    <SelectItem value="block-c">Block C</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <Input 
                                  value={pulseForm.title}
                                  onChange={(e) => setPulseForm({...pulseForm, title: e.target.value})}
                                  placeholder="Enter pulse title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                  value={pulseForm.description}
                                  onChange={(e) => setPulseForm({...pulseForm, description: e.target.value})}
                                  placeholder="What's on your mind?"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Attachment (1 image)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowPulseDialog(false)}>Cancel</Button>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Post Pulse</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {pulses.length > 0 ? (
                      <div className="space-y-6">
                        {pulses.map((pulse) => (
                          <Card key={pulse._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback>{pulse.userId.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{pulse.userId.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {new Date(pulse.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                  {pulse.territory}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{pulse.title}</h3>
                              <p className="text-gray-700 mb-4">{pulse.description}</p>
                              {pulse.attachment && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
                                  <img src={pulse.attachment} alt="Pulse attachment" className="w-full h-64 object-cover" />
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                  <Heart className="w-4 h-4" />
                                  <span>{pulse.likes.length}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{pulse.comments.length}</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Pulses Yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to share a pulse in this community</p>
                        {joinStatus === 'joined' && (
                          <Button onClick={() => setShowPulseDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Pulse
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                )}

                {/* Marketplace Tab */}
                {activeTab === 'marketplace' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
                      {joinStatus === 'joined' && (
                        <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Listing
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Create New Listing</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <Select value={listingForm.type} onValueChange={(value) => setListingForm({...listingForm, type: value as 'want' | 'offer'})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="want">Want</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <Input 
                                  value={listingForm.title}
                                  onChange={(e) => setListingForm({...listingForm, title: e.target.value})}
                                  placeholder="Enter listing title"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                  value={listingForm.description}
                                  onChange={(e) => setListingForm({...listingForm, description: e.target.value})}
                                  placeholder="Describe what you're offering or looking for"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                                <Input 
                                  type="number"
                                  value={listingForm.price}
                                  onChange={(e) => setListingForm({...listingForm, price: e.target.value})}
                                  placeholder="Enter price"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Attachment (1 image)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowListingDialog(false)}>Cancel</Button>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Post Listing</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {marketplace.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {marketplace.map((listing) => (
                          <Card key={listing._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant={listing.type === 'offer' ? 'default' : 'secondary'}>
                                    {listing.type}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {listing.status}
                                  </Badge>
                                </div>
                                <span className="text-lg font-bold text-green-600">₹{listing.price}</span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">{listing.title}</h3>
                              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{listing.description}</p>
                              {listing.attachment && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
                                  <img src={listing.attachment} alt="Listing attachment" className="w-full h-32 object-cover" />
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>{listing.userId.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-600">{listing.userId.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(listing.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Listings Yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to post a listing in this community</p>
                        {joinStatus === 'joined' && (
                          <Button onClick={() => setShowListingDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Listing
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                )}

                {/* Directory Tab */}
                {activeTab === 'directory' && (
                  <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Directory</h2>
                    {members.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.map((member) => (
                          <Card key={member._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                  <p className="text-sm text-gray-500">{member.email || 'No email provided'}</p>
                                  <Badge variant={member.isManager ? 'default' : 'secondary'} className="mt-1">
                                    {member.isManager ? 'Manager' : member.role}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Members Found</h3>
                        <p className="text-gray-600">This community doesn't have any members yet</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                  <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Events</h2>
                    {events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.map((event) => (
                          <Card key={event._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <Badge 
                                  variant={
                                    event.status === 'Upcoming' ? 'default' : 
                                    event.status === 'Ongoing' ? 'secondary' : 
                                    event.status === 'Completed' ? 'outline' : 'destructive'
                                  }
                                >
                                  {event.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(event.eventDate).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {event.startTime}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>{event.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-600">By {event.createdBy.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    Details
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                                    onClick={() => handleRegisterEvent(event._id)}
                                  >
                                    Register
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Scheduled</h3>
                        <p className="text-gray-600 mb-4">There are no upcoming events in this community</p>
                        {joinStatus === 'joined' && (
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Community Details */}
          <div className="space-y-6">
            {/* Community Info Card */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Community Info</h3>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-gray-900">{community.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                  <p className="text-gray-900">
                    {community.location.address && `${community.location.address}, `}
                    {community.location.city}, {community.location.state} {community.location.zipCode}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Contact</h4>
                  <div className="space-y-1">
                    {community.contactInfo?.email && (
                      <p className="text-gray-900">📧 {community.contactInfo.email}</p>
                    )}
                    {community.contactInfo?.phone && (
                      <p className="text-gray-900">📞 {community.contactInfo.phone}</p>
                    )}
                    {community.contactInfo?.website && (
                      <p className="text-gray-900">🌐 {community.contactInfo.website}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <Badge 
                    variant={
                      community.status === 'Active' || community.status === 'active' ? 'default' : 
                      community.status === 'UnderDevelopment' ? 'secondary' : 'outline'
                    }
                  >
                    {community.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                  <p className="text-gray-900">
                    {new Date(community.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities Card */}
            {community.amenityIds && community.amenityIds.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Amenities</h3>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {community.amenityIds.map((amenity) => (
                      <div key={amenity._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-bold">
                            {amenity.name.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{amenity.name}</p>
                          <p className="text-xs text-gray-500">{amenity.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights Card */}
            {community.highlights && community.highlights.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Highlights</h3>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-2">
                    {community.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="text-gray-900">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Banner Image */}
            {community.bannerImage && (
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Community View</h3>
                </CardHeader>
                <CardContent className="p-0">
                  <img 
                    src={community.bannerImage} 
                    alt={community.name} 
                    className="w-full h-48 object-cover rounded-b-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;