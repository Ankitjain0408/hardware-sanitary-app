# SHRI KRISHNA Hardware & Sanitary

A full-stack e-commerce application for hardware and sanitary products.

## Project Structure

```
hardware-sanitary-app/
├── backend/          # Express.js backend server
│   ├── server.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── config/
│
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── public/
│
└── docs/            # Documentation files
```

## Features

- **User Authentication**: Signup with email OTP, login, guest login, forgot password
- **Admin Panel**: Brand, Category, Main Category, and Product management
- **Product Management**: Image uploads via Cloudinary, stock management
- **Public Pages**: Explore by Brand, Category, and Products with filtering
- **Wishlist**: Session-based wishlist functionality
- **Brand Catalogs**: PDF catalog upload and download for brands

## Tech Stack

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- React Router DOM
- Tailwind CSS 4.1.17
- Axios

**Backend:**
- Node.js
- Express 5.2.1
- MongoDB (Mongoose)
- Express Session
- Nodemailer
- Cloudinary

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image storage)
- Email service credentials (for OTP)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables in `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
ADMIN_EMAIL=your_admin_email@gmail.com
ADMIN_PASSWORD=your_admin_password
```

3. Start development servers:
```bash
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build:frontend` - Build frontend for production
- `npm run start:backend` - Start backend in production mode
- `npm run install:all` - Install all dependencies

## Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

### Backend Production
```bash
cd backend
npm start
```

## Documentation

See the `docs/` folder for detailed documentation:
- `DATABASE_STRUCTURE.md` - Database schema and models
- `BACKEND_SETUP.md` - Backend setup guide
- `CLOUDINARY_SETUP.md` - Cloudinary configuration
- `EMAIL_SETUP.md` - Email service setup

## License

ISC
