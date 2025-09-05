// Demo Data Script for College Cash Swap
// Run this after setting up your MongoDB connection

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB for demo data"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import models
const User = require('./models/User');
const Request = require('./models/Request');

// Sample users data
const sampleUsers = [
  {
    firstName: "John",
    secondName: "Doe",
    email: "john@college.edu",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    verified: true
  },
  {
    firstName: "Jane",
    secondName: "Smith",
    email: "jane@college.edu",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    verified: true
  },
  {
    firstName: "Mike",
    secondName: "Johnson",
    email: "mike@college.edu",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    verified: true
  }
];

// Sample requests data (around college campus coordinates)
const sampleRequests = [
  {
    name: "John Doe",
    email: "john@college.edu",
    have: "cash",
    want: "digital",
    amount: 500,
    location: {
      type: "Point",
      coordinates: [-73.935242, 40.730610] // NYC coordinates (example)
    },
    postedAt: new Date()
  },
  {
    name: "Jane Smith",
    email: "jane@college.edu",
    have: "digital",
    want: "cash",
    amount: 300,
    location: {
      type: "Point",
      coordinates: [-73.935242, 40.730610] // NYC coordinates (example)
    },
    postedAt: new Date()
  },
  {
    name: "Mike Johnson",
    email: "mike@college.edu",
    have: "cash",
    want: "digital",
    amount: 750,
    location: {
      type: "Point",
      coordinates: [-73.935242, 40.730610] // NYC coordinates (example)
    },
    postedAt: new Date()
  }
];

// Function to populate database
async function populateDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Request.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${users.length} sample users`);

    // Insert sample requests
    const requests = await Request.insertMany(sampleRequests);
    console.log(`📝 Created ${requests.length} sample requests`);

    console.log("\n✅ Demo data populated successfully!");
    console.log("\n📱 Test Accounts:");
    console.log("Email: john@college.edu, Password: password");
    console.log("Email: jane@college.edu, Password: password");
    console.log("Email: mike@college.edu, Password: password");

    console.log("\n🔍 Sample Requests Available:");
    requests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.name} has ${req.have} and wants ${req.want} (₹${req.amount})`);
    });

  } catch (error) {
    console.error("❌ Error populating database:", error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the script
populateDatabase(); 