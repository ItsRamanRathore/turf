// Turf Owner Dashboard functionality
let ownerTurfId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if owner is logged in
    const ownerId = sessionStorage.getItem('ownerLoggedIn');
    if (!ownerId) {
        alert('Unauthorized access! Please login as turf owner.');
        window.location.href = 'index.html';
        return;
    }
    
    // Get owner's turf (in production, fetch from database)
    initializeOwnerData();
    setupEventListeners();
});

async function initializeOwnerData() {
    // Get the turf ID from session storage
    ownerTurfId = sessionStorage.getItem('ownerLoggedIn');
    
    if (!ownerTurfId) {
        alert('Turf not found. Please login again.');
        window.location.href = 'index.html';
        return;
    }
    
    const turfs = await database.getAllTurfs();
    const turf = turfs.find(t => t.id === ownerTurfId);
    
    if (turf) {
        loadTurfDetails();
        loadStatistics();
        loadBookings();
    } else {
        document.getElementById('turfDetails').innerHTML = '<p>Turf not found. Please contact admin.</p>';
    }
}

// Load turf details
async function loadTurfDetails() {
    const turfs = await database.getAllTurfs();
    const turf = turfs.find(t => t.id === ownerTurfId);
    
    if (turf) {
        const sportsDisplay = turf.sports && turf.sports.length > 0 
            ? turf.sports.join(', ') 
            : turf.type;
        
        document.getElementById('turfDetails').innerHTML = `
            <div class="turf-details">
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Turf Name</span>
                    <span class="turf-detail-value">${turf.name}</span>
                </div>
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Address</span>
                    <span class="turf-detail-value">${turf.address}</span>
                </div>
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Primary Type</span>
                    <span class="turf-detail-value">${turf.type}</span>
                </div>
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Available Sports</span>
                    <span class="turf-detail-value">${sportsDisplay}</span>
                </div>
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Price per Hour</span>
                    <span class="turf-detail-value">₹${turf.price}</span>
                </div>
                <div class="turf-detail-item">
                    <span class="turf-detail-label">Rating</span>
                    <span class="turf-detail-value">${turf.rating}/5 ⭐</span>
                </div>
            </div>
        `;
    } else {
        document.getElementById('turfDetails').innerHTML = `
            <p>No turf assigned to this account. Please contact admin.</p>
        `;
    }
}

// Load statistics
async function loadStatistics() {
    const bookings = await database.getAllBookings();
    const turfBookings = bookings.filter(b => b.turfId === ownerTurfId);
    
    // Total bookings
    document.getElementById('totalBookings').textContent = turfBookings.length;
    
    // Today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = turfBookings.filter(b => b.date === today);
    document.getElementById('todayBookings').textContent = todayBookings.length;
    
    // Total revenue
    const totalRevenue = turfBookings.reduce((sum, b) => sum + b.price, 0);
    document.getElementById('totalRevenue').textContent = totalRevenue;
    
    // This month's revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthBookings = turfBookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear;
    });
    const monthRevenue = monthBookings.reduce((sum, b) => sum + b.price, 0);
    document.getElementById('monthRevenue').textContent = monthRevenue;
}

// Load bookings
async function loadBookings() {
    const bookings = await database.getAllBookings();
    const turfBookings = bookings.filter(b => b.turfId === ownerTurfId);
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    
    if (turfBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No bookings yet</td></tr>';
        return;
    }
    
    // Sort by date (most recent first)
    turfBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    turfBookings.forEach(booking => {
        const row = document.createElement('tr');
        const statusClass = booking.status === 'confirmed' ? 'confirmed' : booking.status === 'pending' ? 'pending' : 'cancelled';
        row.innerHTML = `
            <td>#${booking.id}</td>
            <td>${booking.customerName}</td>
            <td>${booking.customerMobile}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>₹${booking.price}</td>
            <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('ownerLoggedIn');
            sessionStorage.removeItem('ownerEmail');
            window.location.href = 'index.html';
        }
    });
    
    // Change password button
    const changePasswordBtn = document.getElementById('changeOwnerPasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            document.getElementById('changePasswordModal').style.display = 'block';
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Close modal
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
}

// Handle change password
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long!');
        return;
    }
    
    // Get current turf
    const turfs = await database.getAllTurfs();
    const turf = turfs.find(t => t.id === ownerTurfId);
    
    if (turf && turf.owner) {
        // Verify current password
        if (turf.owner.password !== currentPassword) {
            alert('Current password is incorrect!');
            return;
        }
        
        // Update password
        turf.owner.password = newPassword;
        await database.saveTurf(turf.id, turf);
        
        alert('Password changed successfully!');
        document.getElementById('changePasswordModal').style.display = 'none';
        document.getElementById('changePasswordForm').reset();
    } else {
        alert('Error updating password. Please try again.');
    }
}
