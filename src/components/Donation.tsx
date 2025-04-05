import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Heart, Check } from 'lucide-react';

// Replace this with your actual Zeffy donation form URL
const ZEFFY_DONATION_URL = "https://www.zeffy.com/en-US/donation-form/your-organization-id";

const Donation = () => {
  return (
    <section id="donate" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-courage-100 text-courage-800 mb-4">
            Support Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Help Others Find Their Courage
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your contribution helps us continue our work of educating people about facing their fears.
            Every donation empowers someone to understand and overcome their fears.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Zeffy Donation Form Iframe */}
          <div style={{position: "relative", overflow: "hidden", height: "1200px", width: "100%"}}>
            <iframe 
              title="Donation form powered by Zeffy" 
              style={{
                position: "absolute", 
                border: 0, 
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "transparent"
              }} 
              src="https://www.zeffy.com/embed/donation-form/d0849062-4c71-4519-81df-d30348296176" 
              allow="payment"
            />
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>100% of donations go to our cause</span>
            </div>
            
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>Secure & tax-deductible</span>
            </div>
            
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>One-time or monthly options</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donation;
