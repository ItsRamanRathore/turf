// Test MongoDB Atlas Connection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('📡 Connection String:', MONGODB_URI.substring(0, 50) + '...');

const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
};

async function testConnection() {
    try {
        console.log('\n⏳ Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, options);
        
        console.log('✅ Connected successfully!');
        console.log('📊 Connection State:', mongoose.connection.readyState);
        console.log('🗄️ Database:', mongoose.connection.name);
        
        // Test a simple query
        console.log('\n⏳ Testing database query...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('✅ Found', collections.length, 'collections:', collections.map(c => c.name).join(', '));
        
        // Keep connection alive for 10 seconds
        console.log('\n⏳ Keeping connection alive for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('✅ Connection stayed alive!');
        console.log('📊 Final State:', mongoose.connection.readyState);
        
        await mongoose.connection.close();
        console.log('\n✅ Test completed successfully - MongoDB Atlas is working!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Connection Error:', error.message);
        console.error('\n🔧 Possible issues:');
        console.error('   1. Wrong password (check %40 encoding for @ symbol)');
        console.error('   2. IP not whitelisted in MongoDB Atlas (add 0.0.0.0/0 to whitelist)');
        console.error('   3. Network/firewall blocking connection');
        console.error('   4. Wrong database name or cluster URL');
        process.exit(1);
    }
}

testConnection();
