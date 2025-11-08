export interface Amenity {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    category: 'Sports' | 'Recreation' | 'Health' | 'Safety' | 'Convenience' | 'Social' | 'Other';
    isActive: boolean;
}

export interface Community {
    _id: string;
    name: string;
    description: string;
    shortDescription?: string;
    image?: string;
    bannerImage?: string;
    logo?: string;
    managerId?: string | {
        _id: string;
        name: string;
        email: string;
    };
    members?: string[];
    pendingRequests?: string[];
    pulses?: string[];
    marketplaceListings?: string[];
    events?: string[];
    territory?: string;
    location: {
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        coordinates?: {
            lat?: number;
            lng?: number;
        };
    };
    isFeatured: boolean;
    highlights?: string[];
    amenityIds?: Amenity[];
    totalUnits: number;
    occupiedUnits: number;
    establishedYear?: number;
    contactInfo?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    status: 'Active' | 'Inactive' | 'UnderDevelopment' | 'active' | 'inactive' | 'pending';
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    _id: string;
    title: string;
    description: string;
    communityId: {
        _id: string;
        name: string;
        logo?: string;
        location?: Community['location'];
    };
    eventDate: string;
    startTime: string;
    endTime?: string;
    location?: string;
    images?: string[];
    maxParticipants?: number;
    registeredParticipants?: string[];
    eventType: 'Cultural' | 'Sports' | 'Educational' | 'Social' | 'Festival' | 'Meeting' | 'Other';
    status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export interface Announcement {
    _id: string;
    title: string;
    content: string;
    communityId: {
        _id: string;
        name: string;
        logo?: string;
    };
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    category: 'General' | 'Maintenance' | 'Event' | 'Security' | 'Emergency' | 'Other';
    images?: string[];
    documents?: string[];
    publishDate: string;
    expiryDate?: string;
    isPinned: boolean;
    status: 'Draft' | 'Published' | 'Archived';
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export interface CommunityJoinRequest {
    _id: string;
    userId: string;
    communityId: {
        _id: string;
        name: string;
        logo?: string;
        location?: Community['location'];
    };
    message?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: {
        _id: string;
        name: string;
    };
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
