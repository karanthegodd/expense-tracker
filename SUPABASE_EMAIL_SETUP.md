# Supabase Email Configuration Guide

For the forgot password feature to work, you need to configure email settings in your Supabase project.

## Steps to Enable Password Reset Emails

### 1. Configure Redirect URLs

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add your redirect URLs to the **Redirect URLs** list:
   - For local development: `http://localhost:5173/reset-password`
   - For production: `https://your-domain.com/reset-password`
   - For Vercel: `https://your-app.vercel.app/reset-password`

### 2. Configure Email Templates

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Find the **Reset Password** template
3. Make sure it's enabled and configured
4. The default template should work, but you can customize it if needed

### 3. Configure SMTP Settings (Optional but Recommended)

By default, Supabase uses their own email service, but for production you should configure your own SMTP:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
3. Or use Supabase's built-in email service (works for development)

### 4. Enable Email Auth Provider

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure any additional settings if needed

### 5. Test the Feature

1. Try the forgot password feature on your app
2. Check the browser console for any error messages
3. Check your email inbox (and spam folder)
4. If emails aren't being sent, check Supabase logs in the Dashboard

## Troubleshooting

### Emails not being sent?

1. **Check Supabase Logs**: Go to **Logs** → **Auth Logs** in Supabase Dashboard
2. **Verify Redirect URL**: Make sure the redirect URL matches exactly (including http/https)
3. **Check Email Provider**: Verify your email provider settings in Supabase
4. **Rate Limiting**: Supabase has rate limits on emails - wait a few minutes between requests
5. **Check Spam Folder**: Sometimes emails go to spam

### Common Errors

- **"Invalid redirect URL"**: Add the URL to your allowed redirect URLs in Supabase
- **"Email rate limit exceeded"**: Wait a few minutes before trying again
- **"Email not confirmed"**: Make sure email confirmation is enabled in Auth settings

## Production Checklist

- [ ] Redirect URLs configured for production domain
- [ ] SMTP settings configured (recommended for production)
- [ ] Email templates customized (optional)
- [ ] Tested password reset flow end-to-end
- [ ] Checked spam folder for test emails

