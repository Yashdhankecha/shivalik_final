import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Calendar, Search, Plus, Edit, Trash2, Eye, Clock, MapPin, Users } from 'lucide-react';
import { adminApi } from '../../apis/admin';
import { useToast } from '../../hooks/use-toast';

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
      
      setCommunities(response.data.communities || []);
      
      // Auto-select the first community if none selected
      if (response.data.communities.length > 0 && !selectedCommunity) {
        setSelectedCommunity(response.data.communities[0]._id);
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
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await adminApi.getCommunityEvents(selectedCommunity, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      setEvents(response.data.events || []);
      setPagination(response.data.pagination || pagination);
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
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Events Management</h1>
            <p className="text-gray-600">Manage all community events and activities</p>
          </div>
          <Button className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events by title..."
              className="pl-10 border border-gray-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCommunity}
              onChange={(e) => handleCommunityChange(e.target.value)}
              className="border border-gray-400 rounded-md px-3 py-2 text-black"
            >
              <option value="">Select Community</option>
              {communities.map((community: any) => (
                <option key={community._id} value={community._id}>
                  {community.name}
                </option>
              ))}
            </select>
            <Button variant="outline" className="border border-gray-400 text-black hover:bg-gray-100">All Status</Button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                  <span>{new Date(event.eventDate).toLocaleDateString()} at {event.startTime}</span>
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
                <Button variant="outline" size="sm" className="border border-gray-400 text-black hover:bg-gray-100">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border border-gray-400 text-black hover:bg-gray-100">
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
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
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
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
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-black">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published Events</p>
                <p className="text-2xl font-bold text-black">
                  {events.filter(e => e.status === 'Published').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-black">
                  {events.filter(e => e.status === 'Scheduled').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-black">
                  {events.reduce((sum, e) => sum + (e.registeredParticipants?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;