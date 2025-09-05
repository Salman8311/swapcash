# 🔧 Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/college-cash-swap
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=3000
```

## 📍 MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/college-cash-swap`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get connection string
4. Use: `mongodb+srv://username:password@cluster.mongodb.net/college-cash-swap`

## 📧 Gmail Setup for OTP

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Generate new app password for "Mail"
4. Use this password in `EMAIL_PASS`

### Step 3: Update .env File
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

## 🚀 Quick Test

After setting up:

1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Check console for:
   - ✅ Connected to MongoDB Atlas
   - 🚀 Server running on http://localhost:3000

## 🔍 Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify connection string format
- Check network/firewall settings

### Email Issues
- Verify Gmail app password
- Check 2FA is enabled
- Ensure email credentials are correct

### Port Issues
- Change PORT in .env if 3000 is busy
- Check if another service is using the port 