// MongoDB Configuration
// API Base URL - change this when deploying to production
const API_BASE_URL = 'http://localhost:3000/api';

// Database Helper Functions
const database = {
    // Users
    async saveUser(userId, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, ...userData })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save user');
            }
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving user:', error);
            
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[userId] = userData;
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
    },

    async getUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            
            if (!response.ok) {
                throw new Error('User not found');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting user:', error);
            
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            return users[userId] || null;
        }
    },

    async getUserByEmail(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
            
            if (!response.ok) {
                return null;
            }
            
            const user = await response.json();
            return { id: user.userId, ...user };
        } catch (error) {
            console.error('Error getting user by email:', error);
            
            // Fallback to localStorage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            for (const [id, user] of Object.entries(users)) {
                if (user.email === email) {
                    return { id, ...user };
                }
            }
            return null;
        }
    },

    // Turfs
    async saveTurf(turfId, turfData) {
        try {
            const response = await fetch(`${API_BASE_URL}/turfs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ turfId, ...turfData })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save turf');
            }
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving turf:', error);
            
            // Fallback to localStorage
            const turfs = JSON.parse(localStorage.getItem('turfs') || '[]');
            const index = turfs.findIndex(t => t.id === turfId);
            if (index !== -1) {
                turfs[index] = { id: turfId, ...turfData };
            } else {
                turfs.push({ id: turfId, ...turfData });
            }
            localStorage.setItem('turfs', JSON.stringify(turfs));
            return true;
        }
    },

    async getAllTurfs() {
        try {
            const response = await fetch(`${API_BASE_URL}/turfs`);
            
            if (!response.ok) {
                throw new Error('Failed to get turfs');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting turfs:', error);
            
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('turfs') || '[]');
        }
    },

    async deleteTurf(turfId) {
        try {
            const response = await fetch(`${API_BASE_URL}/turfs/${turfId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete turf');
            }
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error deleting turf:', error);
            
            // Fallback to localStorage
            let turfs = JSON.parse(localStorage.getItem('turfs') || '[]');
            turfs = turfs.filter(t => t.id !== turfId);
            localStorage.setItem('turfs', JSON.stringify(turfs));
            return true;
        }
    },

    // Bookings
    async saveBooking(bookingId, bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookingId, ...bookingData })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save booking');
            }
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving booking:', error);
            
            // Fallback to localStorage
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push({ id: bookingId, ...bookingData });
            localStorage.setItem('bookings', JSON.stringify(bookings));
            return true;
        }
    },

    async getAllBookings() {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`);
            
            if (!response.ok) {
                throw new Error('Failed to get bookings');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting bookings:', error);
            
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('bookings') || '[]');
        }
    }
};

// Admin credentials (hardcoded for security)
const ADMIN_CREDENTIALS = {
    email: 'ramanrathore031204@gmail.com',
    password: 'Raman00'
};

// Initialize sample data if needed
async function initializeSampleData() {
    try {
        const turfs = await database.getAllTurfs();
        
        if (turfs.length === 0) {
            console.log('No turfs found. Sample data will be added by the server.');
            // Sample data is now handled by server.js
        }
    } catch (error) {
        console.error('Error checking for sample data:', error);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeSampleData);
