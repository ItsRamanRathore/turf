// Quick script to add demo turfs to MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/turfbooking';

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
    sports: [String],
    rating: { type: Number, default: 4.0 },
    owner: {
        email: String,
        password: String,
        name: String,
        mobile: String
    },
    ownerMerchantId: { type: String },
    ownerBankAccount: {
        accountNumber: String,
        ifsc: String,
        accountHolderName: String
    },
    paymentSplitEnabled: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const Turf = mongoose.model('Turf', turfSchema);

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

async function addDemoTurfs() {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Adding demo turfs...');
        let addedCount = 0;
        
        for (const turfData of demoTurfs) {
            const existing = await Turf.findOne({ turfId: turfData.turfId });
            if (!existing) {
                await Turf.create(turfData);
                console.log(`  ✓ Added: ${turfData.name}`);
                addedCount++;
            } else {
                console.log(`  ⊘ Skipped: ${turfData.name} (already exists)`);
            }
        }

        console.log(`\n✅ Successfully added ${addedCount} demo turfs!`);
        console.log(`📊 Total turfs in database: ${await Turf.countDocuments()}`);

        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addDemoTurfs();
