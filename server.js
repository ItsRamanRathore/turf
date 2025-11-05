const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper Content-Type headers
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        const responseTime = Date.now() - start;
        
        res.json({ 
            status: 'healthy',
            database: 'connected',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/turfbooking';

// MongoDB connection options
const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
    retryWrites: true,
    retryReads: true,
    bufferCommands: true, // Re-enable buffering with longer timeout
    autoIndex: true
};

// Set global buffer timeout to 30 seconds (instead of default 10)
mongoose.set('bufferTimeoutMS', 30000);

// Connect to MongoDB and wait for it to be ready
async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('✅ Connected to MongoDB');
        console.log('📡 Database:', mongoose.connection.name);
        console.log('🔗 Connection state:', mongoose.connection.readyState, '(1 = connected)');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        console.error('💡 Make sure MongoDB is running or check your connection string');
        // Don't exit - let it retry
    }
}

// Initialize connection
connectDB();

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    // Don't exit - let mongoose auto-reconnect
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('close', () => {
    console.log('🔌 MongoDB connection closed');
});

// Middleware to check MongoDB connection
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.error('❌ MongoDB not connected. State:', mongoose.connection.readyState);
        return res.status(503).json({ 
            error: 'Database is not connected. Please try again in a moment.',
            state: mongoose.connection.readyState 
        });
    }
    next();
};

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: String,
    mobile: String,
    email: { type: String, required: true, unique: true },
    password: String, // In production, hash this!
    type: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' },
    createdAt: { type: Date, default: Date.now }
});

const turfSchema = new mongoose.Schema({
    turfId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    address: { type: String, required: true },
    price: { type: Number, required: true },
    type: String,
    sports: [String], // Array of sports available
    rating: { type: Number, default: 4.0 },
    owner: {
        email: String,
        password: String,
        name: String,
        mobile: String
    },
    // Payment split configuration
    ownerMerchantId: { type: String }, // PhonePe Merchant ID for direct settlement
    ownerBankAccount: {
        accountNumber: String,
        ifsc: String,
        accountHolderName: String
    },
    paymentSplitEnabled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    turfId: { type: String, required: true },
    turfName: String,
    turfOwnerId: String, // Owner ID for payment split
    turfOwnerAccount: String, // Owner's PhonePe/Bank account for settlement
    customerName: String,
    customerMobile: String,
    customerEmail: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
    platformFee: { type: Number, default: 0 }, // 10% platform fee
    ownerAmount: { type: Number, default: 0 }, // 90% to owner
    totalAmount: { type: Number, required: true }, // Total paid by customer
    paymentSplit: {
        platform: { type: Number, default: 0 }, // Amount for platform
        owner: { type: Number, default: 0 } // Amount for owner
    },
    status: { type: String, default: 'confirmed' },
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Turf = mongoose.model('Turf', turfSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// ==================== USER ROUTES ====================

// Save/Create User
app.post('/api/users', async (req, res) => {
    try {
        const { userId, ...userData } = req.body;
        
        console.log('📝 Creating user:', userData.email);
        
        // Check if user already exists with timeout
        const existingUser = await User.findOne({ email: userData.email })
            .maxTimeMS(5000) // 5 second timeout for query
            .lean(); // Use lean for faster queries
            
        if (existingUser) {
            console.log('⚠️ User already exists:', userData.email);
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        console.log('✅ Creating new user...');
        const user = new User({ userId, ...userData });
        await user.save();
        
        console.log('✅ User created successfully:', userData.email);
        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ Error saving user:', error.message);
        
        // Handle specific MongoDB errors
        if (error.name === 'MongoTimeoutError') {
            return res.status(504).json({ 
                error: 'Database timeout. Please try again.',
                details: 'The database is taking too long to respond'
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'User with this email already exists'
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Failed to create user'
        });
    }
});

// Get User by ID
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get User by Email
app.get('/api/users/email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user by email:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== TURF ROUTES ====================

// Save/Update Turf
app.post('/api/turfs', async (req, res) => {
    try {
        const { turfId, ...turfData } = req.body;
        
        // Check if turf exists
        const existingTurf = await Turf.findOne({ turfId });
        
        if (existingTurf) {
            // Update existing turf
            Object.assign(existingTurf, turfData);
            existingTurf.updatedAt = new Date();
            await existingTurf.save();
            res.json({ success: true, turf: existingTurf });
        } else {
            // Create new turf
            const turf = new Turf({ turfId, ...turfData });
            await turf.save();
            res.json({ success: true, turf });
        }
    } catch (error) {
        console.error('Error saving turf:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Turfs
app.get('/api/turfs', async (req, res) => {
    try {
        const turfs = await Turf.find();
        // Convert to frontend-compatible format
        const turfsArray = turfs.map(turf => ({
            id: turf.turfId,
            name: turf.name,
            location: turf.location,
            address: turf.address,
            price: turf.price,
            type: turf.type,
            rating: turf.rating
        }));
        res.json(turfsArray);
    } catch (error) {
        console.error('Error getting turfs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Turf by ID
app.get('/api/turfs/:turfId', async (req, res) => {
    try {
        const turf = await Turf.findOne({ turfId: req.params.turfId });
        if (!turf) {
            return res.status(404).json({ error: 'Turf not found' });
        }
        res.json(turf);
    } catch (error) {
        console.error('Error getting turf:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete Turf
app.delete('/api/turfs/:turfId', async (req, res) => {
    try {
        const result = await Turf.deleteOne({ turfId: req.params.turfId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Turf not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting turf:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== BOOKING ROUTES ====================

// Create Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { bookingId, ...bookingData } = req.body;
        const booking = new Booking({ bookingId, ...bookingData });
        await booking.save();
        res.json({ success: true, booking });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        // Convert to frontend-compatible format
        const bookingsArray = bookings.map(booking => ({
            id: booking.bookingId,
            turfId: booking.turfId,
            turfName: booking.turfName,
            customerName: booking.customerName,
            customerMobile: booking.customerMobile,
            customerEmail: booking.customerEmail,
            date: booking.date,
            time: booking.time,
            price: booking.price,
            status: booking.status,
            createdAt: booking.createdAt
        }));
        res.json(bookingsArray);
    } catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Bookings by Turf ID
app.get('/api/bookings/turf/:turfId', async (req, res) => {
    try {
        const bookings = await Booking.find({ turfId: req.params.turfId });
        res.json(bookings);
    } catch (error) {
        console.error('Error getting bookings for turf:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Bookings by Customer Email
app.get('/api/bookings/customer/:email', async (req, res) => {
    try {
        const bookings = await Booking.find({ customerEmail: req.params.email });
        res.json(bookings);
    } catch (error) {
        console.error('Error getting bookings for customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== TURF OWNER PAYMENT DETAILS ====================

// Update Turf Owner Payment Details
app.post('/api/turfs/:turfId/payment-details', async (req, res) => {
    try {
        const { turfId } = req.params;
        const { ownerMerchantId, accountNumber, ifsc, accountHolderName, ownerEmail } = req.body;

        console.log('💳 Updating payment details for turf:', turfId);

        // Validate required fields
        if (!accountNumber || !ifsc || !accountHolderName) {
            return res.status(400).json({ 
                success: false, 
                error: 'Account Number, IFSC Code, and Account Holder Name are required' 
            });
        }

        // Find turf and verify owner
        const turf = await Turf.findOne({ turfId });
        
        if (!turf) {
            return res.status(404).json({ 
                success: false, 
                error: 'Turf not found' 
            });
        }

        // Update payment details
        turf.ownerMerchantId = ownerMerchantId || '';
        turf.ownerBankAccount = {
            accountNumber,
            ifsc,
            accountHolderName
        };
        turf.paymentSplitEnabled = true; // Enable split payment
        turf.updatedAt = new Date();

        await turf.save();

        console.log('✅ Payment details updated successfully');

        res.json({ 
            success: true, 
            message: 'Payment details updated successfully',
            paymentSplitEnabled: true
        });

    } catch (error) {
        console.error('❌ Error updating payment details:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get Turf Owner Payment Details
app.get('/api/turfs/:turfId/payment-details', async (req, res) => {
    try {
        const { turfId } = req.params;
        const turf = await Turf.findOne({ turfId });

        if (!turf) {
            return res.status(404).json({ 
                success: false, 
                error: 'Turf not found' 
            });
        }

        res.json({
            success: true,
            paymentDetails: {
                ownerMerchantId: turf.ownerMerchantId || '',
                accountNumber: turf.ownerBankAccount?.accountNumber || '',
                ifsc: turf.ownerBankAccount?.ifsc || '',
                accountHolderName: turf.ownerBankAccount?.accountHolderName || '',
                paymentSplitEnabled: turf.paymentSplitEnabled || false
            }
        });

    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ==================== DEMO DATA INITIALIZATION ENDPOINT ====================

// Endpoint to manually add demo turfs (for testing)
app.post('/api/init-demo-turfs', async (req, res) => {
    try {
        console.log('🔄 Manually initializing demo turfs...');
        
        // Clear existing turfs (optional - commented out for safety)
        // await Turf.deleteMany({});
        
        const demoTurfs = [
            {
                turfId: 'TURF001',
                name: "Green Valley Sports Arena",
                location: { lat: 23.2545, lng: 77.4050 },
                address: "Near DB City Mall, Zone 2, MP Nagar, Bhopal",
                price: 1500,
                type: "Football/Cricket",
                sports: ["Football", "Cricket"],
                rating: 4.5,
                owner: {
                    name: "Rajesh Kumar",
                    email: "rajesh@greenvalley.com",
                    mobile: "9876543210",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF002',
                name: "Champion's Football Arena",
                location: { lat: 23.2370, lng: 77.4278 },
                address: "Kolar Road, Near Manohar Dairy, Bhopal",
                price: 1200,
                type: "Football",
                sports: ["Football"],
                rating: 4.2,
                owner: {
                    name: "Amit Sharma",
                    email: "amit@championsarena.com",
                    mobile: "9876543211",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF003',
                name: "Sports Hub Bhopal",
                location: { lat: 23.2710, lng: 77.3920 },
                address: "Arera Colony, Behind Sagar Plaza, Bhopal",
                price: 1800,
                type: "Cricket/Football",
                sports: ["Cricket", "Football"],
                rating: 4.7,
                owner: {
                    name: "Vikram Singh",
                    email: "vikram@sportshub.com",
                    mobile: "9876543212",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF004',
                name: "Elite Sports Complex",
                location: { lat: 23.2156, lng: 77.4126 },
                address: "Hoshangabad Road, Near AIIMS, Bhopal",
                price: 2000,
                type: "Multi-Sport",
                sports: ["Football", "Cricket", "Basketball", "Badminton"],
                rating: 4.8,
                owner: {
                    name: "Priya Patel",
                    email: "priya@elitesports.com",
                    mobile: "9876543213",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF005',
                name: "Victory Turf",
                location: { lat: 23.2425, lng: 77.3911 },
                address: "Bittan Market, TT Nagar, Bhopal",
                price: 1000,
                type: "Football",
                sports: ["Football"],
                rating: 4.0,
                owner: {
                    name: "Suresh Yadav",
                    email: "suresh@victoryturf.com",
                    mobile: "9876543214",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF006',
                name: "Royal Cricket Arena",
                location: { lat: 23.2313, lng: 77.4363 },
                address: "Shahpura, Near City Hospital, Bhopal",
                price: 1600,
                type: "Cricket",
                sports: ["Cricket"],
                rating: 4.6,
                owner: {
                    name: "Arjun Malhotra",
                    email: "arjun@royalcricket.com",
                    mobile: "9876543215",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF007',
                name: "Metro Sports Ground",
                location: { lat: 23.2599, lng: 77.4126 },
                address: "New Market, Near Railway Station, Bhopal",
                price: 1300,
                type: "Football/Cricket",
                sports: ["Football", "Cricket"],
                rating: 4.3,
                owner: {
                    name: "Sanjay Verma",
                    email: "sanjay@metrosports.com",
                    mobile: "9876543216",
                    password: "password123"
                }
            },
            {
                turfId: 'TURF008',
                name: "Sunrise Sports Academy",
                location: { lat: 23.2044, lng: 77.4225 },
                address: "Bairagarh, Near Bypass Road, Bhopal",
                price: 1400,
                type: "Multi-Sport",
                sports: ["Football", "Cricket", "Badminton"],
                rating: 4.4,
                owner: {
                    name: "Meena Joshi",
                    email: "meena@sunrisesports.com",
                    mobile: "9876543217",
                    password: "password123"
                }
            }
        ];
        
        // Insert turfs (skip duplicates)
        let addedCount = 0;
        for (const turfData of demoTurfs) {
            const existing = await Turf.findOne({ turfId: turfData.turfId });
            if (!existing) {
                await Turf.create(turfData);
                addedCount++;
            }
        }
        
        console.log(`✅ ${addedCount} demo turfs added successfully`);
        res.json({ 
            success: true, 
            message: `${addedCount} demo turfs added successfully`,
            total: demoTurfs.length 
        });
        
    } catch (error) {
        console.error('❌ Error initializing demo turfs:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ==================== INITIALIZE SAMPLE DATA ====================

async function initializeSampleData() {
    try {
        const turfCount = await Turf.countDocuments();
        
        if (turfCount === 0) {
            console.log('🔄 Initializing sample data...');
            
            const sampleTurfs = [
                {
                    turfId: 'TURF001',
                    name: "Green Valley Sports Arena",
                    location: { lat: 23.2545, lng: 77.4050 },
                    address: "Near DB City Mall, Zone 2, MP Nagar, Bhopal",
                    price: 1500,
                    type: "Football/Cricket",
                    sports: ["Football", "Cricket"],
                    rating: 4.5,
                    owner: {
                        name: "Rajesh Kumar",
                        email: "rajesh@greenvalley.com",
                        mobile: "9876543210"
                    }
                },
                {
                    turfId: 'TURF002',
                    name: "Champion's Football Arena",
                    location: { lat: 23.2370, lng: 77.4278 },
                    address: "Kolar Road, Near Manohar Dairy, Bhopal",
                    price: 1200,
                    type: "Football",
                    sports: ["Football"],
                    rating: 4.2,
                    owner: {
                        name: "Amit Sharma",
                        email: "amit@championsarena.com",
                        mobile: "9876543211"
                    }
                },
                {
                    turfId: 'TURF003',
                    name: "Sports Hub Bhopal",
                    location: { lat: 23.2710, lng: 77.3920 },
                    address: "Arera Colony, Behind Sagar Plaza, Bhopal",
                    price: 1800,
                    type: "Cricket/Football",
                    sports: ["Cricket", "Football"],
                    rating: 4.7,
                    owner: {
                        name: "Vikram Singh",
                        email: "vikram@sportshub.com",
                        mobile: "9876543212"
                    }
                },
                {
                    turfId: 'TURF004',
                    name: "Elite Sports Complex",
                    location: { lat: 23.2156, lng: 77.4126 },
                    address: "Hoshangabad Road, Near AIIMS, Bhopal",
                    price: 2000,
                    type: "Multi-Sport",
                    sports: ["Football", "Cricket", "Basketball", "Badminton"],
                    rating: 4.8,
                    owner: {
                        name: "Priya Patel",
                        email: "priya@elitesports.com",
                        mobile: "9876543213"
                    }
                },
                {
                    turfId: 'TURF005',
                    name: "Victory Turf",
                    location: { lat: 23.2425, lng: 77.3911 },
                    address: "Bittan Market, TT Nagar, Bhopal",
                    price: 1000,
                    type: "Football",
                    sports: ["Football"],
                    rating: 4.0,
                    owner: {
                        name: "Suresh Yadav",
                        email: "suresh@victoryturf.com",
                        mobile: "9876543214"
                    }
                },
                {
                    turfId: 'TURF006',
                    name: "Royal Cricket Arena",
                    location: { lat: 23.2313, lng: 77.4363 },
                    address: "Shahpura, Near City Hospital, Bhopal",
                    price: 1600,
                    type: "Cricket",
                    sports: ["Cricket"],
                    rating: 4.6,
                    owner: {
                        name: "Arjun Malhotra",
                        email: "arjun@royalcricket.com",
                        mobile: "9876543215"
                    }
                },
                {
                    turfId: 'TURF007',
                    name: "Metro Sports Ground",
                    location: { lat: 23.2599, lng: 77.4126 },
                    address: "New Market, Near Railway Station, Bhopal",
                    price: 1300,
                    type: "Football/Cricket",
                    sports: ["Football", "Cricket"],
                    rating: 4.3,
                    owner: {
                        name: "Sanjay Verma",
                        email: "sanjay@metrosports.com",
                        mobile: "9876543216"
                    }
                },
                {
                    turfId: 'TURF008',
                    name: "Sunrise Sports Academy",
                    location: { lat: 23.2044, lng: 77.4225 },
                    address: "Bairagarh, Near Bypass Road, Bhopal",
                    price: 1400,
                    type: "Multi-Sport",
                    sports: ["Football", "Cricket", "Badminton"],
                    rating: 4.4,
                    owner: {
                        name: "Meena Joshi",
                        email: "meena@sunrisesports.com",
                        mobile: "9876543217"
                    }
                }
            ];
            
            await Turf.insertMany(sampleTurfs);
            console.log('✅ 8 Sample turfs added to database');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// ==================== PHONEPE PAYMENT ROUTES ====================

// Platform Fee Configuration
const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee

// Calculate payment split
function calculatePaymentSplit(totalAmount) {
    const platformFee = Math.round((totalAmount * PLATFORM_FEE_PERCENTAGE) / 100);
    const ownerAmount = totalAmount - platformFee;
    
    return {
        total: totalAmount,
        platformFee: platformFee,
        ownerAmount: ownerAmount,
        platformPercentage: PLATFORM_FEE_PERCENTAGE,
        ownerPercentage: 100 - PLATFORM_FEE_PERCENTAGE
    };
}

// PhonePe Payment Configuration
const PHONEPE_CONFIG = {
    merchantId: process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT',
    saltKey: process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
    apiEndpoint: process.env.PHONEPE_ENV === 'production' 
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
    redirectUrl: process.env.PHONEPE_REDIRECT_URL || 'http://localhost:3000',
    callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'http://localhost:3000/api/phonepe/callback',
    // Platform account for receiving 10% fee
    platformMerchantId: process.env.PHONEPE_PLATFORM_MERCHANT_ID || process.env.PHONEPE_MERCHANT_ID
};

// Generate PhonePe checksum
function generatePhonePeChecksum(payload, endpoint) {
    const string = payload + endpoint + PHONEPE_CONFIG.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + PHONEPE_CONFIG.saltIndex;
}

// Initiate PhonePe payment
app.post('/api/phonepe/initiate', async (req, res) => {
    try {
        const { amount, bookingDetails } = req.body;

        // Calculate payment split (10% platform, 90% owner)
        const paymentSplit = calculatePaymentSplit(amount);

        // Generate unique transaction ID
        const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        const merchantUserId = 'USER_' + Date.now();

        // Get turf owner information for split payment
        let turfOwnerMerchantId = null;
        try {
            const turf = await Turf.findOne({ turfId: bookingDetails.turfId });
            if (turf && turf.ownerMerchantId) {
                turfOwnerMerchantId = turf.ownerMerchantId;
            }
        } catch (error) {
            console.log('⚠️ Could not fetch turf owner info:', error.message);
        }

        // Create payment payload with split configuration
        const paymentPayload = {
            merchantId: PHONEPE_CONFIG.merchantId,
            merchantTransactionId: transactionId,
            merchantUserId: merchantUserId,
            amount: amount, // Total amount in paise
            redirectUrl: `${PHONEPE_CONFIG.redirectUrl}?transactionId=${transactionId}`,
            redirectMode: 'REDIRECT',
            callbackUrl: PHONEPE_CONFIG.callbackUrl,
            mobileNumber: bookingDetails.customerMobile,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        // Add split payment configuration if owner merchant ID exists
        // PhonePe Split Payment: Allows direct settlement to multiple accounts
        if (turfOwnerMerchantId) {
            paymentPayload.splits = [
                {
                    merchantId: PHONEPE_CONFIG.platformMerchantId, // Platform gets 10%
                    amount: paymentSplit.platformFee,
                    splitType: 'PERCENTAGE',
                    percentage: PLATFORM_FEE_PERCENTAGE
                },
                {
                    merchantId: turfOwnerMerchantId, // Owner gets 90%
                    amount: paymentSplit.ownerAmount,
                    splitType: 'PERCENTAGE', 
                    percentage: 100 - PLATFORM_FEE_PERCENTAGE
                }
            ];
        }

        // Store booking details with split info temporarily
        global.pendingBookings = global.pendingBookings || {};
        global.pendingBookings[transactionId] = {
            ...bookingDetails,
            amount: amount,
            paymentSplit: paymentSplit,
            turfOwnerMerchantId: turfOwnerMerchantId,
            transactionId: transactionId,
            createdAt: new Date()
        };

        // Encode payload to base64
        const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

        // Generate checksum
        const checksum = generatePhonePeChecksum(base64Payload, '/pg/v1/pay');

        console.log('🚀 Initiating PhonePe Payment with Split:', {
            transactionId,
            totalAmount: amount / 100,
            platformFee: paymentSplit.platformFee / 100,
            ownerAmount: paymentSplit.ownerAmount / 100,
            mobile: bookingDetails.customerMobile,
            splitEnabled: !!turfOwnerMerchantId
        });

        // Make API request to PhonePe
        const response = await axios.post(
            `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/pay`,
            {
                request: base64Payload
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
                }
            }
        );

        console.log('✅ PhonePe Response:', response.data);

        if (response.data.success) {
            res.json({
                success: true,
                message: 'Payment initiated successfully',
                data: response.data.data,
                transactionId: transactionId,
                paymentSplit: {
                    total: paymentSplit.total / 100,
                    platformFee: paymentSplit.platformFee / 100,
                    ownerAmount: paymentSplit.ownerAmount / 100
                }
            });
        } else {
            throw new Error(response.data.message || 'Payment initiation failed');
        }

    } catch (error) {
        console.error('❌ PhonePe initiation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.response?.data || error.message
        });
    }
});

// Check PhonePe payment status
app.get('/api/phonepe/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Generate checksum for status check
        const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}`;
        const string = endpoint + PHONEPE_CONFIG.saltKey;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + PHONEPE_CONFIG.saltIndex;

        console.log('🔍 Checking payment status for:', transactionId);

        // Check payment status from PhonePe
        const response = await axios.get(
            `${PHONEPE_CONFIG.apiEndpoint}${endpoint}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
                }
            }
        );

        console.log('✅ PhonePe Status Response:', response.data);

        if (response.data.success) {
            // Get booking details
            const bookingDetails = global.pendingBookings?.[transactionId] || {};
            
            res.json({
                success: true,
                code: response.data.code,
                message: response.data.message,
                data: {
                    transactionId: transactionId,
                    amount: response.data.data.amount,
                    state: response.data.data.state,
                    responseCode: response.data.data.responseCode,
                    bookingDetails: bookingDetails
                }
            });

            // Clean up pending booking if payment is successful
            if (response.data.code === 'PAYMENT_SUCCESS' && global.pendingBookings?.[transactionId]) {
                delete global.pendingBookings[transactionId];
            }
        } else {
            res.json({
                success: false,
                code: response.data.code,
                message: response.data.message
            });
        }

    } catch (error) {
        console.error('❌ PhonePe status check error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: error.response?.data || error.message
        });
    }
});

// PhonePe callback endpoint (webhook)
app.post('/api/phonepe/callback', async (req, res) => {
    try {
        const callback = req.body;
        console.log('PhonePe Callback:', callback);

        // Verify checksum
        const receivedChecksum = req.headers['x-verify'];
        const base64Response = callback.response;
        
        const calculatedChecksum = generatePhonePeChecksum(base64Response, '');
        
        // Decode response
        const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString());
        
        console.log('Decoded Callback Response:', decodedResponse);

        // Process payment based on status
        if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
            console.log('Payment successful for transaction:', decodedResponse.data.merchantTransactionId);
            // You can update database here
        }

        // Always return success to PhonePe
        res.json({ success: true });

    } catch (error) {
        console.error('PhonePe callback error:', error);
        res.status(500).json({
            success: false,
            message: 'Callback processing failed'
        });
    }
});

// Refund endpoint (optional)
app.post('/api/phonepe/refund', async (req, res) => {
    try {
        const { transactionId, amount } = req.body;

        const refundId = 'REFUND_' + Date.now();
        
        const refundPayload = {
            merchantId: PHONEPE_CONFIG.merchantId,
            merchantTransactionId: transactionId,
            originalTransactionId: transactionId,
            amount: amount,
            callbackUrl: PHONEPE_CONFIG.callbackUrl
        };

        const base64Payload = Buffer.from(JSON.stringify(refundPayload)).toString('base64');
        const checksum = generatePhonePeChecksum(base64Payload, '/pg/v1/refund');

        const response = await axios.post(
            `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/refund`,
            {
                request: base64Payload
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum
                }
            }
        );

        res.json({
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        });

    } catch (error) {
        console.error('PhonePe refund error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Refund failed',
            error: error.response?.data || error.message
        });
    }
});

// Catch-all route - serve index.html for any non-API routes (for client-side routing)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start Server (only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        
        // Wait for MongoDB connection before initializing data
        if (mongoose.connection.readyState === 1) {
            await initializeSampleData();
        } else {
            mongoose.connection.once('connected', async () => {
                await initializeSampleData();
            });
        }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received shutdown signal (SIGINT)');
        console.log('⏳ Closing MongoDB connection gracefully...');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        console.log('👋 Server stopped');
        process.exit(0);
    });
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught Exception:', error);
        console.error('Stack:', error.stack);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 Unhandled Rejection at:', promise);
        console.error('Reason:', reason);
    });
} else {
    // For production (Vercel), initialize sample data on cold start
    mongoose.connection.once('connected', async () => {
        await initializeSampleData();
    });
}

// Export for Vercel
module.exports = app;
