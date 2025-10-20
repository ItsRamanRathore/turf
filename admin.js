// Admin panel functionality
let adminMap;
let selectedMarker;
let editingTurfId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const isAdmin = sessionStorage.getItem('adminLoggedIn');
    if (!isAdmin) {
        alert('Unauthorized access! Please login as admin.');
        window.location.href = 'index.html';
        return;
    }
    
    loadStatistics();
    loadTurfsTable();
    loadBookingsTable();
    setupEventListeners();
});

// Load statistics
async function loadStatistics() {
    const turfs = await database.getAllTurfs();
    const bookings = await database.getAllBookings();
    
    document.getElementById('totalTurfs').textContent = turfs.length;
    document.getElementById('totalBookings').textContent = bookings.length;
    
    // Calculate today's revenue
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.price, 0);
    document.getElementById('todayRevenue').textContent = todayRevenue;
    
    // Active users (unique customers)
    const uniqueCustomers = new Set(bookings.map(b => b.customerMobile));
    document.getElementById('activeUsers').textContent = uniqueCustomers.size;
}

// Load turfs table
async function loadTurfsTable() {
    const turfs = await database.getAllTurfs();
    const tbody = document.getElementById('turfsTableBody');
    tbody.innerHTML = '';
    
    if (turfs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No turfs registered yet</td></tr>';
        return;
    }
    
    turfs.forEach(turf => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${turf.id}</td>
            <td>${turf.name}</td>
            <td>${turf.address}</td>
            <td>${turf.type}</td>
            <td>₹${turf.price}</td>
            <td>${turf.rating}/5</td>
            <td>
                <button class="action-btn btn-edit" onclick="editTurf('${turf.id}')">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteTurf('${turf.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load bookings table
async function loadBookingsTable() {
    const bookings = await database.getAllBookings();
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No bookings yet</td></tr>';
        return;
    }
    
    // Show most recent bookings first
    const sortedBookings = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    
    sortedBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${booking.id}</td>
            <td>${booking.turfName}</td>
            <td>${booking.customerName}</td>
            <td>${booking.customerMobile}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>₹${booking.price}</td>
            <td><span style="color: green; font-weight: bold;">${booking.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up admin panel event listeners...');
    
    // Add turf button
    const addTurfBtn = document.getElementById('addTurfBtn');
    if (addTurfBtn) {
        addTurfBtn.addEventListener('click', () => {
            editingTurfId = null;
            document.getElementById('modalTitle').textContent = 'Add New Turf';
            document.getElementById('turfForm').reset();
            document.getElementById('turfModal').style.display = 'block';
            setTimeout(initAddTurfMap, 100);
        });
    }
    
    // Turf form submission
    const turfForm = document.getElementById('turfForm');
    if (turfForm) {
        turfForm.addEventListener('submit', handleTurfFormSubmit);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('✅ Logout button found, attaching listener');
        logoutBtn.addEventListener('click', () => {
            console.log('🎉 Logout button clicked');
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    } else {
        console.error('❌ Logout button not found!');
    }
    
    // Change password button
    const changePasswordBtn = document.getElementById('changeAdminPasswordBtn');
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
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
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
    
    // Verify current password
    if (currentPassword !== ADMIN_CREDENTIALS.password) {
        alert('Current password is incorrect!');
        return;
    }
    
    // In production, this should update in database
    // For now, we'll update the global constant (note: this won't persist)
    ADMIN_CREDENTIALS.password = newPassword;
    
    // TODO: Update password in MongoDB
    alert('Password changed successfully! Note: In production, this should be stored in database.');
    document.getElementById('changePasswordModal').style.display = 'none';
    document.getElementById('changePasswordForm').reset();
}

// Initialize map for adding turf
function initAddTurfMap() {
    const mapElement = document.getElementById('addTurfMap');
    if (!mapElement) return;
    
    // Clear existing map
    if (adminMap) {
        adminMap.remove();
    }
    
    // Initialize new map centered on Bhopal
    adminMap = L.map('addTurfMap').setView([23.2599, 77.4126], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);
    
    // Add click event to map
    adminMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // Remove previous marker if exists
        if (selectedMarker) {
            adminMap.removeLayer(selectedMarker);
        }
        
        // Add new marker
        selectedMarker = L.marker([lat, lng]).addTo(adminMap);
        
        // Store coordinates
        document.getElementById('turfLat').value = lat;
        document.getElementById('turfLng').value = lng;
    });
}

// Handle turf form submission
async function handleTurfFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('turfName').value;
    const address = document.getElementById('turfAddress').value;
    const type = document.getElementById('turfType').value;
    const price = parseInt(document.getElementById('turfPrice').value);
    const lat = parseFloat(document.getElementById('turfLat').value);
    const lng = parseFloat(document.getElementById('turfLng').value);
    
    // Get selected sports
    const selectedSports = [];
    document.querySelectorAll('.sport-checkbox:checked').forEach(checkbox => {
        selectedSports.push(checkbox.value);
    });
    
    if (selectedSports.length === 0) {
        alert('Please select at least one sport');
        return;
    }
    
    if (!lat || !lng) {
        alert('Please select a location on the map');
        return;
    }
    
    // Get owner credentials
    const ownerEmail = document.getElementById('ownerEmail').value;
    const ownerPassword = document.getElementById('ownerPassword').value;
    const ownerName = document.getElementById('ownerName').value;
    const ownerMobile = document.getElementById('ownerMobile').value;
    
    if (!ownerEmail || !ownerPassword || !ownerName || !ownerMobile) {
        alert('Please fill in all owner credentials');
        return;
    }
    
    const turfData = {
        id: editingTurfId || 'turf_' + Date.now(),
        name,
        address,
        type,
        price,
        location: { lat, lng },
        sports: selectedSports,
        owner: {
            email: ownerEmail,
            password: ownerPassword,
            name: ownerName,
            mobile: ownerMobile
        },
        rating: editingTurfId ? undefined : 4.0,
        updatedAt: new Date().toISOString()
    };
    
    // Get existing turf data if editing
    if (editingTurfId) {
        const turfs = await database.getAllTurfs();
        const existingTurf = turfs.find(t => t.id === editingTurfId);
        if (existingTurf) {
            turfData.rating = existingTurf.rating;
        }
    } else {
        turfData.createdAt = new Date().toISOString();
    }
    
    const saved = await database.saveTurf(turfData.id, turfData);
    
    if (saved) {
        alert(editingTurfId ? 'Turf updated successfully!' : 'Turf added successfully!');
        document.getElementById('turfModal').style.display = 'none';
        
        loadStatistics();
        loadTurfsTable();
    } else {
        alert('Failed to save turf. Please try again.');
    }
}

// Edit turf
async function editTurf(id) {
    const turfs = await database.getAllTurfs();
    const turf = turfs.find(t => t.id === id);
    
    if (turf) {
        editingTurfId = id;
        document.getElementById('modalTitle').textContent = 'Edit Turf';
        document.getElementById('turfName').value = turf.name;
        document.getElementById('turfAddress').value = turf.address;
        document.getElementById('turfType').value = turf.type;
        document.getElementById('turfPrice').value = turf.price;
        document.getElementById('turfLat').value = turf.location.lat;
        document.getElementById('turfLng').value = turf.location.lng;
        
        // Populate sports checkboxes
        document.querySelectorAll('.sport-checkbox').forEach(checkbox => {
            checkbox.checked = turf.sports && turf.sports.includes(checkbox.value);
        });
        
        // Populate owner credentials
        if (turf.owner) {
            document.getElementById('ownerEmail').value = turf.owner.email || '';
            document.getElementById('ownerPassword').value = turf.owner.password || '';
            document.getElementById('ownerName').value = turf.owner.name || '';
            document.getElementById('ownerMobile').value = turf.owner.mobile || '';
        }
        
        document.getElementById('turfModal').style.display = 'block';
        
        setTimeout(() => {
            initAddTurfMap();
            if (selectedMarker) {
                adminMap.removeLayer(selectedMarker);
            }
            selectedMarker = L.marker([turf.location.lat, turf.location.lng]).addTo(adminMap);
            adminMap.setView([turf.location.lat, turf.location.lng], 14);
        }, 100);
    }
}

// Delete turf
async function deleteTurf(id) {
    if (confirm('Are you sure you want to delete this turf?')) {
        const deleted = await database.deleteTurf(id);
        
        if (deleted) {
            alert('Turf deleted successfully!');
            loadStatistics();
            loadTurfsTable();
        } else {
            alert('Failed to delete turf. Please try again.');
        }
    }
}
