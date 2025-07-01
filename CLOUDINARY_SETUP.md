# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for profile image uploads in the Expense Tracker application.

## 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After signing up, you'll be redirected to your dashboard

## 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard, you'll need:

- **Cloud Name**: Found in the dashboard overview
- **Upload Preset**: You'll need to create this (see step 3)

## 3. Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `ml_default`, `profile_images`)
   - **Signing Mode**: Select **Unsigned** (for client-side uploads)
   - **Resource type**: Select **Image**
   - **Access control**: Set as needed (usually **Public read**)
   - **Allowed formats**: Add `jpg`, `png`, `jpeg`
   - **Transformation**: Optional (can add automatic optimizations)
   - **File size limit**: Set to 2MB or as needed
5. Click **Save**

## 4. Configure Environment Variables

Update your `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_actual_upload_preset_name
```

Replace the placeholder values with your actual Cloudinary credentials.

## 5. Production Environment Variables

For deployment (Render/Vercel), add these environment variables:

- `REACT_APP_CLOUDINARY_CLOUD_NAME`
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

## 6. Security Considerations

- The upload preset is set to **unsigned** for simplicity, which means anyone with your preset name can upload images
- For production, consider:
  - Setting up **signed uploads** for better security
  - Adding backend validation for uploaded images
  - Implementing rate limiting for uploads
  - Adding image content validation

## 7. Features Included

The profile page includes:

- ✅ Profile image upload to Cloudinary
- ✅ Profile information update (name, email)
- ✅ Password change with current password verification
- ✅ Image preview and validation (JPG/PNG, max 2MB)
- ✅ User avatar display in navbar
- ✅ Responsive design for mobile and desktop

## 8. Troubleshooting

### Upload Fails

- Check that your cloud name and upload preset are correct
- Ensure the upload preset is set to "unsigned"
- Verify the image file is JPG/PNG and under 2MB

### Environment Variables Not Working

- Restart your development server after changing .env
- Ensure variables start with `REACT_APP_`
- Check that .env file is in the frontend root directory

### Profile Image Not Displaying

- Check browser console for errors
- Verify the image URL is being saved correctly in the database
- Ensure the avatar field is returned from the API
