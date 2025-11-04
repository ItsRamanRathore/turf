// Global variables
let map;
let userLocation = { lat: 23.2599, lng: 77.4126 }; // Default: Bhopal center
let turfsData = [];
let currentUser = null;
let selectedTurf = null;
let currentSportFilter = 'all';
let selectedDate = null;
let selectedTimeSlot = null;
let currentBookingStep = 1;
let bookedSlots = []; // Store all booked slots

console.log('App.js loaded successfully');

// Global error handler
window.addEventListener('error', function(event) {
    console.error('🔥 Global Error Caught:', event.error);
    console.error('Message:', event.message);
    console.error('Filename:', event.filename);
    console.error('Line:', event.lineno, 'Column:', event.colno);
    console.error('Stack:', event.error?.stack);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('🔥 Unhandled Promise Rejection:', event.reason);
});

// Note: ADMIN_CREDENTIALS is defined in mongodb-config.js

// Available time slots
const timeSlots = {
    morning: [
        { id: '06:00-07:00', label: '06:00 AM - 07:00 AM', time: '06:00' },
        { id: '07:00-08:00', label: '07:00 AM - 08:00 AM', time: '07:00' },
        { id: '08:00-09:00', label: '08:00 AM - 09:00 AM', time: '08:00' },
        { id: '09:00-10:00', label: '09:00 AM - 10:00 AM', time: '09:00' },
        { id: '10:00-11:00', label: '10:00 AM - 11:00 AM', time: '10:00' },
        { id: '11:00-12:00', label: '11:00 AM - 12:00 PM', time: '11:00' }
    ],
    evening: [
        { id: '16:00-17:00', label: '04:00 PM - 05:00 PM', time: '16:00' },
        { id: '17:00-18:00', label: '05:00 PM - 06:00 PM', time: '17:00' },
        { id: '18:00-19:00', label: '06:00 PM - 07:00 PM', time: '18:00' },
        { id: '19:00-20:00', label: '07:00 PM - 08:00 PM', time: '19:00' },
        { id: '20:00-21:00', label: '08:00 PM - 09:00 PM', time: '20:00' },
        { id: '21:00-22:00', label: '09:00 PM - 10:00 PM', time: '21:00' }
    ]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Starting initialization...');
    console.log('🔍 Checking if database is available:', typeof database !== 'undefined' ? '✅ Yes' : '❌ No');
    
    // Wait a bit for all elements to be ready
    setTimeout(() => {
        try {
            console.log('🔍 Checking critical elements...');
            
            // Check if critical elements exist
            const criticalElements = {
                'viewMapBtn': document.getElementById('viewMapBtn'),
                'customerRegisterBtn': document.getElementById('customerRegisterBtn'),
                'loginBtn': document.getElementById('loginBtn'),
                'sidebar': document.getElementById('sidebar'),
                'sidebarToggle': document.getElementById('sidebarToggle'),
                'turfCards': document.getElementById('turfCards')
            };
            
            let allPresent = true;
            for (const [name, element] of Object.entries(criticalElements)) {
                if (!element) {
                    console.error(`❌ Missing element: ${name}`);
                    allPresent = false;
                } else {
                    const style = window.getComputedStyle(element);
                    console.log(`✅ Found element: ${name}`, {
                        display: style.display,
                        visibility: style.visibility,
                        zIndex: style.zIndex,
                        pointerEvents: style.pointerEvents
                    });
                }
            }
            
            if (!allPresent) {
                console.error('⚠️ Some critical elements are missing!');
            }
            
            // Check if functions are defined
            console.log('🔍 Checking if filterBySport is defined:', typeof filterBySport !== 'undefined' ? '✅ Yes' : '❌ No');
            console.log('🔍 Checking if scrollToBookings is defined:', typeof scrollToBookings !== 'undefined' ? '✅ Yes' : '❌ No');
            
            // Initialize functions
            console.log('📍 Getting user location...');
            getUserLocation();
            
            console.log('📊 Loading turfs...');
            loadTurfs();
            
            console.log('🪟 Initializing modals...');
            initModals();
            
            console.log('🎯 Setting up event listeners...');
            setupEventListeners();
            
            console.log('👤 Checking user login...');
            checkUserLogin();
            
            console.log('📱 Initializing sidebar...');
            initSidebar();
            
            console.log('✅ Initialization completed successfully!');
            console.log('====================================');
            console.log('💡 TIP: Try clicking buttons now and watch for click logs');
            console.log('====================================');
            
            // Test if buttons are actually receiving clicks
            setTimeout(() => {
                console.log('🧪 Running clickability test...');
                const viewMapBtn = document.getElementById('viewMapBtn');
                if (viewMapBtn) {
                    const rect = viewMapBtn.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const elementAtPoint = document.elementFromPoint(centerX, centerY);
                    
                    console.log('🎯 View Map button position:', {
                        x: centerX,
                        y: centerY,
                        width: rect.width,
                        height: rect.height
                    });
                    console.log('🎯 Element at button center:', elementAtPoint);
                    console.log('🎯 Is it the button?', elementAtPoint === viewMapBtn);
                    
                    if (elementAtPoint !== viewMapBtn) {
                        console.error('⚠️ WARNING: Another element is covering the button!');
                        console.error('   Covering element:', elementAtPoint.tagName, elementAtPoint.className, elementAtPoint.id);
                        const coveringStyle = window.getComputedStyle(elementAtPoint);
                        console.error('   Covering element z-index:', coveringStyle.zIndex);
                        console.error('   Button z-index:', window.getComputedStyle(viewMapBtn).zIndex);
                    }
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            console.error('Stack trace:', error.stack);
        }
    }, 100); // Small delay to ensure DOM is fully ready
});

// Get user's location
let userMarker = null; // Store reference to user location marker

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('✅ User location detected:', userLocation);
                document.getElementById('locationText').textContent = 
                    `📍 Location detected: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
                
                // Update map center and marker if map is initialized
                if (map) {
                    map.setView([userLocation.lat, userLocation.lng], 13);
                    addUserMarker();
                }
                
                // Reload turfs with updated location
                displayTurfs();
            },
            (error) => {
                console.error('Error getting location:', error);
                document.getElementById('locationText').textContent = 
                    '📍 Using default location: Bhopal';
            }
        );
    } else {
        document.getElementById('locationText').textContent = 
            '📍 Geolocation not supported. Using default location: Bhopal';
    }
}

// Add user location marker to map
function addUserMarker() {
    if (!map) return;
    
    // Remove existing user marker if any
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    // Add new user marker with blue icon
    userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map).bindPopup('📍 You are here').openPopup();
    
    console.log('✅ User location marker added to map');
}

// Initialize map (lazy loading)
function initMap() {
    if (map) return; // Already initialized
    
    console.log('🗺️ Initializing map at user location:', userLocation);
    map = L.map('map').setView([userLocation.lat, userLocation.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add user location marker
    addUserMarker();
    
    // Display turfs on map
    displayTurfsOnMap();
}

// Load turfs from database
async function loadTurfs() {
    try {
        console.log('Loading turfs from server API...');
        
        // Fetch turfs from server API
        const response = await fetch('/api/turfs');
        if (!response.ok) {
            throw new Error('Failed to fetch turfs from server');
        }
        
        const data = await response.json();
        turfsData = data.map(turf => ({
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
        
        console.log('Turfs loaded from API:', turfsData.length);
        displayTurfs();
        updateSportCounts(); // Update sport venue counts
    } catch (error) {
        console.error('Error loading turfs:', error);
        // Show user-friendly message
        const turfCardsContainer = document.getElementById('turfCards');
        if (turfCardsContainer) {
            turfCardsContainer.innerHTML = '<p style="text-align: center; color: #e53e3e;">Failed to load turfs. Please refresh the page.</p>';
        }
    }
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}

// Display turfs as cards
function displayTurfs() {
    console.log('displayTurfs called, filter:', currentSportFilter);
    const turfCardsContainer = document.getElementById('turfCards');
    
    if (!turfCardsContainer) {
        console.error('Turf cards container not found');
        return;
    }
    
    turfCardsContainer.innerHTML = '';
    
    // Filter turfs based on sport selection
    let filteredTurfs = turfsData;
    if (currentSportFilter && currentSportFilter !== 'all') {
        filteredTurfs = turfsData.filter(turf => 
            turf.type && turf.type.toLowerCase().includes(currentSportFilter.toLowerCase())
        );
    }
    
    console.log('Filtered turfs:', filteredTurfs.length);
    
    if (filteredTurfs.length === 0) {
        turfCardsContainer.innerHTML = `<p style="text-align: center; color: #666;">No turfs available for ${currentSportFilter === 'all' ? 'any sport' : currentSportFilter}.</p>`;
        return;
    }
    
    filteredTurfs.forEach(turf => {
        // Calculate distance
        const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            turf.location.lat, 
            turf.location.lng
        );
        
        // Create card
        const card = document.createElement('div');
        card.className = 'turf-card';
        card.innerHTML = `
            <h4>${turf.name}</h4>
            <p>📍 ${turf.address}</p>
            <p>⚽ ${turf.type}</p>
            <p class="distance">📏 ${distance} km away</p>
            <p>⭐ Rating: ${turf.rating}/5</p>
            <p class="price">₹${turf.price}/hour</p>
            <button class="btn btn-primary" onclick="openBooking('${turf.id}')">Book Now</button>
        `;
        turfCardsContainer.appendChild(card);
    });
    
    console.log('Turfs displayed successfully');
}

// Display turfs on map
function displayTurfsOnMap() {
    if (!map) return;
    
    // Clear existing turf markers
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker && !layer.getPopup()?.getContent()?.includes('You are here')) {
            map.removeLayer(layer);
        }
    });
    
    turfsData.forEach(turf => {
        const marker = L.marker([turf.location.lat, turf.location.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);
        
        marker.bindPopup(`
            <strong>${turf.name}</strong><br>
            ${turf.address}<br>
            ₹${turf.price}/hour<br>
            ${turf.type}
        `);
    });
}

// Modal handling
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Load turfs for owner login dropdown
    loadTurfsForLogin();
    
    // Handle role switching
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            document.getElementById('loginRole').value = role;
            
            // Update active state
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Get form elements
            const turfSelectionGroup = document.getElementById('turfSelectionGroup');
            const turfSelect = document.getElementById('loginTurfSelect');
            const customerNameGroup = document.getElementById('customerNameGroup');
            const customerMobileGroup = document.getElementById('customerMobileGroup');
            const customerLoginName = document.getElementById('customerLoginName');
            const customerLoginMobile = document.getElementById('customerLoginMobile');
            const emailGroup = document.getElementById('emailGroup');
            const passwordGroup = document.getElementById('passwordGroup');
            const loginEmail = document.getElementById('loginEmail');
            const loginPassword = document.getElementById('loginPassword');
            
            // Show/hide fields based on role
            if (role === 'customer') {
                // Customer: Show name & mobile, hide email & password & turf
                customerNameGroup.style.display = 'block';
                customerMobileGroup.style.display = 'block';
                emailGroup.style.display = 'block'; // Keep email for customer
                passwordGroup.style.display = 'block'; // Keep password for customer
                turfSelectionGroup.style.display = 'none';
                
                customerLoginName.setAttribute('required', 'required');
                customerLoginMobile.setAttribute('required', 'required');
                loginEmail.setAttribute('required', 'required');
                loginPassword.setAttribute('required', 'required');
                turfSelect.removeAttribute('required');
            } else if (role === 'owner') {
                // Owner: Show turf selection, email & password, hide customer fields
                turfSelectionGroup.style.display = 'block';
                customerNameGroup.style.display = 'none';
                customerMobileGroup.style.display = 'none';
                emailGroup.style.display = 'block';
                passwordGroup.style.display = 'block';
                
                turfSelect.setAttribute('required', 'required');
                loginEmail.setAttribute('required', 'required');
                loginPassword.setAttribute('required', 'required');
                customerLoginName.removeAttribute('required');
                customerLoginMobile.removeAttribute('required');
            } else {
                // Admin: Show email & password only
                turfSelectionGroup.style.display = 'none';
                customerNameGroup.style.display = 'none';
                customerMobileGroup.style.display = 'none';
                emailGroup.style.display = 'block';
                passwordGroup.style.display = 'block';
                
                turfSelect.removeAttribute('required');
                loginEmail.setAttribute('required', 'required');
                loginPassword.setAttribute('required', 'required');
                customerLoginName.removeAttribute('required');
                customerLoginMobile.removeAttribute('required');
            }
        });
    });
    
    // Change password link
    const changePasswordLink = document.getElementById('changePasswordLink');
    if (changePasswordLink) {
        changePasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('changePasswordModal').style.display = 'block';
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
}

// Load turfs for owner login dropdown
async function loadTurfsForLogin() {
    try {
        const turfs = await database.getAllTurfs();
        const turfSelect = document.getElementById('loginTurfSelect');
        
        if (turfSelect) {
            // Clear existing options except the first one
            turfSelect.innerHTML = '<option value="">-- Select your turf --</option>';
            
            // Add turfs to dropdown
            turfs.forEach(turf => {
                const option = document.createElement('option');
                option.value = turf.id;
                option.textContent = turf.name;
                turfSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading turfs for login:', error);
    }
}

// Handle change password
async function handleChangePassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('changeEmail').value;
    const currentPassword = document.getElementById('changeCurrentPassword').value;
    const newPassword = document.getElementById('changeNewPassword').value;
    const confirmPassword = document.getElementById('changeConfirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long!');
        return;
    }
    
    // Check if it's admin
    if (email === ADMIN_CREDENTIALS.email && currentPassword === ADMIN_CREDENTIALS.password) {
        // Update admin password
        ADMIN_CREDENTIALS.password = newPassword;
        alert('Admin password changed successfully! Note: This change is temporary and will reset on server restart. For production, implement database storage.');
        document.getElementById('changePasswordModal').style.display = 'none';
        document.getElementById('changePasswordForm').reset();
        return;
    }
    
    // Check if it's a turf owner
    const turfs = await database.getAllTurfs();
    for (const turf of turfs) {
        if (turf.owner && turf.owner.email === email && turf.owner.password === currentPassword) {
            // Update owner password
            turf.owner.password = newPassword;
            await database.saveTurf(turf.id, turf);
            alert('Password changed successfully!');
            document.getElementById('changePasswordModal').style.display = 'none';
            document.getElementById('changePasswordForm').reset();
            return;
        }
    }
    
    alert('Current email or password is incorrect!');
}

// Setup event listeners
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    try {
        // View Map button
        const viewMapBtn = document.getElementById('viewMapBtn');
        if (viewMapBtn) {
            console.log('✅ Attaching listener to View Map button');
            
            // Test if element is actually clickable
            const style = window.getComputedStyle(viewMapBtn);
            console.log('   View Map button style:', {
                pointerEvents: style.pointerEvents,
                display: style.display,
                visibility: style.visibility,
                cursor: style.cursor
            });
            
            // Try multiple ways to attach the listener
            viewMapBtn.addEventListener('click', function(e) {
                console.log('🎉 View Map button clicked via addEventListener!', e);
                const mapSection = document.getElementById('mapSection');
                if (mapSection) {
                    mapSection.style.display = 'block';
                    if (!map) {
                        initMap();
                    }
                    if (map) {
                        map.invalidateSize(); // Refresh map
                    }
                    mapSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, false);
            
            // Also try onclick property as backup
            viewMapBtn.onclick = function(e) {
                console.log('🎉 View Map button clicked via onclick property!', e);
            };
            
            console.log('   Listener attached. Testing click programmatically...');
            // Don't actually trigger it, just report it's ready
            
        } else {
            console.error('❌ viewMapBtn not found');
        }
        
        // Close Map button
        const closeMapBtn = document.getElementById('closeMapBtn');
        if (closeMapBtn) {
            console.log('✅ Attaching listener to Close Map button');
            closeMapBtn.addEventListener('click', () => {
                console.log('🎉 Close Map button clicked');
                const mapSection = document.getElementById('mapSection');
                if (mapSection) {
                    mapSection.style.display = 'none';
                }
            });
        } else {
            console.warn('⚠️ closeMapBtn not found');
        }
        
        // Customer registration button
        const customerRegisterBtn = document.getElementById('customerRegisterBtn');
        if (customerRegisterBtn) {
            console.log('✅ Attaching listener to Register button');
            
            const style = window.getComputedStyle(customerRegisterBtn);
            console.log('   Register button style:', {
                pointerEvents: style.pointerEvents,
                display: style.display,
                visibility: style.visibility,
                cursor: style.cursor
            });
            
            customerRegisterBtn.addEventListener('click', function(e) {
                console.log('🎉 Register button clicked!', e);
                const modal = document.getElementById('customerModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            }, false);
            
            customerRegisterBtn.onclick = function(e) {
                console.log('🎉 Register button clicked via onclick!', e);
            };
            
        } else {
            console.error('❌ customerRegisterBtn not found');
        }
        
        // Unified login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            console.log('✅ Attaching listener to Login button');
            
            const style = window.getComputedStyle(loginBtn);
            console.log('   Login button style:', {
                pointerEvents: style.pointerEvents,
                display: style.display,
                visibility: style.visibility,
                cursor: style.cursor
            });
            
            loginBtn.addEventListener('click', function(e) {
                console.log('🎉 Login button clicked!', e);
                const modal = document.getElementById('loginModal');
                if (modal) {
                    modal.style.display = 'block';
                }
            });
        } else {
            console.error('❌ loginBtn not found');
        }
        
        // Role selector buttons
        const roleButtons = document.querySelectorAll('.role-btn');
        console.log(`Found ${roleButtons.length} role buttons`);
        roleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const loginRole = document.getElementById('loginRole');
                const turfSelectionGroup = document.getElementById('turfSelectionGroup');
                const turfSelect = document.getElementById('loginTurfSelect');
                
                if (loginRole) {
                    loginRole.value = this.dataset.role;
                }
                
                // Show/hide turf selection based on role
                if (this.dataset.role === 'owner') {
                    turfSelectionGroup.style.display = 'block';
                    turfSelect.setAttribute('required', 'required');
                } else {
                    turfSelectionGroup.style.display = 'none';
                    turfSelect.removeAttribute('required');
                }
            });
        });
        
        // Customer registration form
        const customerRegForm = document.getElementById('customerRegForm');
        if (customerRegForm) {
            console.log('✅ Attaching listener to Registration form');
            customerRegForm.addEventListener('submit', handleCustomerRegistration);
        } else {
            console.warn('⚠️ customerRegForm not found');
        }
        
        // Unified login form
        const unifiedLoginForm = document.getElementById('unifiedLoginForm');
        if (unifiedLoginForm) {
            console.log('✅ Attaching listener to Login form');
            unifiedLoginForm.addEventListener('submit', handleUnifiedLogin);
        } else {
            console.warn('⚠️ unifiedLoginForm not found');
        }
        
        // Date input change handler
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            console.log('✅ Attaching listener to Date input');
            dateInput.addEventListener('change', handleDateSelection);
        } else {
            console.warn('⚠️ bookingDate not found (will be available after booking modal opens)');
        }
        
        console.log('✅ Event listeners setup completed');
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
}

// Handle customer registration
async function handleCustomerRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('customerName').value;
    const mobile = document.getElementById('customerMobile').value;
    const email = document.getElementById('customerEmail').value;
    const password = document.getElementById('customerPassword').value;
    
    // Validate mobile number
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Check if user already exists and create user via API
    try {
        const userId = 'user_' + Date.now();
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                name, 
                mobile, 
                email, 
                password, // In production, hash this!
                type: 'customer'
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 400 && data.error && data.error.includes('exists')) {
                alert('An account with this email already exists. Please login.');
                return;
            }
            throw new Error(data.error || 'Failed to register');
        }
        
        // Registration successful
        if (data.user) {
            currentUser = { 
                id: userId, 
                name, 
                mobile, 
                email, 
                type: 'customer'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            alert(`Welcome ${name}! You are now registered.`);
            document.getElementById('customerModal').style.display = 'none';
            document.getElementById('customerRegForm').reset();
            
            updateUIForLoggedInUser();
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration: ' + error.message);
    }
}

// Handle unified login
async function handleUnifiedLogin(e) {
    e.preventDefault();
    
    console.log('🔔 handleUnifiedLogin called');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    console.log('Login attempt - Role:', role, 'Email:', email);
    
    if (role === 'admin') {
        // Check admin credentials
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            alert('Admin login successful! Redirecting to admin panel...');
            window.location.href = 'admin-panel.html';
        } else {
            alert('Invalid admin credentials');
        }
    } else if (role === 'owner') {
        // Check turf owner credentials from turfs database
        const turfSelect = document.getElementById('loginTurfSelect');
        const selectedTurfId = turfSelect.value;
        
        if (!selectedTurfId) {
            alert('Please select your turf');
            return;
        }
        
        const turfs = await database.getAllTurfs();
        const turf = turfs.find(t => t.id === selectedTurfId);
        
        if (turf && turf.owner) {
            if (turf.owner.email === email && turf.owner.password === password) {
                sessionStorage.setItem('ownerLoggedIn', turf.id);
                sessionStorage.setItem('ownerEmail', email);
                alert('Turf Owner login successful! Redirecting to dashboard...');
                window.location.href = 'owner-dashboard.html';
            } else {
                alert('Invalid email or password for the selected turf');
            }
        } else {
            alert('Turf owner credentials not found. Please contact admin.');
        }
    } else if (role === 'customer') {
        // Customer login with name, mobile, email, and password
        console.log('📝 Customer login flow initiated');
        
        const name = document.getElementById('customerLoginName').value;
        const mobile = document.getElementById('customerLoginMobile').value;
        
        console.log('Customer data:', { name, mobile, email });
        
        if (!name || !mobile || !email || !password) {
            alert('Please fill in all fields');
            console.log('❌ Validation failed: Missing fields');
            return;
        }
        
        // Validate mobile number
        if (!/^[0-9]{10}$/.test(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            console.log('❌ Validation failed: Invalid mobile number');
            return;
        }
        
        console.log('✅ Validation passed, checking database...');
        
        // Check if user exists in database
        const users = await database.getAllUsers();
        console.log('📊 Total users in database:', users.length);
        
        const existingUser = users.find(u => 
            u.email === email && 
            u.mobile === mobile &&
            u.password === password
        );
        
        console.log('🔍 Existing user found:', !!existingUser);
        
        if (existingUser) {
            // User exists - login successful
            const userData = {
                userId: existingUser.userId,
                name: existingUser.name,
                email: existingUser.email,
                mobile: existingUser.mobile,
                role: 'customer'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            
            alert(`Welcome back, ${existingUser.name}! 🎉`);
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('unifiedLoginForm').reset();
            
            // Update header if needed
            updateHeaderLoginState();
        } else {
            // User doesn't exist - create new account
            const userId = 'user_' + Date.now();
            const newUser = {
                userId: userId,
                name: name,
                email: email,
                mobile: mobile,
                password: password,
                role: 'customer',
                createdAt: new Date().toISOString()
            };
            
            const saved = await database.saveUser(userId, newUser);
            
            if (saved) {
                const userData = {
                    userId: userId,
                    name: name,
                    email: email,
                    mobile: mobile,
                    role: 'customer'
                };
                
                localStorage.setItem('currentUser', JSON.stringify(userData));
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
                
                alert(`Account created successfully! Welcome, ${name}! 🎉`);
                document.getElementById('loginModal').style.display = 'none';
                document.getElementById('unifiedLoginForm').reset();
                
                // Update header if needed
                updateHeaderLoginState();
            } else {
                alert('Failed to create account. Please try again.');
            }
        }
    }
}

// Update header login state
function updateHeaderLoginState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    // You can add code here to update header with user info if needed
    console.log('User logged in:', currentUser);
}

// Open booking modal (Playo-style)
async function openBooking(turfId) {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem('currentUser');
    if (!storedUser) {
        alert('Please register or login first to book a turf');
        document.getElementById('customerModal').style.display = 'block';
        return;
    }
    
    currentUser = JSON.parse(storedUser);
    
    // Find turf by ID (handle both string and number comparison)
    selectedTurf = turfsData.find(t => String(t.id) === String(turfId));
    
    if (!selectedTurf) {
        alert('Turf not found. Please try again.');
        return;
    }
    
    // Reset booking state
    currentBookingStep = 1;
    selectedDate = null;
    selectedTimeSlot = null;
    
    // Load existing bookings for this turf
    await loadBookedSlots();
    
    // Display turf info
    document.getElementById('bookingTurfInfo').innerHTML = `
        <div class="turf-booking-header">
            <div class="turf-booking-icon">🏟️</div>
            <div class="turf-booking-details">
                <h3>${selectedTurf.name}</h3>
                <p>📍 ${selectedTurf.address}</p>
                <p>⚽ ${selectedTurf.type}</p>
            </div>
            <div class="turf-booking-price">
                <div class="price-label">Price</div>
                <div class="price-value">₹${selectedTurf.price}/hr</div>
            </div>
        </div>
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
    
    // Set maximum date to 30 days from today
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    document.getElementById('bookingDate').setAttribute('max', maxDate.toISOString().split('T')[0]);
    
    // Show modal and go to step 1
    document.getElementById('bookingModal').style.display = 'block';
    goToStep(1);
}

// Load booked slots from database
async function loadBookedSlots() {
    try {
        const allBookings = await database.getAllBookings();
        bookedSlots = allBookings.filter(booking => 
            booking.turfId === selectedTurf.id && 
            booking.status === 'confirmed'
        );
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookedSlots = [];
    }
}

// Quick date selection
function selectToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').value = today;
    handleDateSelection();
}

function selectTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('bookingDate').value = tomorrow.toISOString().split('T')[0];
    handleDateSelection();
}

// Handle date selection
function handleDateSelection() {
    const dateInput = document.getElementById('bookingDate');
    selectedDate = dateInput.value;
    
    if (selectedDate) {
        // Enable next button
        const nextBtn = document.querySelector('#bookingStep1 .btn-next');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }
}

// Navigate between booking steps
function goToStep(step) {
    // Validate current step before proceeding
    if (step === 2 && !selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    if (step === 3 && !selectedTimeSlot) {
        alert('Please select a time slot first');
        return;
    }
    
    // Update step indicator
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step')[step - 1].classList.add('active');
    
    // Update step content
    document.querySelectorAll('.booking-step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('bookingStep' + step).classList.add('active');
    
    currentBookingStep = step;
    
    // Populate step-specific content
    if (step === 2) {
        populateTimeSlots();
    } else if (step === 3) {
        populateBookingSummary();
    }
}

// Populate time slots (check availability)
function populateTimeSlots() {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    document.getElementById('selectedDateDisplay').textContent = formattedDate;
    
    // Populate morning slots
    const morningContainer = document.getElementById('morningSlots');
    morningContainer.innerHTML = '';
    timeSlots.morning.forEach(slot => {
        const isBooked = isSlotBooked(selectedDate, slot.id);
        const slotBtn = createSlotButton(slot, isBooked);
        morningContainer.appendChild(slotBtn);
    });
    
    // Populate evening slots
    const eveningContainer = document.getElementById('eveningSlots');
    eveningContainer.innerHTML = '';
    timeSlots.evening.forEach(slot => {
        const isBooked = isSlotBooked(selectedDate, slot.id);
        const slotBtn = createSlotButton(slot, isBooked);
        eveningContainer.appendChild(slotBtn);
    });
}

// Check if slot is booked
function isSlotBooked(date, timeSlot) {
    return bookedSlots.some(booking => 
        booking.date === date && booking.time === timeSlot
    );
}

// Create slot button
function createSlotButton(slot, isBooked) {
    const btn = document.createElement('button');
    btn.className = 'time-slot-btn';
    btn.dataset.slot = slot.id;
    
    if (isBooked) {
        btn.classList.add('booked');
        btn.disabled = true;
        btn.innerHTML = `
            <span class="slot-time">${slot.label}</span>
            <span class="slot-status">Booked</span>
        `;
    } else {
        btn.innerHTML = `
            <span class="slot-time">${slot.label}</span>
            <span class="slot-status">Available</span>
        `;
        btn.addEventListener('click', () => selectTimeSlot(slot));
    }
    
    return btn;
}

// Select time slot
function selectTimeSlot(slot) {
    // Remove previous selection
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Mark as selected
    event.target.closest('.time-slot-btn').classList.add('selected');
    selectedTimeSlot = slot;
    
    // Enable confirm button
    document.getElementById('confirmSlotBtn').disabled = false;
}

// Populate booking summary
function populateBookingSummary() {
    // Venue details
    document.getElementById('summaryVenue').innerHTML = `
        <p><strong>${selectedTurf.name}</strong></p>
        <p>📍 ${selectedTurf.address}</p>
        <p>⚽ ${selectedTurf.type}</p>
    `;
    
    // Booking details
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    document.getElementById('summaryBooking').innerHTML = `
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${selectedTimeSlot.label}</p>
        <p><strong>Duration:</strong> 1 hour</p>
    `;
    
    // Customer details
    document.getElementById('summaryCustomer').innerHTML = `
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Mobile:</strong> ${currentUser.mobile}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
    `;
    
    // Price breakdown
    document.getElementById('slotPrice').textContent = `₹${selectedTurf.price}`;
    document.getElementById('totalPrice').textContent = `₹${selectedTurf.price}`;
}

// Confirm final booking
async function confirmFinalBooking() {
    // Create booking
    const bookingId = 'booking_' + Date.now();
    const booking = {
        id: bookingId,
        turfId: selectedTurf.id,
        turfName: selectedTurf.name,
        customerName: currentUser.name,
        customerMobile: currentUser.mobile,
        customerEmail: currentUser.email,
        date: selectedDate,
        time: selectedTimeSlot.id,
        price: selectedTurf.price,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    // Store booking
    const saved = await database.saveBooking(bookingId, booking);
    if (saved) {
        // Close booking modal
        document.getElementById('bookingModal').style.display = 'none';
        
        // Show success modal
        showBookingSuccess(booking);
    } else {
        alert('Booking failed. Please try again.');
    }
}

// Show booking success modal
function showBookingSuccess(booking) {
    const dateObj = new Date(booking.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    document.getElementById('successDetails').innerHTML = `
        <div class="success-info">
            <div class="success-row">
                <span class="success-label">Booking ID</span>
                <span class="success-value">#${booking.id.substring(8)}</span>
            </div>
            <div class="success-row">
                <span class="success-label">Venue</span>
                <span class="success-value">${booking.turfName}</span>
            </div>
            <div class="success-row">
                <span class="success-label">Date</span>
                <span class="success-value">${formattedDate}</span>
            </div>
            <div class="success-row">
                <span class="success-label">Time</span>
                <span class="success-value">${selectedTimeSlot.label}</span>
            </div>
            <div class="success-row highlight">
                <span class="success-label">Amount Paid</span>
                <span class="success-value">₹${booking.price}</span>
            </div>
        </div>
        <p class="success-message">📧 Confirmation email sent to ${booking.customerEmail}</p>
        <p class="success-message">📱 SMS sent to ${booking.customerMobile}</p>
    `;
    
    document.getElementById('bookingSuccessModal').style.display = 'block';
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('bookingSuccessModal').style.display = 'none';
    // Reload bookings to update availability
    loadBookedSlots();
}

// Footer: Newsletter subscription
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    if (!emailInput) return;
    
    const email = emailInput.value;
    
    // Simulate subscription
    alert(`🎉 Thank you for subscribing!\n\nWe'll send updates to: ${email}`);
    event.target.reset();
    
    // In production, this would send to your backend
    // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
}

// Footer: Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show scroll-to-top button on scroll
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }
});

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const registerBtn = document.getElementById('customerRegisterBtn');
    if (currentUser) {
        registerBtn.textContent = `Hi, ${currentUser.name}`;
        registerBtn.style.cursor = 'default';
    }
}

// Check if user is already logged in
function checkUserLogin() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }
}

// Sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !sidebarToggle || !sidebarClose || !sidebarOverlay) {
        console.error('Sidebar elements not found');
        return;
    }

    // Open sidebar
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });

    // Close sidebar
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
}

// Filter turfs by sport
function filterBySport(sport) {
    console.log('🔵 filterBySport called with:', sport);
    
    currentSportFilter = sport;
    
    // Update active button in sidebar
    document.querySelectorAll('.sidebar .sport-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update active sport card
    updateActiveSportCard(sport);
    
    // Filter and display turfs
    displayTurfs();
    
    // Close sidebar if open
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    // Scroll to turf list
    const turfList = document.querySelector('.turf-list');
    if (turfList) {
        turfList.scrollIntoView({ behavior: 'smooth' });
    }
}

// Select sport from sports section and filter
function selectSportAndFilter(sport) {
    console.log('🔵 selectSportAndFilter called with:', sport);
    
    currentSportFilter = sport;
    
    // Update active sport card
    updateActiveSportCard(sport);
    
    // Filter and display turfs
    displayTurfs();
    
    // Scroll to turf list
    const turfList = document.querySelector('.turf-list');
    if (turfList) {
        turfList.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update turf list header
    updateTurfListHeader(sport);
}

// Update active sport card styling
function updateActiveSportCard(sport) {
    // Remove active class from all sport cards
    document.querySelectorAll('.sport-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected sport card
    if (sport !== 'all') {
        const selectedCard = document.querySelector(`.sport-card[data-sport="${sport}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
    }
}

// Update turf list header based on selected sport
function updateTurfListHeader(sport) {
    const turfListSection = document.querySelector('.turf-list');
    if (!turfListSection) return;
    
    const header = turfListSection.querySelector('h3');
    if (!header) return;
    
    if (sport === 'all') {
        header.textContent = '🏆 All Available Turfs';
    } else {
        header.textContent = `${getSportIcon(sport)} ${sport} Venues`;
    }
}

// Get sport icon
function getSportIcon(sport) {
    const icons = {
        'Cricket': '🏏',
        'Football': '⚽',
        'Badminton': '🏸',
        'Swimming': '🏊',
        'Tennis': '🎾',
        'Table Tennis': '🏓'
    };
    return icons[sport] || '🏟️';
}

// Update sport venue counts
function updateSportCounts() {
    const sports = ['Cricket', 'Football', 'Badminton', 'Swimming', 'Tennis', 'Table Tennis'];
    
    sports.forEach(sport => {
        const count = turfsData.filter(turf => 
            turf.type && turf.type.toLowerCase().includes(sport.toLowerCase())
        ).length;
        
        const countElement = document.getElementById(`${sport.toLowerCase().replace(' ', '')}-count`);
        if (countElement) {
            // Animate count
            animateCount(countElement, 0, count, 1000);
        }
    });
}

// Animate count numbers
function animateCount(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Scroll to bookings section
function scrollToBookings() {
    console.log('🔵 scrollToBookings called');
    
    const turfList = document.querySelector('.turf-list');
    if (turfList) {
        turfList.scrollIntoView({ behavior: 'smooth' });
    }
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Show About Us modal
function showAboutUs() {
    console.log('🔵 showAboutUs called');
    
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.style.display = 'block';
    }
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Show Contact Info modal
function showContactInfo() {
    console.log('🔵 showContactInfo called');
    
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'block';
    }
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Show Terms and Conditions modal
function showTermsAndConditions() {
    console.log('🔵 showTermsAndConditions called');
    
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.style.display = 'block';
    }
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}
