# Web Video Platform - Comprehensive Project Report

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [System Architecture](#system-architecture)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Database Design](#database-design)
8. [Security Implementation](#security-implementation)
9. [Features & Functionality](#features--functionality)
10. [API Documentation](#api-documentation)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Development Setup](#development-setup)
13. [Testing](#testing)
14. [Performance Optimizations](#performance-optimizations)
15. [Challenges & Solutions](#challenges--solutions)
16. [Future Enhancements](#future-enhancements)
17. [Conclusion](#conclusion)

---

## Executive Summary

This project is a full-stack web video platform application developed as part of the IT093IU Web Application Development course. The application provides a comprehensive video streaming platform with user management, video upload/streaming, social features (comments, ratings, subscriptions), and administrative capabilities. The system is built using modern web technologies with a React frontend, Spring Boot backend, and MySQL database, all containerized using Docker Compose for easy deployment and scalability.

**Key Highlights:**
- Full-stack video streaming platform with user authentication and authorization
- RESTful API architecture with JWT-based security
- Responsive React frontend with modern UI/UX
- Docker containerization for easy deployment
- Cloudinary integration for media storage
- Role-based access control (Admin, User)
- Real-time features: comments, ratings, subscriptions, notifications

---

## Project Overview

### Project Name
Web Video Platform (HCMIU Web Application Development Project)

### Project Type
Full-stack web application for video streaming and management

### Objectives
1. Develop a scalable video streaming platform
2. Implement secure user authentication and authorization
3. Provide video management capabilities (CRUD operations)
4. Enable social interactions (comments, ratings, subscriptions)
5. Create an intuitive and responsive user interface
6. Implement administrative features for content management

### Target Users
- **Regular Users**: Browse, watch, upload videos, interact with content
- **Administrators**: Manage users, videos, and platform settings

---

## Architecture & Technology Stack

### Frontend Technologies
- **Framework**: React 18.2.0
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS 4.1.4
- **State Management**: Zustand 5.0.3
- **Routing**: React Router DOM 7.5.0
- **HTTP Client**: Axios 1.8.4
- **Video Player**: React Player 2.16.0
- **UI Components**: Headless UI 2.2.1, Heroicons 2.2.0
- **Animations**: Framer Motion 12.9.2
- **Notifications**: React Hot Toast 2.5.2
- **Emoji Support**: Emoji Mart 5.6.0

### Backend Technologies
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 21
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.0
- **Connection Pooling**: HikariCP
- **Validation**: Jakarta Validation API 3.0.2, Hibernate Validator 8.0.0
- **JWT**: JJWT 0.11.5
- **Cloud Storage**: Cloudinary SDK 1.36.0
- **Email Service**: Spring Mail

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: MySQL 8.0
- **File Storage**: Cloudinary (for videos, images, and avatars)
- **Version Control**: Git

### External Services
- **Cloudinary**: Video, image, and avatar storage (cloud-based)
- **Email Service**: Gmail SMTP for password reset

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│                    (React Application)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS/HTTP
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      Nginx Reverse Proxy                    │
│              (Load Balancing & SSL Termination)             │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
                │ /api/*                    │ /*
                │                           │
┌───────────────▼──────────────┐  ┌─────────▼─────────────────┐
│    Spring Boot Backend       │  │   React Frontend (Vite)   │
│    (Port 8080)               │  │   (Port 5173)             │
│                              │  │                           │
│  - REST API                  │  │  - React Components       │
│  - JWT Authentication        │  │  - State Management       │
│  - Business Logic            │  │  - UI/UX                  │
│  - File Upload Handling      │  │                           │
└───────────────┬──────────────┘  └───────────────────────────┘
                │
                │ JDBC
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    MySQL Database (Port 3306)               │
│                                                             │
│  - User Data                                                │
│  - Video Metadata                                           │
│  - Comments & Ratings                                       │
│  - Subscriptions & Watchlists                               │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                   │
│  │  Cloudinary  │         │  Gmail SMTP  │                   │
│  │  (Images)    │         │  (Email)     │                   │
│  └──────────────┘         └──────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── VideoCarousel.jsx
│   ├── VideoList.jsx
│   ├── CustomVideoPlayer.jsx
│   ├── CommentItem.jsx
│   └── ...
├── pages/              # Page-level components
│   ├── HomePage.jsx
│   ├── WatchPage.jsx
│   ├── ProfilePage.jsx
│   ├── AdminPage.jsx
│   └── ...
├── stores/             # Zustand state management
│   ├── useUserStore.js
│   ├── useVideoStore.js
│   ├── useCommentStore.js
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useDebounce.js
│   ├── useInfiniteScroll.js
│   └── ...
├── services/           # Business logic services
│   ├── videoCacheService.js
│   └── videoQualityService.js
├── config/             # Configuration files
│   ├── axios.js
│   └── format.js
└── utils/              # Utility functions
    ├── validation.js
    └── imageUtils.js
```

#### Backend Architecture
```
src/main/java/com/example/hcmiuweb/
├── controllers/        # REST API endpoints
│   ├── AuthController.java
│   ├── VideoController.java
│   ├── CommentController.java
│   └── ...
├── services/           # Business logic layer
│   ├── VideoService.java
│   ├── UserService.java
│   ├── CommentService.java
│   └── ...
├── repositories/       # Data access layer
│   ├── VideoRepository.java
│   ├── UserRepository.java
│   └── ...
├── entities/           # JPA entities (database models)
│   ├── User.java
│   ├── Video.java
│   ├── Comment.java
│   └── ...
├── dtos/               # Data Transfer Objects
│   ├── VideoDTO.java
│   ├── CommentDTO.java
│   └── ...
├── config/             # Configuration classes
│   ├── SecurityConfig.java
│   ├── WebConfig.java
│   └── jwt/
└── payload/            # Request/Response models
    ├── request/
    └── response/
```

---

## Backend Implementation

### Core Components

#### 1. Entity Layer (Database Models)

**User Entity**
- Fields: id, username, email, password, registrationDate, avatar, role, resetToken, resetTokenExpiry
- Relationships: Many-to-One with Role, One-to-Many with Videos, Comments, Subscriptions

**Video Entity**
- Fields: id, title, description, uploadDate, duration, url, thumbnailUrl, viewCount
- Relationships: Many-to-One with User (uploader) and Category, One-to-Many with Ratings, Tags, Comments

**Comment Entity**
- Fields: id, content, commentDate
- Relationships: Many-to-One with User and Video, One-to-Many with CommentRatings

**Other Entities**
- Category, Tag, VideoTag, VideoRating, CommentRating, Subscription, WatchList, Notification, Role

#### 2. Service Layer

**VideoService**
- CRUD operations for videos
- Search functionality
- View count management
- Similar videos recommendation
- Rating aggregation

**UserService**
- User management
- Profile updates
- Password management

**CommentService**
- Comment creation, update, deletion
- Comment retrieval with pagination

**RatingService**
- Video and comment rating management
- Average rating calculations

**EmailService**
- Password reset email functionality
- Email template management

**CloudinaryService**
- Image upload to Cloudinary
- Avatar management
- Video upload to Cloudinary (videos stored in cloud storage)

#### 3. Controller Layer

**AuthController** (`/api/auth`)
- `POST /signup` - User registration
- `POST /signin` - User authentication (JWT)
- `POST /logout` - User logout
- `GET /me` - Get current user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

**VideoController** (`/api/videos`)
- `GET /` - Get all videos
- `GET /{id}` - Get video by ID (increments view count)
- `GET /uploader/{uploaderId}` - Get videos by uploader
- `GET /category/{categoryId}` - Get videos by category
- `GET /search?title={title}` - Search videos
- `POST /` - Create video (authenticated)
- `PUT /{id}` - Update video (owner or admin)
- `DELETE /{id}` - Delete video (owner or admin)
- `POST /{id}/view` - Increment view count
- `GET /{id}/similar` - Get similar videos

**CommentController** (`/api/comments`)
- `GET /video/{videoId}` - Get comments for video
- `POST /` - Create comment
- `PUT /{id}` - Update comment
- `DELETE /{id}` - Delete comment

**RatingController** (`/api/ratings`)
- `POST /video` - Rate a video
- `POST /comment` - Rate a comment
- `GET /video/{videoId}` - Get video rating

**FileUploadController** (`/api/uploads`)
- `POST /video` - Upload video file to Cloudinary
- `POST /avatar` - Upload avatar image to Cloudinary
- `POST /avatar-url` - Set avatar from URL
- `POST /thumbnail` - Upload thumbnail image to Cloudinary

**Other Controllers**
- CategoryController, TagController, SubscriptionController, WatchListController, NotificationController, UserController

#### 4. Security Configuration

**SecurityConfig**
- JWT-based authentication
- CORS configuration for cross-origin requests
- Role-based access control (ROLE_USER, ROLE_ADMIN)
- Password encryption using BCrypt
- Stateless session management

**JWT Implementation**
- Token generation and validation
- HTTP-only cookie storage for security
- Token expiration (24 hours)
- Refresh token mechanism

**Authentication Flow**
1. User submits credentials
2. Backend validates credentials
3. JWT token generated and stored in HTTP-only cookie
4. Token included in subsequent requests
5. Token validated on each protected endpoint

---

## Frontend Implementation

### Key Features

#### 1. Routing & Navigation
- React Router DOM for client-side routing
- Protected routes (authentication required)
- Admin-only routes
- Loading states during navigation
- Scroll-to-top on route change

**Routes:**
- `/` - Home page (different for authenticated/unauthenticated users)
- `/login` - Login page
- `/signup` - Registration page
- `/watch/:id` - Video watch page
- `/search` - Search results page
- `/profile` - User profile page
- `/watchlist/:id` - User watchlist
- `/dashboard/:id` - User dashboard
- `/admin/:id` - Admin panel

#### 2. State Management (Zustand)

**useUserStore**
- User authentication state
- User profile data
- Login/logout functions
- Token management
- Role checking (isAdmin)

**useVideoStore**
- Video list management
- Video CRUD operations
- Video fetching (all, by user, by category)
- Search functionality
- Loading states

**useCommentStore**
- Comment management
- Comment CRUD operations
- Comment pagination

**useCategoryStore**
- Category list management
- Category fetching

**useWatchListStore**
- Watchlist management
- Add/remove videos from watchlist

#### 3. UI Components

**VideoCarousel**
- Horizontal scrolling video carousel
- Category-based filtering
- Responsive design
- Lazy loading

**CustomVideoPlayer**
- React Player integration
- Playback controls
- Volume management
- Quality selection
- Fullscreen support

**VideoList**
- Grid/list view of videos
- Video editing (inline)
- Video deletion
- Thumbnail display
- View count display

**CommentItem**
- Comment display
- Comment editing
- Comment deletion
- Like/dislike functionality
- Nested comments support

**CreateVideoForm**
- Video upload (file or URL)
- Thumbnail selection (preset or custom URL)
- Category selection
- Form validation
- Upload progress tracking

**AvatarSelector**
- Preset avatar selection
- Custom image upload to Cloudinary
- Image preview

**ThumbnailSelector**
- Preset thumbnail selection
- Custom URL input
- Preview functionality

#### 4. Custom Hooks

**useDebounce**
- Debounce search input
- Performance optimization

**useInfiniteScroll**
- Infinite scrolling for video lists
- Lazy loading

**useNavigateWithLoading**
- Navigation with loading bar
- Better UX during route changes

**useVideoVolume**
- Video volume persistence
- User preference storage

**useCache**
- API response caching
- Reduced server load

#### 5. Services

**videoCacheService**
- Video data caching
- Cache invalidation
- Performance optimization

**videoQualityService**
- Video quality management
- Adaptive streaming support

#### 6. Utilities

**validation.js**
- Form validation functions
- Email validation
- Password strength checking

**imageUtils.js**
- Image URL handling
- Fallback image management
- Image optimization

**format.js**
- Date formatting
- Number formatting
- Text formatting utilities

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ username    │
│ email       │
│ password    │
│ avatar      │
│ role_id(FK) │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐      ┌─────────────┐      ┌─────────────┐
│    Video    │      │  Comment    │      │ Subscription│
│─────────────│      │─────────────│      │─────────────│
│ id (PK)     │◄─────┤ id (PK)     │      │ id (PK)     │
│ title       │ 1:N  │ content     │      │ user_id(FK) │
│ description │      │ user_id(FK) │      │ channel_id  │
│ url         │      │ video_id(FK)│      └─────────────┘
│ thumbnail   │      └─────────────┘
│ viewCount   │
│ user_id(FK) │      ┌─────────────┐
│ category_id │      │ VideoRating │
└──────┬──────┘      │─────────────│
       │             │ video_id(FK)│
       │ 1:N         │ user_id(FK) │
       │             │ rating      │
┌──────▼──────┐      └─────────────┘
│ VideoTag    │
│─────────────│      ┌─────────────┐
│ video_id(FK)│      │ WatchList   │
│ tag_id(FK)  │      │─────────────│
└─────────────┘      │ id (PK)     │
                     │ user_id(FK) │
┌─────────────┐      │ video_id(FK)│
│  Category   │      └─────────────┘
│─────────────│
│ id (PK)     │
│ name        │
└─────────────┘
```

### Database Tables

**user**
- Primary Key: user_id
- Unique Constraints: username, email
- Foreign Keys: role_id → role(role_id)

**video**
- Primary Key: video_id
- Foreign Keys: user_id → user(user_id), category_id → category(category_id)
- Indexes: uploader, category, uploadDate

**comment**
- Primary Key: comment_id
- Foreign Keys: user_id → user(user_id), video_id → video(video_id)

**video_rating**
- Composite Primary Key: (video_id, user_id)
- Foreign Keys: video_id → video(video_id), user_id → user(user_id)

**comment_rating**
- Composite Primary Key: (comment_id, user_id)
- Foreign Keys: comment_id → comment(comment_id), user_id → user(user_id)

**video_tag**
- Composite Primary Key: (video_id, tag_id)
- Foreign Keys: video_id → video(video_id), tag_id → tag(tag_id)

**subscription**
- Composite Primary Key: (user_id, channel_id)
- Foreign Keys: user_id → user(user_id), channel_id → user(user_id)

**watch_list**
- Primary Key: watch_list_id
- Foreign Keys: user_id → user(user_id), video_id → video(video_id)

**notification**
- Primary Key: notification_id
- Foreign Keys: user_id → user(user_id), video_id → video(video_id)

**category**
- Primary Key: category_id
- Unique Constraint: name

**tag**
- Primary Key: tag_id
- Unique Constraint: name

**role**
- Primary Key: role_id
- Unique Constraint: role_name

---

## Security Implementation

### Authentication & Authorization

**JWT Token Security**
- Tokens stored in HTTP-only cookies (prevents XSS attacks)
- Secure flag enabled (HTTPS only)
- SameSite=None for cross-site support
- Token expiration: 24 hours
- Secret key stored in application properties

**Password Security**
- BCrypt hashing (10 rounds)
- Password strength validation
- Password reset via email token (15-minute expiration)

**Role-Based Access Control (RBAC)**
- Two roles: ROLE_USER, ROLE_ADMIN
- Admin can manage all videos and users
- Users can only manage their own content
- Protected endpoints check authentication and authorization

**CORS Configuration**
- Configured for specific origins
- Credentials allowed for authenticated requests
- Preflight request handling

**Input Validation**
- Jakarta Validation API
- Request body validation
- SQL injection prevention (JPA parameterized queries)
- XSS prevention (input sanitization)

**File Upload Security**
- File type validation
- File size limits (500MB for videos, smaller for images)
- Secure file storage
- Cloudinary integration for image uploads

---

## Features & Functionality

### User Features

#### 1. Authentication & User Management
- **Registration**: Username, email, password registration
- **Login**: JWT-based authentication
- **Profile Management**: Update profile, change avatar
- **Password Reset**: Email-based password recovery
- **Avatar Selection**: Choose from presets or upload custom image

#### 2. Video Features
- **Video Upload**: Upload video files or provide video URL
- **Video Playback**: Custom video player with controls
- **Video Browsing**: Browse videos by category, uploader, or search
- **Video Management**: Edit and delete own videos
- **Thumbnail Selection**: Choose from presets or custom URL
- **View Count**: Automatic view count tracking

#### 3. Social Features
- **Comments**: Add, edit, delete comments on videos
- **Ratings**: Rate videos and comments (like/dislike)
- **Subscriptions**: Subscribe to other users' channels
- **Watchlist**: Save videos to watch later
- **Notifications**: Receive notifications for new videos from subscribed channels

#### 4. Search & Discovery
- **Search**: Search videos by title
- **Category Filtering**: Browse videos by category
- **Related Videos**: View similar videos based on category
- **Trending**: View popular videos

### Admin Features

#### 1. User Management
- View all users
- User statistics
- User role management

#### 2. Video Management
- View all videos
- Edit any video
- Delete any video
- Video statistics

#### 3. Dashboard
- Platform statistics (total videos, users, views)
- Overview of platform activity

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": ["ROLE_USER"]
}
```

**Response:** `200 OK` with success message

#### POST /api/auth/signin
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK` with user data (token in HTTP-only cookie)

#### POST /api/auth/logout
Logout current user.

**Response:** `200 OK`

#### GET /api/auth/me
Get current authenticated user.

**Response:** `200 OK` with user data

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:** `200 OK`

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`

### Video Endpoints

#### GET /api/videos
Get all videos.

**Response:** `200 OK` with array of VideoDTO

#### GET /api/videos/{id}
Get video by ID (increments view count).

**Response:** `200 OK` with VideoDTO

#### GET /api/videos/uploader/{uploaderId}
Get videos by uploader.

**Response:** `200 OK` with array of VideoDTO

#### GET /api/videos/category/{categoryId}
Get videos by category.

**Response:** `200 OK` with array of VideoDTO

#### GET /api/videos/search?title={title}
Search videos by title.

**Response:** `200 OK` with array of VideoDTO

#### POST /api/videos
Create a new video (authenticated).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "url": "string",
  "thumbnailUrl": "string",
  "categoryId": number,
  "userId": number
}
```

**Response:** `200 OK` with VideoDTO

#### PUT /api/videos/{id}
Update video (owner or admin).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "url": "string",
  "thumbnailUrl": "string",
  "categoryId": number
}
```

**Response:** `200 OK` with VideoDTO

#### DELETE /api/videos/{id}
Delete video (owner or admin).

**Response:** `200 OK`

#### GET /api/videos/{id}/similar
Get similar videos.

**Response:** `200 OK` with array of VideoDTO

### Comment Endpoints

#### GET /api/comments/video/{videoId}
Get comments for a video.

**Response:** `200 OK` with array of CommentDTO

#### POST /api/comments
Create a comment (authenticated).

**Request Body:**
```json
{
  "content": "string",
  "videoId": number
}
```

**Response:** `200 OK` with CommentDTO

#### PUT /api/comments/{id}
Update comment (owner).

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** `200 OK` with CommentDTO

#### DELETE /api/comments/{id}
Delete comment (owner or admin).

**Response:** `200 OK`

### Rating Endpoints

#### POST /api/ratings/video
Rate a video (authenticated).

**Request Body:**
```json
{
  "videoId": number,
  "rating": number
}
```

**Response:** `200 OK`

#### POST /api/ratings/comment
Rate a comment (authenticated).

**Request Body:**
```json
{
  "commentId": number,
  "rating": number
}
```

**Response:** `200 OK`

### File Upload Endpoints

#### POST /api/uploads/video
Upload video file to Cloudinary.

**Request:** Multipart form data with `file` field

**Response:** `200 OK` with video URL (Cloudinary secure URL)

**Storage Location:** Videos are stored on Cloudinary cloud storage service, not locally. The Cloudinary URL is saved in the database (`video.url` field).

#### POST /api/uploads/avatar
Upload avatar to Cloudinary.

**Request:** Multipart form data with `file` field

**Response:** `200 OK` with avatar URL

#### POST /api/uploads/avatar-url
Set avatar from URL.

**Request Body:**
```json
{
  "url": "string"
}
```

**Response:** `200 OK`

---

## Deployment & Infrastructure

### Docker Configuration

**docker-compose.yml**
- **Frontend Service**: React app on port 5173
- **Backend Service**: Spring Boot on port 8080
- **Database Service**: MySQL 8.0 on port 3307
- **Volume Mounts**: 
  - Frontend code for hot reload
  - Video uploads directory (`./uploaded-videos:/app/videos`) - Note: Currently not used for video storage
  - Database persistent storage

### File Storage

**Video Storage:**
- **Primary Storage**: Videos are uploaded to **Cloudinary** cloud storage service
- **Storage Location**: Cloudinary's cloud infrastructure (not local filesystem)
- **Database Storage**: Only the video URL (Cloudinary secure URL) is stored in the MySQL database (`video.url` column)
- **Local Directory**: The `/app/videos` directory is configured in `application.properties` (`file.upload-dir=/app/videos`) and mounted in Docker, but is **not currently used** for video storage. All videos are stored on Cloudinary.

**Image Storage:**
- **Avatars**: Stored on Cloudinary (in "avatars" folder)
- **Thumbnails**: Stored on Cloudinary (in "thumbnails" folder)

**Alternative Video Input:**
- Users can also provide video URLs directly (without uploading), which are stored as-is in the database

**Dockerfile (Frontend)**
- Node.js base image
- Vite build process
- Production-ready static files

**Dockerfile (Backend)**
- Maven build process
- Java 21 runtime
- Spring Boot executable JAR

### Nginx Configuration

**nginx.conf**
- Reverse proxy for frontend and backend
- SSL/TLS termination
- CORS handling
- Static file caching
- SPA routing support

**Features:**
- HTTP to HTTPS redirect
- API routing to backend
- Frontend routing
- Static asset caching (1 year)
- CORS preflight handling

### Environment Configuration

**Backend (application.properties)**
- Database connection settings
- JWT secret and expiration
- Cloudinary credentials (for video and image storage)
- Email SMTP settings
- File upload limits (500MB max for videos, 100MB enforced in code)
- File upload directory (`file.upload-dir=/app/videos`) - configured but not used (videos stored on Cloudinary)

**Frontend (Environment Variables)**
- API base URL configuration
- Development/production mode detection

### Production Deployment

**Deployment Platforms:**
- Frontend: Vercel (or similar)
- Backend: Railway (or similar cloud platform)
- Database: MySQL on cloud provider

**Environment Variables:**
- Database credentials
- JWT secret
- Cloudinary API keys
- Email service credentials
- API base URLs

---

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 21 JDK (for local backend development)
- Maven 3.8+ (for local backend development)
- MySQL 8.0+ (for local database, or use Docker)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd IT093IU_Web_Application_Development_Project
```

#### 2. Backend Setup
```bash
cd be
# Configure application.properties with database credentials
mvn clean install
mvn spring-boot:run
```

#### 3. Frontend Setup
```bash
cd fe
npm install
npm run dev
```

#### 4. Docker Setup (Recommended)
```bash
# From project root
docker-compose up --build
```

### Configuration Files

**Backend Configuration**
- `be/src/main/resources/application.properties`
- Database connection settings
- JWT configuration
- Cloudinary credentials
- Email settings

**Frontend Configuration**
- `fe/src/config/axios.js`
- API base URL
- Environment-specific settings

**Docker Configuration**
- `docker-compose.yml`
- Service definitions
- Volume mounts
- Port mappings

---

## Testing

### Backend Testing

**Test Structure:**
- Unit tests for services
- Integration tests for controllers
- Repository tests

**Test Files:**
- `HcmiuWebApplicationTests.java`
- `TestControllerTests.java`

**Test Coverage:**
- Authentication flow
- Video CRUD operations
- Comment operations
- Rating operations

### Frontend Testing

**Testing Approach:**
- Component testing (manual)
- Integration testing (manual)
- E2E testing (manual)

**Test Areas:**
- User authentication flow
- Video upload and playback
- Comment functionality
- Search functionality
- Admin features

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Video upload (file and URL)
- [ ] Video playback
- [ ] Comment creation and editing
- [ ] Rating videos and comments
- [ ] Search functionality
- [ ] Category filtering
- [ ] Watchlist management
- [ ] Subscription management
- [ ] Admin panel access
- [ ] Profile management
- [ ] Password reset

---

## Performance Optimizations

### Frontend Optimizations

1. **Code Splitting**
   - Lazy loading of routes
   - Dynamic imports for heavy components
   - Vendor chunk separation

2. **Image Optimization**
   - OptimizedImage component with lazy loading
   - Thumbnail optimization
   - Fallback images

3. **State Management**
   - Zustand for efficient state updates
   - Selective re-renders
   - Memoization where appropriate

4. **API Optimization**
   - Request debouncing (search)
   - Response caching
   - Infinite scrolling for large lists

5. **Bundle Optimization**
   - Vite build optimization
   - Tree shaking
   - Minification

### Backend Optimizations

1. **Database Optimization**
   - Indexed columns (user_id, category_id, uploadDate)
   - Efficient queries with JPA
   - Connection pooling (HikariCP)

2. **Caching**
   - Response caching where appropriate
   - Static resource caching

3. **File Handling**
   - Efficient file upload handling
   - Cloudinary integration for images
   - Video file streaming

4. **Security Optimization**
   - Stateless JWT authentication
   - Efficient password hashing
   - Optimized CORS configuration

---

## Challenges & Solutions

### Challenge 1: Cross-Origin Authentication
**Problem:** JWT cookies not working across different domains (Vercel frontend to Railway backend).

**Solution:**
- Configured CORS with credentials
- Set SameSite=None and Secure flags on cookies
- Configured allowed origins in both frontend and backend

### Challenge 2: Video File Upload Size
**Problem:** Large video files causing timeout and memory issues.

**Solution:**
- Increased Spring Boot multipart file size limits (500MB)
- Implemented streaming upload
- Added file size validation on frontend

### Challenge 3: State Management Complexity
**Problem:** Managing complex state across multiple components.

**Solution:**
- Implemented Zustand for centralized state management
- Created separate stores for different domains (user, video, comment)
- Used custom hooks for reusable logic

### Challenge 4: Video Playback Performance
**Problem:** Slow video loading and buffering.

**Solution:**
- Implemented React Player with quality selection
- Added video caching service
- Optimized video URL handling

### Challenge 5: Real-time Updates
**Problem:** Comments and ratings not updating in real-time.

**Solution:**
- Implemented manual refresh mechanism
- Added optimistic UI updates
- Used state management for immediate UI feedback

---

## Future Enhancements

### Short-term Enhancements

1. **Real-time Features**
   - WebSocket integration for live comments
   - Real-time notifications
   - Live chat during video playback

2. **Video Features**
   - Video transcoding for multiple qualities
   - Subtitle support
   - Playback speed control
   - Video chapters

3. **Social Features**
   - User profiles with bio and social links
   - Playlists creation and sharing
   - Video sharing to social media
   - User following/followers system

4. **Search & Discovery**
   - Advanced search filters
   - Trending algorithm
   - Personalized recommendations
   - Search history

### Long-term Enhancements

1. **Performance**
   - CDN integration for video delivery
   - Database query optimization
   - Redis caching layer
   - Load balancing

2. **Analytics**
   - Video analytics dashboard
   - User behavior tracking
   - Performance metrics
   - A/B testing framework

3. **Monetization**
   - Advertisement integration
   - Premium subscriptions
   - Creator revenue sharing
   - Payment gateway integration

4. **Mobile Support**
   - React Native mobile app
   - Progressive Web App (PWA)
   - Mobile-optimized UI

5. **Advanced Features**
   - Live streaming
   - Video editing tools
   - AI-powered content moderation
   - Automated thumbnail generation
   - Video transcription

---

## Conclusion

This Web Video Platform project successfully demonstrates a full-stack web application with modern technologies and best practices. The application provides a comprehensive video streaming platform with user management, social features, and administrative capabilities.

### Key Achievements

1. **Complete Full-Stack Implementation**: Successfully integrated React frontend with Spring Boot backend
2. **Security**: Implemented robust JWT-based authentication and authorization
3. **Scalability**: Docker containerization enables easy deployment and scaling
4. **User Experience**: Modern, responsive UI with smooth interactions
5. **Feature Completeness**: Comprehensive feature set including video management, social interactions, and admin tools

### Technical Highlights

- Modern tech stack (React, Spring Boot, MySQL)
- RESTful API architecture
- JWT-based security
- Docker containerization
- Cloudinary integration
- Responsive design
- State management with Zustand
- Performance optimizations

### Learning Outcomes

- Full-stack web development
- RESTful API design
- Authentication and authorization
- Database design and ORM
- Docker containerization
- Frontend state management
- Security best practices
- Performance optimization

### Project Status

The project is **functional and deployable** with all core features implemented. The application can be deployed to production environments with proper configuration of environment variables and external services.

### Recommendations

1. **Testing**: Add comprehensive automated testing (unit, integration, E2E)
2. **Documentation**: Expand API documentation with Swagger/OpenAPI
3. **Monitoring**: Implement logging and monitoring solutions
4. **CI/CD**: Set up continuous integration and deployment pipelines
5. **Security Audit**: Conduct security audit and penetration testing
6. **Performance Testing**: Load testing and performance benchmarking

---

## Appendix

### Project Structure
```
IT093IU_Web_Application_Development_Project/
├── be/                          # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/hcmiuweb/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── repositories/
│   │   │   │   ├── entities/
│   │   │   │   ├── config/
│   │   │   │   └── ...
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── fe/                          # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── config/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── README.md
└── REPORT.md
```

### Technology Versions

**Frontend:**
- React: 18.2.0
- Vite: 6.2.0
- TailwindCSS: 4.1.4
- Zustand: 5.0.3
- React Router: 7.5.0
- Axios: 1.8.4

**Backend:**
- Spring Boot: 3.2.3
- Java: 21
- MySQL Connector: Latest
- JJWT: 0.11.5
- Cloudinary: 1.36.0

**Infrastructure:**
- Docker: Latest
- Docker Compose: Latest
- MySQL: 8.0
- Nginx: Latest

---

**Report Generated:** December 2024  
**Project Status:** Complete and Functional  
**Version:** 1.0

