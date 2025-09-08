// Corrected server.js for Swapcash
// Notes: improved Mongo connection options, more flexible CORS handling,
// transporter verification and safer env checks, basic request validation,
// small bug fixes and additional defensive checks.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Security middleware (enable by default unless explicitly disabled)
if (process.env.HELMET_ENABLED !== 'false') {
  app.use(helmet());
}

// Trust proxy if behind reverse proxy (for rate limiting / secure cookies)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration — allow specific origins or fallback to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS ?
  process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) :
  ['http://localhost:3000', 'http://localhost:8000'];

const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use((req, res, next) => {
  // Simple health path bypass for internal checks
  if (req.path === '/health') return res.json({ ok: true });
  next();
});

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ---------------------
// MongoDB Connection
// ---------------------
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ CRITICAL: MONGODB_URI is not set in environment');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ---------------------
// OTP store (in-memory)
// ---------------------
const otpStore = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (!data || now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// ---------------------
// JWT Secret
// ---------------------
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

// ---------------------
// Auth middleware
// ---------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = payload;
    next();
  });
};

// ---------------------
// Nodemailer transporter
// ---------------------
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // verify transporter (non-blocking)
  transporter.verify().then(() => {
    console.log('✅ Email transporter ready');
  }).catch((err) => {
    console.warn('⚠️ Email transporter verification failed:', err.message || err);
  });
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set — OTP emails will fail.');
}

// ---------------------
// Rate limiter for OTP
// ---------------------
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: 'Too many OTP requests. Please try again in 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------
// Validation
// ---------------------
const validateEmail = body('email').isEmail().normalizeEmail();
const validateSignup = [
  body('firstName').trim().isLength({ min: 1, max: 50 }).escape(),
  body('secondName').trim().isLength({ min: 1, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
];

// ---------------------
// Send OTP
// ---------------------
app.post('/send-otp', otpLimiter, validateEmail, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid email format' });
  const { email } = req.body;

  if (!transporter) return res.status(500).json({ message: 'Email service not configured' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
  const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);

  otpStore.set(email, { otp, expiresAt, attempts: 0 });

  if (process.env.NODE_ENV === 'development') console.log('📧 OTP sent (dev):', { email, otp });

  const mailOptions = {
    from: `"CashSwap Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for CashSwap Signup',
    text: `Your OTP is: ${otp}. It is valid for ${expiryMinutes} minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to your email!' });
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ---------------------
// Models
// ---------------------
const User = mongoose.model('User', new mongoose.Schema({
  firstName: String,
  secondName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  verified: { type: Boolean, default: false }
}));

const RequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  have: String,
  want: String,
  amount: Number,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  postedAt: { type: Date, default: Date.now }
});
RequestSchema.index({ location: '2dsphere' });
const Request = mongoose.model('Request', RequestSchema);

const ConversationSchema = new mongoose.Schema({
  participants: [String],
  requestId: String,
  lastMessage: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);

// ---------------------
// Signup
// ---------------------
app.post('/signup', validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

  const { firstName, secondName, email, password, otp } = req.body;

  if (process.env.NODE_ENV === 'development') console.log('🔍 Signup attempt:', { email });

  const otpData = otpStore.get(email);
  if (!otpData || Date.now() > otpData.expiresAt) return res.status(400).json({ message: 'OTP expired or invalid' });

  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
  if (otpData.attempts >= maxAttempts) {
    otpStore.delete(email);
    return res.status(429).json({ message: 'Too many failed attempts. Please request a new OTP.' });
  }

  if (otpData.otp !== otp) {
    otpData.attempts += 1;
    otpStore.set(email, otpData);
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, secondName, email, password: hashedPassword, verified: true });
    await user.save();
    otpStore.delete(email);
    res.status(200).json({ message: 'Signup successful!' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// ---------------------
// Login
// ---------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: `Welcome back, ${user.firstName || 'user'}!`, token, user: { id: user._id, email: user.email, firstName: user.firstName } });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Login failed due to server error.' });
  }
});

// ---------------------
// Post a request
// ---------------------
app.post('/post-request', authenticateToken, async (req, res) => {
  const { name, email, have, want, amount, location } = req.body;

  if (!location || !Array.isArray(location.coordinates)) return res.status(400).json({ message: 'Location with coordinates is required.' });
  if (have === want) return res.status(400).json({ message: "You can't request the same thing you already have." });

  try {
    const newRequest = new Request({ name, email, have, want, amount, location });
    await newRequest.save();
    res.json({ message: 'Request posted successfully!', requestId: newRequest._id });
  } catch (err) {
    console.error('❌ Post request error:', err);
    res.status(500).json({ message: 'Failed to post request.' });
  }
});

// ---------------------
// Matching requests (based on location)
// ---------------------
app.post('/matching-requests', authenticateToken, async (req, res) => {
  const { have, location } = req.body;
  if (!location?.coordinates || !Array.isArray(location.coordinates)) return res.status(400).json({ message: 'Location coordinates required.' });

  try {
    const opposite = have === 'cash' ? 'digital' : 'cash';
    const matches = await Request.find({
      have: opposite,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: location.coordinates },
          $maxDistance: parseInt(process.env.MATCH_MAX_DISTANCE) || 10000
        }
      }
    });
    res.json(matches);
  } catch (err) {
    console.error('❌ Failed to fetch matching requests:', err);
    res.status(500).json({ message: 'Failed to find matches.' });
  }
});

// ---------------------
// Find matches using a user's most recent request
// ---------------------
app.post('/find-matches', async (req, res) => {
  const { email, latitude, longitude } = req.body;
  try {
    const myRequest = await Request.findOne({ email }).sort({ postedAt: -1 });
    if (!myRequest) return res.status(404).json({ message: 'Your request not found.' });

    const matches = await Request.find({
      email: { $ne: email },
      have: myRequest.want,
      want: myRequest.have,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(process.env.MATCH_MAX_DISTANCE) || 10000
        }
      }
    });

    res.json(matches);
  } catch (err) {
    console.error('❌ Error finding matches:', err);
    res.status(500).json({ message: 'Error finding matches.' });
  }
});

// ---------------------
// Conversations & messages
// ---------------------
app.post('/conversation', authenticateToken, async (req, res) => {
  const { user1Email, user2Email, requestId } = req.body;
  try {
    let conversation = await Conversation.findOne({ participants: { $all: [user1Email, user2Email] }, requestId });
    if (!conversation) {
      conversation = new Conversation({ participants: [user1Email, user2Email], requestId });
      await conversation.save();
    }
    res.json({ conversationId: conversation._id, participants: conversation.participants, createdAt: conversation.createdAt });
  } catch (err) {
    console.error('❌ Error creating conversation:', err);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

app.post('/send-message', authenticateToken, async (req, res) => {
  const { conversationId, sender, content } = req.body;
  try {
    const message = new Message({ conversationId, sender, content });
    await message.save();
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: new Date() });
    res.json({ messageId: message._id, timestamp: message.timestamp, message: 'Message sent successfully' });
  } catch (err) {
    console.error('❌ Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

app.get('/messages/:conversationId', authenticateToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

app.get('/conversations/user', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  try {
    const conversations = await Conversation.find({ participants: userEmail }).sort({ lastMessage: -1 });
    const conversationsWithLastMessage = await Promise.all(conversations.map(async (conv) => {
      const lastMessage = await Message.findOne({ conversationId: conv._id }).sort({ timestamp: -1 });
      return {
        conversationId: conv._id,
        participants: conv.participants.filter(p => p !== userEmail),
        requestId: conv.requestId,
        lastMessage: lastMessage ? lastMessage.content : '',
        lastMessageTime: lastMessage ? lastMessage.timestamp : conv.createdAt,
        unreadCount: await Message.countDocuments({ conversationId: conv._id, sender: { $ne: userEmail }, read: false })
      };
    }));
    res.json(conversationsWithLastMessage);
  } catch (err) {
    console.error('❌ Error fetching conversations:', err);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

app.post('/mark-read', authenticateToken, async (req, res) => {
  const { conversationId } = req.body;
  const userEmail = req.user.email;
  try {
    await Message.updateMany({ conversationId, sender: { $ne: userEmail }, read: false }, { read: true });
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Public list of requests
app.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ postedAt: -1 }).select('name email have want amount postedAt');
    res.json(requests);
  } catch (err) {
    console.error('❌ Error fetching requests:', err);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') console.log('✅ Production mode: HTTPS enforcement enabled');
});

