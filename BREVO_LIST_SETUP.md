# 🔧 Brevo List Configuration

Your Brevo integration is now set up to automatically add users to the correct lists based on their tier!

## 📋 Current Setup:

**User Tiers → Brevo Lists:**
- **Free Users** → "All Users" list only
- **Pro Users** → "All Users" + "Pro Users" lists  
- **Ultra Users** → "All Users" + "Ultra Users" lists

## 🔍 How to Find Your List IDs:

1. Go to [Brevo Dashboard](https://app.brevo.com/)
2. Navigate to **Contacts** → **Lists**
3. Click on each list (All Users, Pro Users, Ultra Users)
4. Look at the URL - the number at the end is your list ID
   - Example: `https://app.brevo.com/contact/list/edit/123` → List ID is `123`

## ⚙️ Update Configuration:

Once you have your list IDs, update them in:
`src/lib/brevo.ts` - lines 5-9:

```typescript
const BREVO_LIST_IDS = {
  ALL_USERS: 123,     // Replace with your "All Users" list ID
  PRO_USERS: 456,     // Replace with your "Pro Users" list ID  
  ULTRA_USERS: 789    // Replace with your "Ultra Users" list ID
}
```

## ✅ What Happens Automatically:

### On Signup:
- ✅ User added to "All Users" list
- ✅ Pro/Ultra users also added to tier-specific list
- ✅ User attributes set (FIRSTNAME, LASTNAME, USER_TIER, SIGNUP_DATE)

### On Upgrade (via Stripe):
- ✅ User moved to correct tier-specific list
- ✅ User attributes updated (USER_TIER, UPGRADE_DATE)
- ✅ Email marketing campaigns can target by list

## 🚀 Ready to Deploy:

Once you update the list IDs, users will be automatically sorted into the correct Brevo lists!

**No more wrong lists!** 🎉