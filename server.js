const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/turfbooking';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    turfId: { type: String, required: true },
    turfName: String,
    customerName: String,
    customerMobile: String,
    customerEmail: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
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
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        const user = new User({ userId, ...userData });
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: error.message });
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

// ==================== INITIALIZE SAMPLE DATA ====================

async function initializeSampleData() {
    try {
        const turfCount = await Turf.countDocuments();
        
        if (turfCount === 0) {
            console.log('🔄 Initializing sample data...');
            
            const sampleTurfs = [
                {
                    turfId: 'turf_' + Date.now(),
                    name: "Green Valley Sports Turf",
                    location: { lat: 23.2545, lng: 77.4050 },
                    address: "Near DB City Mall, Zone 2, Bhopal",
                    price: 1500,
                    type: "Football/Cricket",
                    rating: 4.5
                },
                {
                    turfId: 'turf_' + (Date.now() + 1),
                    name: "Champion's Arena",
                    location: { lat: 23.2370, lng: 77.4278 },
                    address: "Kolar Road, Bhopal",
                    price: 1200,
                    type: "Football",
                    rating: 4.2
                },
                {
                    turfId: 'turf_' + (Date.now() + 2),
                    name: "Sports Hub Bhopal",
                    location: { lat: 23.2710, lng: 77.3920 },
                    address: "Arera Colony, Bhopal",
                    price: 1800,
                    type: "Cricket/Football",
                    rating: 4.7
                }
            ];
            
            await Turf.insertMany(sampleTurfs);
            console.log('✅ Sample turfs added to database');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Catch-all route - serve index.html for any non-API routes (for client-side routing)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start Server (only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        initializeSampleData();
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    });
} else {
    // For production (Vercel), initialize sample data on cold start
    initializeSampleData();
}

// Export for Vercel
module.exports = app;
