import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from '@/assets/images/Print_Transparent.svg';
import { videoConfig } from '@/config/videos';

const VideosSimple = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    // Load Vimeo Player API
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up
      document.body.removeChild(script);
    };
  }, []);

  const handlePlayClick = (videoKey: string) => {
    setActiveVideo(videoKey);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Helmet>
        <title>Courage Stories - Be Courageous</title>
        <meta name="description" content="Watch stories of people finding their courage and facing their fears." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-indigo-900 dark:text-indigo-300">Courage Stories</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Watch inspiring stories of people facing their fears and finding their courage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Julie's Video */}
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-black">
              {activeVideo === 'julie' ? (
                <div style={{padding:'56.25% 0 0 0', position:'relative'}}>
                  <iframe
                    src="https://player.vimeo.com/video/1072428960?h=756979b04e&badge=0&autopause=0&player_id=0&app_id=58479"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
                    title="BE Courageous"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={logo}
                    alt={`${videoConfig.julie.name} - Placeholder`}
                    className="h-1/2 w-1/2 object-contain opacity-80"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-0 flex items-center justify-center w-16 h-16 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                    onClick={() => handlePlayClick('julie')}
                  >
                    <Play size={32} className="fill-current" />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                {videoConfig.julie.name}'s Story
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {videoConfig.julie.description}
              </p>
            </div>
          </div>

          {/* Compilation Video */}
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-black">
              {activeVideo === 'compilation' ? (
                <div style={{padding:'56.25% 0 0 0', position:'relative'}}>
                  <iframe
                    src="https://player.vimeo.com/video/1072428847?h=fb07f16cf1&badge=0&autopause=0&player_id=0&app_id=58479"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
                    title="Be Courageous - Compilation"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Compilation - Placeholder"
                    className="h-1/2 w-1/2 object-contain opacity-80"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-0 flex items-center justify-center w-16 h-16 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                    onClick={() => handlePlayClick('compilation')}
                  >
                    <Play size={32} className="fill-current" />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                {videoConfig.compilation.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {videoConfig.compilation.description}
              </p>
            </div>
          </div>
        </div>

        {/* Local Videos Section */}
        <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-400">More Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['laura', 'michael', 'nicolas'].map((key) => {
            const video = videoConfig[key as keyof typeof videoConfig];
            return (
              <div key={key} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="relative aspect-video bg-black">
                  {activeVideo === key ? (
                    <video
                      src={video.videoSrc}
                      controls
                      autoPlay
                      className="absolute inset-0 w-full h-full object-cover"
                      title={`${video.name}'s Story`}
                      onEnded={() => setActiveVideo(null)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={logo}
                        alt={`${video.name} - Placeholder`}
                        className="h-1/2 w-1/2 object-contain opacity-80"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-0 flex items-center justify-center w-12 h-12 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                        onClick={() => handlePlayClick(key)}
                      >
                        <Play size={24} className="fill-current" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {video.name}'s Story
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {video.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VideosSimple;
