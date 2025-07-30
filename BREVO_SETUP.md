# Brevo Email Marketing Setup Guide

## 🔑 Environment Variables Required

Add these to your `.env.local` and Vercel environment variables:

```bash
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=hello@thehackai.com

# Brevo SMTP Settings (Optional)
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your_smtp_login_here
```

## 📋 Brevo Dashboard Setup

### 1. Create Contact Lists
Create these lists in your Brevo dashboard:
- **List 1**: "All Users" (Free tier users)
- **List 2**: "Pro Users" (Pro tier subscribers)  
- **List 3**: "Ultra Users" (Ultra tier subscribers)

### 2. Create Custom Contact Attributes
In Contacts → Contact attributes, create:
- **USER_TIER** (Text field)
- **SIGNUP_DATE** (Date field)
- **SIGNUP_SOURCE** (Text field)
- **UPGRADE_DATE** (Date field)

### 3. Get Your API Key
1. Go to Account → SMTP & API → API Keys
2. Create a new API key with full permissions
3. Copy the key to your environment variables

### 4. Get Your SMTP Settings
Your SMTP credentials are:
- **Server**: smtp-relay.brevo.com  
- **Port**: 587
- **Login**: Available in your SMTP settings

## 🔄 How It Works

### New User Signup
1. User creates account → Automatically added to Brevo List 1
2. Welcome email sent via Brevo transactional API
3. Contact tagged with signup date and source

### Subscription Upgrades
1. User upgrades to Pro → Added to List 2, attributes updated
2. User upgrades to Ultra → Added to List 3, attributes updated
3. Brevo campaigns can target specific subscriber tiers

### Account Management
1. User deletes account → Contact removed from all lists
2. All user data cleaned up across platform and email system

## 🧪 Testing

1. Add your API key to environment variables
2. Create a test signup with a new email
3. Check Brevo dashboard - contact should appear in "All Users" list
4. Welcome email should be sent automatically

## 📧 Email Templates

The system uses transactional emails with HTML templates. You can customize the welcome email template in `/src/lib/brevo.ts` in the `sendWelcomeEmail` function.

## 🚀 Ready to Deploy

Once you've:
1. ✅ Added API key to environment variables
2. ✅ Created contact lists in Brevo dashboard  
3. ✅ Set up custom contact attributes

The Brevo integration will work automatically for all new signups and subscription changes!