![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white)

# ♻️ DisposeHub

DisposeHub is a production-ready **MERN Stack** waste disposal platform that connects users and drivers through **real-time request management**.

Users can create disposal requests with images, while drivers receive instant updates, accept requests, complete pickups, and compete on a live leaderboard.

The project demonstrates secure authentication, real-time communication, cloud-based media storage, and production deployment using modern web technologies.


## ⭐ Key Highlights

- 🔐 JWT Authentication with HTTP-only Cookies
- 🌐 Google OAuth Login
- ⚡ Real-time updates using Socket.IO
- 👥 Role-based access for Users & Drivers
- 📷 Cloudinary Image Uploads
- 📧 Email Notifications with Nodemailer
- 🏆 Live Leaderboard
- 🚀 Fully Deployed on Render

## 🚀 Live Demo

| Service | Link |
|---------|------|
| 🌐 Frontend | https://disposehub-client.onrender.com |
| 🔗 Backend API | https://disposehub.onrender.com |

## 📑 Table of Contents

- [⭐ Key Highlights](#-key-highlights)
- [🚀 Live Demo](#-live-demo)
- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🏗️ Application Architecture](#️-application-architecture)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [📡 API Overview](#-api-overview)
- [🔄 Real-Time Workflow](#-real-time-workflow)
- [🚀 Deployment Architecture](#-deployment-architecture)
- [🚀 Future Improvements](#-future-improvements)
- [👥 Contributors](#-contributors)
- [👨‍💻 Author](#-author)


## ✨ Features

| Module | Features |
|---------|----------|
| Authentication | Email Login, Google OAuth, JWT, Secure Cookies |
| User | Create Requests, Upload Images, Track Status, Notifications |
| Driver | Accept Requests, Complete Pickups |
| Real-Time | Socket.IO, Live Notifications, Live Leaderboard |
| Security | Protected Routes, RBAC, CORS |
| Deployment | Render, MongoDB Atlas, Cloudinary |

## 📸 Screenshots

| Home | User Dashboard |
|------|----------------|
| ![Home](image.png) | ![User Dashboard](image-1.png) |

|  **Map Activity**  | **Leaderboard** |
|------------------|-------------|
| ![Map Activity](image-10.png) | ![Leaderboard](image-3.png) |

| **Login** |**Support** |
|-------|----------|
| ![Login](image-7.png) | ![Support](image-9.png) |


## 🏗️ Application Architecture

```mermaid
flowchart TD
    A[React Frontend] -->|REST API| B[Express Backend]
    A -->|Socket.IO| B
    B --> C[(MongoDB Atlas)]
    B --> D[Cloudinary]
    B --> E[Google OAuth]
    B --> F[Nodemailer]
```


## 🛠 Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![Socket.IO Client](https://img.shields.io/badge/Socket.IO_Client-010101?logo=socketdotio&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?logo=passport&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF6B6B)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-30B980?logo=maildotru&logoColor=white)

### Deployment

![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)

## 📁 Folder Structure

```text
DisposeHub
├── client
│   ├── src
│   └── public
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── sockets
│   └── utils
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Anujsharma88085/DisposeHub.git
cd DisposeHub
```

### 2. Install dependencies

**Backend**

```bash
cd server
npm install
```

**Frontend**

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create:

- server/.env
- client/.env

Refer to the Environment Variables section below.

### 4. Run the application

Open two terminals.

**Terminal 1 – Server**

```bash
cd server
npm run dev
```

**Terminal 2 – Client**

```bash
cd client
npm run dev
```

## 🔐 Environment Variables

### Server (`server/.env`)

```env
PORT=

MONGO_URI=

JWT_SECRET=
JWT_EXPIRES_IN=
COOKIE_EXPIRES_IN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

BACKEND_URL=
FRONTEND_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=
VITE_SOCKET_URL=
```

## 📡 API Overview

| Module | Method | Endpoint |
|--------|:------:|----------|
| **Authentication** | `POST` | `/users/signup` |
| | `POST` | `/users/login` |
| | `GET` | `/auth/google` |
| **User** | `POST` | `/save` |
| | `GET` | `/active-locations` |
| | `PATCH` | `/:id/cancel` |
| **Driver** | `GET` | `/active-locations` |
| | `PATCH` | `/:id/deactivate` |

## 🔄 Real-Time Workflow

```mermaid
flowchart TD
    A[👤 User Creates Request]
    --> B[⚡ Socket Event Emitted]
    --> C[🚛 Driver Receives Request Instantly]
    --> D[✅ Driver Accepts Request]
    --> E[🔔 User Receives Live Update]
    --> F[♻️ Driver Completes Pickup]
    --> G[🏆 Leaderboard Updates]
```


## 🚀 Deployment Architecture

```mermaid
flowchart LR
    U[👤 User]
    --> F[🌐 Frontend<br/>Render Static Site]

    F -->|REST API / Socket.IO| B[⚙️ Backend<br/>Render Web Service]

    B --> DB[(🍃 MongoDB Atlas)]
    B --> C[(☁️ Cloudinary)]
    B --> G[🔐 Google OAuth]
    B --> N[📧 Nodemailer]
```

## 🚀 Future Improvements

- 🔔 Push Notifications
- 🤖 AI-based Waste Classification
- 📊 Analytics Dashboard


## 👥 Contributors

- [Anuj Kumar Sharma](https://github.com/Anujsharma88085)
- [Abhay Sharma](https://github.com/abhaysharma20233009)
- [Aryan Mishra](https://github.com/aryan-username)

## 👨‍💻 Author

**Anuj Kumar Sharma**

[![GitHub](https://img.shields.io/badge/GitHub-Anujsharma88085-181717?logo=github&logoColor=white)](https://github.com/Anujsharma88085)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anuj%20Kumar%20Sharma-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anujsharma88085/)

⭐ If you found this project helpful, consider giving it a star!
