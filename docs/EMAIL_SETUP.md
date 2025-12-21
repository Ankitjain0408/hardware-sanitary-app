# Email Configuration Guide

To enable OTP emails for password reset, you need to configure email settings in your `.env` file.

## Step 1: Choose Your Email Provider

### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to your Google Account settings: https://myaccount.google.com/
   - Navigate to **Security** → **2-Step Verification** → **App passwords**
   - Select "Mail" and "Other (Custom name)"
   - Enter "Hardware Sanitary App" as the name
   - Click "Generate"
   - **Copy the 16-character password** (you'll need this for EMAIL_PASS)

3. **Add to .env file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Option B: Other SMTP Providers

For other email providers (Outlook, Yahoo, custom SMTP), use these settings:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

**Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Step 2: Update Your .env File

Add these lines to your existing `.env` file in the root directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

## Step 3: Restart Your Server

After updating the `.env` file, restart your backend server:

```bash
npm run server
```

## Step 4: Test Email Configuration

When you start the server, check the console logs. If email is configured correctly, you should see:
- `✅ OTP email sent successfully to [email]` when a password reset is requested

If you see errors, check:
1. Email credentials are correct in `.env`
2. App password is generated correctly (for Gmail)
3. 2FA is enabled (for Gmail)
4. Firewall/antivirus isn't blocking SMTP connections

## Troubleshooting

**"Email service not configured" error:**
- Make sure EMAIL_USER and EMAIL_PASS are set in `.env`
- Restart the server after updating `.env`

**"Authentication failed" error:**
- For Gmail: Make sure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Gmail account
- Verify the app password is correct (no spaces)

**"Connection timeout" error:**
- Check your internet connection
- Verify EMAIL_HOST and EMAIL_PORT are correct
- Some networks block SMTP ports - try a different network or use a VPN

**Emails going to spam:**
- This is normal for development. In production, set up SPF, DKIM, and DMARC records for your domain.

## Security Notes

- **Never commit your `.env` file to version control**
- Use App Passwords instead of your main email password
- For production, consider using a dedicated email service like SendGrid, Mailgun, or AWS SES

