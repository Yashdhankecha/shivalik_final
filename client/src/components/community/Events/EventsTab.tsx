import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Eye, 
  QrCode, 
  Download, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { communityApi } from '../../../apis/community';
import { useToast } from '../../../hooks/use-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  registrationCount: number;
  availableSlots: number;
  banner: string;
  createdBy: {
    name: string;
  };
}

const EventsTab = ({ communityId, user }: { communityId: string; user: any }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [registration, setRegistration] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const showMessage = (message: string, type: 'success' | 'error' | 'info') => {
    toast({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await communityApi.getCommunityEvents(communityId, { page });
      const data = response.result || response.data;
      setEvents(data.events || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      showMessage(error.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [communityId, page]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      showMessage('Please login to register for events', 'error');
      return;
    }

    try {
      const response = await communityApi.registerForEvent(eventId);
      setRegistration(response.result || response.data);
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowQRDialog(true);
      }
      showMessage('Successfully registered for event!', 'success');
      fetchEvents();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to register for event';
      showMessage(errorMsg, 'error');
    }
  };

  const handleViewQR = async (eventId: string) => {
    try {
      const response = await communityApi.getUserRegistration(eventId);
      setRegistration(response.result || response.data);
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowQRDialog(true);
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to load registration', 'error');
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsDialog(true);
  };

  const downloadQR = () => {
    if (!registration?.qrCode) return;
    const link = document.createElement('a');
    link.href = registration.qrCode;
    link.download = `event-ticket-${selectedEvent?._id}.png`;
    link.click();
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    
    if (eventDate > now) return 'upcoming';
    if (eventDate <= now && event.endTime) {
      const [hours, minutes] = event.endTime.split(':').map(Number);
      const endTime = new Date(eventDate);
      endTime.setHours(hours, minutes);
      if (now <= endTime) return 'ongoing';
    }
    return 'completed';
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black">Community Events</h2>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border-2 border-gray-200">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-black mb-2">No Events Found</h3>
          <p className="text-gray-600">
            There are no events scheduled in this community
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventStatus = getEventStatus(event);
            const isRegistered = registration && selectedEvent?._id === event._id;
            const isFull = event.maxParticipants && event.availableSlots === 0;
            
            return (
              <Card key={event._id} className="hover:shadow-xl transition-all duration-300 border-2 overflow-hidden group">
                {event.banner && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <Badge className="absolute top-2 right-2 bg-black text-white">
                      {eventStatus === 'upcoming' ? 'Upcoming' :
                       eventStatus === 'ongoing' ? 'Ongoing' :
                       'Completed'}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-black" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-black" />
                      <span>{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-black" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-black" />
                        <span className="text-gray-600">
                          {event.registrationCount || 0} / {event.maxParticipants} registered
                        </span>
                        {event.availableSlots !== null && event.availableSlots !== undefined && (
                          <span className={`ml-1 font-semibold ${event.availableSlots > 0 ? 'text-black' : 'text-gray-600'}`}>
                            ({event.availableSlots} slots {event.availableSlots > 0 ? 'left' : 'left'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-black text-white">{event.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">By {event.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(event)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    {user && (
                      <>
                        {isRegistered ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewQR(event._id)}
                            className="flex-1"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            View Ticket
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            onClick={() => handleRegister(event._id)}
                            disabled={isFull || eventStatus === 'completed'}
                          >
                            {isFull ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Full
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Register
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              {selectedEvent.banner && (
                <img src={selectedEvent.banner} alt={selectedEvent.title} className="w-full h-64 object-cover rounded-lg" />
              )}
              <p className="text-gray-700">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">{new Date(selectedEvent.eventDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold">{selectedEvent.startTime} {selectedEvent.endTime && `- ${selectedEvent.endTime}`}</p>
                  </div>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}
                {selectedEvent.maxParticipants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold">
                        {selectedEvent.registrationCount || 0} / {selectedEvent.maxParticipants}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                {user && (
                  <Button
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleRegister(selectedEvent._id);
                    }}
                    className="flex-1 bg-black hover:bg-gray-800"
                    disabled={selectedEvent.maxParticipants && selectedEvent.availableSlots === 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Event Ticket
            </DialogTitle>
          </DialogHeader>
          {registration && selectedEvent && (
            <div className="space-y-4">
              <div className="text-center bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {selectedEvent.startTime}
                </p>
                {selectedEvent.location && (
                  <p className="text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedEvent.location}
                  </p>
                )}
                <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                  <img src={registration.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Show this QR code at the event entrance for check-in
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadQR}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  onClick={() => setShowQRDialog(false)}
                  className="flex-1 bg-black hover:bg-gray-800"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsTab;