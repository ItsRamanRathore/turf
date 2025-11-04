# Payment Split System - 10% Platform Fee + 90% Owner

## 🎯 Overview

Your turf booking platform now automatically splits payments:
- **10% Platform Fee** → Goes to you (Platform Owner)
- **90% Owner Share** → Goes directly to Turf Owner

This is implemented using PhonePe's Split Payment feature, which ensures instant and automatic fund distribution.

---

## 💰 How It Works

### Payment Flow:

```
Customer Pays ₹1000
    ↓
PhonePe Payment Gateway
    ↓
Automatic Split:
├─ Platform (You): ₹100 (10%)
└─ Turf Owner: ₹900 (90%)
```

### Example Calculations:

| Booking Amount | Platform Fee (10%) | Owner Amount (90%) |
|----------------|--------------------|--------------------|
| ₹500           | ₹50                | ₹450               |
| ₹1,000         | ₹100               | ₹900               |
| ₹1,500         | ₹150               | ₹1,350             |
| ₹2,000         | ₹200               | ₹1,800             |

---

## 🔧 Implementation Details

### 1. Database Schema Updates

**Turf Schema** - Added payment split fields:
```javascript
{
  ownerMerchantId: String,           // PhonePe Merchant ID of turf owner
  ownerBankAccount: {
    accountNumber: String,
    ifsc: String,
    accountHolderName: String
  },
  paymentSplitEnabled: Boolean       // Enable/disable split for this turf
}
```

**Booking Schema** - Added split tracking:
```javascript
{
  totalAmount: Number,               // Total paid by customer
  platformFee: Number,               // 10% platform commission
  ownerAmount: Number,               // 90% to turf owner
  paymentSplit: {
    platform: Number,
    owner: Number
  }
}
```

### 2. Automatic Split Calculation

The system automatically calculates:
```javascript
Platform Fee = Total Amount × 10 / 100
Owner Amount = Total Amount × 90 / 100
```

### 3. PhonePe Split Payment Integration

When payment is initiated, the system:
1. Calculates split amounts
2. Checks if turf owner has merchant ID
3. Sends split configuration to PhonePe
4. PhonePe distributes funds automatically

---

## 📋 Setup Requirements

### For Platform Owner (You):

1. **PhonePe Merchant Account**
   - Sign up at: https://www.phonepe.com/business-solutions/
   - Complete KYC verification
   - Get your Merchant ID and Salt Key
   - **Enable Split Payment Feature** (Contact PhonePe Support)

2. **Update .env File**
   ```properties
   PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
   PHONEPE_PLATFORM_MERCHANT_ID=YOUR_MERCHANT_ID
   PHONEPE_SALT_KEY=YOUR_SALT_KEY
   ```

3. **PhonePe Dashboard Configuration**
   - Enable "Split Payment" feature
   - Set up settlement account
   - Configure webhook URLs

### For Turf Owners:

Each turf owner needs:
1. **Their own PhonePe Merchant Account**
   - Register at PhonePe Business
   - Complete KYC
   - Get Merchant ID

2. **Register Merchant ID in Your Platform**
   - Login to Owner Dashboard
   - Go to Payment Settings
   - Enter PhonePe Merchant ID
   - Verify bank account details

---

## 🚀 How to Enable Split for a Turf

### Method 1: Via Owner Dashboard (Recommended)

1. Owner logs in to dashboard
2. Goes to "Payment Settings"
3. Enters PhonePe Merchant ID
4. Enters bank account details
5. Saves settings
6. System enables split payment for that turf

### Method 2: Via Admin Panel

1. Admin logs in
2. Opens turf details
3. Adds owner's merchant ID
4. Enables split payment
5. Saves changes

### Method 3: Direct Database Update

```javascript
db.turfs.updateOne(
  { turfId: "TURF001" },
  {
    $set: {
      ownerMerchantId: "OWNER_MERCHANT_ID",
      paymentSplitEnabled: true,
      ownerBankAccount: {
        accountNumber: "1234567890",
        ifsc: "SBIN0001234",
        accountHolderName: "Owner Name"
      }
    }
  }
);
```

---

## 💡 Important Notes

### Split Payment Behavior:

✅ **If Owner Has Merchant ID:**
- Payment splits automatically (10% + 90%)
- Both accounts receive funds instantly
- No manual transfer needed

❌ **If Owner Doesn't Have Merchant ID:**
- Full amount goes to platform account
- You must manually transfer 90% to owner
- System still tracks split amounts in database

### Settlement Timeline:

- **With Split Payment**: Instant to both accounts (T+0 or T+1)
- **Without Split**: Manual transfer needed (T+2 to T+7)

### Transaction Fees:

PhonePe charges MDR (Merchant Discount Rate):
- Typically 1.5% - 2% on transaction amount
- This is deducted before split
- Example: ₹1000 booking
  - After MDR (2%): ₹980
  - Platform gets: ₹98 (10% of ₹980)
  - Owner gets: ₹882 (90% of ₹980)

---

## 🔐 Security & Compliance

### Best Practices:

1. **Verify Owner Identity**
   - Check KYC documents
   - Verify bank account ownership
   - Match names on documents

2. **Monitor Transactions**
   - Review split transactions daily
   - Check for failed settlements
   - Reconcile amounts monthly

3. **Handle Disputes**
   - Maintain transaction logs
   - Keep booking records
   - Provide clear refund policy

### Legal Requirements:

- GST registration (if applicable)
- TDS deduction on commission (if required)
- Issue invoices for platform fee
- Maintain accounting records

---

## 📊 Tracking & Reports

### View Split Information:

**In Booking Details:**
```javascript
{
  "bookingId": "BK12345",
  "totalAmount": 1000,
  "platformFee": 100,
  "ownerAmount": 900,
  "paymentSplit": {
    "platform": 100,
    "owner": 900
  }
}
```

**In Success Modal:**
- Shows total amount paid
- Displays platform fee (10%)
- Shows amount to owner (90%)

### Generate Reports:

**Platform Revenue Report:**
```javascript
// Total platform earnings
db.bookings.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$platformFee" }
    }
  }
]);
```

**Owner Settlement Report:**
```javascript
// Amount owed to specific owner
db.bookings.aggregate([
  {
    $match: { turfOwnerId: "OWNER_ID" }
  },
  {
    $group: {
      _id: null,
      totalOwed: { $sum: "$ownerAmount" }
    }
  }
]);
```

---

## 🐛 Troubleshooting

### Issue: Split payment not working

**Check:**
1. Owner has valid merchant ID
2. `paymentSplitEnabled` is true
3. PhonePe split feature is enabled on your account
4. Owner's merchant ID is approved by PhonePe

**Solution:**
```javascript
// Verify turf configuration
db.turfs.findOne({ turfId: "TURF_ID" });

// Check if split is enabled
if (!turf.ownerMerchantId) {
  console.log("❌ Owner merchant ID missing");
}
```

### Issue: Owner not receiving payments

**Check:**
1. Owner's merchant account is active
2. Bank account is verified
3. No issues in PhonePe dashboard
4. Settlement cycle (T+1 or T+2)

**Solution:**
- Check PhonePe dashboard for failed settlements
- Verify owner's bank details
- Contact PhonePe support with transaction ID

### Issue: Incorrect split amounts

**Check:**
1. Verify calculation logic (10% / 90%)
2. Check for rounding errors
3. Review MDR deductions

**Solution:**
```javascript
// Recalculate split
const totalAmount = 1000; // in paise
const platformFee = Math.round((totalAmount * 10) / 100);
const ownerAmount = totalAmount - platformFee;
```

---

## 📞 Support & Contacts

### PhonePe Split Payment Support:
- **Email**: merchantsupport@phonepe.com
- **Phone**: 080-68727374
- **Topic**: "Split Payment Configuration"

### Feature Request:
To enable split payment on your PhonePe account:
1. Email PhonePe support
2. Request "Split Payment / Multi-Account Settlement"
3. Provide your Merchant ID
4. They will enable it within 2-3 business days

---

## 📈 Future Enhancements

### Planned Features:

1. **Dynamic Commission Rates**
   - Different rates for different turfs
   - Promotional discounts
   - Volume-based pricing

2. **Detailed Analytics**
   - Revenue dashboard
   - Owner-wise earnings
   - Monthly reports

3. **Automated Invoicing**
   - Generate GST invoices
   - Email to owners monthly
   - PDF download option

4. **Wallet System**
   - Platform wallet for owners
   - Faster withdrawals
   - Cashback offers

---

## ✅ Testing Checklist

Before going live:

- [ ] Platform merchant account created
- [ ] Split payment feature enabled by PhonePe
- [ ] Test with sandbox credentials
- [ ] Add test owner merchant ID
- [ ] Make test booking
- [ ] Verify split amounts in logs
- [ ] Check both accounts receive payments
- [ ] Test refund process
- [ ] Verify database records
- [ ] Test with real merchant IDs (small amount)

---

## 🎉 You're All Set!

Your payment split system is now ready:
- ✅ 10% commission to platform automatically
- ✅ 90% direct settlement to turf owners
- ✅ Real-time tracking and reports
- ✅ Secure and compliant

**Next Steps:**
1. Enable split payment on PhonePe account
2. Add your merchant credentials
3. Onboard turf owners with merchant IDs
4. Start processing bookings
5. Monitor splits in PhonePe dashboard

---

**Questions?** Contact PhonePe support or review their split payment documentation.

**Happy Earning! 💰**
