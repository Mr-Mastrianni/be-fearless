# Cloudinary Implementation Steps

This guide provides a step-by-step process to migrate your videos from local storage to Cloudinary.

## Current Status

We've prepared your codebase to use Cloudinary by:
1. Creating a configuration structure in `src/config/videos.ts`
2. Updating your components to use this configuration
3. Temporarily pointing the configuration to local files so your app continues to work

## Step 1: Sign Up for Cloudinary (Already Completed)

You mentioned you've already signed up for Cloudinary and have your API key.

## Step 2: Update Your Cloudinary Credentials

1. Open `src/config/cloudinary.ts` and update it with your actual Cloudinary credentials:

```typescript
// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: 'your-cloud-name', // Replace with your actual cloud name from your dashboard
  apiKey: 'your-api-key',       // Replace with your actual API key
  apiSecret: 'your-api-secret', // Replace with your actual API secret
};
```

## Step 3: Upload Your Videos to Cloudinary

### Option A: Upload via Cloudinary Dashboard (Recommended for First-Time Users)

1. Log in to your Cloudinary dashboard at [https://cloudinary.com/console](https://cloudinary.com/console)
2. Click on "Media Library" in the left sidebar
3. Click the "Upload" button in the top-right corner
4. Create a new folder called "courage-videos" (click "Create folder" button)
5. Navigate into the folder and upload each of your video files:
   - `compilation_-_be_courageous (2160p).mp4` → rename to "compilation"
   - `v1_-_julie_-_be_courageous_1080p.mp4` → rename to "julie"
   - `v1_-_laura_-_be_courageous_1080p.mp4` → rename to "laura"
   - `v1_-_michael_-_be_courageous_1080p.mp4` → rename to "michael"
   - `v1_-_nicolas_-_be_courageous_1080p.mp4` → rename to "nicolas"

### Option B: Upload via Script

If you prefer to use the script we created:

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

## Step 4: Update Your Videos Configuration

After uploading your videos, update `src/config/videos.ts` to use Cloudinary URLs:

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
  laura: {
    name: 'Laura',
    videoSrc: `${baseUrl}/v1/courage-videos/laura`,
    category: 'Overcoming Fear',
    description: "Laura's personal journey of courage and growth."
  },
  michael: {
    name: 'Michael',
    videoSrc: `${baseUrl}/v1/courage-videos/michael`,
    category: 'Growth Journey',
    description: "Michael's personal journey of courage and growth."
  },
  nicolas: {
    name: 'Nicolas',
    videoSrc: `${baseUrl}/v1/courage-videos/nicolas`,
    category: 'Transformation',
    description: "Nicolas's personal journey of courage and growth."
  },
  compilation: {
    name: 'Compilation',
    videoSrc: `${baseUrl}/v1/courage-videos/compilation`,
    category: 'Featured',
    description: "A compilation of courage stories."
  }
};
```

## Step 5: Test Your Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Videos page and verify that:
   - All videos load correctly from Cloudinary
   - Videos play when clicked
   - There are no console errors

## Step 6: Optimize Your Videos (Optional)

Once everything is working, you can add Cloudinary optimization parameters:

```typescript
// Add optimization parameters to the URLs
const videoConfig = {
  julie: {
    name: 'Julie',
    videoSrc: `${baseUrl}/f_auto,q_auto/v1/courage-videos/julie`,
    // ...
  },
  // ...
};
```

## Step 7: Clean Up

After confirming everything works with Cloudinary:

1. Remove the local video files from your repository
2. Update your `.gitignore` to prevent accidentally committing large video files in the future
3. Commit these changes to your repository

## Troubleshooting

If videos don't play after uploading to Cloudinary:

1. Check your browser console for errors
2. Verify that your Cloudinary cloud name is correct
3. Check that the video public IDs match what's in your code
4. Try accessing a video URL directly in your browser, e.g.:
   `https://res.cloudinary.com/your-cloud-name/video/upload/v1/courage-videos/julie`
5. Check your Cloudinary dashboard to ensure the videos were uploaded successfully
