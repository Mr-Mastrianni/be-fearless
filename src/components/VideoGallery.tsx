import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/images/Print_Transparent.svg';
import { videoConfig } from '@/config/videos';

const VideoGallery = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  return (
    <section id="videos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16 px-4">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Our Journey
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Watch Our Adventure
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            See how we face our fears and grow through challenges. Our real experiences
            show the power of courage in action.
          </p>
        </div>

        {/* Video Display - Single Featured Video */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {!showVideo ? (
                  <>
                    <img
                      src={logo}
                      alt="Be Courageous Logo Placeholder"
                      className="object-contain h-3/4 w-3/4 opacity-50 cursor-pointer"
                      style={{ backgroundColor: 'transparent' }}
                      onClick={handlePlayClick}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute inset-0 flex items-center justify-center w-20 h-20 m-auto bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                      onClick={handlePlayClick}
                      aria-label="Play Video"
                    >
                      <Play size={48} className="fill-current" />
                    </Button>
                  </>
                ) : (
                  videoConfig.compilation.type === 'vimeo' ? (
                    <iframe
                      src={videoConfig.compilation.embedSrc}
                      className="w-full h-full"
                      title="Facing Our Fears Together - Compilation"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
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
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Facing Our Fears Together</h3>
            <p className="mt-2 text-gray-600">
              This video shows our team members challenging themselves and supporting each other
              through various courage-building activities. Every step outside our comfort zone
              is a victory worth celebrating.
            </p>
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <span className="mr-2">Filmed on location</span>
              <span>•</span>
              <span className="ml-2">March 2025</span>
            </div>
          </div>
        </div>

        {/* Additional text and testimonial */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <blockquote className="italic text-lg text-gray-600 mb-4">
            "The experience changed how I view challenges. Now, I see fear as an opportunity
            for growth rather than something to avoid."
          </blockquote>
          <div className="font-medium">- Alex, Team Member</div>
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;