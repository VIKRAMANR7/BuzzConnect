# 🌐 BuzzConnect – Full‑Stack Social Networking Platform

A modern social networking platform with **real‑time messaging, stories, posts, user discovery, and connection management** — built using React, TypeScript, Node.js, Express, MongoDB, Clerk Authentication, and Inngest background jobs.

Hosted on **Vercel**:

- **Frontend:** https://buzz-connect.vercel.app
- **Backend API:** https://buzz-connect-server.vercel.app

---

## 📸 Screenshots

All screenshots are stored in:

`client/public/screenshots/`

### 🔐 Authentication

![Auth](client/public/screenshots/auth.png)

### 🏠 Feed

![Feed](client/public/screenshots/feed.png)

### ✍️ Create Post

![Create Post](client/public/screenshots/create-post.png)

### 🔎 Discover People

![Discover](client/public/screenshots/discover.png)

### 👤 Profile Page

![Profile](client/public/screenshots/profile.png)

### 💬 Messages

![Messages](client/public/screenshots/messages.png)

### 💭 Chat (DM)

![Chat](client/public/screenshots/chatbox.png)

### 📖 Stories

![Stories](client/public/screenshots/stories.png)

---

## ✨ Features

### 🧑‍🤝‍🧑 Social Features

- Follow users
- Send & accept connection requests
- Personalized feed from connections
- Full profile customization
- User discovery by username, name, location, or bio

### 📱 Content Features

- Create posts (text / images / mixed)
- Upload up to 4 images
- View a media-only gallery
- Create 24‑hour disappearing stories (text, image, video)

### 💬 Messaging

- Real‑time chat using **Server‑Sent Events (SSE)**
- Multi‑tab syncing
- Share images
- Recent messages widget
- Read‑friendly chat UI

### ⚙️ Automation (Inngest)

- Story auto‑deletion after 24 hours
- Connection request follow‑up reminder email
- Daily unseen message digest
- Background workflows for user lifecycle

---

## 🛠️ Tech Stack

### **Frontend (Vite + React + TS)**

- React 19
- TypeScript
- Redux Toolkit
- TailwindCSS 4
- Axios
- React Router 7
- Clerk Auth

### **Backend (Node + Express + MongoDB)**

- Express.js
- MongoDB + Mongoose 8
- Clerk Auth Middleware
- Multer for file uploads
- ImageKit for image hosting
- Nodemailer (Brevo SMTP)
- SSE for real‑time communication
- Inngest for scheduled jobs

---

## 🚀 Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/BuzzConnect.git
cd BuzzConnect
```

---

## ⚙️ Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=

# Clerk
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# SMTP
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

Start server:

```bash
npm run dev
```

---

## 💻 Frontend Setup

```bash
cd client
npm install
```

Create `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASE_URL=http://localhost:4000
```

Start frontend:

```bash
npm run dev
```

---

## 🗂 Project Structure

```
BuzzConnect/
├── client/
│   ├── public/screenshots/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── features/
│       ├── app/
│       ├── api/
│       └── types/
└── server/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── models/
    ├── configs/
    ├── inngest/
    └── server.ts
```

---

## 🔗 API Endpoints

### User

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/user/data`        | Get user data           |
| POST   | `/api/user/discover`    | Search users            |
| POST   | `/api/user/follow`      | Follow user             |
| POST   | `/api/user/connect`     | Send connection request |
| POST   | `/api/user/accept`      | Accept request          |
| GET    | `/api/user/connections` | All connections         |

### Posts

| Method | Endpoint         | Description |
| ------ | ---------------- | ----------- |
| POST   | `/api/post/add`  | Create post |
| GET    | `/api/post/feed` | Get feed    |
| POST   | `/api/post/like` | Like/unlike |

### Stories

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| POST   | `/api/story/create` | Create story   |
| GET    | `/api/story/get`    | Active stories |

### Messaging

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/api/message/:userId` | SSE stream            |
| POST   | `/api/message/send`    | Send message          |
| POST   | `/api/message/get`     | Conversation messages |

---

## 🚀 Deployment (Vercel)

### Frontend

- Already deployed: https://buzz-connect.vercel.app

### Backend

- Already deployed: https://buzz-connect-server.vercel.app

---

## ⭐ Support

If you like this project, **please star the repo!** 🌟
