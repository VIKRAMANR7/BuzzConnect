# 🚀 BuzzConnect - Social Media Platform

<div align="center">

![BuzzConnect Logo](client/public/buzzconnect.ico)

**A modern, full-stack social media platform built with the MERN stack**

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://buzz-connect.vercel.app)
[![Backend API](https://img.shields.io/badge/API-online-blue.svg)](https://buzz-connect-server.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

[Features](#-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [System Architecture](#-system-architecture)
- [Data Flow Diagram](#-data-flow-diagram)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**BuzzConnect** is a feature-rich social media platform that enables users to connect, share, and engage with a global community. Built with modern web technologies, it offers real-time messaging, story sharing, post creation, and comprehensive user connection management.

### Key Highlights

- 🔐 **Secure Authentication** - Powered by Clerk
- 💬 **Real-time Messaging** - Server-Sent Events (SSE) for instant communication
- 📸 **Media Sharing** - Stories and posts with image/video support
- 🔔 **Smart Notifications** - Email reminders via Inngest workflows
- 🎨 **Modern UI/UX** - Responsive design with TailwindCSS
- ⚡ **High Performance** - Optimized with Redux Toolkit state management
- 🗄️ **Scalable Backend** - RESTful API with MongoDB

---

## ✨ Features

### User Management

- ✅ User authentication and authorization (Clerk)
- ✅ Profile customization (avatar, cover photo, bio, location)
- ✅ User discovery and search functionality
- ✅ Follow/unfollow system
- ✅ Connection requests with acceptance workflow

### Content Sharing

- ✅ Create text and image posts (up to 4 images)
- ✅ Like and interact with posts
- ✅ Create stories (text, image, or video)
- ✅ Stories auto-delete after 24 hours
- ✅ Story views tracking

### Messaging

- ✅ Real-time one-on-one messaging
- ✅ Image sharing in messages
- ✅ Message read status
- ✅ Recent messages sidebar
- ✅ Unread message notifications

### Notifications

- ✅ Email notifications for connection requests
- ✅ Reminder emails for pending connections (24h)
- ✅ Daily digest for unseen messages
- ✅ Real-time in-app notifications

### Additional Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Feed algorithm (connections + following)
- ✅ Media gallery view
- ✅ User profile pages
- ✅ Connection management dashboard

---

## 🌐 Live Demo

- **Frontend:** [https://buzz-connect.vercel.app](https://buzz-connect.vercel.app)
- **Backend API:** [https://buzz-connect-server.vercel.app](https://buzzconnect-server.vercel.app)

---

## 📸 Screenshots

### Authentication

<img src="client/public/screenshots/auth.png" alt="Authentication" width="800"/>

_Clerk-powered secure authentication with social login support_

### Feed

<img src="client/public/screenshots/feed.png" alt="Feed" width="800"/>

_Dynamic feed displaying posts from connections and followed users_

### Stories

<img src="client/public/screenshots/stories.png" alt="Stories" width="800"/>

_Instagram-style stories with text, image, and video support_

### Create Post

<img src="client/public/screenshots/create-post.png" alt="Create Post" width="800"/>

_Intuitive post creation with multi-image upload_

### Messages

<img src="client/public/screenshots/messages.png" alt="Messages" width="800"/>

_Real-time messaging with connection list_

### Chat Box

<img src="client/public/screenshots/chatbox.png" alt="Chat Box" width="800"/>

_One-on-one chat with image sharing capability_

### Discover

<img src="client/public/screenshots/discover.png" alt="Discover" width="800"/>

_User discovery with advanced search functionality_

### Profile

<img src="client/public/screenshots/profile.png" alt="Profile" width="800"/>

_Comprehensive user profiles with posts and media gallery_

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React 19 SPA]
        B[Redux Toolkit]
        C[React Router]
    end

    subgraph "Authentication"
        D[Clerk Auth]
    end

    subgraph "API Layer"
        E[Express Server]
        F[REST API Endpoints]
        G[SSE Endpoints]
    end

    subgraph "Middleware"
        H[Auth Middleware]
        I[Error Handler]
        J[Multer Upload]
    end

    subgraph "Services"
        K[User Service]
        L[Post Service]
        M[Message Service]
        N[Story Service]
    end

    subgraph "External Services"
        O[ImageKit CDN]
        P[Clerk API]
        Q[Inngest Workflows]
        R[NodeMailer SMTP]
    end

    subgraph "Database"
        S[(MongoDB Atlas)]
    end

    A --> D
    A --> B
    A --> C
    A --> E
    D --> P
    E --> F
    E --> G
    F --> H
    H --> I
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N
    K --> S
    L --> S
    M --> S
    N --> S
    J --> O
    K --> Q
    N --> Q
    Q --> R
```

### Architecture Overview

The system follows a modern **three-tier architecture**:

1. **Presentation Layer**: React 19 with Redux Toolkit for state management
2. **Application Layer**: Express.js RESTful API with middleware pipeline
3. **Data Layer**: MongoDB with Mongoose ODM

**Key Design Patterns**:

- Repository Pattern (Mongoose models)
- Middleware Chain Pattern (Express)
- Observer Pattern (SSE for real-time updates)
- Async Handler Pattern (Error handling)

---

## 🔄 Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant CL as Clerk Auth
    participant API as Express API
    participant MW as Middleware
    participant DB as MongoDB
    participant IK as ImageKit
    participant IG as Inngest
    participant EM as Email Service

    Note over U,EM: User Authentication Flow
    U->>C: Login Request
    C->>CL: Authenticate
    CL-->>C: JWT Token
    C->>API: API Request + Token
    API->>MW: Verify Token
    MW-->>API: User ID

    Note over U,EM: Post Creation Flow
    U->>C: Create Post + Images
    C->>API: POST /api/post/add
    API->>MW: Upload Images
    MW->>IK: Store Images
    IK-->>MW: Image URLs
    MW->>DB: Save Post
    DB-->>API: Success
    API-->>C: Post Created
    C-->>U: Update Feed

    Note over U,EM: Real-time Messaging Flow
    U->>C: Send Message
    C->>API: POST /api/message/send
    API->>DB: Save Message
    API->>API: Broadcast via SSE
    API-->>C: Message Delivered

    Note over U,EM: Connection Request Flow
    U->>C: Send Connection Request
    C->>API: POST /api/user/connect
    API->>DB: Create Connection
    API->>IG: Trigger Workflow
    IG->>EM: Send Email
    IG->>IG: Wait 24h
    IG->>EM: Send Reminder

    Note over U,EM: Story Creation Flow
    U->>C: Create Story
    C->>API: POST /api/story/create
    API->>IK: Upload Media
    API->>DB: Save Story
    API->>IG: Schedule Delete (24h)
    IG->>DB: Delete Story
```

---

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Story : creates
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Connection : initiates
    User ||--o{ Connection : receives
    User }o--o{ User : follows
    User }o--o{ User : connected_with

    User {
        string _id PK
        string email
        string full_name
        string username
        string bio
        string profile_picture
        string cover_photo
        string location
        array followers
        array following
        array connections
        datetime createdAt
        datetime updatedAt
    }

    Post {
        objectId _id PK
        string user FK
        string content
        array image_urls
        string post_type
        array likes_count
        datetime createdAt
        datetime updatedAt
    }

    Story {
        objectId _id PK
        string user FK
        string content
        string media_url
        string media_type
        array views_count
        string background_color
        datetime createdAt
        datetime updatedAt
    }

    Message {
        objectId _id PK
        string from_user_id FK
        string to_user_id FK
        string text
        string message_type
        string media_url
        boolean seen
        datetime createdAt
        datetime updatedAt
    }

    Connection {
        objectId _id PK
        string from_user_id FK
        string to_user_id FK
        string status
        datetime createdAt
        datetime updatedAt
    }
```

### Schema Details

#### User Model

- **Purpose**: Stores user profile information
- **Indexes**: `_id` (primary), `email` (unique), `username` (unique)
- **Relationships**: Self-referential (followers/following), one-to-many with posts/stories/messages

#### Post Model

- **Purpose**: Stores user posts with text and images
- **Features**: Multi-image support (up to 4), like tracking
- **Types**: `text`, `image`, `text_with_image`

#### Story Model

- **Purpose**: Temporary content (24-hour lifespan)
- **Features**: Auto-deletion via Inngest, view tracking
- **Types**: `text`, `image`, `video`

#### Message Model

- **Purpose**: Direct messages between users
- **Features**: Real-time delivery via SSE, read receipts
- **Types**: `text`, `image`

#### Connection Model

- **Purpose**: Manages user connections
- **Status**: `pending`, `accepted`
- **Features**: Email notifications, 24h reminder system

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Purpose          | Version |
| --------------- | ---------------- | ------- |
| React           | UI Library       | 19.1.1  |
| TypeScript      | Type Safety      | 5.9.3   |
| Redux Toolkit   | State Management | 2.8.2   |
| React Router    | Routing          | 7.8.2   |
| TailwindCSS     | Styling          | 4.1.12  |
| Vite            | Build Tool       | 7.1.2   |
| Axios           | HTTP Client      | 1.11.0  |
| Clerk React     | Authentication   | 5.43.1  |
| React Hot Toast | Notifications    | 2.6.0   |
| Lucide React    | Icons            | 0.541.0 |
| Moment.js       | Date Formatting  | 2.30.1  |

### Backend

| Technology    | Purpose         | Version |
| ------------- | --------------- | ------- |
| Node.js       | Runtime         | 20+     |
| Express       | Web Framework   | 4.21.2  |
| TypeScript    | Type Safety     | 5.9.3   |
| MongoDB       | Database        | -       |
| Mongoose      | ODM             | 8.19.4  |
| Clerk Express | Authentication  | 1.7.24  |
| Inngest       | Background Jobs | 3.40.1  |
| ImageKit      | Image CDN       | 6.0.0   |
| Multer        | File Upload     | 1.4.5   |
| Nodemailer    | Email Service   | 7.0.5   |

### DevOps & Tools

- **Deployment**: Vercel (Frontend & Backend)
- **Database Hosting**: MongoDB Atlas
- **Email**: Brevo SMTP
- **Image Storage**: ImageKit CDN
- **Version Control**: Git
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier

---

## 🚀 Installation

### Prerequisites

```bash
node >= 20.0.0
pnpm >= 8.0.0
MongoDB Atlas account
Clerk account
ImageKit account
Inngest account
SMTP credentials (Brevo/SendGrid)
```

### Clone Repository

```bash
git clone https://github.com/yourusername/buzzconnect.git
cd buzzconnect
```

### Server Setup

```bash
cd server
pnpm install
```

Create `.env` file in `server/` directory:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buzzconnect

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Frontend URL
FRONTEND_URL=http://localhost:5173

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/

# Email (Optional)
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SENDER_EMAIL=noreply@yourdomain.com

# Inngest
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

Start development server:

```bash
pnpm dev
```

### Client Setup

```bash
cd client
pnpm install
```

Create `.env` file in `client/` directory:

```env
VITE_BASE_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

Start development server:

```bash
pnpm dev
```

### Build for Production

**Server:**

```bash
cd server
pnpm build
pnpm start
```

**Client:**

```bash
cd client
pnpm build
pnpm preview
```

---

## 🔐 Environment Variables

### Server Environment Variables

| Variable                | Description               | Required           |
| ----------------------- | ------------------------- | ------------------ |
| `PORT`                  | Server port               | No (default: 5000) |
| `MONGODB_URI`           | MongoDB connection string | Yes                |
| `CLERK_SECRET_KEY`      | Clerk secret key          | Yes                |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key     | Yes                |
| `FRONTEND_URL`          | Frontend URL for CORS     | Yes                |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public key       | Yes                |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private key      | Yes                |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint     | Yes                |
| `SMTP_USER`             | SMTP username             | No                 |
| `SMTP_PASS`             | SMTP password             | No                 |
| `SENDER_EMAIL`          | Sender email address      | No                 |
| `INNGEST_EVENT_KEY`     | Inngest event key         | Yes                |
| `INNGEST_SIGNING_KEY`   | Inngest signing key       | No                 |

### Client Environment Variables

| Variable                     | Description           | Required |
| ---------------------------- | --------------------- | -------- |
| `VITE_BASE_URL`              | Backend API URL       | Yes      |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes      |

---

## 📡 API Documentation

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

### User Endpoints

#### Get User Data

```http
GET /api/user/data
Authorization: Bearer <token>
```

#### Update User Profile

```http
POST /api/user/update
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  username: string
  bio: string
  location: string
  full_name: string
  profile: file (optional)
  cover: file (optional)
```

#### Discover Users

```http
POST /api/user/discover
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "input": "search query"
  }
```

#### Follow User

```http
POST /api/user/follow
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "id": "user_id"
  }
```

#### Unfollow User

```http
POST /api/user/unfollow
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "id": "user_id"
  }
```

#### Send Connection Request

```http
POST /api/user/connect
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "id": "user_id"
  }
```

#### Accept Connection Request

```http
POST /api/user/accept
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "id": "user_id"
  }
```

#### Get User Connections

```http
GET /api/user/connections
Authorization: Bearer <token>
```

#### Get User Profile

```http
POST /api/user/profiles
Content-Type: application/json

Body:
  {
    "profileId": "user_id"
  }
```

### Post Endpoints

#### Create Post

```http
POST /api/post/add
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  content: string
  post_type: "text" | "image" | "text_with_image"
  images: file[] (max 4)
```

#### Get Feed Posts

```http
GET /api/post/feed
Authorization: Bearer <token>
```

#### Like/Unlike Post

```http
POST /api/post/like
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "postId": "post_id"
  }
```

### Story Endpoints

#### Create Story

```http
POST /api/story/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  content: string (optional)
  media_type: "text" | "image" | "video"
  background_color: string (hex)
  media: file (optional)
```

#### Get Stories

```http
GET /api/story/get
Authorization: Bearer <token>
```

### Message Endpoints

#### SSE Connection

```http
GET /api/message/:userId
```

#### Send Message

```http
POST /api/message/send
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  to_user_id: string
  text: string
  image: file (optional)
```

#### Get Chat Messages

```http
POST /api/message/get
Authorization: Bearer <token>
Content-Type: application/json

Body:
  {
    "to_user_id": "user_id"
  }
```

#### Get Recent Messages

```http
GET /api/user/recent-messages
Authorization: Bearer <token>
```

---

## 📁 Project Structure

### Server Structure

```
server/
├── src/
│   ├── configs/          # Configuration files
│   │   ├── db.ts         # MongoDB connection
│   │   ├── imageKit.ts   # ImageKit setup
│   │   ├── multer.ts     # File upload config
│   │   ├── nodeMailer.ts # Email config
│   │   └── validateEnv.ts # Environment validation
│   ├── controllers/      # Request handlers
│   │   ├── messageController.ts
│   │   ├── postController.ts
│   │   ├── storyController.ts
│   │   └── userController.ts
│   ├── middleware/       # Express middleware
│   │   ├── asyncHandler.ts
│   │   ├── auth.ts       # Authentication
│   │   └── errorHandler.ts
│   ├── models/           # Mongoose schemas
│   │   ├── Connection.ts
│   │   ├── Message.ts
│   │   ├── Post.ts
│   │   ├── Story.ts
│   │   └── User.ts
│   ├── routes/           # API routes
│   │   ├── messageRoutes.ts
│   │   ├── postRoutes.ts
│   │   ├── storyRoutes.ts
│   │   └── userRoutes.ts
│   ├── inngest/          # Background jobs
│   │   └── index.ts
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── server.ts         # Entry point
├── package.json
└── tsconfig.json
```

### Client Structure

```
client/
├── src/
│   ├── api/              # API configuration
│   │   └── axios.ts
│   ├── app/              # Redux store
│   │   ├── store.ts
│   │   └── useAppDispatch.ts
│   ├── assets/           # Static assets
│   ├── components/       # React components
│   │   ├── Loading.tsx
│   │   ├── MenuItems.tsx
│   │   ├── Notification.tsx
│   │   ├── PostCard.tsx
│   │   ├── ProfileModal.tsx
│   │   ├── RecentMessages.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StoriesBar.tsx
│   │   ├── StoryModal.tsx
│   │   ├── StoryViewer.tsx
│   │   ├── UserCard.tsx
│   │   └── UserProfileInfo.tsx
│   ├── features/         # Redux slices
│   │   ├── connections/
│   │   ├── messages/
│   │   └── user/
│   ├── pages/            # Page components
│   │   ├── ChatBox.tsx
│   │   ├── Connections.tsx
│   │   ├── CreatePost.tsx
│   │   ├── Discover.tsx
│   │   ├── Feed.tsx
│   │   ├── Layout.tsx
│   │   ├── Login.tsx
│   │   ├── Messages.tsx
│   │   └── Profile.tsx
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔧 Component Architecture

```mermaid
graph TD
    A[App.tsx] --> B[Layout]
    A --> C[Login]

    B --> D[Sidebar]
    B --> E[Feed]
    B --> F[Messages]
    B --> G[Connections]
    B --> H[Discover]
    B --> I[Profile]
    B --> J[CreatePost]
    B --> K[ChatBox]

    E --> L[StoriesBar]
    E --> M[PostCard]
    E --> N[RecentMessages]

    L --> O[StoryModal]
    L --> P[StoryViewer]

    F --> Q[UserCard]

    G --> Q

    H --> Q

    I --> R[UserProfileInfo]
    I --> S[ProfileModal]
    I --> M

    K --> T[MessageInput]
    K --> U[MessageList]

    D --> V[MenuItems]

    subgraph "Redux Store"
        W[userSlice]
        X[connectionsSlice]
        Y[messagesSlice]
    end

    M --> W
    Q --> W
    Q --> X
    U --> Y
```

---

## 🌊 API Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as React Component
    participant RD as Redux Store
    participant A as Axios Instance
    participant M as Middleware
    participant CT as Controller
    participant S as Service/Model
    participant DB as MongoDB
    participant EX as External Service

    Note over C,EX: Complete Request Lifecycle

    C->>R: User Action
    R->>RD: Dispatch Action
    RD->>A: HTTP Request
    A->>M: Auth Middleware

    alt Token Valid
        M->>CT: Forward Request
        CT->>S: Business Logic
        S->>DB: Query/Update
        DB-->>S: Result

        alt External Service Needed
            S->>EX: API Call
            EX-->>S: Response
        end

        S-->>CT: Processed Data
        CT-->>A: JSON Response
        A-->>RD: Update State
        RD-->>R: Re-render
        R-->>C: UI Update
    else Token Invalid
        M-->>A: 401 Error
        A-->>RD: Error Action
        RD-->>R: Error State
        R-->>C: Error Message
    end
```

---

## 🎯 Key Features Implementation

### Real-time Messaging (SSE)

The application uses **Server-Sent Events** for real-time message delivery:

1. Client establishes SSE connection on mount
2. Server maintains connection map per user
3. New messages broadcast to recipient's connections
4. Client receives and updates Redux store
5. Toast notification shown if not in active chat

### Story Auto-deletion

Stories are automatically deleted after 24 hours using Inngest:

1. Story created → Inngest event triggered
2. Workflow sleeps for 24 hours
3. After 24h → Story deleted from MongoDB
4. Next story fetch excludes deleted story

### Connection Request Workflow

Multi-step email notification system:

1. User sends connection request
2. Immediate email sent to recipient
3. Inngest schedules 24h reminder
4. If still pending → Reminder email sent
5. If accepted → No reminder sent

### Image Optimization

All images processed through ImageKit:

1. Client uploads file
2. Multer handles multipart data
3. File buffer sent to ImageKit
4. ImageKit returns optimized URL
5. URL stored in MongoDB
6. Client displays from CDN

---

## 🚦 Testing

### Run Tests

```bash
# Server tests
cd server
pnpm test

# Client tests
cd client
pnpm test
```

### Linting

```bash
# Server linting
cd server
pnpm lint

# Client linting
cd client
pnpm lint
```

### Type Checking

```bash
# Server type check
cd server
pnpm typecheck

# Client type check
cd client
pnpm typecheck
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@VIKRAMANR7](https://github.com/VIKRAMANR7)

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.com/)
- [ImageKit](https://imagekit.io/)
- [Inngest](https://www.inngest.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📞 Support

For support, email support@buzzconnect.com or join our Slack channel.

---

<div align="center">

**Made with ❤️ and TypeScript**

⭐ Star this repo if you find it helpful!

</div>
