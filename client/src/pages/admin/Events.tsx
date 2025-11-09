import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Calendar, Search, Plus, Edit, Trash2, Eye, Clock, MapPin, Users } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';
import { getImageUrl } from '../../utils/imageUtils';

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    eventType: 'Other',
    image: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      fetchEvents();
    }
  }, [selectedCommunity, pagination.page, searchTerm]);

  const fetchCommunities = async () => {
    try {
      const response = await adminApi.getAdminCommunities({
        page: 1,
        limit: 100 // Get all communities for the dropdown
      });
      
      // Handle response structure
      const data = response.result || response.data || response;
      const communitiesList = data.communities || data || [];
      setCommunities(Array.isArray(communitiesList) ? communitiesList : []);
      
      // Auto-select the first community if none selected
      if (communitiesList.length > 0 && !selectedCommunity) {
        setSelectedCommunity(communitiesList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communities",
        variant: "destructive"
      });
    }
  };

  const fetchEvents = async () => {
    // If no community selected and not "all", return
    if (!selectedCommunity && selectedCommunity !== 'all') return;
    
    try {
      setLoading(true);
      
      // If "all" is selected, fetch events from all communities
      if (selectedCommunity === 'all') {
        // Fetch events from all communities
        let allEvents: any[] = [];
        let totalEvents = 0;
        
        // Fetch events from each community
        for (const community of communities) {
          try {
            const response = await adminApi.getCommunityEvents(community._id, {
              page: 1,
              limit: 100, // Get more events per community
              search: searchTerm
            });
            
            const data = response.result || response.data || response;
            const events = data.events || data || [];
            allEvents = [...allEvents, ...events];
            totalEvents += events.length;
          } catch (error) {
            console.error(`Error fetching events for community ${community._id}:`, error);
          }
        }
        
        // Sort events by date
        allEvents.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
        
        // Apply pagination manually
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedEvents = allEvents.slice(startIndex, endIndex);
        
        setEvents(paginatedEvents);
        setPagination({
          ...pagination,
          total: allEvents.length,
          totalPages: Math.ceil(allEvents.length / pagination.limit)
        });
      } else {
        // Fetch events for specific community
        const response = await adminApi.getCommunityEvents(selectedCommunity, {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        });
        
        // Handle response structure
        const data = response.result || response.data || response;
        setEvents(data.events || data || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-black text-white">Published</Badge>;
      case 'Draft':
        return <Badge className="bg-gray-500 text-white">Draft</Badge>;
      case 'Scheduled':
        return <Badge className="bg-gray-700 text-white">Scheduled</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-300 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-800">{status}</Badge>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleCommunityChange = (communityId) => {
    setSelectedCommunity(communityId);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEvent(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || '',
      eventType: event.eventType || 'Other',
      image: null
    });
    setShowEditForm(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCommunity) {
      toast({
        title: "Error",
        description: "Please select a community",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('eventDate', newEvent.eventDate);
      formData.append('startTime', newEvent.startTime);
      formData.append('endTime', newEvent.endTime);
      formData.append('location', newEvent.location);
      formData.append('maxParticipants', newEvent.maxParticipants);
      formData.append('eventType', newEvent.eventType);
      
      if (newEvent.image) {
        formData.append('images', newEvent.image);
      }

      await adminApi.createCommunityEvent(selectedCommunity, formData);
      
      toast({
        title: "Success",
        description: "Event created successfully"
      });
      
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: '',
        eventType: 'Other',
        image: null
      });
      
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast({
        title: "Error",
        description: "No event selected",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Info",
      description: "Event update functionality would be implemented here",
      variant: "default"
    });
    
    setShowEditForm(false);
    setSelectedEvent(null);
  };

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black mb-1 md:mb-2">Events Management</h1>
            <p className="text-sm md:text-base text-gray-600">Manage all community events and activities</p>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800 text-sm md:text-base w-full md:w-auto"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events by title..."
              className="pl-10 border border-gray-400 text-black text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCommunity}
              onChange={(e) => handleCommunityChange(e.target.value)}
              className="border border-gray-400 rounded-md px-3 py-2 text-black text-sm md:text-base w-full md:w-auto"
            >
              <option value="">Select Community</option>
              <option value="all">All Communities</option>
              {communities.map((community: any) => (
                <option key={community._id} value={community._id}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mt-4 md:mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Events</p>
                <p className="text-xl md:text-2xl font-bold text-black">1</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Published Events</p>
                <p className="text-xl md:text-2xl font-bold text-black">0</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Upcoming Events</p>
                <p className="text-xl md:text-2xl font-bold text-black">0</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Attendees</p>
                <p className="text-xl md:text-2xl font-bold text-black">0</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 mt-4 md:mt-6">
        {events.map((event: any) => (
          <Card key={event._id} className="hover:shadow-lg transition-shadow bg-white border border-gray-300">
            <CardHeader className="border-b border-gray-300 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-black">{event.title}</h3>
                {getStatusBadge(event.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{communities.find((c: any) => c._id === event.communityId)?.name || 'Unknown Community'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateToDDMMYYYY(event.eventDate)} at {event.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{event.registeredParticipants?.length || 0} attendees</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border border-gray-400 text-black hover:bg-gray-100"
                  onClick={() => handleViewEvent(event)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border border-gray-400 text-black hover:bg-gray-100"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border border-gray-400 text-black hover:bg-gray-100">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-black">
              <Calendar className="w-5 h-5" />
              All Events
            </h3>
            <p className="text-sm text-gray-600">Showing {events.length} events</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event: any) => (
                  <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-black">{event.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {communities.find((c: any) => c._id === event.communityId)?.name || 'Unknown Community'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateToDDMMYYYY(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.location || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.registeredParticipants?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-black hover:bg-gray-100"
                        onClick={() => handleViewEvent(event)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
            className="border border-gray-400 text-black hover:bg-gray-100"
          >
            Next
          </Button>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Event Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-black">{selectedEvent.title}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Community</p>
                    <p className="font-medium">
                      {communities.find((c: any) => c._id === selectedEvent.communityId)?.name || 'Unknown Community'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Event Type</p>
                    <p className="font-medium">{selectedEvent.eventType || 'Other'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{selectedEvent.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {selectedEvent.eventDate ? formatDateToDDMMYYYY(selectedEvent.eventDate) : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">{selectedEvent.startTime || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">{selectedEvent.endTime || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedEvent.location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Max Participants</p>
                    <p className="font-medium">
                      {selectedEvent.maxParticipants ? selectedEvent.maxParticipants : 'No limit'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Attendees</p>
                  <p className="font-medium">
                    {selectedEvent.registeredParticipants?.length || 0} registered
                  </p>
                </div>
                
                {selectedEvent.images && selectedEvent.images.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Event Banner</p>
                    <img 
                      src={getImageUrl(selectedEvent.images?.[0])} 
                      alt="Event Banner" 
                      className="mt-2 max-w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowViewModal(false)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Form Modal */}
      {showEditForm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Edit Event</h2>
                <button 
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <Input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-400 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Community</label>
                    <select
                      name="community"
                      value={selectedCommunity}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                      required
                      className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                      disabled
                    >
                      <option value="">Select Community</option>
                      {communities.map((community: any) => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                    <Input
                      type="text"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      className="border border-gray-400 text-black"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Location (Google Place API)</label>
                  <Input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="border border-gray-400 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Creative Attachment (Image)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border border-gray-400 text-black"
                  />
                  {selectedEvent.images && selectedEvent.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Current Image:</p>
                      <img 
                        src={getImageUrl(selectedEvent.images?.[0])} 
                        alt="Current Event Banner" 
                        className="mt-1 max-w-full h-24 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Start Date</label>
                    <Input
                      type="date"
                      name="eventDate"
                      value={newEvent.eventDate}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <Input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <Input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="border border-gray-400 text-black"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Limit Up to</label>
                    <Input
                      type="number"
                      name="maxParticipants"
                      value={newEvent.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      name="eventType"
                      value={newEvent.eventType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                    >
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Educational">Educational</option>
                      <option value="Social">Social</option>
                      <option value="Festival">Festival</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="border border-gray-400 text-black hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Update Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Create New Event</h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <Input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-400 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Community</label>
                    <select
                      name="community"
                      value={selectedCommunity}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                      required
                      className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                    >
                      <option value="">Select Community</option>
                      {communities.map((community: any) => (
                        <option key={community._id} value={community._id}>
                          {community.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Territory</label>
                    <Input
                      type="text"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      className="border border-gray-400 text-black"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Location (Google Place API)</label>
                  <Input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="border border-gray-400 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Creative Attachment (Image)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border border-gray-400 text-black"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Start Date</label>
                    <Input
                      type="date"
                      name="eventDate"
                      value={newEvent.eventDate}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <Input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <Input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="border border-gray-400 text-black"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Limit Up to</label>
                    <Input
                      type="number"
                      name="maxParticipants"
                      value={newEvent.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      className="border border-gray-400 text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      name="eventType"
                      value={newEvent.eventType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                    >
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Educational">Educational</option>
                      <option value="Social">Social</option>
                      <option value="Festival">Festival</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border border-gray-400 text-black hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Create Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;