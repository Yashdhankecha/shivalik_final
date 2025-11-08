import { Event } from '../../types/CommunityTypes';

interface RecentEventsProps {
    events: Event[];
    loading: boolean;
    onViewAll: () => void;
}

const RecentEvents = ({ events, loading, onViewAll }: RecentEventsProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
                    <button
                        onClick={onViewAll}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                        event.eventType === 'Cultural' ? 'bg-purple-100 text-purple-700' :
                                        event.eventType === 'Sports' ? 'bg-green-100 text-green-700' :
                                        event.eventType === 'Educational' ? 'bg-blue-100 text-blue-700' :
                                        event.eventType === 'Social' ? 'bg-pink-100 text-pink-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {event.eventType}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(event.eventDate)}</span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {event.title}
                            </h3>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {event.description}
                            </p>

                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {event.communityId.name}
                            </div>

                            {event.maxParticipants && (
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {event.registeredParticipants?.length || 0} / {event.maxParticipants} Registered
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No upcoming events</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecentEvents;
