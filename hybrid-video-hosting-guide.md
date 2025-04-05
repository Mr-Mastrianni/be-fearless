# Hybrid Video Hosting Implementation Guide

This guide explains how to implement a hybrid approach for hosting your videos, using Cloudinary for smaller videos and Vimeo for the large compilation video.

## Current Implementation Status

We've updated your codebase to:

1. Use a centralized video configuration in `src/config/videos.ts`
2. Support multiple video hosting types (local, Cloudinary, Vimeo)
3. Render different video players based on the hosting type

## Step 1: Upload Your Individual Videos to Cloudinary

For the smaller videos (Julie, Laura, Michael, Nicolas):

1. Log in to your Cloudinary dashboard
2. Upload each video with the following Public IDs:
   - `courage-videos/julie` for `v1_-_julie_-_be_courageous_1080p.mp4`
   - `courage-videos/laura` for `v1_-_laura_-_be_courageous_1080p.mp4`
   - `courage-videos/michael` for `v1_-_michael_-_be_courageous_1080p.mp4`
   - `courage-videos/nicolas` for `v1_-_nicolas_-_be_courageous_1080p.mp4`

## Step 2: Upload Your Compilation Video to Vimeo

For the large compilation video:

1. Sign up for a Vimeo account if you don't have one
2. Upload `compilation_-_be_courageous (2160p).mp4` to Vimeo
3. Set privacy to "Only people with the private link"
4. Get the video ID from the share/embed code (it's a number like "123456789")

## Step 3: Update Your Configuration

After uploading all videos, update `src/config/cloudinary.ts` with your Cloudinary credentials:

```typescript
// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: 'your-cloud-name', // Replace with your actual cloud name
  apiKey: 'your-api-key',       // Replace with your actual API key
  apiSecret: 'your-api-secret', // Replace with your actual API secret
};
```

Then update `src/config/videos.ts` to use the hosted videos:

```typescript
// Import Cloudinary config
import { cloudinaryConfig } from './cloudinary';

// Construct the base URL for Cloudinary videos
const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload`;

// Video configuration with Cloudinary and Vimeo URLs
export const videoConfig = {
  julie: {
    name: 'Julie',
    type: 'cloudinary',
    videoSrc: `${baseUrl}/v1/courage-videos/julie`,
    category: 'Personal Story',
    description: "Julie's personal journey of courage and growth."
  },
  laura: {
    name: 'Laura',
    type: 'cloudinary',
    videoSrc: `${baseUrl}/v1/courage-videos/laura`,
    category: 'Overcoming Fear',
    description: "Laura's personal journey of courage and growth."
  },
  michael: {
    name: 'Michael',
    type: 'cloudinary',
    videoSrc: `${baseUrl}/v1/courage-videos/michael`,
    category: 'Growth Journey',
    description: "Michael's personal journey of courage and growth."
  },
  nicolas: {
    name: 'Nicolas',
    type: 'cloudinary',
    videoSrc: `${baseUrl}/v1/courage-videos/nicolas`,
    category: 'Transformation',
    description: "Nicolas's personal journey of courage and growth."
  },
  compilation: {
    name: 'Compilation',
    type: 'vimeo',
    videoId: 'YOUR_VIMEO_VIDEO_ID', // Replace with your Vimeo video ID
    embedSrc: 'https://player.vimeo.com/video/YOUR_VIMEO_VIDEO_ID?autoplay=1&title=0&byline=0&portrait=0',
    category: 'Featured',
    description: "A compilation of courage stories."
  }
};
```

## Step 4: Test Your Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Videos page and verify that:
   - The individual videos load from Cloudinary
   - The compilation video loads from Vimeo
   - All videos play correctly
   - There are no console errors

## Step 5: Optimize Your Videos (Optional)

For Cloudinary videos, you can add optimization parameters:

```typescript
videoSrc: `${baseUrl}/f_auto,q_auto/v1/courage-videos/julie`,
```

For Vimeo, you can customize the player appearance:

```typescript
embedSrc: 'https://player.vimeo.com/video/YOUR_VIMEO_VIDEO_ID?autoplay=1&title=0&byline=0&portrait=0&color=ff9933',
```

## Step 6: Clean Up

After confirming everything works:

1. Remove the local video files from your repository
2. Update your `.gitignore` to prevent accidentally committing large video files in the future
3. Commit these changes to your repository

## Benefits of This Hybrid Approach

1. **Cost-effective**: Uses free tiers of both services
2. **Optimized for file size**: Cloudinary for smaller videos, Vimeo for large videos
3. **Better performance**: Videos are served from CDNs instead of your server
4. **Reduced repository size**: No large video files in your Git repository

## Troubleshooting

If videos don't play:

1. Check your browser console for errors
2. Verify that your Cloudinary cloud name is correct
3. Check that the Vimeo video ID is correct
4. Try accessing the videos directly in your browser
5. Check CORS settings if you encounter cross-origin issues
