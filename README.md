# 🏟️ Turf Booking System - Bhopal# Turf Booking Website - Bhopal



A modern, full-stack web application for booking sports turfs in Bhopal with automatic location detection, interactive maps, and complete admin management system.A clean and simple website for booking sports turfs in Bhopal with automatic location detection and map-based turf discovery.



[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)## ✨ Key Features

[![Node.js](https://img.shields.io/badge/Node.js-14+-blue.svg)](https://nodejs.org/)

[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)### 🎯 Customer Features

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)- **Auto Location Detection**: Automatically detects user's location and shows nearby turfs

- **Optional Map View**: View all registered turfs on an interactive map (click "View Map" button)

## 🌟 Overview- **User Registration**: Complete registration with name, mobile, email and password

- **Easy Booking**: Select date and time slot to book turfs

A production-ready turf booking platform featuring customer registration, real-time booking, admin panel for turf management, and owner dashboards. Built with MongoDB for persistent storage and includes offline fallback with LocalStorage.- **Distance Calculation**: See how far each turf is from your location

- **Secure Storage**: User data stored in MongoDB database

## ✨ Features

### 🔐 Admin Features (Admin Only Can Add Turfs)

### 🎯 Customer Features- **Restricted Access**: Only admin can add new turfs to the system

- **📍 Auto Location Detection** - Detects user's current location automatically- **Add/Edit/Delete Turfs**: Complete turf management system

- **🗺️ Interactive Map View** - View all turfs on Leaflet.js map with current location marker- **Interactive Map Selection**: Click on map to set turf location precisely

- **👤 User Registration** - Complete registration with name, mobile, email, password- **Dashboard Statistics**: View total turfs, bookings, revenue and active users

- **📅 Easy Booking** - 3-step booking process: Select turf → Pick date → Choose time slot- **Booking Management**: View all bookings across all turfs

- **📏 Distance Calculation** - Shows distance from your location to each turf- **Admin Credentials**: ramanrathore031204@gmail.com / Raman00

- **🔒 Secure Storage** - User data stored in MongoDB with session management

- **🏅 Sports Filtering** - Filter turfs by sport type (Cricket, Football, Basketball, etc.)### 🏟️ Turf Owner Features

- **Owner Dashboard**: View turf-specific statistics

### 🔐 Admin Features- **Booking List**: See all bookings for your turf

- **🔑 Restricted Access** - Only admin can add/edit/delete turfs- **Revenue Tracking**: Track total and monthly revenue

- **➕ Turf Management** - Add new turfs with interactive map location picker- **Unified Login**: Single login button for both admin and turf owner

- **✏️ Edit/Delete** - Full CRUD operations on turf listings

- **📊 Dashboard Statistics** - Total turfs, bookings, revenue, active users## 📁 File Structure

- **📋 Booking Management** - View and manage all bookings across all turfs

- **🗺️ Map Integration** - Click on map to set precise turf coordinates```

turf/

### 🏢 Turf Owner Features├── server.js               # Node.js backend server with Express & MongoDB

- **📈 Owner Dashboard** - View turf-specific statistics and analytics├── mongodb-config.js       # Database configuration and API helpers

- **📋 Booking List** - See all bookings for your specific turf├── package.json            # Node.js dependencies

- **💰 Revenue Tracking** - Track total and monthly revenue├── .env                    # Environment variables (MongoDB connection)

- **🔐 Unified Login** - Single login system with role selection├── index.html              # Main landing page with unified login

├── styles.css              # Global styles with modern design

## 🛠️ Tech Stack├── app.js                  # Main application logic

├── admin-panel.html        # Admin interface (admin access only)

### Frontend├── admin.js                # Admin functionality

- **HTML5** - Semantic markup structure├── owner-dashboard.html    # Turf owner interface

- **CSS3** - Modern styling with gradients, animations, responsive design├── owner-dashboard.js      # Owner dashboard logic

- **JavaScript (ES6+)** - Async/await, modular code└── README.md               # This file

- **Leaflet.js 1.9.4** - Interactive maps```

- **OpenStreetMap** - Map tiles provider

## 🚀 How to Use

### Backend

- **Node.js** - JavaScript runtime### For Customers:

- **Express 4.18.2** - Web server framework1. Open `index.html` in your browser

- **MongoDB** - NoSQL database2. Allow location access when prompted (optional)

- **Mongoose 8.0.3** - MongoDB object modeling3. Click "Register" to create an account with:

- **CORS** - Cross-origin resource sharing   - Full Name

- **dotenv** - Environment configuration   - Mobile Number (10 digits)

   - Email Address

### Storage   - Password

- **MongoDB** - Primary persistent database4. Browse turfs in the list view

- **LocalStorage** - Fallback for offline functionality5. Click "View Map" button to see turfs on interactive map

- **SessionStorage** - User session management6. Click "Book Now" on any turf

7. Select date and time slot

## 📁 Project Structure8. Confirm booking



```### For Admin (Only Admin Can Add Turfs):

turf-booking-bhopal/1. Click "Login" button on the homepage

├── server.js                 # Express server with MongoDB2. Select "Admin" role tab

├── mongodb-config.js         # Database API helper functions3. Login with:

├── package.json              # Dependencies and scripts   - Email: `ramanrathore031204@gmail.com`

├── .env                      # Environment variables (create from .env.example)   - Password: `Raman00`

├── .env.example             # Environment template4. Add new turfs by clicking "➕ Add New Turf"

├── .gitignore               # Git ignore rules5. Click on the map to set precise turf location

│6. Fill in turf details (name, address, type, price)

├── index.html               # Main landing page7. Save turf (only admin has this privilege)

├── app.js                   # Main application logic8. View statistics and manage bookings

├── styles.css               # Global stylesheet9. Edit or delete existing turfs

│

├── admin-panel.html         # Admin dashboard### For Turf Owners:

├── admin.js                 # Admin functionality1. Click "Login" button on the homepage

│2. Select "Turf Owner" role tab

├── owner-dashboard.html     # Owner dashboard3. Login with your credentials (provided by admin)

├── owner-dashboard.js       # Owner functionality4. View your turf details and statistics

│5. Monitor bookings and revenue

├── README.md                # This file

├── MONGODB_SETUP.md         # Detailed MongoDB setup guide## 🛠️ Technologies Used

├── QUICK_START.md           # Quick start instructions

└── SETUP_GUIDE.md           # Complete setup guide### Frontend:

```- **HTML5** - Structure and semantic markup

- **CSS3** - Modern styling with animations and responsive design

## 🚀 Quick Start- **JavaScript (ES6+)** - Application logic with async/await

- **Leaflet.js** - Interactive maps (lazy loaded)

### Prerequisites- **OpenStreetMap** - Map tiles

- Node.js v14 or higher

- MongoDB (local or Atlas account)### Backend:

- Modern web browser- **Node.js** - JavaScript runtime

- **Express** - Web server framework

### Installation- **MongoDB** - NoSQL database for users, turfs, and bookings

- **Mongoose** - MongoDB object modeling

1. **Clone the repository**- **CORS** - Cross-origin resource sharing

```bash- **dotenv** - Environment variable management

git clone https://github.com/yourusername/turf-booking-bhopal.git

cd turf-booking-bhopal### Storage:

```- **MongoDB** - Primary database

- **LocalStorage** - Fallback for offline functionality

2. **Install dependencies**

```bash## Requirements

npm install

```### Server:

- **Node.js** (v14 or higher)

3. **Configure environment**- **MongoDB** (Local installation or MongoDB Atlas account)

```bash

# Copy example environment file### Browser:

cp .env.example .env- Modern browser with JavaScript enabled

- Geolocation API support

# Edit .env with your MongoDB connection string- LocalStorage support

# For local MongoDB:

MONGODB_URI=mongodb://localhost:27017/turfbooking## 🚀 Setup Instructions



# For MongoDB Atlas:### 1. Install Dependencies

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/turfbooking```powershell

```npm install

```

4. **Start the server**

```bash### 2. Configure MongoDB

npm startCreate a `.env` file (or copy from `.env.example`):

``````env

PORT=3000

5. **Open in browser**MONGODB_URI=mongodb://localhost:27017/turfbooking

``````

http://localhost:3000/index.html

```For MongoDB Atlas (cloud), use your connection string:

```env

## 📖 Detailed SetupMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/turfbooking

```

For complete setup instructions, see **[MONGODB_SETUP.md](MONGODB_SETUP.md)**

### 3. Start the Server

## 🔑 Admin Credentials```powershell

npm start

**Admin Login (Only admin can add turfs):**```

- Email: `ramanrathore031204@gmail.com`

- Password: `Raman00`### 4. Open in Browser

Navigate to: **http://localhost:3000/index.html**

**Important:** Only this admin account has permission to create, edit, and delete turf listings.

📖 **For detailed setup instructions, see `MONGODB_SETUP.md`**

## 💾 Database Collections

## 🔑 Admin Credentials

### users

- userId, name, email, password, mobile, type, createdAt**Admin Login (Only Admin Can Add Turfs):**

- Email: `ramanrathore031204@gmail.com`

### turfs- Password: `Raman00`

- id, name, location (lat, lng), address, price, type, sports, rating, owner

**Important**: Only this admin account can register new turfs on the website.

### bookings

- id, turfId, turfName, userId, customerName, customerEmail, customerMobile, date, timeSlot, price, status, createdAt## Sample Data



## 🎮 UsageThe application comes with 3 sample turfs in Bhopal:

1. Green Valley Sports Turf (Near DB City Mall)

### For Customers2. Champion's Arena (Kolar Road)

3. Sports Hub Bhopal (Arera Colony)

1. Visit `http://localhost:3000/index.html`

2. Allow location access (optional)## 💾 Data Storage

3. Register an account

4. Browse turfs or click "View Map"### MongoDB Database Collections:

5. Filter by sport type- **users** - Customer and owner accounts

6. Click "Book Now" on any turf- **turfs** - All registered turfs (admin only can add)

7. Select date and time slot- **bookings** - All bookings

8. Confirm booking

### Session Storage:

### For Admin- `currentUser` - Logged in customer details

- `adminLoggedIn` - Admin session flag

1. Click "Login" → Select "Admin" role- `ownerLoggedIn` - Owner session ID

2. Login with admin credentials

3. View dashboard statistics### LocalStorage Fallback:

4. Add/Edit/Delete turfsIf MongoDB server is offline, the app automatically falls back to localStorage for all data.

5. Manage all bookings

## 🔧 MongoDB Setup Options

### For Turf Owners

### Option 1: Local MongoDB (Development)

1. Click "Login" → Select "Turf Owner" role1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)

2. Login with owner credentials (provided by admin)2. Start MongoDB service

3. View turf statistics and bookings3. Use connection string: `mongodb://localhost:27017/turfbooking`

4. Track revenue

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

## 🎨 Key Features1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. Create a free cluster

### Modern UI/UX3. Get your connection string

- Gradient backgrounds and smooth animations4. Add to `.env` file

- Responsive design for all devices

- Interactive maps with location markers**Note**: The app works with localStorage fallback if MongoDB is offline!

- Real-time form validation

- Modal-based booking system## 🎨 UI/UX Improvements



### Smart Location- **Modern Login Design**: Beautiful gradient icons and smooth animations

- Auto-detects user location- **Role-Based Login**: Single unified login with role selector

- Shows "You are here" marker on map- **Responsive Forms**: Clean input fields with focus effects

- Calculates distance to each turf- **Optional Map View**: Map loads only when user clicks "View Map"

- Sorts turfs by proximity- **Smooth Transitions**: Modal animations and hover effects

- **Mobile Friendly**: Fully responsive design

### Booking System

- 3-step booking wizard## 🔐 Security Features

- Date picker (blocks past dates)

- Morning/evening time slots- **Admin-Only Turf Creation**: Only admin can add/edit/delete turfs

- Real-time availability check- **Session Management**: Secure session storage for logged-in users

- Booking confirmation- **Access Control**: Dashboard pages check authentication before loading

- **Password Protection**: User passwords stored (should be hashed in production)

## 🔒 Security

## 🚀 Future Enhancements

- Admin-only turf management

- Session-based authentication- Password hashing with bcrypt

- Input validation- Payment gateway integration (Razorpay/Stripe)

- XSS protection- Email/SMS notifications via Twilio

- CORS configuration- User reviews and ratings system

- Environment variable protection- Real-time turf availability calendar

- Multiple images per turf with gallery

**Production Recommendations:**- Advanced search and filters

- Implement bcrypt password hashing- Progressive Web App (PWA) version

- Add JWT authentication- Admin analytics dashboard with charts

- Use HTTPS

- Add rate limiting## 📝 Notes

- Input sanitization

- **Admin Access**: Only ramanrathore031204@gmail.com can add new turfs

## 🌐 API Endpoints- **Database**: MongoDB with Express REST API and localStorage fallback

- **Map**: Lazy loaded to improve initial page load time

### Turfs- **Server Required**: Must run `npm start` to access the application

- `GET /api/turfs` - Get all turfs- **Access**: Use `http://localhost:3000/` not `file://` protocol

- `POST /api/turfs` - Create new turf- **Production Ready**: Add password hashing and JWT authentication for production

- `PUT /api/turfs/:id` - Update turf- **Security**: In production, use environment variables and secure password storage

- `DELETE /api/turfs/:id` - Delete turf

## License

### Users

- `GET /api/users` - Get all usersMIT License - Free to use and modify

- `POST /api/users` - Create new user

- `GET /api/users/:userId` - Get user by ID---



### Bookings**Developed for Turf Booking - Bhopal**

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/turf/:turfId` - Get bookings by turf

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/turfbooking
```

### Sample Data
Includes 3 sample turfs in Bhopal:
1. Green Valley Sports Turf - Near DB City Mall
2. Champion's Arena - Kolar Road
3. Sports Hub Bhopal - Arera Colony

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Use different port in .env
PORT=3001
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
mongod --version

# For Atlas, verify IP whitelist and credentials
```

### Buttons not working
- Hard refresh: `Ctrl + Shift + R`
- Check browser console (F12) for errors
- Verify all scripts loaded

### Map not displaying
- Allow location access
- Check internet connection
- Verify Leaflet.js loaded

## 🚀 Future Enhancements

- [ ] Password hashing (bcrypt)
- [ ] JWT authentication
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Email/SMS notifications
- [ ] User reviews and ratings
- [ ] Image upload for turfs
- [ ] Progressive Web App (PWA)
- [ ] Admin analytics dashboard
- [ ] Booking cancellation
- [ ] Multi-language support

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Author

Developed for Turf Booking - Bhopal

## 🤝 Contributing

Contributions welcome! 

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Email: ramanrathore031204@gmail.com

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for mapping library
- MongoDB for database solution
- Express.js community

---

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for Bhopal turf booking community
