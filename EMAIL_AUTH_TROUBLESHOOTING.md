# Fixing "Failed to send sign-in email" Error

## 🔍 The Problem

You're seeing: **"Failed to send sign-in email. Please try again."**

This error occurs when Firebase Email Link Authentication is not properly configured.

## ✅ Solution: Enable Email Link Authentication

### Step 1: Go to Firebase Console

Open: https://console.firebase.google.com/project/forever-english-corner/authentication/providers

### Step 2: Enable Email/Password Provider

1. Click on **"Email/Password"** in the providers list
2. You'll see TWO toggle switches:

   **First Toggle: "Email/Password"**
   - ✅ Turn this ON

   **Second Toggle: "Email link (passwordless sign-in)"**
   - ✅ Turn this ON too

3. Click **"Save"**

**Important:** You MUST enable BOTH toggles for email link sign-in to work!

### Step 3: Verify Authorized Domains

1. Still in Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll down to **"Authorized domains"** section
3. Make sure these are listed:
   - ✅ `localhost`
   - ✅ `forever-english-corner.firebaseapp.com`
   - ✅ `forever-english-corner.web.app`

4. If any are missing, click **"Add domain"** and add them

### Step 4: Test Again

1. Go back to your app: http://localhost:3000/chat (or 3001)
2. Click **"Sign in with Email"**
3. Enter your email
4. Click **"Send Link"**
5. Check your email!

---

## 🐛 Still Not Working?

### Check the Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try email sign-in again
4. Look for error messages

Common error codes and fixes:

#### Error: `auth/unauthorized-continue-uri`
**Cause:** Your domain isn't in the authorized domains list

**Fix:**
1. Go to Firebase Console → Authentication → Settings
2. Add `localhost` to Authorized domains
3. Save and try again

#### Error: `auth/operation-not-allowed`
**Cause:** Email link sign-in isn't enabled

**Fix:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Click "Email/Password"
3. Enable BOTH toggles (Email/Password AND Email link)
4. Save

#### Error: `auth/invalid-continue-uri`
**Cause:** The redirect URL is malformed

**Fix:**
1. Check your `.env.local` file
2. Verify all Firebase config values are correct
3. Restart your dev server: `npm run dev`

#### Error: `auth/missing-continue-uri`
**Cause:** The action code settings are missing

**Fix:**
- This shouldn't happen with our code, but restart the dev server

---

## 🔄 Alternative: Use Google Sign-In

While you're setting up email authentication, you can use Google sign-in which works immediately:

1. Enable Google in Firebase Console (just one toggle, no other config needed)
2. Use the **"Sign in with Google"** button
3. Works instantly! ✅

---

## 📧 How to Enable Email Provider (Visual Guide)

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/project/forever-english-corner/authentication/providers
   ```

2. **Click "Email/Password"**
   
3. **You'll see this:**
   ```
   ┌─────────────────────────────────────────┐
   │ Email/Password                          │
   │                                         │
   │ ⚪ Enable                               │  ← Turn this ON!
   │                                         │
   │ ⚪ Email link (passwordless sign-in)   │  ← Turn this ON too!
   │                                         │
   │         [Cancel]  [Save]                │
   └─────────────────────────────────────────┘
   ```

4. **Turn BOTH toggles to ON (blue)**

5. **Click "Save"**

---

## ✅ Verification Checklist

Before trying again, verify:

- [ ] Firebase Console → Authentication → Sign-in method
- [ ] "Email/Password" provider is enabled
- [ ] "Email link (passwordless sign-in)" is enabled (second toggle)
- [ ] Authentication → Settings → Authorized domains includes `localhost`
- [ ] Dev server is running (`npm run dev`)
- [ ] Using the correct port (3000 or 3001)

---

## 💡 Pro Tip

While email link authentication is being set up, just use **Google Sign-In**:
- No configuration needed
- Works immediately
- One click authentication
- Just enable "Google" provider in Firebase Console

Once you get Google working, you can come back and set up email authentication later!

---

## 🆘 Need More Help?

If you're still stuck:

1. **Check Firebase Console errors:**
   - Go to Authentication → Users
   - Look for any error messages

2. **Check browser console:**
   - F12 → Console tab
   - Look for red error messages

3. **Verify environment variables:**
   ```bash
   # Check .env.local has these:
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=forever-english-corner.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=forever-english-corner
   # etc.
   ```

4. **Restart everything:**
   ```bash
   # Stop the dev server (Ctrl+C)
   npm run dev
   # Try again
   ```

---

**Quick Fix:** Just use Google Sign-In for now! It works without any extra setup. 🚀
