# Cloudinary Image Upload Setup

This guide will help you set up Cloudinary for image uploads in the Hardware Sanitary App.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up" (free tier available)
3. Complete the registration process

## Step 2: Get Your Cloudinary Credentials

After signing up, you'll be taken to your dashboard. You'll need:

1. **Cloud Name** - Found in your dashboard URL or account details
2. **API Key** - Found in the dashboard
3. **API Secret** - Found in the dashboard (click "Reveal" to see it)

## Step 3: Add Credentials to Backend Environment

Add these variables to your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Never commit your `.env` file to Git!

## Step 4: Verify Setup

1. Restart your backend server
2. Try uploading an image when creating/editing a product
3. Check your Cloudinary dashboard to see uploaded images

## Features

- **Automatic Image Optimization**: Images are automatically resized and optimized
- **Secure URLs**: Images are served via HTTPS
- **CDN Delivery**: Fast image delivery worldwide
- **Automatic Cleanup**: Images are deleted from Cloudinary when removed from products

## Image Upload Limits

- Maximum file size: 5MB per image
- Maximum images per product: 10
- Supported formats: JPG, JPEG, PNG, WEBP
- Images are automatically resized to max 800x800px

## Troubleshooting

### Images not uploading?

1. Check that all Cloudinary credentials are correct in `.env`
2. Verify your Cloudinary account is active
3. Check backend server logs for errors
4. Ensure file size is under 5MB

### Images not displaying?

1. Check that the image URL is correct
2. Verify CORS settings in Cloudinary (if needed)
3. Check browser console for errors

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- Unlimited transformations
- Perfect for development and small projects

For production with high traffic, consider upgrading to a paid plan.

