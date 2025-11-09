import { Announcement } from '../../types/CommunityTypes';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface RecentAnnouncementsProps {
    announcements: Announcement[];
    loading: boolean;
}

const RecentAnnouncements = ({ announcements, loading }: RecentAnnouncementsProps) => {
    const formatDate = (dateString: string) => {
        return formatDateToDDMMYYYY(dateString);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'High':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-300';
        }
    };

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Announcements</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-6">
                                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Announcements</h2>

                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className={`rounded-lg p-6 border-l-4 ${getPriorityColor(announcement.priority)} bg-white shadow-md hover:shadow-lg transition-shadow`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {announcement.isPinned && (
                                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 3a1 1 0 011 1v5h3a1 1 0 110 2h-3v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h3V4a1 1 0 011-1z" />
                                        </svg>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {announcement.title}
                                    </h3>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        announcement.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                        announcement.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                        announcement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {announcement.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(announcement.publishDate)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-3">
                                {announcement.content}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {announcement.communityId.name}
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    announcement.category === 'Emergency' ? 'bg-red-100 text-red-700' :
                                    announcement.category === 'Security' ? 'bg-orange-100 text-orange-700' :
                                    announcement.category === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                    announcement.category === 'Event' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {announcement.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {announcements.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No recent announcements</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecentAnnouncements;
