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
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';

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
  isRegistered?: boolean;
  registeredParticipants?: string[];
  registeredParticipantsPreview?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

const EventsTab = ({ communityId, user }: { communityId: string; user: any }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
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
      let eventsList = data.events || [];
      
      // Additional client-side filtering to remove past events
      const now = new Date();
      eventsList = eventsList.filter((event: Event) => {
        const eventDate = new Date(event.eventDate);
        
        // If event date is in the future, include it
        if (eventDate > now) {
          return true;
        }
        
        // If event date is today or past, check if it has ended
        if (event.endTime) {
          const [hours, minutes] = event.endTime.split(':').map(Number);
          const endDateTime = new Date(eventDate);
          endDateTime.setHours(hours, minutes);
          // Only include if event hasn't ended yet
          return now <= endDateTime;
        }
        
        // If no end time and date has passed, exclude it
        return false;
      });
      
      setTotalPages(data.pagination?.totalPages || 1);
      
      // Check registration status for each event if user is logged in
      if (user && eventsList.length > 0) {
        const registeredSet = new Set<string>();
        
        // Check registration status for all events in parallel
        await Promise.all(
          eventsList.map(async (event: Event) => {
            try {
              const regResponse = await communityApi.getUserRegistration(event._id);
              // If we get a response, user is registered
              if (regResponse?.result || regResponse?.data) {
                registeredSet.add(event._id);
              }
            } catch (error: any) {
              // 404 is expected for unregistered events - ignore it
              // Only log other errors
              if (error?.response?.status !== 404) {
                console.warn('Error checking registration status:', error?.response?.data?.message || error?.message);
              }
            }
          })
        );
        
        // Update registered events set
        setRegisteredEvents(registeredSet);
        
        // Mark events as registered in the events array
        const updatedEvents = eventsList.map((e: Event) => ({
          ...e,
          isRegistered: registeredSet.has(e._id)
        }));
        setEvents(updatedEvents);
      } else {
        // Clear registered events if user is not logged in
        setRegisteredEvents(new Set());
        setEvents(eventsList);
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [communityId, page]);

  const handleRegisterClick = (eventId: string) => {
    if (!user) {
      showMessage('Please login to register for events', 'error');
      return;
    }
    setPendingEventId(eventId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRegister = async () => {
    if (!pendingEventId) return;

    try {
      const response = await communityApi.registerForEvent(pendingEventId);
      
      // Check if response indicates success
      if (response?.result || response?.data) {
        setRegistration(response.result || response.data);
        const event = events.find(e => e._id === pendingEventId);
        if (event) {
          setSelectedEvent(event);
          setShowQRDialog(true);
        }
        showMessage('Successfully registered for event!', 'success');
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
      
      // Immediately add to registered events set - this ensures button shows immediately
      setRegisteredEvents(prev => {
        const newSet = new Set(prev);
        newSet.add(pendingEventId);
        return newSet;
      });
      
      // Update the event's registration count locally
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e._id === pendingEventId 
            ? { 
                ...e, 
                registrationCount: (e.registrationCount || 0) + 1,
                availableSlots: e.maxParticipants ? Math.max(0, (e.availableSlots ?? e.maxParticipants) - 1) : null,
                isRegistered: true
              }
            : e
        )
      );
      
      setShowConfirmDialog(false);
      setPendingEventId(null);
      
      // Refresh events after a delay to get updated participant data, but preserve registration status
      setTimeout(() => {
        fetchEvents();
      }, 1000);
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract error message from response
      let errorMsg = 'Failed to register for event';
      if (error.response?.data) {
        // Check different possible response formats
        errorMsg = error.response.data.message || 
                   error.response.data.error || 
                   error.message || 
                   'Failed to register for event';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // If user is already registered, update the UI to show "View Ticket" button
      if (errorMsg.includes('already registered') || errorMsg.includes('already registered for this event')) {
        // Mark event as registered
        setRegisteredEvents(prev => {
          const newSet = new Set(prev);
          if (pendingEventId) {
            newSet.add(pendingEventId);
          }
          return newSet;
        });
        
        // Update event object
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e._id === pendingEventId 
              ? { ...e, isRegistered: true }
              : e
          )
        );
        
        // Try to fetch the registration to show QR code
        if (pendingEventId) {
          try {
            const regResponse = await communityApi.getUserRegistration(pendingEventId);
            setRegistration(regResponse.result || regResponse.data);
            const event = events.find(e => e._id === pendingEventId);
            if (event) {
              setSelectedEvent(event);
              setShowQRDialog(true);
            }
          } catch (regError) {
            console.error('Error fetching existing registration:', regError);
          }
        }
        
        showMessage('You are already registered for this event. Showing your ticket.', 'info');
      } else {
        showMessage(errorMsg, 'error');
      }
      
      setShowConfirmDialog(false);
      setPendingEventId(null);
    }
  };

  const handleViewQR = async (eventId: string) => {
    try {
      const response = await communityApi.getUserRegistration(eventId);
      const registrationData = response.result || response.data;
      
      if (!registrationData) {
        showMessage('Registration not found', 'error');
        return;
      }
      
      setRegistration(registrationData);
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowQRDialog(true);
      } else {
        // If event is not in current list (e.g., past event), use registration data
        if (registrationData.eventId) {
          setSelectedEvent({
            _id: eventId,
            title: registrationData.eventId?.title || 'Event',
            description: registrationData.eventId?.description || '',
            eventDate: registrationData.eventId?.eventDate || '',
            startTime: registrationData.eventId?.startTime || '',
            endTime: registrationData.eventId?.endTime || '',
            location: registrationData.eventId?.location || '',
            maxParticipants: 0,
            registrationCount: 0,
            availableSlots: 0,
            banner: '',
            createdBy: { name: registrationData.userId?.name || '' }
          } as Event);
          setShowQRDialog(true);
        } else {
          showMessage('Event information not available', 'error');
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load registration';
      showMessage(errorMsg, 'error');
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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Community Events</h2>
      </div>

      {events.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gray-50 border-2 border-gray-200 rounded-xl">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600">
            There are no events scheduled in this community
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => {
            const eventStatus = getEventStatus(event);
            // Check both registeredEvents set and event.isRegistered flag
            const isRegistered = registeredEvents.has(event._id) || event.isRegistered === true;
            const isFull = event.maxParticipants && event.availableSlots === 0;
            
            return (
              <Card key={event._id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden group bg-white">
                {event.banner && (
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className="absolute top-3 right-3 bg-gray-900 text-white border-0 shadow-lg">
                      {eventStatus === 'upcoming' ? 'Upcoming' :
                       eventStatus === 'ongoing' ? 'Ongoing' :
                       'Completed'}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">{event.title}</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2 min-h-[2.5rem]">{event.description}</p>
                  
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-gray-900" />
                      </div>
                      <span className="font-medium">{formatDateToDDMMYYYY(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-900" />
                      </div>
                      <span className="font-medium">{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-gray-900" />
                        </div>
                        <span className="line-clamp-1 font-medium">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">
                            {event.registrationCount || 0} {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
                          </span>
                          {event.availableSlots !== null && event.availableSlots !== undefined && event.maxParticipants && (
                            <Badge variant={event.availableSlots > 0 ? "default" : "secondary"} className="ml-2">
                              {event.availableSlots} {event.availableSlots === 1 ? 'slot' : 'slots'} left
                            </Badge>
                          )}
                        </div>
                        {/* Live Participants Preview */}
                        {event.registeredParticipantsPreview && event.registeredParticipantsPreview.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex -space-x-2">
                              {event.registeredParticipantsPreview.slice(0, 5).map((participant: any) => (
                                <Avatar key={participant._id} className="w-6 h-6 border-2 border-white">
                                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                                    {participant.name?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {(event.registrationCount || 0) > 5 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{(event.registrationCount || 0) - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mb-4">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarFallback className="bg-gray-900 text-white text-xs">{event.createdBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">By {event.createdBy.name}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(event)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Details
                    </Button>
                    {user && (
                      <>
                        {isRegistered ? (
                          <Button
                            size="sm"
                            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                            onClick={() => handleViewQR(event._id)}
                          >
                            <QrCode className="w-4 h-4 mr-1.5" />
                            View Ticket
                          </Button>
                        ) : null}
                        {!isRegistered && (
                          <Button
                            size="sm"
                            className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
                            onClick={() => handleRegisterClick(event._id)}
                            disabled={isFull || eventStatus === 'completed'}
                          >
                            {isFull ? (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1.5" />
                                Full
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1.5" />
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
                  <>
                    {registeredEvents.has(selectedEvent._id) ? (
                      <Button
                        onClick={() => {
                          setShowDetailsDialog(false);
                          handleViewQR(selectedEvent._id);
                        }}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        View Ticket
                      </Button>
                    ) : null}
                    {!registeredEvents.has(selectedEvent._id) && (
                      <Button
                        onClick={() => {
                          setShowDetailsDialog(false);
                          handleRegisterClick(selectedEvent._id);
                        }}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                        disabled={selectedEvent.maxParticipants && selectedEvent.availableSlots === 0}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Register Now
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                  className="flex-1 border-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Registration</DialogTitle>
          </DialogHeader>
          {pendingEventId && (() => {
            const event = events.find(e => e._id === pendingEventId);
            return event ? (
              <div className="space-y-4 mt-4">
                <p className="text-gray-700">
                  Are you sure you want to register for <strong>{event.title}</strong>?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{formatDateToDDMMYYYY(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setPendingEventId(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmRegister}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Confirm Registration
                  </Button>
                </div>
              </div>
            ) : null;
          })()}
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