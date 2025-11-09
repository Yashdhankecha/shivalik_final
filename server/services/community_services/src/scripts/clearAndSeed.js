require('dotenv').config();
const mongoose = require('mongoose');
const db = require("../models/index.js");

// Import all models
const CommunitiesModel = require('../models/Communities');
const PulsesModel = require('../models/Pulses');
const MarketplaceListingsModel = require('../models/MarketplaceListings');
const EventsModel = require('../models/Events');
const DirectoryEntriesModel = require('../models/DirectoryEntries');
const UsersModel = require('../models/Users');
const CommunityJoinRequestsModel = require('../models/CommunityJoinRequests');
const CommunityManagersModel = require('../models/CommunityManagers');
const ReportsModel = require('../models/Reports');
const RoleChangeRequestsModel = require('../models/RoleChangeRequests');
const EventRegistrationsModel = require('../models/EventRegistrations');
const MarketplaceChatsModel = require('../models/MarketplaceChats');
const AmenitiesModel = require('../models/Amenities');
const AnnouncementsModel = require('../models/Announcements');

async function clearAndSeedDatabase() {
    try {
        console.log('🔍 Connecting to database...');
        
        // Wait for database connection
        await new Promise((resolve, reject) => {
            db.DBConnect.on('connected', resolve);
            setTimeout(() => reject(new Error('Database connection timeout')), 5000);
        });
        
        console.log('✅ Database connected');
        
        // Clear all collections
        console.log('\n🗑️  Clearing all collections...');
        await CommunitiesModel.deleteMany({});
        await PulsesModel.deleteMany({});
        await MarketplaceListingsModel.deleteMany({});
        await EventsModel.deleteMany({});
        await DirectoryEntriesModel.deleteMany({});
        await UsersModel.deleteMany({});
        await CommunityJoinRequestsModel.deleteMany({});
        await CommunityManagersModel.deleteMany({});
        await ReportsModel.deleteMany({});
        await RoleChangeRequestsModel.deleteMany({});
        await EventRegistrationsModel.deleteMany({});
        await MarketplaceChatsModel.deleteMany({});
        await AmenitiesModel.deleteMany({});
        await AnnouncementsModel.deleteMany({});
        
        console.log('✅ All collections cleared');
        
        // Create main user (harsh@gmail.com)
        console.log('\n👤 Creating main user (harsh@gmail.com)...');
        const mainUser = await UsersModel.create({
            name: 'Harsh Patel',
            email: 'harsh@gmail.com',
            mobileNumber: '9876543210',
            password: 'Harsh@123',
            role: 'Admin',
            status: 'Active',
            isEmailVerified: true
        });
        console.log('✅ Main user created:', mainUser.email);
        
        // Create additional users for Ahmedabad region
        console.log('\n👥 Creating additional users...');
        const users = [
            await UsersModel.create({
                name: 'Rajesh Mehta',
                email: 'rajesh.mehta@gmail.com',
                mobileNumber: '9876543211',
                password: 'Rajesh@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Priya Sharma',
                email: 'priya.sharma@gmail.com',
                mobileNumber: '9876543212',
                password: 'Priya@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Amit Kumar',
                email: 'amit.kumar@gmail.com',
                mobileNumber: '9876543213',
                password: 'Amit@123',
                role: 'User',
                status: 'Pending',
                isEmailVerified: false
            }),
            await UsersModel.create({
                name: 'Sneha Patel',
                email: 'sneha.patel@gmail.com',
                mobileNumber: '9876543214',
                password: 'Sneha@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Vikram Singh',
                email: 'vikram.singh@gmail.com',
                mobileNumber: '9876543215',
                password: 'Vikram@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Neha Desai',
                email: 'neha.desai@gmail.com',
                mobileNumber: '9876543216',
                password: 'Neha@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Anil Gupta',
                email: 'anil.gupta@gmail.com',
                mobileNumber: '9876543217',
                password: 'Anil@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Kavita Reddy',
                email: 'kavita.reddy@gmail.com',
                mobileNumber: '9876543218',
                password: 'Kavita@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            }),
            await UsersModel.create({
                name: 'Deepak Joshi',
                email: 'deepak.joshi@gmail.com',
                mobileNumber: '9876543219',
                password: 'Deepak@123',
                role: 'User',
                status: 'Active',
                isEmailVerified: true
            })
        ];
        console.log('✅ Created 9 additional users');
        
        // Create Civil Engineers Group Ahmedabad as the main community
        console.log('\n🏘️  Creating Civil Engineers Group Ahmedabad...');
        const civilEngineersCommunity = await CommunitiesModel.create({
            name: 'Civil Engineers Group Ahmedabad',
            description: 'A professional community for civil engineers in Ahmedabad. Connect with fellow engineers, share knowledge, discuss projects, and grow your professional network. This community brings together experienced professionals, fresh graduates, and students in the field of civil engineering.',
            shortDescription: 'Professional network for civil engineers in Ahmedabad',
            bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
            logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
            managerId: mainUser._id,
            members: [mainUser._id, users[0]._id, users[1]._id, users[3]._id, users[4]._id, users[5]._id],
            pendingRequests: [users[2]._id],
            territory: 'Ahmedabad - Professional Network',
            location: {
                address: 'Engineering Hub, Science City Road',
                city: 'Ahmedabad',
                state: 'Gujarat',
                zipCode: '380060',
                country: 'India',
                coordinates: {
                    lat: 23.0225,
                    lng: 72.5714
                }
            },
            isFeatured: true,
            highlights: [
                'Professional Networking Events',
                'Technical Workshops & Seminars',
                'Project Collaboration Platform',
                'Job Opportunities & Career Growth',
                'Knowledge Sharing Sessions',
                'Industry Expert Talks',
                'Study Groups & Mentorship',
                'Latest Industry Updates'
            ],
            totalUnits: 500,
            occupiedUnits: 0,
            establishedYear: 2024,
            contactInfo: {
                email: 'info@civilengineersahmedabad.com',
                phone: '+91-9876543250',
                website: 'https://civilengineersahmedabad.com'
            },
            status: 'active',
            createdBy: mainUser._id
        });
        console.log('✅ Created main community: Civil Engineers Group Ahmedabad');
        
        // Create 9 additional communities in Ahmedabad and nearby areas
        console.log('\n🏘️  Creating additional communities...');
        const communities = [
            await CommunitiesModel.create({
                name: 'Shivalik Group Housing Society',
                description: 'Premium residential community by Shivalik Group in Ahmedabad. Modern amenities, 24/7 security, and eco-friendly environment for families.',
                shortDescription: 'Premium residential community by Shivalik Group',
                bannerImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
                logo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400',
                managerId: mainUser._id,
                members: [mainUser._id, users[0]._id, users[1]._id, users[3]._id],
                pendingRequests: [users[2]._id],
                territory: 'Ahmedabad - SG Road',
                location: {
                    address: '123 Shivalik Avenue, SG Road',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    zipCode: '380054',
                    country: 'India',
                    coordinates: {
                        lat: 23.0300,
                        lng: 72.5200
                    }
                },
                isFeatured: true,
                highlights: [
                    'Olympic Size Swimming Pool',
                    '24/7 CCTV Surveillance & Security',
                    'Modern Gymnasium with Trainers',
                    'Children Play Area & Park',
                    'Community Clubhouse',
                    'Power Backup',
                    'Rainwater Harvesting',
                    'Visitor Parking'
                ],
                totalUnits: 250,
                occupiedUnits: 198,
                establishedYear: 2018,
                contactInfo: {
                    email: 'info@shivalikgroup.com',
                    phone: '+91-9876543210',
                    website: 'https://shivalikgroup.com'
                },
                status: 'active',
                createdBy: mainUser._id
            }),
            await CommunitiesModel.create({
                name: 'Gandhinagar Civil Engineers Network',
                description: 'Professional network for civil engineers in Gandhinagar. Collaborate on projects, share knowledge, and grow your professional connections.',
                shortDescription: 'Professional network for civil engineers in Gandhinagar',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[0]._id,
                members: [users[0]._id, users[1]._id, users[3]._id, users[4]._id],
                pendingRequests: [users[2]._id],
                territory: 'Gandhinagar - Professional Network',
                location: {
                    address: 'Engineering Complex, Sector 15',
                    city: 'Gandhinagar',
                    state: 'Gujarat',
                    zipCode: '382015',
                    country: 'India',
                    coordinates: {
                        lat: 23.2156,
                        lng: 72.6369
                    }
                },
                isFeatured: true,
                highlights: [
                    'Project Collaboration Platform',
                    'Technical Seminars',
                    'Professional Networking',
                    'Knowledge Sharing',
                    'Career Opportunities'
                ],
                totalUnits: 300,
                occupiedUnits: 0,
                establishedYear: 2023,
                contactInfo: {
                    email: 'info@gandhinagarcivilengineers.com',
                    phone: '+91-9876543220'
                },
                status: 'active',
                createdBy: users[0]._id
            }),
            await CommunitiesModel.create({
                name: 'Vadodara Infrastructure Professionals',
                description: 'Community for infrastructure professionals in Vadodara. Share expertise, collaborate on projects, and stay updated with industry trends.',
                shortDescription: 'Infrastructure professionals community in Vadodara',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[1]._id,
                members: [users[1]._id, users[3]._id, users[4]._id, users[5]._id],
                pendingRequests: [users[2]._id],
                territory: 'Vadodara - Professional Network',
                location: {
                    address: 'Infrastructure Hub, Akota',
                    city: 'Vadodara',
                    state: 'Gujarat',
                    zipCode: '390020',
                    country: 'India',
                    coordinates: {
                        lat: 22.3072,
                        lng: 73.1812
                    }
                },
                isFeatured: false,
                highlights: [
                    'Project Collaboration',
                    'Technical Workshops',
                    'Industry Updates',
                    'Networking Events'
                ],
                totalUnits: 200,
                occupiedUnits: 0,
                establishedYear: 2022,
                contactInfo: {
                    email: 'info@vadodarainfrastructure.com',
                    phone: '+91-9876543230'
                },
                status: 'active',
                createdBy: users[1]._id
            }),
            await CommunitiesModel.create({
                name: 'Surat Construction Network',
                description: 'Professional network for construction professionals in Surat. Connect with peers, share knowledge, and explore collaboration opportunities.',
                shortDescription: 'Construction professionals network in Surat',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[3]._id,
                members: [users[3]._id, users[4]._id, users[5]._id, users[6]._id],
                pendingRequests: [users[2]._id],
                territory: 'Surat - Professional Network',
                location: {
                    address: 'Construction Center, Ring Road',
                    city: 'Surat',
                    state: 'Gujarat',
                    zipCode: '395002',
                    country: 'India',
                    coordinates: {
                        lat: 21.1702,
                        lng: 72.8311
                    }
                },
                isFeatured: false,
                highlights: [
                    'Project Collaboration',
                    'Knowledge Sharing',
                    'Networking Events',
                    'Career Opportunities'
                ],
                totalUnits: 150,
                occupiedUnits: 0,
                establishedYear: 2021,
                contactInfo: {
                    email: 'info@suratconstruction.com',
                    phone: '+91-9876543240'
                },
                status: 'active',
                createdBy: users[3]._id
            }),
            await CommunitiesModel.create({
                name: 'Ahmedabad Green Residency',
                description: 'Eco-friendly residential community in Ahmedabad with sustainable living practices and modern amenities.',
                shortDescription: 'Eco-friendly residential community',
                bannerImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
                logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
                managerId: users[4]._id,
                members: [users[4]._id, users[5]._id, users[6]._id],
                pendingRequests: [users[2]._id],
                territory: 'Ahmedabad - Satellite Area',
                location: {
                    address: '456 Green Lane, Satellite',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    zipCode: '380051',
                    country: 'India',
                    coordinates: {
                        lat: 23.0300,
                        lng: 72.5500
                    }
                },
                isFeatured: true,
                highlights: [
                    'Solar Panel Installation',
                    'Rainwater Harvesting',
                    'Organic Garden',
                    'EV Charging Stations',
                    'Waste Segregation',
                    'Cycling Tracks'
                ],
                totalUnits: 180,
                occupiedUnits: 165,
                establishedYear: 2020,
                contactInfo: {
                    email: 'contact@greenresidency.com',
                    phone: '+91-9876543250',
                    website: 'https://greenresidency.in'
                },
                status: 'active',
                createdBy: users[4]._id
            }),
            await CommunitiesModel.create({
                name: 'Rajkot Engineering Forum',
                description: 'Professional forum for engineers in Rajkot. Share knowledge, collaborate on projects, and grow professionally.',
                shortDescription: 'Engineering forum in Rajkot',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[5]._id,
                members: [users[5]._id, users[6]._id, users[7]._id],
                pendingRequests: [users[2]._id],
                territory: 'Rajkot - Professional Network',
                location: {
                    address: 'Engineering Forum, Kalawad Road',
                    city: 'Rajkot',
                    state: 'Gujarat',
                    zipCode: '360005',
                    country: 'India',
                    coordinates: {
                        lat: 22.3039,
                        lng: 70.8022
                    }
                },
                isFeatured: false,
                highlights: [
                    'Knowledge Sharing',
                    'Project Collaboration',
                    'Technical Seminars',
                    'Networking Events'
                ],
                totalUnits: 120,
                occupiedUnits: 0,
                establishedYear: 2019,
                contactInfo: {
                    email: 'info@rajkotengineering.com',
                    phone: '+91-9876543260'
                },
                status: 'active',
                createdBy: users[5]._id
            }),
            await CommunitiesModel.create({
                name: 'Junagadh Infrastructure Group',
                description: 'Professional group for infrastructure professionals in Junagadh. Collaborate, share knowledge, and grow professionally.',
                shortDescription: 'Infrastructure professionals group in Junagadh',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[6]._id,
                members: [users[6]._id, users[7]._id, users[8]._id],
                pendingRequests: [users[2]._id],
                territory: 'Junagadh - Professional Network',
                location: {
                    address: 'Infrastructure Center, Bypass Road',
                    city: 'Junagadh',
                    state: 'Gujarat',
                    zipCode: '362001',
                    country: 'India',
                    coordinates: {
                        lat: 21.5222,
                        lng: 70.4572
                    }
                },
                isFeatured: false,
                highlights: [
                    'Project Collaboration',
                    'Knowledge Sharing',
                    'Networking Events',
                    'Career Opportunities'
                ],
                totalUnits: 100,
                occupiedUnits: 0,
                establishedYear: 2018,
                contactInfo: {
                    email: 'info@junagadhinfrastructure.com',
                    phone: '+91-9876543270'
                },
                status: 'active',
                createdBy: users[6]._id
            }),
            await CommunitiesModel.create({
                name: 'Bhavnagar Civil Network',
                description: 'Professional network for civil engineers in Bhavnagar. Share knowledge, collaborate on projects, and grow professionally.',
                shortDescription: 'Civil engineers network in Bhavnagar',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[7]._id,
                members: [users[7]._id, users[8]._id],
                pendingRequests: [users[2]._id],
                territory: 'Bhavnagar - Professional Network',
                location: {
                    address: 'Civil Engineering Hub, Nr. University',
                    city: 'Bhavnagar',
                    state: 'Gujarat',
                    zipCode: '364001',
                    country: 'India',
                    coordinates: {
                        lat: 21.7645,
                        lng: 72.1562
                    }
                },
                isFeatured: false,
                highlights: [
                    'Knowledge Sharing',
                    'Project Collaboration',
                    'Technical Seminars',
                    'Networking Events'
                ],
                totalUnits: 80,
                occupiedUnits: 0,
                establishedYear: 2017,
                contactInfo: {
                    email: 'info@bhavnagarcivil.com',
                    phone: '+91-9876543280'
                },
                status: 'active',
                createdBy: users[7]._id
            }),
            await CommunitiesModel.create({
                name: 'Nadiad Engineering Community',
                description: 'Professional community for engineers in Nadiad. Share knowledge, collaborate on projects, and grow professionally.',
                shortDescription: 'Engineering community in Nadiad',
                bannerImage: 'https://images.unsplash.com/photo-1581092160562-40aa28e2ea6e?w=1200',
                logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
                managerId: users[8]._id,
                members: [users[8]._id],
                pendingRequests: [users[2]._id],
                territory: 'Nadiad - Professional Network',
                location: {
                    address: 'Engineering Complex, NH8',
                    city: 'Nadiad',
                    state: 'Gujarat',
                    zipCode: '387001',
                    country: 'India',
                    coordinates: {
                        lat: 22.6886,
                        lng: 72.8619
                    }
                },
                isFeatured: false,
                highlights: [
                    'Knowledge Sharing',
                    'Project Collaboration',
                    'Networking Events',
                    'Career Opportunities'
                ],
                totalUnits: 60,
                occupiedUnits: 0,
                establishedYear: 2016,
                contactInfo: {
                    email: 'info@nadiadengineering.com',
                    phone: '+91-9876543290'
                },
                status: 'active',
                createdBy: users[8]._id
            })
        ];
        console.log('✅ Created 9 additional communities');
        
        // Add all communities to the main array
        const allCommunities = [civilEngineersCommunity, ...communities];
        
        // Create 10 pulses for each community (100 total)
        console.log('\n📢 Creating pulses...');
        let pulseCount = 0;
        for (let i = 0; i < allCommunities.length; i++) {
            const community = allCommunities[i];
            const communityPulses = [];
            
            for (let j = 0; j < 10; j++) {
                const pulse = await PulsesModel.create({
                    title: `Pulse ${j + 1} for ${community.name}`,
                    description: `This is pulse ${j + 1} for the ${community.name} community. It contains important information and updates for all members.`,
                    territory: j % 3 === 0 ? 'Announcement' : j % 3 === 1 ? 'General' : 'Events',
                    communityId: community._id,
                    userId: j % 2 === 0 ? mainUser._id : users[j % users.length]._id,
                    status: j % 5 === 0 ? 'pending' : 'approved',
                    likes: j % 3 === 0 ? [mainUser._id, users[0]._id] : j % 3 === 1 ? [users[1]._id, users[2]._id] : [],
                    comments: j % 4 === 0 ? [
                        { userId: users[0]._id, text: 'Great information!', createdAt: new Date() },
                        { userId: users[1]._id, text: 'Thanks for sharing.', createdAt: new Date() }
                    ] : []
                });
                communityPulses.push(pulse._id);
                pulseCount++;
            }
            
            // Update community with pulses
            await CommunitiesModel.findByIdAndUpdate(community._id, { $push: { pulses: { $each: communityPulses } } });
        }
        console.log(`✅ Created ${pulseCount} pulses`);
        
        // Create 10 marketplace listings for each community (100 total)
        console.log('\n🛒 Creating marketplace listings...');
        let listingCount = 0;
        for (let i = 0; i < allCommunities.length; i++) {
            const community = allCommunities[i];
            const communityListings = [];
            
            for (let j = 0; j < 10; j++) {
                const listing = await MarketplaceListingsModel.create({
                    type: j % 2 === 0 ? 'sell' : 'buy',
                    title: `${j % 2 === 0 ? 'Selling' : 'Looking for'} item ${j + 1} in ${community.name}`,
                    description: `This is a ${j % 2 === 0 ? 'sale' : 'request'} listing for item ${j + 1} in the ${community.name} community.`,
                    price: j % 2 === 0 ? 1000 + (j * 500) : 0,
                    attachment: j % 3 === 0 ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' : undefined,
                    communityId: community._id,
                    userId: j % 2 === 0 ? mainUser._id : users[j % users.length]._id,
                    status: j % 4 === 0 ? 'pending' : 'approved'
                });
                communityListings.push(listing._id);
                listingCount++;
            }
            
            // Update community with listings
            await CommunitiesModel.findByIdAndUpdate(community._id, { $push: { marketplaceListings: { $each: communityListings } } });
        }
        console.log(`✅ Created ${listingCount} marketplace listings`);
        
        // Create 10 events for each community (100 total)
        console.log('\n📅 Creating events...');
        let eventCount = 0;
        for (let i = 0; i < allCommunities.length; i++) {
            const community = allCommunities[i];
            const communityEvents = [];
            
            for (let j = 0; j < 10; j++) {
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + (i * 10) + j);
                
                const event = await EventsModel.create({
                    title: `Event ${j + 1} for ${community.name}`,
                    description: `This is event ${j + 1} for the ${community.name} community. Join us for this exciting event!`,
                    communityId: community._id,
                    eventDate: eventDate,
                    startTime: '10:00 AM',
                    endTime: '2:00 PM',
                    location: `${community.location.address}, ${community.location.city}`,
                    images: j % 2 === 0 ? ['https://images.unsplash.com/photo-1583241800698-5b0e9b1fe0f5?w=800'] : undefined,
                    maxParticipants: 50 + (j * 10),
                    participants: [
                        { userId: mainUser._id, status: 'confirmed', registeredAt: new Date() },
                        { userId: users[0]._id, status: 'confirmed', registeredAt: new Date() },
                        { userId: users[1]._id, status: j % 3 === 0 ? 'pending' : 'confirmed', registeredAt: new Date() }
                    ],
                    attendance: j % 5 === 0 ? [
                        { userId: mainUser._id, markedAt: new Date(), verified: true },
                        { userId: users[0]._id, markedAt: new Date(), verified: true }
                    ] : [],
                    eventType: j % 4 === 0 ? 'Festival' : j % 4 === 1 ? 'Educational' : j % 4 === 2 ? 'Social' : 'Meeting',
                    status: eventDate > new Date() ? 'Upcoming' : 'Completed',
                    createdBy: j % 2 === 0 ? mainUser._id : users[j % users.length]._id
                });
                communityEvents.push(event._id);
                eventCount++;
            }
            
            // Update community with events
            await CommunitiesModel.findByIdAndUpdate(community._id, { $push: { events: { $each: communityEvents } } });
        }
        console.log(`✅ Created ${eventCount} events`);
        
        // Create directory entries for Civil Engineers Group Ahmedabad
        console.log('\n📖 Creating directory entries...');
        const directoryEntries = [];
        const serviceTypes = ['plumber', 'electrician', 'security', 'housekeeping', 'carpenter', 'painter', 'gardener', 'mechanic', 'other'];
        for (let i = 0; i < 10; i++) {
            const entry = await DirectoryEntriesModel.create({
                name: `${i % 2 === 0 ? 'Shivalik' : 'Ahmedabad'} ${['Service', 'Professional', 'Expert', 'Specialist', 'Provider'][i % 5]} ${i + 1}`,
                serviceType: serviceTypes[i % serviceTypes.length],
                contactNumber: `+91-98765432${10 + i}`,
                email: `info${i + 1}@${i % 2 === 0 ? 'shivalik' : 'ahmedabad'}${['service', 'professional', 'expert', 'specialist', 'provider'][i % 5]}.com`,
                address: `${100 + i} ${['Main', 'First', 'Second', 'Third', 'Fourth'][i % 5]} Street, Ahmedabad`,
                availabilityHours: 'Mon-Sat: 9 AM - 6 PM',
                verified: i % 3 !== 0,
                communityId: civilEngineersCommunity._id,
                addedBy: i % 2 === 0 ? mainUser._id : users[i % users.length]._id
            });
            directoryEntries.push(entry._id);
        }
        console.log(`✅ Created ${directoryEntries.length} directory entries`);
        
        // Create community managers
        console.log('\n👨‍💼 Creating community managers...');
        let managerCount = 0;
        for (let i = 0; i < allCommunities.length; i++) {
            const community = allCommunities[i];
            // Each community gets 1-2 managers
            const managerCountForCommunity = 1 + (i % 2);
            
            for (let j = 0; j < managerCountForCommunity; j++) {
                const managerUser = j === 0 ? mainUser : users[(i + j) % users.length];
                await CommunityManagersModel.create({
                    userId: managerUser._id,
                    communityId: community._id,
                    assignedBy: mainUser._id,
                    status: 'Active',
                    permissions: {
                        canApproveJoinRequests: true,
                        canManagePosts: true,
                        canManageUsers: true,
                        canCreateEvents: true,
                        canManageReports: true
                    }
                });
                managerCount++;
            }
        }
        console.log(`✅ Created ${managerCount} community managers`);
        
        // Create join requests
        console.log('\n📝 Creating join requests...');
        let requestCount = 0;
        for (let i = 0; i < allCommunities.length; i++) {
            const community = allCommunities[i];
            // Each community gets 1-3 join requests
            const requestCountForCommunity = 1 + (i % 3);
            
            for (let j = 0; j < requestCountForCommunity; j++) {
                await CommunityJoinRequestsModel.create({
                    userId: users[(i + j) % users.length]._id,
                    communityId: community._id,
                    status: j % 3 === 0 ? 'Pending' : j % 3 === 1 ? 'Approved' : 'Rejected',
                    message: `Interested in joining ${community.name} community`
                });
                requestCount++;
            }
        }
        console.log(`✅ Created ${requestCount} join requests`);
        
        // Create reports
        console.log('\n🚩 Creating reports...');
        let reportCount = 0;
        for (let i = 0; i < 10; i++) {
            await ReportsModel.create({
                title: `Report ${i + 1}: ${['Inappropriate content', 'Spam', 'Harassment', 'Other'][i % 4]}`,
                description: `This is report ${i + 1} for inappropriate content in the community.`,
                type: ['Financial', 'Maintenance', 'Security', 'Survey', 'Facility', 'Other'][i % 6],
                communityId: allCommunities[i % allCommunities.length]._id,
                createdBy: users[i % users.length]._id,
                status: i % 4 === 0 ? 'Draft' : i % 4 === 1 ? 'Pending' : i % 4 === 2 ? 'Approved' : 'Rejected',
                priority: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
                approvedBy: i % 4 >= 2 ? mainUser._id : undefined,
                approvedAt: i % 4 >= 2 ? new Date() : undefined
            });
            reportCount++;
        }
        console.log(`✅ Created ${reportCount} reports`);
        
        // Create role change requests
        console.log('\n📝 Creating role change requests...');
        let roleRequestCount = 0;
        for (let i = 0; i < 10; i++) {
            await RoleChangeRequestsModel.create({
                userId: users[i % users.length]._id,
                currentRole: 'User',
                communityId: allCommunities[i % allCommunities.length]._id,
                requestedRole: i % 2 === 0 ? 'Manager' : 'Admin',
                reason: `Requesting ${i % 2 === 0 ? 'Manager' : 'Admin'} role for better community management`,
                status: i % 4 === 0 ? 'Pending' : i % 4 === 1 ? 'Approved' : 'Rejected',
                reviewedBy: i % 4 !== 0 ? mainUser._id : undefined,
                reviewedAt: i % 4 !== 0 ? new Date() : undefined
            });
            roleRequestCount++;
        }
        console.log(`✅ Created ${roleRequestCount} role change requests`);
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Users: ${1 + users.length}`);
        console.log(`   - Communities: ${allCommunities.length}`);
        console.log(`   - Pulses: ${pulseCount}`);
        console.log(`   - Marketplace Listings: ${listingCount}`);
        console.log(`   - Events: ${eventCount}`);
        console.log(`   - Directory Entries: ${directoryEntries.length}`);
        console.log(`   - Community Managers: ${managerCount}`);
        console.log(`   - Join Requests: ${requestCount}`);
        console.log(`   - Reports: ${reportCount}`);
        console.log(`   - Role Change Requests: ${roleRequestCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error in clearAndSeedDatabase:', error);
        process.exit(1);
    }
}

// Run the script
clearAndSeedDatabase();