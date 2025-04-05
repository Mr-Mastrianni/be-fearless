import { useEffect, useRef, useState, Fragment } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import '../styles/micro-interactions.css';
import { HelpIcon, ExploreIcon, CourageIcon, ActivityIcon } from './CustomIcons';

// Array of background images for the slideshow
const backgroundImages = [
  "https://images.pexels.com/photos/15666484/pexels-photo-15666484/free-photo-of-man-on-rope-bridge-over-canyon.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/4237473/pexels-photo-4237473.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/16460415/pexels-photo-16460415/free-photo-of-aerial-view-of-silhouetted-shore-and-a-person-flying-with-a-parachute-over-the-sea-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1761282/pexels-photo-1761282.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2225771/pexels-photo-2225771.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const Hero = () => {
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImage, setShowImage] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (heroSectionRef.current) {
      observer.observe(heroSectionRef.current);
    }

    return () => {
      if (heroSectionRef.current) {
        observer.unobserve(heroSectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only start the carousel once images are loaded
    if (!imagesLoaded) return;

    // Set up the image rotation interval
    const imageRotationInterval = setInterval(() => {
      // Fade out the current image
      setShowImage(false);

      // After a short delay, change the image index and fade in the new image
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setShowImage(true);
      }, 500); // 500ms for fade out transition

    }, 3000); // Change image every 3 seconds

    // Clean up interval on component unmount
    return () => {
      clearInterval(imageRotationInterval);
    };
  }, [imagesLoaded]);

  useEffect(() => {
    // Skip the complex animation on mobile devices to prevent layout issues
    if (!heroTextRef.current || window.innerWidth < 640) return;

    const text = heroTextRef.current.innerText;
    heroTextRef.current.innerHTML = '';

    // Only run the text animation when visible and not on mobile
    if (isVisible) {
      // Create an array for the words
      const words = ["Courage", "Is", "One", "Adventure", "Away"];

      // Add each word with proper spacing
      words.forEach((word, wordIndex) => {
        // Add a space before words (except the first one)
        if (wordIndex > 0) {
          const space = document.createElement('span');
          space.innerHTML = '&nbsp;';
          heroTextRef.current?.appendChild(space);
        }

        // Add each letter of the word with animation
        [...word].forEach((char, charIndex) => {
          const span = document.createElement('span');
          span.innerText = char;
          span.style.animationDelay = `${0.05 * (charIndex + wordIndex * 10)}s`;
          heroTextRef.current?.appendChild(span);
        });
      });
    }
  }, [isVisible]);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = backgroundImages.length;

    const preloadImages = () => {
      backgroundImages.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
      });
    };

    preloadImages();
  }, []);

  const scrollToActivities = () => {
    const activitiesSection = document.getElementById('activities');
    if (activitiesSection) {
      activitiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={heroSectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Loading indicator */}
      {!imagesLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="inline-block w-12 h-12 border-t-2 border-l-2 border-white rounded-full animate-spin mb-4"></div>
            <p className="text-lg animate-pulse">Loading experience...</p>
          </div>
        </div>
      )}

      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Image slideshow */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`hero-bg-slide ${currentImageIndex === index && showImage && imagesLoaded ? 'active' : ''} hero-bg-zoom`}
            style={{
              backgroundImage: `url(${image})`,
              zIndex: currentImageIndex === index ? 1 : 0,
              backgroundPosition: 'center center',
              backgroundSize: 'cover'
            }}
          />
        ))}

        {/* Dark overlay with gradient - stronger on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-courage-950/90 to-growth-900/85 backdrop-blur-[2px]"></div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hexagonPattern" width="10" height="17.321" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                <polygon points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5" fill="rgba(255,255,255,0.05)" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hexagonPattern)" />
          </svg>
        </div>
      </div>

      {/* Animated floating shapes (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-courage-200/10 blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-[40%] right-[15%] w-96 h-96 rounded-full bg-courage-300/10 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-[20%] left-[25%] w-80 h-80 rounded-full bg-courage-100/10 blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="w-full relative z-10 flex items-center justify-center min-h-[80vh] pt-16 sm:pt-0">
        <div className={`w-full max-w-3xl mx-auto text-center px-4 sm:px-6 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-1.5 mb-8 text-xs sm:text-sm font-medium rounded-full bg-growth-700/50 backdrop-blur-sm text-white animate-text-focus-in link-hover-effect">
            <span className="hero-subtext">Face your fears. Find your strength.</span>
          </span>

          {/* Main Hero Text - Explicitly Centered */}
          <div className="hero-title-container scroll-fade-in visible px-2 sm:px-0">
            <h1
              ref={heroTextRef}
              className="hero-title w-full"
              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
            >
              <span className="hero-title-glow">Courage Is One Adventure Away</span>
              <span className="block">Courage Is One</span>
              <span className="block">Adventure Away</span>
            </h1>
          </div>

          <p className="hero-subtext text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-10 max-w-2xl mx-auto animate-tracking-in-expand px-2 sm:px-4" style={{ animationDelay: "0.5s" }}>
            Push your boundaries and discover the incredible strength that lives within you.
            Our guided adventure experiences are designed to help you
            <span className="text-growth-300 font-medium"> face your fears </span>
            and emerge
            <span className="text-growth-300 font-medium"> transformed</span>.
          </p>

          <div className={`flex justify-center transition-all duration-1000 delay-500 transform staggered-animation visible ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center gap-2 px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg transition-all duration-300 hover:scale-105 btn-micro-interaction"
              onClick={scrollToActivities}
            >
              <ActivityIcon size={18} color="white" className="hidden sm:inline" />
              Explore Activities
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="text-white rounded-full h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center border border-growth-400/30 bg-gradient-to-br from-growth-800/50 to-growth-900/50 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 animate-pulse btn-micro-interaction"
          onClick={scrollToActivities}
        >
          <ArrowDown size={16} className="text-white sm:hidden" />
          <ArrowDown size={20} className="text-white hidden sm:block" />
        </Button>
        <div className="text-center mt-2 text-growth-200 hero-subtext text-xs sm:text-sm opacity-80">Explore</div>
      </div>
    </div>
  );
};

export default Hero;
