// PhonePe Payment Gateway Integration for Turf Booking System

// API Base URL - should match mongodb-config.js
const API_URL = 'http://localhost:3000';

class PhonePePayment {
    constructor() {
        this.merchantId = 'MERCHANTUAT'; // Replace with your PhonePe Merchant ID
        this.saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'; // Replace with your Salt Key
        this.saltIndex = 1; // Replace with your Salt Index
        this.apiEndpoint = '/api/phonepe'; // Your backend endpoint
        this.currentBooking = null;
    }

    // Initialize payment after booking confirmation
    async initiatePayment(bookingData) {
        console.log('💰 PhonePe initiatePayment called with:', bookingData);
        this.currentBooking = bookingData;
        
        try {
            // Show loading
            console.log('⏳ Showing payment loading overlay...');
            this.showPaymentLoading();
            
            // Create payment request
            console.log('📡 Creating payment request...');
            const paymentResponse = await this.createPaymentRequest(bookingData);
            console.log('✅ Payment response received:', paymentResponse);
            
            if (paymentResponse.success) {
                console.log('🚀 Redirecting to PhonePe payment page...');
                // Redirect to PhonePe payment page
                window.location.href = paymentResponse.data.instrumentResponse.redirectInfo.url;
            } else {
                throw new Error(paymentResponse.message || 'Payment initiation failed');
            }
        } catch (error) {
            console.error('❌ Payment initiation error:', error);
            this.hidePaymentLoading();
            alert('Failed to initiate payment. Please try again.\n' + error.message);
        }
    }

    // Create payment request on backend
    async createPaymentRequest(bookingData) {
        try {
            console.log('📤 Sending payment request to:', `${API_URL}/api/phonepe/initiate`);
            const response = await fetch(`${API_URL}/api/phonepe/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: bookingData.amount,
                    bookingDetails: {
                        turfId: bookingData.turfId,
                        turfName: bookingData.turfName,
                        date: bookingData.date,
                        timeSlot: bookingData.timeSlot,
                        customerEmail: bookingData.customerEmail,
                        customerName: bookingData.customerName,
                        customerMobile: bookingData.customerMobile
                    }
                })
            });

            console.log('📥 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Server error:', errorData);
                throw new Error(errorData.message || 'Failed to create payment request');
            }

            const data = await response.json();
            console.log('✅ Payment request created successfully:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating payment request:', error);
            throw error;
        }
    }

    // Check payment status
    async checkPaymentStatus(transactionId) {
        try {
            console.log('📡 Fetching payment status from:', `${API_URL}/api/phonepe/status/${transactionId}`);
            const response = await fetch(`${API_URL}/api/phonepe/status/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📥 Status check response:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Status check failed:', errorText);
                throw new Error('Failed to check payment status');
            }

            const data = await response.json();
            console.log('✅ Payment status data:', data);
            return data;
        } catch (error) {
            console.error('❌ Error checking payment status:', error);
            throw error;
        }
    }

    // Handle payment success (called after redirect back)
    async handlePaymentCallback(transactionId) {
        try {
            console.log('🔍 handlePaymentCallback called with transactionId:', transactionId);
            this.showPaymentLoading('Verifying payment...');
            
            // Check payment status
            console.log('📡 Checking payment status...');
            const statusResponse = await this.checkPaymentStatus(transactionId);
            console.log('✅ Status response:', statusResponse);
            
            this.hidePaymentLoading();
            
            if (statusResponse.success && statusResponse.code === 'PAYMENT_SUCCESS') {
                console.log('✅ Payment successful, saving booking...');
                // Save booking
                await this.saveBookingWithPayment(statusResponse.data);
                
                // Show success message
                this.showPaymentSuccess(statusResponse.data);
            } else if (statusResponse.code === 'PAYMENT_PENDING') {
                console.log('⏳ Payment pending');
                alert('Payment is pending. Please wait for confirmation.');
            } else {
                console.log('❌ Payment failed or cancelled:', statusResponse);
                alert('Payment failed or was cancelled. Please try again.');
            }
        } catch (error) {
            console.error('❌ Payment callback error:', error);
            this.hidePaymentLoading();
            alert('Failed to verify payment. Please contact support.\nError: ' + error.message);
        }
    }

    // Save booking after successful payment
    async saveBookingWithPayment(paymentData) {
        try {
            // Generate a unique booking ID
            const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            // Calculate payment split (10% platform, 90% owner)
            const totalAmount = paymentData.amount / 100; // Convert from paise to rupees
            const platformFee = Math.round((totalAmount * 10) / 100 * 100) / 100; // 10%
            const ownerAmount = Math.round((totalAmount * 90) / 100 * 100) / 100; // 90%
            
            const bookingData = {
                bookingId: bookingId,
                turfId: paymentData.bookingDetails.turfId,
                turfName: paymentData.bookingDetails.turfName,
                customerName: paymentData.bookingDetails.customerName,
                customerEmail: paymentData.bookingDetails.customerEmail,
                customerMobile: paymentData.bookingDetails.customerMobile,
                date: paymentData.bookingDetails.date,
                time: paymentData.bookingDetails.timeSlot,
                timeSlot: paymentData.bookingDetails.timeSlot,
                price: totalAmount,
                totalAmount: totalAmount,
                platformFee: platformFee,
                ownerAmount: ownerAmount,
                paymentSplit: {
                    platform: platformFee,
                    owner: ownerAmount
                },
                amount: totalAmount,
                paymentId: paymentData.transactionId,
                paymentStatus: 'paid',
                paymentMethod: 'PhonePe',
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };

            console.log('💰 Payment Split:', {
                total: totalAmount,
                platformFee: platformFee + ' (10%)',
                ownerAmount: ownerAmount + ' (90%)'
            });

            const response = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error('Failed to save booking');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving booking:', error);
            throw error;
        }
    }

    // Show payment success modal
    showPaymentSuccess(paymentData) {
        const totalAmount = paymentData.amount / 100;
        const platformFee = Math.round((totalAmount * 10) / 100 * 100) / 100;
        const ownerAmount = Math.round((totalAmount * 90) / 100 * 100) / 100;
        
        const successDetails = `
            <div class="payment-success-details">
                <div class="success-item">
                    <span class="label">Transaction ID:</span>
                    <span class="value">${paymentData.transactionId}</span>
                </div>
                <div class="success-item">
                    <span class="label">Turf:</span>
                    <span class="value">${paymentData.bookingDetails.turfName}</span>
                </div>
                <div class="success-item">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(paymentData.bookingDetails.date).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="success-item">
                    <span class="label">Time Slot:</span>
                    <span class="value">${paymentData.bookingDetails.timeSlot}</span>
                </div>
                <div class="success-item">
                    <span class="label">Total Amount:</span>
                    <span class="value">₹${totalAmount}</span>
                </div>
                <div class="success-item split-info">
                    <span class="label">Payment Split:</span>
                    <span class="value split-details">
                        <span class="split-line">Platform Fee (10%): ₹${platformFee}</span>
                        <span class="split-line">To Turf Owner (90%): ₹${ownerAmount}</span>
                    </span>
                </div>
                <div class="success-item">
                    <span class="label">Payment Method:</span>
                    <span class="value">PhonePe</span>
                </div>
                <div class="success-item">
                    <span class="label">Status:</span>
                    <span class="value status-paid">PAID ✓</span>
                </div>
            </div>
            <p style="margin-top: 20px; color: #666;">
                A confirmation has been sent to ${paymentData.bookingDetails.customerEmail}
            </p>
        `;

        document.getElementById('successDetails').innerHTML = successDetails;
        document.getElementById('bookingSuccessModal').style.display = 'block';
        document.getElementById('bookingModal').style.display = 'none';
    }

    // Show payment loading overlay
    showPaymentLoading(message = 'Initiating payment...') {
        let loadingOverlay = document.getElementById('paymentLoadingOverlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'paymentLoadingOverlay';
            loadingOverlay.innerHTML = `
                <div class="payment-loading-content">
                    <div class="payment-spinner"></div>
                    <p id="paymentLoadingMessage">${message}</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                #paymentLoadingOverlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .payment-loading-content {
                    text-align: center;
                    color: white;
                }
                .payment-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #5f259f;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                #paymentLoadingMessage {
                    font-size: 18px;
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
        } else {
            document.getElementById('paymentLoadingMessage').textContent = message;
            loadingOverlay.style.display = 'flex';
        }
    }

    // Hide payment loading overlay
    hidePaymentLoading() {
        const loadingOverlay = document.getElementById('paymentLoadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Create global payment handler instance
const phonePePayment = new PhonePePayment();

// Wait for page to load before overriding
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Payment.js loaded - Overriding confirmFinalBooking function');
    
    // Override the confirmFinalBooking function to use PhonePe payment
    if (typeof window.confirmFinalBooking !== 'undefined') {
        console.log('✅ Original confirmFinalBooking found, saving as backup');
        window.originalConfirmFinalBooking = window.confirmFinalBooking;
    }

    window.confirmFinalBooking = async function() {
        console.log('🔔 Payment flow initiated - confirmFinalBooking called');
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('👤 Current User:', currentUser);
        
        if (!currentUser) {
            alert('Please login to continue with booking');
            document.getElementById('bookingModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
            return;
        }

        // Check if required booking variables exist (from app.js)
        console.log('📅 Selected Date:', selectedDate);
        console.log('⏰ Selected Time Slot:', selectedTimeSlot);
        console.log('🏟️ Selected Turf:', selectedTurf);

        if (!selectedDate) {
            alert('Please select a booking date');
            return;
        }

        if (!selectedTimeSlot) {
            alert('Please select a time slot');
            return;
        }

        if (!selectedTurf) {
            alert('Please select a turf');
            return;
        }

        const bookingData = {
            turfId: selectedTurf.id,
            turfName: selectedTurf.name,
            date: selectedDate,
            timeSlot: selectedTimeSlot.label || selectedTimeSlot.id,
            customerEmail: currentUser.email,
            customerName: currentUser.name,
            customerMobile: currentUser.mobile,
            amount: selectedTurf.price * 100 // Convert to paise for PhonePe
        };

        console.log('💳 Initiating PhonePe payment with data:', bookingData);

        // Initiate PhonePe payment
        await phonePePayment.initiatePayment(bookingData);
    };
    
    console.log('✅ confirmFinalBooking function override complete');
    
    // Check for payment callback on page load
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    
    if (transactionId) {
        console.log('💳 Payment callback detected, transaction ID:', transactionId);
        // Handle payment callback
        phonePePayment.handlePaymentCallback(transactionId);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});
