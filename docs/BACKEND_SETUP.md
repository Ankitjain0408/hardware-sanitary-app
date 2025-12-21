# 🗄️ Backend Database Setup Guide

## Prerequisites
- Node.js installed
- MongoDB account (Atlas) or local MongoDB installation

## Step-by-Step Setup

### Step 1: Install Dependencies ✅
Already done! Dependencies are installed.

### Step 2: Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Easiest) 🌐

1. **Create Account**: Go to https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: 
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create"
3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or any name)
   - Password: Create a strong password (save it!)
   - Click "Add User"
4. **Whitelist IP Address**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Add Current IP Address" or use `0.0.0.0/0` for all IPs (development only)
5. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hardware-sanitary-app?retryWrites=true&w=majority`

#### Option B: Local MongoDB 💻

1. **Download**: https://www.mongodb.com/try/download/community
2. **Install**: Follow installation wizard
3. **Start Service**: MongoDB should start automatically
4. **Connection String**: `mongodb://localhost:27017/hardware-sanitary-app`

### Step 3: Create .env File

Create a file named `.env` in the root directory (same level as package.json):

```env
PORT=5000
MONGO_URL=your_connection_string_here
SESSION_SECRET=your_random_secret_key_min_32_characters

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Example .env file:**
```env
PORT=5000
MONGO_URL=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/hardware-sanitary-app?retryWrites=true&w=majority
SESSION_SECRET=my_super_secret_session_key_that_is_very_long_12345678901234567890

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=my_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**Note:** See `docs/CLOUDINARY_SETUP.md` for detailed Cloudinary setup instructions.

**To generate a random SESSION_SECRET**, you can:
- Use: https://randomkeygen.com/
- Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 4: Start Backend Server

```bash
npm run server
```

**Expected Output:**
```
MongoDB connected
Server running on port 5000
```

### Step 5: Start Frontend (New Terminal)

```bash
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## ✅ Testing

1. Open http://localhost:5173
2. Click the **User icon** (top right) in the navbar
3. Try **Signup** with:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123 (must have uppercase and number)
4. After signup, try **Login**

## 🔧 Troubleshooting

**"MongoDB connection failed"**
- Check your MONGO_URL in .env file
- Make sure password doesn't have special characters (or URL encode them)
- For Atlas: Check IP whitelist includes your IP

**"Port 5000 already in use"**
- Change PORT in .env to another number (e.g., 5001)
- Or stop the process using port 5000

**"Cannot find module"**
- Run `npm install` again

**CORS errors**
- Make sure backend is running on port 5000
- Make sure frontend is running on port 5173
- Check server.js has correct CORS origin

## 📝 Notes

- `.env` file is in `.gitignore` - it won't be committed to git
- Never share your `.env` file or commit it to version control
- For production, use environment variables on your hosting platform

