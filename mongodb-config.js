// MongoDB API Wrapper
// This provides a database object that communicates with the server API

const database = {
    // Get all turfs
    async getAllTurfs() {
        try {
            const response = await fetch('/api/turfs');
            if (!response.ok) throw new Error('Failed to fetch turfs');
            const turfs = await response.json();
            
            // Convert to expected format
            return turfs.map(turf => ({
                id: turf.turfId,
                name: turf.name,
                location: turf.location,
                address: turf.address,
                price: turf.price,
                type: turf.type,
                sports: turf.sports || [],
                rating: turf.rating || 4.0,
                owner: turf.owner
            }));
        } catch (error) {
            console.error('Error fetching turfs:', error);
            return [];
        }
    },

    // Save turf
    async saveTurf(turfId, turfData) {
        try {
            const response = await fetch('/api/turfs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    turfId: turfId,
                    ...turfData
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving turf:', error);
            return false;
        }
    },

    // Get all users
    async getAllUsers() {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const users = await response.json();
            
            // Convert to expected format
            return users.map(user => ({
                id: user.userId,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                password: user.password,
                type: user.type
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    // Get user by email
    async getUserByEmail(email) {
        try {
            const users = await this.getAllUsers();
            return users.find(u => u.email === email);
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Save user
    async saveUser(userId, userData) {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    ...userData
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    },

    // Get all bookings
    async getAllBookings() {
        try {
            const response = await fetch('/api/bookings');
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const bookings = await response.json();
            
            // Convert to expected format
            return bookings.map(booking => ({
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
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    },

    // Save booking
    async saveBooking(bookingId, bookingData) {
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingId,
                    ...bookingData
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving booking:', error);
            return false;
        }
    },

    // Get bookings by turf
    async getBookingsByTurf(turfId) {
        try {
            const response = await fetch(`/api/bookings/turf/${turfId}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            return await response.json();
        } catch (error) {
            console.error('Error fetching turf bookings:', error);
            return [];
        }
    },

    // Get bookings by customer
    async getBookingsByCustomer(email) {
        try {
            const response = await fetch(`/api/bookings/customer/${email}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer bookings:', error);
            return [];
        }
    }
};

// Admin credentials (defined globally)
const ADMIN_CREDENTIALS = {
    email: 'admin@turfbooking.com',
    password: 'admin123'
};

console.log('✅ MongoDB API Wrapper loaded');
