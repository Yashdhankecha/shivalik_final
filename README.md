# 🏘️ Shivalik Community Management Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

**A comprehensive community management system for real estate communities with moderation, marketplace, events, and social features.**

[Features](#-key-features) • [Installation](#-installation) • [Documentation](#-documentation) • [API Reference](#-api-documentation) • [Demo](#-demo)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Key Modules](#-key-modules)
- [Screenshots & Demo](#-screenshots--demo)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Shivalik Community Management Platform** is a full-stack web application designed to streamline community management for real estate communities. It provides a centralized platform for residents, managers, and administrators to interact, manage events, buy/sell items, share updates, and maintain a thriving community ecosystem.

### What Makes This Special?

- ✅ **Complete Moderation System** - Real-time dashboard for managers to approve/reject content
- ✅ **Integrated Marketplace** - Buy/sell properties with in-app chat functionality
- ✅ **Event Management** - QR code-based event registration and attendance tracking
- ✅ **Social Feed (Pulses)** - Community posts with like, comment, and approval workflow
- ✅ **Service Directory** - Curated directory of service providers
- ✅ **Role-Based Access Control** - Granular permissions for Admin, Manager, and Users
- ✅ **Modern UI/UX** - Responsive design with Tailwind CSS and Radix UI components

---

## 🎯 Problem Statement

Traditional community management relies on:
- **Fragmented Communication** - WhatsApp groups, emails, notice boards
- **Manual Processes** - Paper-based approvals, physical attendance tracking
- **No Centralized Platform** - Multiple tools for different needs
- **Limited Transparency** - Residents unaware of pending approvals
- **Inefficient Moderation** - Managers struggle to review content quickly

---

## 💡 Solution

A unified platform that:
- **Centralizes Communication** - All community interactions in one place
- **Automates Workflows** - Digital approval processes with notifications
- **Enables Commerce** - Built-in marketplace for community transactions
- **Streamlines Events** - QR code-based registration and attendance
- **Provides Transparency** - Real-time status updates for all actions
- **Facilitates Moderation** - Dedicated dashboard for quick content review

---

## ✨ Key Features

### 🏠 **Community Management**
- Create and manage multiple communities
- Community profiles with amenities, location, and highlights
- Featured communities showcase
- Join request system with approval workflow
- Member management and role assignment

### 📱 **Pulses (Social Feed)**
- Create and share community posts
- Like and comment on posts
- File attachments support
- Manager approval workflow
- Real-time updates

### 📅 **Event Management**
- Create and manage community events
- QR code-based registration
- Digital attendance tracking
- Event calendar and reminders
- Registration approval system

### 🛒 **Marketplace**
- Buy/sell property listings
- Image uploads for listings
- In-app chat between buyers and sellers
- Listing approval workflow
- Status management (pending, approved, sold, closed)

### 📞 **Service Directory**
- Curated directory of service providers
- Search and filter by service type
- Contact information and details
- Manager-managed entries

### 👥 **User Management**
- Role-based access control (Admin, Manager, User)
- User registration with OTP verification
- Profile management
- Password reset functionality
- Google OAuth integration

### 🛡️ **Moderation Dashboard**
- **Overview Tab** - All pending items in one view
- **Users Tab** - Approve/reject join requests
- **Pulses Tab** - Moderate community posts
- **Marketplace Tab** - Review listings
- Quick stats and counters
- Optional comments/feedback on actions

### 🔐 **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization middleware
- CORS protection
- Rate limiting
- Input validation and sanitization

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS 3.4.11
- **State Management**: Redux Toolkit + Redux Saga
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts, Chart.js

### **Backend**
- **Runtime**: Node.js 20.18.0
- **Framework**: Express.js 4.21.1
- **Database**: MongoDB 8.7.1 (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Express-fileupload, Multer
- **Email**: Nodemailer, SendGrid
- **QR Codes**: QRCode library
- **Validation**: Express-validator
- **Security**: Helmet, HPP, CORS
- **Logging**: Winston

### **DevOps & Tools**
- **Package Manager**: npm
- **Process Manager**: Nodemon (development)
- **Database Migrations**: migrate-mongo
- **Version Control**: Git
- **Environment**: dotenv

---

## 🏗️ Architecture

### **System Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Admin   │  │ Manager  │  │   User   │  │  Guest  │ │
│  │  Panel   │  │  Panel   │  │Dashboard │  │ Landing │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ REST API (JWT Auth)
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Backend (Express.js)                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                  │  │
│  │         (JWT Verification, Role Check)             │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Admin   │  │ Manager  │  │Community │  │  Auth   │  │
│  │Controller│  │Controller│  │Controller│  │Controller│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────────────┐
│              MongoDB Database                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Users   │  │Communities│ │ Pulses   │  │ Events  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │Marketplace│ │Directory │ │JoinReqs  │  │Reports  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────┘
```

### **Database Schema**

- **Users** - User accounts, roles, authentication
- **Communities** - Community profiles, members, settings
- **Pulses** - Community posts, likes, comments
- **Events** - Event details, registrations, attendance
- **MarketplaceListings** - Buy/sell listings, status
- **MarketplaceChats** - Chat conversations for listings
- **DirectoryEntries** - Service provider directory
- **CommunityJoinRequests** - Join request workflow
- **CommunityManagers** - Manager assignments and permissions
- **Reports** - Community reports and issues

---

## 🚀 Installation

### **Prerequisites**

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn
- Git

### **Step 1: Clone the Repository**

```bash
git clone <repository-url>
cd sivalik_final
```

### **Step 2: Backend Setup**

```bash
# Navigate to backend
cd server/services/community_services

# Install dependencies
npm install

# Create environment file
cp .env.example .env.dev

# Edit .env.dev with your configuration
# Required variables:
# - PORT=11001
# - ENTRYTRACKING_DB_URL=mongodb://localhost:27017/shivalik_db
# - JWT_SECRET=your_secret_key
# - JWT_SECRET_USER=your_user_secret
# - REFRESH_TOKEN_SECRET=your_refresh_secret
# - EMAIL_USER=your_email@gmail.com
# - EMAIL_PASS=your_app_password

# Start the server
npm run start:dev
```

The backend will start on `http://localhost:11001`

### **Step 3: Frontend Setup**

```bash
# Navigate to frontend (from project root)
cd client

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:11001" > .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:8080` (or port shown in terminal)

### **Step 4: Seed Sample Data (Optional)**

```bash
# From backend directory
cd server/services/community_services

# Seed landing page data
npm run seed:landing

# Seed community data
npm run seed:community
```

### **Step 5: Access the Application**

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:11001
- **Landing Page**: http://localhost:8080/
- **Admin Panel**: http://localhost:8080/admin (requires admin login)
- **Manager Panel**: http://localhost:8080/manager (requires manager login)

---

## 📁 Project Structure

```
sivalik_final/
│
├── client/                          # Frontend React Application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── apis/                   # API service layer
│   │   │   ├── admin.ts           # Admin API methods
│   │   │   ├── auth.ts            # Authentication API
│   │   │   ├── community.ts       # Community API
│   │   │   └── manager.ts         # Manager API
│   │   ├── components/            # React components
│   │   │   ├── community/         # Community-specific components
│   │   │   │   ├── Pulses/       # Pulse feed components
│   │   │   │   ├── Events/       # Event components
│   │   │   │   ├── Marketplace/  # Marketplace components
│   │   │   │   └── Directory/    # Directory components
│   │   │   ├── ui/               # Reusable UI components
│   │   │   └── landing/          # Landing page components
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/            # Admin pages
│   │   │   ├── manager/          # Manager pages
│   │   │   │   └── ModerationDashboard.tsx
│   │   │   ├── auth/             # Authentication pages
│   │   │   └── CommunityDashboard.tsx
│   │   ├── routing/              # Route configuration
│   │   ├── store/                # Redux store
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── server/                         # Backend Services
│   └── services/
│       └── community_services/   # Community Management Service
│           ├── src/
│           │   ├── controllers/  # Route handlers
│           │   │   ├── adminController.js
│           │   │   ├── managerController.js
│           │   │   ├── communityController.js
│           │   │   ├── pulsesController.js
│           │   │   ├── eventsController.js
│           │   │   ├── marketplaceController.js
│           │   │   └── directoryController.js
│           │   ├── models/       # Mongoose models
│           │   │   ├── Users.js
│           │   │   ├── Communities.js
│           │   │   ├── Pulses.js
│           │   │   ├── Events.js
│           │   │   ├── MarketplaceListings.js
│           │   │   └── ...
│           │   ├── routes/       # API routes
│           │   │   ├── adminRoutes.js
│           │   │   ├── managerRoutes.js
│           │   │   ├── communityRoutes.js
│           │   │   └── ...
│           │   ├── middleware/  # Express middleware
│           │   │   ├── authMiddleware.js
│           │   │   └── managerMiddleware.js
│           │   ├── libs/        # Third-party integrations
│           │   │   ├── sendMail.js
│           │   │   └── sendOtp.js
│           │   └── index.js     # Application entry point
│           ├── package.json
│           └── .env.dev         # Environment variables
│
├── README.md                      # This file
├── API_DOCUMENTATION.md          # API reference
├── COMMUNITY_MODULES_IMPLEMENTATION.md
├── QUICK_START_GUIDE.md
└── TROUBLESHOOTING_LOGIN_ERROR.md
```

---

## 📚 API Documentation

### **Base URL**
```
http://localhost:11001/api/v1
```

### **Authentication Endpoints**

```
POST   /auth/register              # Register new user
POST   /auth/login                 # User login
POST   /auth/verify-otp            # Verify OTP
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset password
POST   /auth/google-login          # Google OAuth login
```

### **Community Endpoints**

```
GET    /community/communities                    # Get all communities
GET    /community/communities/featured           # Get featured communities
GET    /community/communities/:id                # Get community details
POST   /community/communities/:id/join-request   # Request to join community
```

### **Pulses (Posts) Endpoints**

```
GET    /community/pulses/:communityId           # Get pulses
POST   /community/pulses/create                 # Create pulse
PUT    /community/pulses/approve/:pulseId       # Approve pulse
POST   /community/pulses/:pulseId/like          # Like/unlike pulse
POST   /community/pulses/:pulseId/comment       # Add comment
```

### **Events Endpoints**

```
GET    /community/events/:communityId                    # Get events
POST   /community/events/create                         # Create event
POST   /community/events/register/:eventId              # Register for event
GET    /community/events/registration/:eventId          # Get registration
POST   /community/events/attendance/mark                 # Mark attendance (QR)
GET    /community/events/attendance/:eventId            # Get attendance list
```

### **Marketplace Endpoints**

```
GET    /community/marketplace/:communityId              # Get listings
POST   /community/marketplace/listing/create            # Create listing
POST   /community/marketplace/chat/:listingId           # Start chat
POST   /community/marketplace/chat/message/:listingId   # Send message
GET    /community/marketplace/chat/:listingId           # Get messages
```

### **Manager Endpoints**

```
GET    /manager/moderation-dashboard/:communityId       # Get moderation dashboard
GET    /manager/community-join-requests/:communityId    # Get join requests
PUT    /manager/community-join-requests/:communityId/:requestId/approve
PUT    /manager/community-join-requests/:communityId/:requestId/reject
GET    /manager/posts/:communityId                       # Get posts
PUT    /manager/posts/:communityId/:postId/approve       # Approve post
PUT    /manager/posts/:communityId/:postId/reject        # Reject post
GET    /manager/marketplace/listings/:communityId       # Get listings
PUT    /manager/marketplace/listings/:communityId/:listingId/approve
PUT    /manager/marketplace/listings/:communityId/:listingId/reject
```

### **Admin Endpoints**

```
GET    /admin/users                                    # Get all users
GET    /admin/communities                              # Get all communities
GET    /admin/join-requests                            # Get all join requests
PUT    /admin/join-requests/:requestId/approve         # Approve request
GET    /admin/pulse-approvals                          # Get pulse approvals
GET    /admin/marketplace-approvals                    # Get marketplace approvals
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 👥 User Roles & Permissions

### **Admin (SuperAdmin/Admin)**
- Full system access
- Manage all communities
- Approve/reject all content
- Manage users and roles
- Assign managers to communities
- View system-wide analytics

### **Manager**
- Manage assigned communities
- Approve/reject join requests
- Moderate pulses (posts)
- Approve/reject marketplace listings
- Create and manage events
- View community reports
- Access moderation dashboard

### **User (Member)**
- Join communities (with approval)
- Create pulses (pending approval)
- Register for events
- Create marketplace listings (pending approval)
- View community directory
- Chat with other members

### **Guest**
- View landing page
- Browse featured communities
- View public events
- View public announcements
- Register new account

---

## 🎯 Key Modules

### **1. Moderation Dashboard**
A comprehensive dashboard for managers to review and moderate all community content:

- **Overview Tab**: Shows all pending items (users, pulses, listings) in one view
- **Users Tab**: Review and approve/reject join requests
- **Pulses Tab**: Moderate community posts
- **Marketplace Tab**: Review and approve listings
- **Quick Stats**: Real-time counters for pending items
- **Action Logging**: All actions tracked with timestamps and reviewer info

### **2. Pulses (Social Feed)**
Community news feed with:
- Post creation with text and file attachments
- Like and comment functionality
- Manager approval workflow
- Real-time updates
- Territory-based categorization

### **3. Event Management**
Complete event system with:
- Event creation and management
- QR code-based registration
- Digital attendance tracking
- Registration approval workflow
- Event calendar and reminders

### **4. Marketplace**
Buy/sell platform with:
- Property listing creation
- Image uploads
- In-app chat between buyers/sellers
- Listing approval workflow
- Status management (pending, approved, sold, closed)

### **5. Service Directory**
Curated directory featuring:
- Service provider listings
- Search and filter functionality
- Contact information
- Manager-managed entries

---

## 📸 Screenshots & Demo

### **Landing Page**
- Hero section with call-to-action
- Featured communities showcase
- Recent events and announcements
- Amenities display

### **Moderation Dashboard**
- Clean tabbed interface
- Quick stats cards
- Pending items list
- Approve/reject actions with comments

### **Community Dashboard**
- Tabbed interface (Pulses, Events, Marketplace, Directory)
- Real-time updates
- Role-based features

### **Admin Panel**
- User management
- Community management
- Content approvals
- Analytics dashboard

---

## 🔮 Future Enhancements

### **Short Term**
- [ ] Push notifications for approvals
- [ ] Email notifications for all actions
- [ ] Advanced search and filters
- [ ] Mobile app (React Native)
- [ ] Real-time chat improvements
- [ ] Payment integration for marketplace

### **Long Term**
- [ ] AI-powered content moderation
- [ ] Analytics and reporting dashboard
- [ ] Multi-language support
- [ ] Video streaming for events
- [ ] Integration with smart home devices
- [ ] Blockchain-based verification
- [ ] Advanced analytics and insights

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Team

**Shivalik Development Team**

- **Backend Development**: Node.js, Express.js, MongoDB
- **Frontend Development**: React, TypeScript, Tailwind CSS
- **UI/UX Design**: Modern, responsive design
- **DevOps**: Environment setup, deployment configuration

---

## 📞 Support & Contact

For questions, issues, or contributions:
- **Email**: support@shivalik.io
- **Documentation**: See project documentation files
- **Issues**: Open an issue on GitHub

---

## 🎉 Acknowledgments

- **Technologies**: React, Node.js, MongoDB, Express.js
- **UI Libraries**: Radix UI, Tailwind CSS
- **Icons**: Lucide React
- **Community**: All contributors and testers

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 200+
- **API Endpoints**: 100+
- **Database Models**: 15+
- **User Roles**: 3 (Admin, Manager, User)
- **Main Modules**: 5 (Pulses, Events, Marketplace, Directory, Moderation)

---

## ✅ Project Status

- ✅ **Authentication System** - Complete
- ✅ **User Management** - Complete
- ✅ **Community Management** - Complete
- ✅ **Pulses Module** - Complete
- ✅ **Events Module** - Complete
- ✅ **Marketplace Module** - Complete
- ✅ **Directory Module** - Complete
- ✅ **Moderation Dashboard** - Complete
- ✅ **Admin Panel** - Complete
- ✅ **Manager Panel** - Complete
- ✅ **Landing Page** - Complete
- 🔄 **Mobile App** - Planned
- 🔄 **Advanced Analytics** - Planned

---

<div align="center">

**Built with ❤️ by the Shivalik Team**

⭐ Star us on GitHub if you find this project helpful!

</div>

