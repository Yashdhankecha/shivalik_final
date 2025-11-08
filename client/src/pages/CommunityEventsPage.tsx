import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../apis/community';
import { Event } from '../types/CommunityTypes';
import { useAuth } from '../hooks/useAuth';
import { showMessage } from '../utils/Constant';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Calendar, MapPin, Users, Clock, Search, Filter, X, ChevronDown, Plus, Sparkles } from 'lucide-react';
import AuthModal from '../components/ui/AuthModal';

interface FilterState {
  category: string[];
  community: string[];
  dateRange: string;
}

const CommunityEventsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    category: ['Upcoming', 'Free Events', 'Workshop'],
    community: [],
    dateRange: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getRecentEvents(20);
      setEvents(response.data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      showMessage(error.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = (eventId: string) => {
    if (!isAuthenticated) {
      setSelectedEvent(eventId);
      setShowAuthModal(true);
      return;
    }
    // Handle event registration
    showMessage('Successfully registered for event!', 'success');
  };

  const removeFilter = (category: keyof FilterState, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category]) 
        ? (prev[category] as string[]).filter(v => v !== value)
        : prev[category]
    }));
  };

  const tabs = [
    { id: 'all', label: 'All Events' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past Events' },
    { id: 'registered', label: 'My Registrations' }
  ];

  // Mock featured events (replace with real data)
  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(3, 9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Real Estate Community
                </h1>
                <p className="text-xs text-gray-500">Workshops, meetups, celebrations and more.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Dashboard
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title, category, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Category
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <MapPin className="w-4 h-4" />
              Community
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Active Filters */}
          {(activeFilters.category.length > 0 || activeFilters.community.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
              {activeFilters.category.map(filter => (
                <Badge key={filter} variant="secondary" className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {filter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('category', filter)} />
                </Badge>
              ))}
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Featured Events */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  Featured Events
                </h2>
                <Button variant="link" className="text-blue-600">
                  Sort by: Upcoming
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredEvents.map((event, index) => (
                  <Card key={event._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 group">
                    <div className="relative">
                      <div className={`h-40 bg-gradient-to-br ${
                        index === 0 ? 'from-pink-400 to-rose-500' :
                        index === 1 ? 'from-purple-400 to-indigo-500' :
                        'from-blue-400 to-cyan-500'
                      } group-hover:scale-105 transition-transform duration-300`}>
                        {/* Image placeholder */}
                      </div>
                      <Badge className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 border-0">
                        Featured
                      </Badge>
                      <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700">
                        {index === 0 ? 'Workshop' : index === 1 ? 'Community' : 'Meetup'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.title || `Event ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {event.description || 'Join us for an exciting community event'}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>Skyline Recreation Center</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Sunday, Dec 15 • 9:30 AM</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <Avatar key={i} className="w-7 h-7 border-2 border-white">
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xs">
                                U{i}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                            +5
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">27 registered</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>17 spots left</span>
                          <span>30 / 47</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '64%' }} />
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleRegisterEvent(event._id)}
                      >
                        Register Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingEvents.map((event, index) => (
                  <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="relative">
                      <div className={`h-32 bg-gradient-to-br ${
                        index % 4 === 0 ? 'from-orange-400 to-pink-500' :
                        index % 4 === 1 ? 'from-green-400 to-teal-500' :
                        index % 4 === 2 ? 'from-yellow-400 to-orange-500' :
                        'from-indigo-400 to-purple-500'
                      }`} />
                      <Badge className="absolute top-2 right-2 bg-white/90">
                        {index % 2 === 0 ? 'Workshop' : 'Meetup'}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-base mb-2 line-clamp-1">
                        {event.title || `Upcoming Event ${index + 1}`}
                      </h3>
                      <div className="space-y-1 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">Community Center</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Dec {15 + index} • 2:30 PM</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex -space-x-1">
                          {[1, 2].map(i => (
                            <Avatar key={i} className="w-5 h-5 border border-white">
                              <AvatarFallback className="bg-gray-300 text-xs">U</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{10 + index * 2} registered</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full h-8 text-xs"
                        variant="outline"
                        onClick={() => handleRegisterEvent(event._id)}
                      >
                        Register Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Highlights */}
            <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Upcoming Highlights</h3>
                <div className="space-y-3">
                  {['Live Jazz Concert', 'Tech Meetup', 'New Year\'s Eve Party'].map((title, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{title}</h4>
                          <p className="text-xs opacity-90">Dec {20 + i} • 8:00 AM</p>
                          <p className="text-xs opacity-75 mt-1">+{12 + i} spots left</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended For You */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recommended For You
                </h3>
                <div className="space-y-3">
                  {['Photography Workshop', 'Yoga Session', 'Tech Meetup'].map((title, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <h4 className="font-semibold text-sm text-blue-600 mb-1">{title}</h4>
                      <p className="text-xs text-gray-500">Based on your interests</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Events */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Popular Events</h3>
                <div className="space-y-3">
                  {['Community Festival', 'Art Walk', 'Networking Night'].map((title, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-sm">{title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{62 - i * 10} registered</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Manager CTA */}
            <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">Community Manager?</h3>
                <p className="text-sm opacity-90 mb-4">Create and manage events for your community</p>
                <Button className="w-full bg-white text-orange-600 hover:bg-gray-100">
                  Create Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedEvent(null);
        }}
        onSuccess={() => {
          setShowAuthModal(false);
          if (selectedEvent) {
            handleRegisterEvent(selectedEvent);
          }
        }}
      />
    </div>
  );
};

export default CommunityEventsPage;
