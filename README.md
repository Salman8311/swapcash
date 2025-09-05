# 💰 College Cash Swap

A modern web application that allows college students to exchange cash for digital money (or vice versa) with nearby users. Built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JavaScript.

## ✨ Features

- **User Authentication**: Secure signup with OTP verification via email
- **Geolocation Matching**: Find compatible users within 10km radius
- **Real-time Matching**: Instant matching based on location and preferences
- **Secure Transactions**: OTP verification and encrypted passwords
- **Responsive Design**: Modern, mobile-friendly UI

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account for OTP emails

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-cash-swap
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3000
   ```

   **Note**: For Gmail, you'll need to:
   - Enable 2-factor authentication
   - Generate an "App Password" and use that instead of your regular password

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open in browser:**
   Simply open `index.html` in your web browser, or serve it using a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (install http-server globally first)
   npx http-server
   ```

## 📱 How It Works

1. **Sign Up**: Users create accounts with email verification
2. **Post Request**: Users specify what they have (cash/digital) and what they want
3. **Find Matches**: The system finds compatible users within 10km radius
4. **Connect**: Users can connect and arrange the exchange

## 🏗️ Project Structure

```
college-cash-swap/
├── backend/
│   ├── models/
│   │   ├── Request.js      # Request schema with geospatial indexing
│   │   └── User.js         # User schema
│   ├── routes/              # API endpoints
│   ├── utils/
│   │   └── sendOtp.js      # Email OTP functionality
│   ├── server.js            # Main Express server
│   └── package.json
├── frontend/
│   ├── index.html           # Landing page
│   ├── signup.html          # User registration
│   ├── login.html           # User authentication
│   ├── request.html         # Post exchange requests
│   ├── requests.html        # Browse all requests
│   └── match.html           # Find matches
└── README.md
```

## 🔧 API Endpoints

- `POST /send-otp` - Send OTP to user's email
- `POST /signup` - User registration
- `POST /login` - User authentication
- `POST /post-request` - Create exchange request
- `POST /matching-requests` - Find compatible requests
- `GET /requests` - Get all requests
- `POST /find-matches` - Find matches for specific user

## 🎨 Frontend Features

- **Modern UI**: Clean, responsive design with gradient backgrounds
- **Form Validation**: Client-side validation with user-friendly error messages
- **Status Notifications**: Success/error messages with auto-hide
- **Navigation**: Easy navigation between different sections
- **Mobile Responsive**: Works perfectly on all device sizes

## 🔒 Security Features

- **Password Hashing**: Bcrypt encryption for user passwords
- **OTP Verification**: Email-based one-time password verification
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing configuration

## 🚧 Development

### Adding New Features

1. **Backend**: Add new routes in `server.js` or create separate route files
2. **Frontend**: Create new HTML files or enhance existing ones
3. **Database**: Modify schemas in the `models/` directory

### Testing

- Test the backend API endpoints using Postman or similar tools
- Test the frontend by opening HTML files in different browsers
- Test geolocation features on mobile devices

## 🌟 Future Enhancements

- [ ] Real-time chat between matched users
- [ ] Push notifications for new matches
- [ ] User ratings and reviews system
- [ ] Advanced filtering options
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running
4. Check your Gmail app password settings

## 🎯 Use Cases

- **Students with cash** who need digital money for online purchases
- **Students with digital money** who need cash for local expenses
- **Emergency situations** where quick currency conversion is needed
- **Campus events** where cash/digital exchange is required

---

**Built with ❤️ for the college community** 

## Mobile (Android) with Capacitor

- Ensure the backend is running and reachable from the device/emulator. On Android emulator, `http://10.0.2.2:3000` points to the host.
- Mobile project lives in `mobile/` and reuses `frontend/` as web assets.

Commands (from `mobile/`):

```bash
# 1) Copy frontend and sync
npm run build:web
npx cap copy

# 2) Open Android project
npx cap open android

# 3) Run from Android Studio on an emulator/device
```

Configure API base URL:

- The app detects Capacitor and on Android defaults to `http://10.0.2.2:3000`.
- Override at runtime by setting `localStorage.apiBaseUrl` to a full URL before login, e.g. in DevTools console. 