// Script to upload videos to Cloudinary
// To use this script:
// 1. Install the Cloudinary SDK: npm install cloudinary
// 2. Update the configuration below with your Cloudinary credentials
// 3. Run the script: node upload-to-cloudinary.js

const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dwt0yikij', // Replace with your actual cloud name
  api_key: '864514581265886',       // Replace with your actual API key
  api_secret: 'zPytPIdWYDihUOJITTI-0BEZLN8'  // Replace with your actual API secret
});

// Define the videos to upload
const videos = [
  {
    filePath: 'public/vids/v1_-_julie_-_be_courageous_1080p.mp4',
    publicId: 'courage-videos/julie'
  },
  {
    filePath: 'public/vids/v1_-_laura_-_be_courageous_1080p.mp4',
    publicId: 'courage-videos/laura'
  },
  {
    filePath: 'public/vids/v1_-_michael_-_be_courageous_1080p.mp4',
    publicId: 'courage-videos/michael'
  },
  {
    filePath: 'public/vids/v1_-_nicolas_-_be_courageous_1080p.mp4',
    publicId: 'courage-videos/nicolas'
  },
  {
    filePath: 'public/vids/compilation_-_be_courageous (2160p).mp4',
    publicId: 'courage-videos/compilation'
  }
];

// Function to upload a single video
async function uploadVideo(video) {
  console.log(`Starting upload for ${video.filePath}...`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(video.filePath)) {
      console.error(`File not found: ${video.filePath}`);
      return;
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(video.filePath, {
      resource_type: 'video',
      public_id: video.publicId,
      chunk_size: 6000000, // 6MB chunks for large files
      eager: [
        { format: 'mp4', transformation: [
            {quality: 'auto:good'}
          ]}
      ],
      eager_async: true
    });
    
    console.log(`Successfully uploaded ${video.filePath}`);
    console.log(`URL: ${result.secure_url}`);
    console.log('-----------------------------------');
    
    return result;
  } catch (error) {
    console.error(`Error uploading ${video.filePath}:`, error);
  }
}

// Upload all videos
async function uploadAllVideos() {
  console.log('Starting upload of all videos to Cloudinary...');
  
  for (const video of videos) {
    await uploadVideo(video);
  }
  
  console.log('All uploads completed!');
}

// Run the upload
uploadAllVideos();
