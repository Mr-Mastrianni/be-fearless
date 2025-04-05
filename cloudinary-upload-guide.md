# Cloudinary Upload Guide

This guide will help you upload your videos to Cloudinary and update your application to use them.

## Step 1: Update Your Cloudinary Credentials

1. Open `src/config/cloudinary.ts` and update it with your actual Cloudinary credentials:

```typescript
// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: 'your-cloud-name', // Replace with your actual cloud name
  apiKey: 'your-api-key',       // Replace with your actual API key
  apiSecret: 'your-api-secret', // Replace with your actual API secret
};
```

## Step 2: Upload Your Videos to Cloudinary

### Option A: Upload via Cloudinary Dashboard (Easiest)

1. Log in to your Cloudinary dashboard at [https://cloudinary.com/console](https://cloudinary.com/console)
2. Click on "Media Library" in the left sidebar
3. Click the "Upload" button in the top-right corner
4. Upload each of your video files:
   - `compilation_-_be_courageous (2160p).mp4`
   - `v1_-_julie_-_be_courageous_1080p.mp4`
   - `v1_-_laura_-_be_courageous_1080p.mp4`
   - `v1_-_michael_-_be_courageous_1080p.mp4`
   - `v1_-_nicolas_-_be_courageous_1080p.mp4`
5. For each video, set the "Public ID" to:
   - `courage-videos/compilation`
   - `courage-videos/julie`
   - `courage-videos/laura`
   - `courage-videos/michael`
   - `courage-videos/nicolas`

### Option B: Upload via Script (More Technical)

1. Install the Cloudinary SDK:
   ```bash
   npm install cloudinary
   ```

2. Open the `upload-to-cloudinary.js` file and update it with your Cloudinary credentials:
   ```javascript
   cloudinary.config({
     cloud_name: 'your-cloud-name', // Replace with your actual cloud name
     api_key: 'your-api-key',       // Replace with your actual API key
     api_secret: 'your-api-secret'  // Replace with your actual API secret
   });
   ```

3. Run the script:
   ```bash
   node upload-to-cloudinary.js
   ```

## Step 3: Update Your Videos Configuration

After uploading your videos, update `src/config/videos.ts` with the correct cloud name:

```typescript
// Import Cloudinary config
import { cloudinaryConfig } from './cloudinary';

// Construct the base URL for Cloudinary videos
const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload`;

// Video configuration with Cloudinary URLs
export const videoConfig = {
  julie: {
    name: 'Julie',
    videoSrc: `${baseUrl}/v1/courage-videos/julie`,
    category: 'Personal Story',
    description: "Julie's personal journey of courage and growth."
  },
  // ... other videos
};
```

## Step 4: Test Your Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Videos page and verify that:
   - All videos load correctly
   - Videos play when clicked
   - There are no console errors

## Step 5: Optimize Your Videos (Optional)

Cloudinary offers several optimization features you can add to your video URLs:

1. Automatic format detection:
   ```typescript
   videoSrc: `${baseUrl}/f_auto/v1/courage-videos/julie`,
   ```

2. Quality optimization:
   ```typescript
   videoSrc: `${baseUrl}/q_auto/v1/courage-videos/julie`,
   ```

3. Combine multiple transformations:
   ```typescript
   videoSrc: `${baseUrl}/f_auto,q_auto/v1/courage-videos/julie`,
   ```

## Step 6: Clean Up

Once everything is working with Cloudinary:

1. Remove the local video files from your repository
2. Update your `.gitignore` to prevent accidentally committing large video files in the future
3. Commit these changes to your repository

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that your Cloudinary credentials are correct
3. Make sure the Public IDs in your code match the ones in Cloudinary
4. Try accessing the video URLs directly in your browser to ensure they work
