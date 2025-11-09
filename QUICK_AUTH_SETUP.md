# Quick Setup: Google & Email Authentication

## ✅ What's Configured

Your app now uses **only** Google and Email authentication:
- **Google Sign-In** - One-click authentication
- **Email Link Sign-In** - Passwordless email authentication

## 🔐 Firebase Console Setup

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/project/forever-english-corner/authentication/providers)
2. Click **Authentication** → **Sign-in method**
3. Click **Google**
4. Toggle **Enable**
5. Select your support email
6. Click **Save**

✅ **Done!** Google sign-in is ready.

---

### 2. Enable Email/Password Sign-In

**Important: This is required for email link sign-in to work!**

1. In **Sign-in method** tab
2. Click **Email/Password**
3. **Toggle Enable** for "Email/Password" (top toggle)
4. **Toggle Enable** for "Email link (passwordless sign-in)" (bottom toggle)
5. Click **Save**

**Note:** You must enable BOTH toggles for email link authentication to work!

✅ **Done!** Email link sign-in is ready.

---

### 3. Configure Authorized Domains

**Critical Step for Email Authentication:**

1. In **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Verify these domains are listed:
   - ✅ `localhost` (for development)
   - ✅ `forever-english-corner.firebaseapp.com`
   - ✅ `forever-english-corner.web.app`
4. For production, add your custom domain:
   - Click **Add domain**
   - Enter your domain (e.g., `englishcorner.cyou`)
   - Click **Add**

**Why this matters:** Firebase will only send email links to authorized domains. If your domain isn't authorized, email sign-in will fail with an error.

---

## 🧪 Test Authentication

### Test Google Sign-In:
1. Visit http://localhost:3000/chat (or 3001)
2. Click **"Sign in with Google"**
3. Choose your Google account
4. You should see "Welcome, [Your Name]!"

### Test Email Sign-In:
1. Visit http://localhost:3000/chat
2. Click **"Sign in with Email"**
3. Enter your email address
4. Click **"Send Link"**
5. Check your email for the sign-in link
6. Click the link in the email
7. You'll be signed in automatically!

---

## 📧 How Email Sign-In Works

1. User enters their email
2. Firebase sends a magic link to their email
3. User clicks the link
4. User is automatically signed in
5. No password needed! 🎉

**Benefits:**
- More secure than passwords
- No password to remember
- No password to reset
- Works across devices

---

## 🐛 Troubleshooting

### "Email link sign-in not working"
- ✅ Make sure "Email link (passwordless sign-in)" is enabled in Firebase Console
- ✅ Check spam/junk folder for the email
- ✅ Verify the email domain is authorized in Firebase Console

### "Google sign-in popup blocked"
- ✅ Allow popups for localhost in browser settings
- ✅ Try again - the popup should appear

### "Configuration error"
- ✅ Verify `.env.local` has all Firebase variables
- ✅ Restart the dev server after changing `.env.local`

---

## 📝 Code Changes Summary

**Removed:**
- Facebook authentication
- GitHub authentication  
- Apple authentication
- Reddit authentication
- All hardcoded Firebase config values

**Kept:**
- Google authentication (popup)
- Email link authentication (passwordless)
- Clean configuration from `.env.local` only

**Added:**
- Email input form for passwordless sign-in
- Automatic email link handling
- Better UX with email sent confirmation

---

## 🚀 Ready to Use!

1. Enable Google & Email in Firebase Console (see above)
2. Restart your dev server if it's not running:
   ```bash
   npm run dev
   ```
3. Visit http://localhost:3000/chat
4. Test both sign-in methods!

That's it! Your authentication is ready. 🎉
