# Quick Email Provider Reference Card

## 📋 SMTP Settings Cheat Sheet

Copy and paste the settings for your chosen provider into `.env.local`:

### Gmail
```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```
📖 Get App Password: https://myaccount.google.com/apppasswords

---

### Hotmail/Outlook
```env
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@hotmail.com
EMAIL_SERVER_PASSWORD=your-hotmail-app-password
EMAIL_FROM=your-email@hotmail.com
```

---

### iCloud
```env
EMAIL_SERVER_HOST=smtp.mail.me.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@icloud.com
EMAIL_SERVER_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@icloud.com
```
📖 Get App Password: https://appleid.apple.com/account/manage

---

### QQ Mail
```env
EMAIL_SERVER_HOST=smtp.qq.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@qq.com
EMAIL_SERVER_PASSWORD=your-qq-authorization-code
EMAIL_FROM=your-email@qq.com
```
📖 Get Authorization Code: Settings → Account → IMAP/SMTP Service

---

### Yahoo
```env
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yahoo.com
EMAIL_SERVER_PASSWORD=your-yahoo-app-password
EMAIL_FROM=your-email@yahoo.com
```
📖 Get App Password: https://login.yahoo.com/account/security

---

## 🔐 Important Notes

1. **Never use your regular email password** - Always use app-specific passwords
2. **Enable 2FA** - Required for most providers to generate app passwords
3. **Match EMAIL_FROM** - Some providers require it to match EMAIL_SERVER_USER
4. **Restart server** - After changing .env.local, restart your Next.js dev server

---

## ⚡ Quick Test

Run this to verify your SMTP settings:

```bash
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((err) => {
  console.log(err ? '❌ ' + err.message : '✅ SMTP Ready!');
});
"
```

Replace the values with your actual settings.

---

See **EMAIL_SETUP_GUIDE.md** for detailed instructions!
