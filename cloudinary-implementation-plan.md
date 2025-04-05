# Cloudinary Implementation Plan for Video Hosting

This document outlines the step-by-step process to migrate your videos from local storage to Cloudinary, a cloud-based media management service.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. The free tier includes:
   - 25GB storage
   - 25GB monthly bandwidth
   - 25,000 transformations
   - No credit card required

## 2. Set Up Your Cloudinary Dashboard

After signing up:

1. Note your **Cloud Name** from the dashboard
2. Create a new folder called `courage-videos` to organize your content
3. Set up upload presets for easier management

## 3. Upload Your Videos

### Option A: Upload via Dashboard (Easiest)

1. Log in to your Cloudinary dashboard
2. Navigate to Media Library → Upload
3. Upload each video file:
   - `compilation_-_be_courageous (2160p).mp4` (418.7 MB)
   - `v1_-_julie_-_be_courageous_1080p.mp4` (117.6 MB)
   - `v1_-_laura_-_be_courageous_1080p.mp4` (104.1 MB)
   - `v1_-_michael_-_be_courageous_1080p.mp4` (84.7 MB)
   - `v1_-_nicolas_-_be_courageous_1080p.mp4` (93.3 MB)
4. Add tags to each video for better organization (e.g., "personal-story", "compilation")

### Option B: Upload via API (More Technical)

If you prefer programmatic upload:

```javascript
// Example Node.js script for uploading to Cloudinary
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

// Upload video
cloudinary.uploader.upload('path/to/video.mp4', {
  resource_type: 'video',
  public_id: 'courage-videos/julie',
  chunk_size: 6000000, // 6MB chunks for large files
  eager: [
    { format: 'mp4', transformation: [
        {quality: 'auto:good'}
      ]}
  ],
  eager_async: true
}, function(error, result) {
  console.log(result, error);
});
```

## 4. Update Your React Code

### Create a Video Configuration File

Create a new file `src/config/videos.ts`:

```typescript
// Video configuration with Cloudinary URLs
export const videoConfig = {
  julie: {
    name: 'Julie',
    videoSrc: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/courage-videos/julie',
    category: 'Personal Story',
    description: "Julie's personal journey of courage and growth."
  },
  laura: {
    name: 'Laura',
    videoSrc: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/courage-videos/laura',
    category: 'Overcoming Fear',
    description: "Laura's personal journey of courage and growth."
  },
  michael: {
    name: 'Michael',
    videoSrc: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/courage-videos/michael',
    category: 'Growth Journey',
    description: "Michael's personal journey of courage and growth."
  },
  nicolas: {
    name: 'Nicolas',
    videoSrc: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/courage-videos/nicolas',
    category: 'Transformation',
    description: "Nicolas's personal journey of courage and growth."
  },
  compilation: {
    name: 'Compilation',
    videoSrc: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1/courage-videos/compilation',
    category: 'Featured',
    description: "A compilation of courage stories."
  }
};
```

### Update Videos.tsx

Modify `src/pages/Videos.tsx`:

```typescript
// Remove these imports
// import videoJulie from '/vids/v1_-_julie_-_be_courageous (1080p).mp4';
// import videoLaura from '/vids/v1_-_laura_-_be_courageous (1080p).mp4';
// import videoMichael from '/vids/v1_-_michael_-_be_courageous (1080p).mp4';
// import videoNicolas from '/vids/v1_-_nicolas_-_be_courageous (1080p).mp4';

// Add this import
import { videoConfig } from '@/config/videos';

// Then update your useEffect:
useEffect(() => {
  // Use the config instead of local imports
  const videoData = [
    videoConfig.julie,
    videoConfig.laura,
    videoConfig.michael,
    videoConfig.nicolas,
  ];

  const formattedVideos = videoData.map((video, index) => ({
    ...video,
    id: `video-${index}-${video.name}`,
    displayName: video.name,
    thumbnail: logo
  }));
  
  setVideos(formattedVideos);
}, []);
```

### Update VideoGallery.tsx

Modify `src/components/VideoGallery.tsx`:

```typescript
// Remove this import
// import featuredVideo from '/vids/compilation_-_be_courageous (2160p).mp4';

// Add this import
import { videoConfig } from '@/config/videos';

// Then update your video element:
<video
  src={videoConfig.compilation.videoSrc}
  controls
  autoPlay
  className="w-full h-full object-cover"
  title="Facing Our Fears Together - Compilation"
  onEnded={() => setShowVideo(false)}
>
  Your browser does not support the video tag.
</video>
```

## 5. Cloudinary Advanced Features

Cloudinary offers several features you can leverage:

### Automatic Format Detection

Add `f_auto` to your URLs to serve the optimal format based on the browser:

```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/f_auto/v1/courage-videos/julie
```

### Quality Optimization

Add `q_auto` to automatically optimize quality vs file size:

```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/q_auto/v1/courage-videos/julie
```

### Responsive Videos

Generate different resolutions for different devices:

```typescript
// For mobile (480p)
const mobileUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/c_scale,w_480/v1/courage-videos/julie`;

// For desktop (1080p)
const desktopUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/c_scale,w_1080/v1/courage-videos/julie`;
```

## 6. Testing

1. After implementing these changes, test video playback on different devices
2. Check network tab in browser dev tools to confirm videos are loading from Cloudinary
3. Verify that video quality and performance are acceptable

## 7. Clean Up

Once everything is working with Cloudinary:

1. Remove the local video files from your repository
2. Update your `.gitignore` to prevent accidentally committing large video files in the future
3. Commit these changes to your repository

## 8. Monitoring

Monitor your Cloudinary usage through their dashboard to ensure you stay within the free tier limits or upgrade if needed.
