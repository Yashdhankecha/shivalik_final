import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Calendar, Search, Plus, Edit, Trash2, Eye, Clock, MapPin, Users } from 'lucide-react';

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock event data
  const events = [
    { id: 1, title: 'Annual Community Meet', community: 'Green Valley Apartments', date: '2023-12-15', time: '18:00', location: 'Community Hall', attendees: 120, status: 'Published' },
    { id: 2, title: 'Yoga Session', community: 'Sunset Hills Condos', date: '2023-12-10', time: '07:00', location: 'Park Area', attendees: 45, status: 'Published' },
    { id: 3, title: 'Board Meeting', community: 'Oakwood Park Villas', date: '2023-12-12', time: '19:00', location: 'Conference Room', attendees: 15, status: 'Draft' },
    { id: 4, title: 'Christmas Party', community: 'Pine Grove Residency', date: '2023-12-22', time: '20:00', location: 'Garden Area', attendees: 85, status: 'Published' },
    { id: 5, title: 'New Year Celebration', community: 'Royal Gardens', date: '2023-12-31', time: '22:00', location: 'Club House', attendees: 200, status: 'Scheduled' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-900 text-green-300">Published</Badge>;
      case 'Draft':
        return <Badge className="bg-yellow-900 text-yellow-300">Draft</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-900 text-blue-300">Scheduled</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-900 text-red-300">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-900 text-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-100 mb-2">Events Management</h1>
            <p className="text-gray-400">Manage all community events and activities</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800">
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events by title or community..."
              className="pl-10 bg-gray-900 border-emerald-700 text-emerald-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Status</Button>
            <Button variant="outline" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">All Communities</Button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow bg-gray-800 border-emerald-900/30">
            <CardHeader className="border-b border-emerald-900/30 pb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-emerald-100">{event.title}</h3>
                {getStatusBadge(event.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>{event.community}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{event.attendees} attendees</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-emerald-900/20 flex justify-between">
                <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-300 hover:bg-emerald-900/30">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:text-red-300 hover:bg-red-900/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Table */}
      <Card className="bg-gray-800 border-emerald-900/30">
        <CardHeader className="border-b border-emerald-900/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-100">
              <Calendar className="w-5 h-5 text-emerald-500" />
              All Events
            </h3>
            <p className="text-sm text-gray-400">Showing {events.length} events</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-emerald-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Attendees</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm text-emerald-100">{event.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {event.community}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>{event.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {event.attendees}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/30">
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-emerald-100">23</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Published Events</p>
                <p className="text-2xl font-bold text-emerald-100">18</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming Events</p>
                <p className="text-2xl font-bold text-emerald-100">5</p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-emerald-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Attendees</p>
                <p className="text-2xl font-bold text-emerald-100">1,245</p>
              </div>
              <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;