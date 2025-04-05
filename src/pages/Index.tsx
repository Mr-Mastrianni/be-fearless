import ChatBot from "@/components/ChatBot";
import Hero from "@/components/Hero";
import Activities from "@/components/Activities";
import VideoGallery from "@/components/VideoGallery";
import { useEffect } from "react";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Activities Section */}
      <Activities />

      {/* Video Gallery Section */}
      <VideoGallery />

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Be Courageous. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>
    </div>
  );
};

export default Index;
