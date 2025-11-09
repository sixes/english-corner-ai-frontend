# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Next.js application.

## 🚀 Quick Start

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter project name (e.g., "english-corner-ai")
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Register Your Web App

1. In Firebase Console, click the web icon (`</>`) to add a web app
2. Register app nickname (e.g., "English Corner Web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. **Copy the Firebase configuration** - you'll need these values

### Step 3: Configure Environment Variables

Copy the Firebase configuration to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123 (optional)
```

### Step 4: Enable Authentication Methods

In Firebase Console:

1. Go to **Authentication** → **Sign-in method**
2. Enable the providers you want to use:

---

## 🔐 Enable Authentication Providers

### Google Sign-In (Recommended)

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Google**
3. Toggle **Enable**
4. Select a support email
5. Click **Save**

**That's it!** No additional configuration needed for Google.

---

### Facebook Sign-In

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add **Facebook Login** product
4. Get your **App ID** and **App Secret**

Back in Firebase Console:
1. Click **Facebook** in Sign-in methods
2. Toggle **Enable**
3. Paste your Facebook **App ID** and **App Secret**
4. Copy the **OAuth redirect URI** from Firebase
5. Go back to Facebook App Settings → Facebook Login → Settings
6. Add the Firebase redirect URI to **Valid OAuth Redirect URIs**
7. Click **Save Changes** in both Facebook and Firebase

---

### GitHub Sign-In

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: English Corner AI
   - **Homepage URL**: `http://localhost:3000` (dev) or your domain
   - **Authorization callback URL**: Get from Firebase (see below)
4. Click **Register application**
5. Copy the **Client ID**
6. Generate a **Client Secret** and copy it

Back in Firebase Console:
1. Click **GitHub** in Sign-in methods
2. Toggle **Enable**
3. Copy the **Authorization callback URL** from Firebase
4. Go back to GitHub OAuth App settings
5. Update **Authorization callback URL** with Firebase URL
6. Paste GitHub **Client ID** and **Client Secret** into Firebase
7. Click **Save** in Firebase

---

### Email/Password Sign-In

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable** for "Email/Password"
4. Optionally enable "Email link (passwordless sign-in)"
5. Click **Save**

---

### Phone Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **Phone**
3. Toggle **Enable**
4. Add your test phone numbers if needed
5. Click **Save**

**Note**: Phone authentication requires additional setup and may have costs.

---

## 🔧 Configure Authorized Domains

For production deployment:

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domain (e.g., `englishcorner.cyou`)
3. Click **Add domain**

Default authorized domains:
- `localhost` (for development)
- `your-project.firebaseapp.com`
- `your-project.web.app`

---

## 📱 Firestore Database Setup (Optional)

To store user data and chat history:

1. In Firebase Console → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Production mode**
4. Select a location (choose closest to your users)
5. Click **Enable**

### Security Rules for Test Mode
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

### Security Rules for Production
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat history per user
    match /chats/{userId}/messages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 Testing Your Setup

### 1. Check Environment Variables

Make sure your `.env.local` file is properly configured and restart your dev server:

```bash
npm run dev
```

### 2. Test Authentication

1. Go to `http://localhost:3000/chat`
2. Click on a sign-in button
3. Complete the authentication flow
4. You should see "Welcome, [Your Name]!"

### 3. Verify in Firebase Console

1. Go to **Authentication** → **Users**
2. You should see your user account listed

---

## 🎨 Customization

### Customize Auth UI

The auth buttons are in `app/chat/page.js`. You can customize:
- Button colors
- Button text
- Layout
- Add more providers

### Add More Providers

Firebase supports many providers:
- Microsoft
- Yahoo
- Apple (requires Apple Developer account)
- Twitter
- And more!

Check [Firebase Auth Documentation](https://firebase.google.com/docs/auth) for details.

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- ✅ Check environment variables are set correctly
- ✅ Restart your dev server after changing `.env.local`
- ✅ Verify Firebase project is created properly

### "Firebase: Error (auth/popup-closed-by-user)"
- ℹ️ User closed the popup - this is normal
- No action needed

### "Firebase: Error (auth/unauthorized-domain)"
- ✅ Add your domain to Authorized domains in Firebase Console
- ✅ For localhost, it should be pre-authorized

### "Firebase: Error (auth/operation-not-allowed)"
- ✅ Enable the authentication provider in Firebase Console
- ✅ Check Authentication → Sign-in method

### Facebook/GitHub sign-in not working
- ✅ Verify Client ID/Secret are correct
- ✅ Check redirect URIs match exactly
- ✅ Make sure OAuth app is in production mode (for Facebook)

---

## 📊 Firebase vs NextAuth Comparison

| Feature | Firebase Auth | NextAuth |
|---------|--------------|----------|
| Setup Complexity | Easy | Medium |
| Email Auth | Built-in | Requires SMTP |
| OAuth Providers | Many built-in | Many supported |
| Database | Firestore included | Requires separate DB |
| Pricing | Free tier generous | Free (but DB costs) |
| Session Management | Built-in | JWT or Database |
| Serverless | Yes | Partial |

---

## 🚀 Production Checklist

- [ ] Firebase project created
- [ ] Authentication providers enabled
- [ ] Environment variables configured
- [ ] Authorized domains added
- [ ] Firestore security rules configured (if using Firestore)
- [ ] Test all sign-in methods
- [ ] Configure custom email templates (if using email auth)
- [ ] Set up password reset flow
- [ ] Enable multi-factor authentication (optional)
- [ ] Monitor Firebase usage/quota

---

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## 💡 Next Steps

1. Complete the Firebase setup above
2. Test authentication on `/chat` page
3. (Optional) Set up Firestore to store chat history
4. (Optional) Add user profile page
5. Deploy to production

Happy coding! 🎉
