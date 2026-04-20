# 🧹 Public Complaint Tracking System (Swachh-type)

A comprehensive MERN stack complaint management system where citizens can report civic issues and track resolution status transparently.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS 3
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT (Access + Refresh Tokens)

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/complaint-system
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
