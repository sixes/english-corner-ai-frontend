# Email Provider Setup Guide for NextAuth

This guide will help you configure email authentication using various SMTP providers with NextAuth.

## Quick Start

1. Choose ONE email provider from the options below
2. Follow the provider-specific setup instructions
3. Update your `.env.local` file with the correct settings
4. Restart your development server

---

## 📧 Gmail (Recommended)

### Configuration
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

### Setup Steps
1. Go to [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose "Mail"
5. Click **Select device** → Choose "Other" and enter "NextAuth"
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Use this password in `EMAIL_SERVER_PASSWORD`

### Notes
- Two-factor authentication must be enabled
- App passwords are more secure than regular passwords
- Each app should have its own password

---

## 📧 Hotmail/Outlook

### Configuration
```env
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@hotmail.com
EMAIL_SERVER_PASSWORD=your-hotmail-password
EMAIL_FROM=your-email@hotmail.com
```

### Setup Steps
1. Log into your [Outlook account](https://outlook.live.com/)
2. Click on your profile picture → **My Microsoft account**
3. Go to **Security** → **Advanced security options**
4. Under **App passwords**, click **Create a new app password**
5. Copy the generated password
6. Use this password in `EMAIL_SERVER_PASSWORD`

### Notes
- Works with @hotmail.com, @outlook.com, and @live.com addresses
- Regular password may work, but app password is recommended
- Ensure "less secure app access" is not blocking the connection

---

## 📧 iCloud Mail

### Configuration
```env
EMAIL_SERVER_HOST=smtp.mail.me.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@icloud.com
EMAIL_SERVER_PASSWORD=your-icloud-app-specific-password
EMAIL_FROM=your-email@icloud.com
```

### Setup Steps
1. Go to [Apple ID account page](https://appleid.apple.com/)
2. Sign in with your Apple ID
3. Navigate to **Security** section
4. Under **App-Specific Passwords**, click **Generate Password**
5. Enter a label like "NextAuth Email"
6. Copy the generated password (format: xxxx-xxxx-xxxx-xxxx)
7. Use this password in `EMAIL_SERVER_PASSWORD` (include hyphens or remove them)

### Notes
- Two-factor authentication must be enabled for your Apple ID
- You can have multiple app-specific passwords
- Passwords can be revoked individually

---

## 📧 QQ Mail (腾讯QQ邮箱)

### Configuration
```env
EMAIL_SERVER_HOST=smtp.qq.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@qq.com
EMAIL_SERVER_PASSWORD=your-qq-authorization-code
EMAIL_FROM=your-email@qq.com
```

### Setup Steps (设置步骤)
1. Log into [QQ Mail](https://mail.qq.com/)
2. Click **Settings (设置)** → **Account (账户)**
3. Scroll to **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV Service**
4. Enable **IMAP/SMTP Service**
5. Click **Generate Authorization Code (生成授权码)**
6. Verify with SMS code
7. Copy the authorization code
8. Use this code in `EMAIL_SERVER_PASSWORD`

### Notes
- 必须开启IMAP/SMTP服务
- Authorization code (授权码) is different from your QQ password
- Port 465 (SSL) is also supported but use 587 for compatibility
- Alternative host: `smtp.exmail.qq.com` (for QQ Enterprise Mail)

---

## 📧 Yahoo Mail

### Configuration
```env
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yahoo.com
EMAIL_SERVER_PASSWORD=your-yahoo-app-password
EMAIL_FROM=your-email@yahoo.com
```

### Setup Steps
1. Go to [Yahoo Account Security](https://login.yahoo.com/account/security)
2. Sign in to your Yahoo account
3. Click **Generate app password** or **Manage app passwords**
4. Select **Other App** from the dropdown
5. Enter "NextAuth" or any name
6. Click **Generate**
7. Copy the 16-character password
8. Use this password in `EMAIL_SERVER_PASSWORD`

### Notes
- Two-step verification must be enabled
- App passwords are required for third-party apps
- Regular password will not work for SMTP authentication

---

## 🔧 Common Settings

### Port Options
- **Port 587** (TLS/STARTTLS) - Recommended, works with most providers
- **Port 465** (SSL) - Alternative, may require additional config
- **Port 25** (Unencrypted) - Not recommended, often blocked

### Security Options
All configurations above use TLS/STARTTLS by default. If you need to customize:

```javascript
// In app/api/auth/[...nextauth]/route.js
EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    },
    secure: false, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false // Use with caution in production
    }
  },
  from: process.env.EMAIL_FROM
})
```

---

## 🧪 Testing Your Configuration

### 1. Basic SMTP Test
You can test your SMTP settings before running the app:

```javascript
// Create a test file: test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Change to your provider
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Server is ready');
  }
});
```

Run: `node test-email.js`

### 2. Send Test Email
```javascript
transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Testing NextAuth email configuration'
}, (error, info) => {
  if (error) {
    console.log('❌ Send Error:', error);
  } else {
    console.log('✅ Email sent:', info.messageId);
  }
});
```

---

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
- ✅ Use app-specific password, not your regular password
- ✅ Enable 2FA if required by provider
- ✅ Check for typos in email and password

### Error: "Connection timeout"
- ✅ Check your firewall settings
- ✅ Verify SMTP port is not blocked
- ✅ Try alternative ports (587 → 465)

### Error: "Self-signed certificate"
- ✅ Add `tls: { rejectUnauthorized: false }` to server config (development only)

### Error: "Email requires an adapter"
- ✅ This is expected - Email provider needs a database adapter
- ✅ For testing without DB, remove EmailProvider or add a database adapter

### Emails not being delivered
- ✅ Check spam/junk folder
- ✅ Verify `EMAIL_FROM` address
- ✅ Some providers require `from` to match `user`
- ✅ Check provider's sending limits

---

## 📊 Provider Comparison

| Provider | Setup Difficulty | Reliability | Sending Limit | Best For |
|----------|-----------------|-------------|---------------|----------|
| Gmail | Easy | Excellent | 500/day | Development & Production |
| Hotmail/Outlook | Easy | Excellent | 300/day | All purposes |
| iCloud | Medium | Good | Lower | Apple ecosystem users |
| QQ | Medium | Good | Varies | Chinese users |
| Yahoo | Easy | Good | Varies | General use |

---

## 🚀 Production Recommendations

For production, consider using a dedicated email service:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - 62,000 emails/month free (with EC2)
- **Postmark** - Great for transactional emails

These services provide better deliverability, analytics, and higher sending limits.

---

## 📝 Next Steps

1. Choose your email provider
2. Generate app-specific password
3. Update `.env.local` with your settings
4. Test the configuration
5. Restart your Next.js dev server
6. Try signing in with email on `/chat` page

For more information, visit:
- [NextAuth Email Provider Docs](https://next-auth.js.org/providers/email)
- [Nodemailer Documentation](https://nodemailer.com/)
