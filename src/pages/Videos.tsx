import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from "react-helmet-async";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Slider from "react-slick";
import logo from '@/assets/images/Print_Transparent.svg';

// Need to import Slick CSS
// Add to the top of the file
// You'll need to install: npm install react-slick @types/react-slick slick-carousel

// Import video configuration from Cloudinary
import { videoConfig } from '@/config/videos';

interface Video {
  id: string;
  name: string;
  displayName: string;
  duration?: string;
  category: string;
  description: string;
  thumbnail: string;
  videoSrc?: string;
  type?: 'local' | 'cloudinary' | 'vimeo' | 'youtube';
  videoId?: string;
  embedSrc?: string;
  cloudinaryId?: string;
  cloudName?: string;
}

// Custom arrow components for the carousel
const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 focus:outline-none"
      onClick={onClick}
    >
      <ChevronLeft size={24} />
    </button>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 focus:outline-none"
      onClick={onClick}
    >
      <ChevronRight size={24} />
    </button>
  );
};

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // 1. Effect to fetch initial video data
  useEffect(() => {
    // Use Cloudinary video data
    const videoData: Omit<Video, 'id' | 'thumbnail' | 'description' | 'displayName'>[] = [
      {
        name: videoConfig.julie.name,
        type: videoConfig.julie.type as 'vimeo',
        videoId: videoConfig.julie.videoId,
        embedSrc: videoConfig.julie.embedSrc,
        category: videoConfig.julie.category
      },
      {
        name: videoConfig.laura.name,
        type: videoConfig.laura.type as 'cloudinary',
        videoSrc: videoConfig.laura.videoSrc,
        cloudinaryId: videoConfig.laura.cloudinaryId,
        cloudName: videoConfig.laura.cloudName,
        category: videoConfig.laura.category
      },
      {
        name: videoConfig.michael.name,
        type: videoConfig.michael.type as 'cloudinary',
        videoSrc: videoConfig.michael.videoSrc,
        cloudinaryId: videoConfig.michael.cloudinaryId,
        cloudName: videoConfig.michael.cloudName,
        category: videoConfig.michael.category
      },
      {
        name: videoConfig.nicolas.name,
        type: videoConfig.nicolas.type as 'cloudinary',
        videoSrc: videoConfig.nicolas.videoSrc,
        cloudinaryId: videoConfig.nicolas.cloudinaryId,
        cloudName: videoConfig.nicolas.cloudName,
        category: videoConfig.nicolas.category
      },
      {
        name: videoConfig.compilation.name,
        type: videoConfig.compilation.type as 'vimeo',
        videoId: videoConfig.compilation.videoId,
        embedSrc: videoConfig.compilation.embedSrc,
        category: videoConfig.compilation.category
      },
    ];

    const formattedVideos = videoData.map((video, index) => {
       const description = `${video.name}'s personal journey of courage and growth.`;
       return {
         ...video,
         id: `video-${index}-${video.name}`,
         displayName: video.name,
         description,
         thumbnail: logo
       };
     });
    setVideos(formattedVideos);
  }, []);

  // 2. Calculate derived state (categories and filtered videos) based on state/props
  const categories = Array.from(new Set(videos.map(video => video.category)));
  const filteredVideos = selectedCategory
    ? videos.filter(video => video.category === selectedCategory)
    : videos;

  // 4. Helper function to pause all videos and reset state
  const pauseAllVideos = () => {
    console.log("Pausing ALL videos and resetting state");
    // Stop all videos and reset the DOM
    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef) {
        try {
          // First pause the video
          if (!videoRef.paused) {
            videoRef.pause();
          }
          // Then reset its time to beginning to ensure clean state
          videoRef.currentTime = 0;
        } catch (error) {
          console.error(`Error pausing video ${index}:`, error);
        }
      }
    });
    // Reset state
    setIsPlaying(false);
  };

  // 5. Effect for category changes (needs pauseAllVideos)
  useEffect(() => {
    pauseAllVideos();
    setActivePlayerIndex(null);
    videoRefs.current = []; // Reset refs on category change
  }, [selectedCategory]);

  // 6. Event Handlers (need pauseAllVideos, videoRefs, setActivePlayerIndex)
  const handlePlayClick = (index: number) => {
    console.log(`handlePlayClick called for index ${index}, current activeIndex=${activePlayerIndex}, isPlaying=${isPlaying}`);
    setPlaybackError(null);

    // If we're already playing this video, stop it
    if (activePlayerIndex === index && isPlaying) {
      pauseAllVideos();
      // Keep the index active but not playing
      return;
    }

    // Pause all videos first - this ensures we start fresh
    pauseAllVideos();

    // Update the active index to change which video is visible
    setActivePlayerIndex(index);

    // Small delay to ensure DOM has updated
    setTimeout(() => {
      // Get reference to the video element
      const videoRef = videoRefs.current[index];
      if (videoRef) {
        console.log(`Attempting to play video ${index}`);

        // Set a loaded metadata handler to ensure video is ready
        const handleCanPlay = () => {
          console.log(`Video ${index} can play now`);

          // Try to play the video
          videoRef.play()
            .then(() => {
              console.log(`Video ${index} playing successfully`);
              setIsPlaying(true);
              // Clear any error messages when video starts playing successfully
              setPlaybackError(null);
            })
            .catch(error => {
              console.error(`Error playing video ${index}:`, error);
              setPlaybackError(`Failed to play video: ${error.message}`);
              setIsPlaying(false);
            });

          // Remove the event listener after it fires
          videoRef.removeEventListener('canplay', handleCanPlay);
        };

        // Add the event listener
        videoRef.addEventListener('canplay', handleCanPlay);

        // If the video is already ready, we might need to trigger manually
        if (videoRef.readyState >= 3) {
          handleCanPlay();
        }
      } else {
        console.warn(`Video ref not found for index ${index}`);
        // Add a small delay before setting the error to allow time for the video ref to be created
        // This helps prevent false error messages when the video is actually loading correctly
        setTimeout(() => {
          // Only set the error if the video ref is still not available and this is still the active player
          if (!videoRefs.current[index] && activePlayerIndex === index) {
            setPlaybackError("Video player not available");
          }
        }, 1000); // 1 second delay
      }
    }, 100);
  };

  const handleVideoEnded = (index: number) => {
    console.log(`Video ${index} ended`);
    setIsPlaying(false);
  };

  const handleVideoPause = () => {
    console.log(`Video paused`);
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    console.log(`Video playing`);
    setIsPlaying(true);
    // Clear any error messages when video starts playing
    setPlaybackError(null);
  };

  // Reset all videos on unmount
  useEffect(() => {
    return () => {
      pauseAllVideos();
    };
  }, []);

  // Load Vimeo Player API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 7. Carousel Settings (need filteredVideos, pauseAllVideos, videoRefs, activePlayerIndex)
  const featuredSettings = {
    dots: true,
    infinite: filteredVideos.length > 1, // Avoid infinite scroll issues with 1 item
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (oldIndex, newIndex) => {
       // Pause the video at the old index before slide changes
       if (oldIndex !== newIndex && videoRefs.current[oldIndex]) {
           videoRefs.current[oldIndex]?.pause();
           // Optionally reset activePlayerIndex if it was the leaving slide
           if (activePlayerIndex === oldIndex) {
               setActivePlayerIndex(null);
           }
       }
    },
    responsive: [
      {
        breakpoint: 640,
        settings: {
          arrows: false
        }
      }
    ]
  };

  // Calculate videos for the second carousel to determine settings
  const remainingVideos = filteredVideos.slice(Math.min(filteredVideos.length, 2));
  const numRemainingVideos = remainingVideos.length;
  const slidesToShowSecond = Math.min(3, numRemainingVideos); // Show up to 3, but no more than available

  const carouselSettings = {
    dots: true,
    infinite: numRemainingVideos > slidesToShowSecond, // Enable infinite only if there are more videos than shown at once
    speed: 500,
    slidesToShow: slidesToShowSecond,
    slidesToScroll: 1,
    autoplay: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (oldIndex, newIndex) => {
        // Adjust index based on the slice offset for the 'More Stories' carousel
        const offset = Math.min(filteredVideos.length, 2);
        const actualOldIndex = oldIndex + offset;
        // Pause the video at the old index before slide changes
        if (oldIndex !== newIndex && videoRefs.current[actualOldIndex]) {
            videoRefs.current[actualOldIndex]?.pause();
            // Optionally reset activePlayerIndex if it was the leaving slide
            if (activePlayerIndex === actualOldIndex) {
                setActivePlayerIndex(null);
            }
        }
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, numRemainingVideos), // Show up to 2, but no more than available
          slidesToScroll: 1,
          infinite: numRemainingVideos > Math.min(2, numRemainingVideos)
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          infinite: numRemainingVideos > 1 // Infinite if more than 1 video remains
        }
      }
    ]
  };

  // 8. Return JSX
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Courage Stories - Be Courageous</title>
        <meta name="description" content="Watch stories of people finding their courage and facing their fears." />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-indigo-900 dark:text-indigo-300">Courage Stories</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Watch inspiring stories of people facing their fears and finding their courage.
          </p>
        </div>

        {/* Categories filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="mb-2"
              >
                All Categories
              </Button>

              {categories.map((category, i) => (
                <Button
                  key={i}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Video Carousel - First 2 videos with larger display */}
        {filteredVideos.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-400">Featured Stories</h2>
            <div className="featured-carousel relative">
              <Slider {...featuredSettings}>
                {filteredVideos.slice(0, Math.min(filteredVideos.length, 2)).map((video, index) => (
                  <div key={`featured-${video.id}`} className="px-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                      <div className="relative aspect-video group bg-black flex items-center justify-center">
                        {/* Only render video when it's active */}
                        {activePlayerIndex === index && (
                          video.type === 'vimeo' ? (
                            <div style={{padding:'56.25% 0 0 0', position:'relative'}} className="absolute inset-0 w-full h-full z-10">
                              <iframe
                                key={`${video.id}-${Date.now()}`}
                                src={video.id.includes('julie') || video.name === 'Julie'
                                  ? "https://player.vimeo.com/video/1072428960?h=756979b04e&badge=0&autopause=0&player_id=0&app_id=58479"
                                  : "https://player.vimeo.com/video/1072428847?h=fb07f16cf1&badge=0&autopause=0&player_id=0&app_id=58479"}
                                style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
                                title={video.id.includes('julie') || video.name === 'Julie' ? "BE Courageous" : "Be Courageous - Compilation"}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : video.type === 'cloudinary' ? (
                            <video
                              ref={el => { videoRefs.current[index] = el; }}
                              key={`${video.id}-${Date.now()}`} // Ensure a fresh key on each render
                              src={video.videoSrc}
                              controls
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onEnded={() => handleVideoEnded(index)}
                              onPause={handleVideoPause}
                              onPlay={handleVideoPlay}
                              title={`${video.displayName}'s Story`}
                              preload="auto"
                              playsInline
                            >
                              <source
                                src={`https://res.cloudinary.com/${video.cloudName}/video/upload/q_auto,f_auto/${video.cloudinaryId}.mp4`}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <video
                              ref={el => { videoRefs.current[index] = el; }}
                              key={`${video.id}-${Date.now()}`} // Ensure a fresh key on each render
                              src={video.videoSrc}
                              controls
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onEnded={() => handleVideoEnded(index)}
                              onPause={handleVideoPause}
                              onPlay={handleVideoPlay}
                              title={`${video.displayName}'s Story`}
                              preload="auto"
                              playsInline
                            >
                              Your browser does not support the video tag.
                            </video>
                          )
                        )}

                        {/* Always show placeholder when video isn't active */}
                        {activePlayerIndex !== index && (
                          <img
                            src={video.thumbnail}
                            alt={`${video.displayName} - Placeholder`}
                            className="absolute inset-0 w-full h-full object-contain opacity-80 bg-slate-100 dark:bg-slate-700 z-5"
                          />
                        )}

                        {/* Show playing indicator */}
                        {activePlayerIndex === index && isPlaying && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-20">
                            Playing
                          </div>
                        )}

                        {/* Play button - show when video is not active or not playing */}
                        {(activePlayerIndex !== index || !isPlaying) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute inset-0 flex items-center justify-center w-16 h-16 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all z-15"
                            onClick={(e) => { e.stopPropagation(); handlePlayClick(index); }}
                            aria-label={activePlayerIndex === index && !isPlaying ? "Resume Video" : "Play Video"}
                          >
                            <Play size={32} className="fill-current" />
                          </Button>
                        )}

                        {/* Error message */}
                        {activePlayerIndex === index && playbackError && (
                          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-2 rounded z-20">
                            {playbackError}
                          </div>
                        )}

                        <div className="absolute top-4 left-4 z-15"> {/* Ensure badge is above placeholder */}
                          <Badge variant="secondary" className="text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {video.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            {video.displayName}'s Story
                          </h3>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Info size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{video.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400">
                          Watch {video.displayName}'s journey in facing fears and building courage. This inspirational story shows how confronting fear leads to personal growth.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}

        {/* Video Carousel - All other videos */}
        {numRemainingVideos > 0 && ( // Render if there are any remaining videos
          <div className="video-carousel relative mb-8">
            <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-400">More Courage Stories</h2>
            <Slider {...carouselSettings}>
              {remainingVideos.map((video, index) => { // Map over the calculated remaining videos
                const playerIndex = index + (filteredVideos.length - numRemainingVideos); // Calculate correct overall index
                return (
                  <div key={video.id} className="px-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-xl transform duration-300 h-full flex flex-col">
                      <div className="relative aspect-video group bg-black flex items-center justify-center flex-shrink-0">
                        {/* Only render video when it's active */}
                        {activePlayerIndex === playerIndex && (
                          video.type === 'vimeo' ? (
                            <div style={{padding:'56.25% 0 0 0', position:'relative'}} className="absolute inset-0 w-full h-full z-10">
                              <iframe
                                key={`${video.id}-${Date.now()}`}
                                src={video.id.includes('julie') || video.name === 'Julie'
                                  ? "https://player.vimeo.com/video/1072428960?h=756979b04e&badge=0&autopause=0&player_id=0&app_id=58479"
                                  : "https://player.vimeo.com/video/1072428847?h=fb07f16cf1&badge=0&autopause=0&player_id=0&app_id=58479"}
                                style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
                                title={video.id.includes('julie') || video.name === 'Julie' ? "BE Courageous" : "Be Courageous - Compilation"}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                allowFullScreen
                              ></iframe>
                            </div>
                          ) : video.type === 'cloudinary' ? (
                            <video
                              ref={el => { videoRefs.current[playerIndex] = el; }}
                              key={`${video.id}-${Date.now()}`} // Ensure a fresh key on each render
                              controls
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onEnded={() => handleVideoEnded(playerIndex)}
                              onPause={handleVideoPause}
                              onPlay={handleVideoPlay}
                              title={`${video.displayName}'s Story`}
                              preload="auto"
                              playsInline
                            >
                              <source
                                src={`https://res.cloudinary.com/${video.cloudName}/video/upload/q_auto,f_auto/${video.cloudinaryId}.mp4`}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <video
                              ref={el => { videoRefs.current[playerIndex] = el; }}
                              key={`${video.id}-${Date.now()}`} // Ensure a fresh key on each render
                              src={video.videoSrc}
                              controls
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onEnded={() => handleVideoEnded(playerIndex)}
                              onPause={handleVideoPause}
                              onPlay={handleVideoPlay}
                              title={`${video.displayName}'s Story`}
                              preload="auto"
                              playsInline
                            >
                              Your browser does not support the video tag.
                            </video>
                          )
                        )}

                        {/* Always show placeholder when video isn't active */}
                        {activePlayerIndex !== playerIndex && (
                          <img
                            src={video.thumbnail}
                            alt={`${video.displayName} - Placeholder`}
                            className="absolute inset-0 w-full h-full object-contain opacity-80 bg-slate-100 dark:bg-slate-700 z-5"
                          />
                        )}

                        {/* Show playing indicator */}
                        {activePlayerIndex === playerIndex && isPlaying && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-20">
                            Playing
                          </div>
                        )}

                        {/* Play button - show when video is not active or not playing */}
                        {(activePlayerIndex !== playerIndex || !isPlaying) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute inset-0 flex items-center justify-center w-12 h-12 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all z-15"
                            onClick={(e) => { e.stopPropagation(); handlePlayClick(playerIndex); }}
                            aria-label={activePlayerIndex === playerIndex && !isPlaying ? "Resume Video" : "Play Video"}
                          >
                            <Play size={24} className="fill-current" />
                          </Button>
                        )}

                        {/* Error message */}
                        {activePlayerIndex === playerIndex && playbackError && (
                          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-20">
                            {playbackError}
                          </div>
                        )}

                        <div className="absolute top-2 left-2 z-15"> {/* Ensure badge is above placeholder */}
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {video.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {video.displayName}'s Story
                          </h3>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Info size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{video.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Watch {video.displayName}'s journey in facing fears and building courage.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        )}
        {filteredVideos.length === 0 && (
          <div className='text-center py-10 text-slate-500 dark:text-slate-400'>
            No videos found for the selected category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;