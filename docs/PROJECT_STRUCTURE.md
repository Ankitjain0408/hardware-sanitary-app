# Project Structure

## Overview

The project is now organized into separate `backend/` and `frontend/` folders for better maintainability and deployment.

## Directory Structure

```
hardware-sanitary-app/
│
├── backend/                    # Backend Server (Express.js)
│   ├── server.js               # Main server file
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables (create this)
│   │
│   ├── config/                 # Configuration files
│   │   └── db.js              # Database connection
│   │
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── brandController.js
│   │   ├── categoryController.js
│   │   ├── imageController.js
│   │   └── productController.js
│   │
│   ├── models/                 # Database models
│   │   ├── Brand.js
│   │   ├── OTP.js
│   │   ├── Product.js
│   │   ├── ProductCategory.js
│   │   ├── ProductImage.js
│   │   └── user.js
│   │
│   ├── routes/                 # API routes
│   │   ├── brandRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── imageRoutes.js
│   │   └── productRoutes.js
│   │
│   ├── middlewares/            # Custom middlewares
│   │   └── authMiddleware.js
│   │
│   └── utils/                  # Utility functions
│       └── emailService.js
│
├── frontend/                    # Frontend Application (React + Vite)
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── index.html              # HTML entry point
│   │
│   ├── public/                 # Static assets
│   │   └── vite.svg
│   │
│   └── src/                    # Source code
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Main App component
│       ├── App.css
│       ├── index.css
│       │
│       ├── components/         # React components
│       │   ├── admin/          # Admin components
│       │   ├── AppNavbar.jsx
│       │   ├── Login.jsx
│       │   └── ...
│       │
│       └── pages/              # Page components
│           ├── admin/          # Admin pages
│           └── ...
│
├── docs/                       # Documentation
│   ├── SETUP.md
│   ├── EMAIL_SETUP.md
│   └── ...
│
├── package.json                # Root package.json (workspace)
├── README.md                   # Main README
└── .gitignore                  # Git ignore rules
```

## Running the Project

### Development

**Run both frontend and backend:**
```bash
npm run dev
```

**Run separately:**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

### Production

**Build frontend:**
```bash
cd frontend
npm run build
```

**Start backend:**
```bash
cd backend
npm start
```

## Environment Setup

Create `.env` file in `backend/` directory:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Benefits of This Structure

1. **Clear Separation**: Backend and frontend are completely separated
2. **Easy Deployment**: Can deploy backend and frontend separately
3. **Better Organization**: Related files are grouped together
4. **Scalability**: Easy to add more features or services
5. **Team Collaboration**: Different teams can work on backend/frontend independently

