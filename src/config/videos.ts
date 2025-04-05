// Temporary configuration using local videos
// This will be replaced with Cloudinary URLs after uploading the videos

// Video configuration with Cloudinary URLs
export const videoConfig = {
  julie: {
    name: 'Julie',
    type: 'vimeo',
    videoId: '1072428960',
    embedSrc: 'https://player.vimeo.com/video/1072428960?h=756979b04e&badge=0&autopause=0&player_id=0&app_id=58479',
    category: 'Personal Story',
    description: "Julie's personal journey of courage and growth."
  },
  laura: {
    name: 'Laura',
    type: 'cloudinary',
    videoSrc: 'https://res.cloudinary.com/dwt0yikij/video/upload/v1743743304/laura_ubzloo.mp4',
    cloudinaryId: 'laura_ubzloo',
    cloudName: 'dwt0yikij',
    category: 'Overcoming Fear',
    description: "Laura's personal journey of courage and growth."
  },
  michael: {
    name: 'Michael',
    type: 'cloudinary',
    videoSrc: 'https://res.cloudinary.com/dwt0yikij/video/upload/v1743743357/michael_sgd9xa.mp4',
    cloudinaryId: 'michael_sgd9xa',
    cloudName: 'dwt0yikij',
    category: 'Growth Journey',
    description: "Michael's personal journey of courage and growth."
  },
  nicolas: {
    name: 'Nicolas',
    type: 'cloudinary',
    videoSrc: 'https://res.cloudinary.com/dwt0yikij/video/upload/v1743743386/nicolas_jfgxo2.mp4',
    cloudinaryId: 'nicolas_jfgxo2',
    cloudName: 'dwt0yikij',
    category: 'Transformation',
    description: "Nicolas's personal journey of courage and growth."
  },
  compilation: {
    name: 'Compilation',
    type: 'vimeo',
    videoId: '1072428847',
    embedSrc: 'https://player.vimeo.com/video/1072428847?h=fb07f16cf1&badge=0&autopause=0&player_id=0&app_id=58479',
    category: 'Featured',
    description: "A compilation of courage stories."
  },
};
