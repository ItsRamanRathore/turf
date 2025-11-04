# PhonePe Payment Gateway Setup Guide

## 🎯 Complete Implementation Guide

Your PhonePe payment gateway is now configured for **PRODUCTION MODE**. Follow these steps to complete the setup with your real credentials.

---

## 📋 Step 1: Get PhonePe Merchant Account

### 1.1 Sign Up for PhonePe Payment Gateway
1. Visit: [PhonePe Business Solutions](https://www.phonepe.com/business-solutions/payment-gateway/)
2. Click on "Get Started" or "Sign Up"
3. Fill in your business details:
   - Business Name
   - Business Type (Sports/Recreation)
   - Contact Information
   - Business Address

### 1.2 Complete KYC Verification
You'll need to submit:
- **PAN Card** (Business/Individual)
- **Aadhaar Card** (for proprietorship)
- **GST Certificate** (if applicable)
- **Bank Account Details**
- **Business Registration Certificate**
- **Address Proof**

### 1.3 Get Your Credentials
Once approved, you'll receive:
- **Merchant ID** (e.g., `M2024XXXXX`)
- **Salt Key** (e.g., `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- **Salt Index** (usually `1`)

---

## 🔧 Step 2: Configure Your Application

### 2.1 Update .env File
Open `.env` file and replace these values:

```properties
# Replace with your actual PhonePe credentials
PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID_HERE
PHONEPE_SALT_KEY=YOUR_SALT_KEY_HERE
PHONEPE_SALT_INDEX=1

# Set environment to production (or sandbox for testing)
PHONEPE_ENV=production

# Update URLs for your domain (or keep localhost for local testing)
PHONEPE_REDIRECT_URL=http://localhost:3000
PHONEPE_CALLBACK_URL=http://localhost:3000/api/phonepe/callback
```

### 2.2 Testing in Sandbox Mode
Before going live, test in sandbox mode:

```properties
PHONEPE_ENV=sandbox
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
```

Use PhonePe's test cards for sandbox testing.

---

## 🌐 Step 3: Configure PhonePe Dashboard

### 3.1 Add Callback URL
1. Login to [PhonePe Merchant Dashboard](https://business.phonepe.com/login)
2. Go to **Settings** → **Webhooks**
3. Add your callback URL:
   - Local: `http://localhost:3000/api/phonepe/callback`
   - Production: `https://your-domain.com/api/phonepe/callback`

### 3.2 Whitelist Redirect URLs
In the PhonePe dashboard:
1. Go to **Settings** → **Payment Settings**
2. Add allowed redirect URLs:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.com`

### 3.3 Configure Webhook Authentication
- Enable webhook signature verification
- Note down the webhook secret (if provided)

---

## 🚀 Step 4: Test the Integration

### 4.1 Local Testing
1. Start your server:
   ```bash
   npm start
   ```

2. Open browser: `http://localhost:3000`

3. Test booking flow:
   - Login as customer
   - Select a turf
   - Choose date and time
   - Click "Confirm Booking"
   - Complete payment on PhonePe page
   - Verify booking in database

### 4.2 Sandbox Testing (Recommended First)
Use PhonePe test credentials:
- Test Cards: Provided by PhonePe in sandbox mode
- Test UPI IDs: `success@ybl`, `failure@ybl`
- Test amounts for different scenarios

### 4.3 Production Testing
- Use small amount (₹1-10) for first transaction
- Test with real payment methods
- Verify webhook callbacks are received
- Check booking confirmation emails

---

## 📊 Step 5: Monitor Transactions

### 5.1 PhonePe Dashboard
- View all transactions in real-time
- Check settlement reports
- Monitor failed transactions
- Download reconciliation reports

### 5.2 Your Database
- Check MongoDB for booking records
- Verify payment status updates
- Monitor pending bookings cleanup

---

## 🔐 Security Best Practices

### ✅ DO's:
- Keep `SALT_KEY` secret and secure
- Use HTTPS in production (SSL certificate)
- Validate webhook signatures
- Store sensitive data encrypted
- Use environment variables (never hardcode)
- Regular security audits
- Enable 2FA on PhonePe dashboard

### ❌ DON'Ts:
- Never commit `.env` file to GitHub
- Don't expose API keys in frontend code
- Don't skip checksum verification
- Don't store card details (PCI compliance)
- Don't ignore webhook failures

---

## 🌍 Step 6: Deploy to Production

### 6.1 Deploy on Vercel

1. Update `.env` for production:
   ```properties
   PHONEPE_ENV=production
   PHONEPE_REDIRECT_URL=https://your-app.vercel.app
   PHONEPE_CALLBACK_URL=https://your-app.vercel.app/api/phonepe/callback
   ```

2. Add environment variables in Vercel:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all PhonePe credentials

3. Update PhonePe dashboard with production URLs

4. Deploy:
   ```bash
   vercel --prod
   ```

### 6.2 Update PhonePe Dashboard
- Change callback URL to production URL
- Whitelist production domain
- Enable production API access

---

## 🧪 Testing Checklist

- [ ] Payment initiation successful
- [ ] PhonePe payment page loads correctly
- [ ] Payment success redirects properly
- [ ] Booking saved to database
- [ ] Confirmation email sent
- [ ] Payment failure handled gracefully
- [ ] Refund process working
- [ ] Webhook callbacks received
- [ ] Transaction logs recorded
- [ ] Mobile responsive working

---

## 📞 Support & Resources

### PhonePe Support
- **Email**: merchantsupport@phonepe.com
- **Phone**: 080-68727374
- **Dashboard**: https://business.phonepe.com
- **Documentation**: https://developer.phonepe.com/docs

### Integration Support
- PhonePe API Documentation: [https://developer.phonepe.com/v1/docs/](https://developer.phonepe.com/v1/docs/)
- Test Cards: Available in PhonePe sandbox dashboard
- Postman Collection: Download from PhonePe developer portal

---

## 🐛 Troubleshooting

### Issue: Payment initiation fails
- Check if Merchant ID and Salt Key are correct
- Verify API endpoint (sandbox vs production)
- Check server logs for detailed error
- Ensure amount is in paise (multiply by 100)

### Issue: Callback not received
- Verify callback URL is correct in PhonePe dashboard
- Check if server is publicly accessible (use ngrok for local testing)
- Ensure webhook signature verification is correct
- Check PhonePe dashboard for webhook delivery logs

### Issue: Payment success but booking not saved
- Check MongoDB connection
- Verify all required fields are present
- Check server logs for validation errors
- Ensure transactionId is being passed correctly

### Issue: Checksum verification fails
- Verify Salt Key is correct (no extra spaces)
- Check Salt Index matches dashboard
- Ensure payload encoding is correct (base64)
- Verify checksum generation logic

---

## 📝 Important API Endpoints

### Your Server Endpoints
- `POST /api/phonepe/initiate` - Start payment
- `GET /api/phonepe/status/:transactionId` - Check status
- `POST /api/phonepe/callback` - Webhook receiver
- `POST /api/phonepe/refund` - Process refund

### PhonePe API Endpoints

**Sandbox:**
```
https://api-preprod.phonepe.com/apis/pg-sandbox
```

**Production:**
```
https://api.phonepe.com/apis/hermes
```

---

## 💰 Pricing & Settlement

### Transaction Charges
- MDR (Merchant Discount Rate): Check with PhonePe (typically 1.5-2%)
- No setup fees
- No annual maintenance charges

### Settlement Cycle
- T+1 or T+2 (configurable)
- Auto-settlement to your bank account
- Download settlement reports from dashboard

---

## 🎉 You're All Set!

Once you've completed all steps:
1. Your PhonePe integration is **LIVE**
2. Real payments will be processed
3. Money will be settled to your bank account
4. Customers can book turfs with real payments

### Next Steps:
1. Get your PhonePe merchant account approved
2. Update `.env` with real credentials
3. Test thoroughly in sandbox mode
4. Go live with production credentials
5. Monitor transactions in PhonePe dashboard

---

## 📧 Need Help?

If you face any issues during setup:
1. Check PhonePe documentation
2. Contact PhonePe merchant support
3. Review server logs for detailed errors
4. Test with smaller amounts first

**Good luck with your turf booking business! 🏟️**
