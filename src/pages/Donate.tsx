import { Helmet } from "react-helmet-async";

// Use the direct form URL instead of the embed URL
const ZEFFY_DONATION_URL = "https://www.zeffy.com/en-US/donation-form/d0849062-4c71-4519-81df-d30348296176";

const Donate = () => {
  return (
    <>
      <Helmet>
        <title>Donate - Be Courageous</title>
        <meta name="description" content="Support our mission to help people overcome their fears and build lasting confidence." />
      </Helmet>

      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-block mb-2">
              <span className="bg-red-100 text-red-800 text-sm font-medium px-4 py-1 rounded-full">Support Our Mission</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Help Others Find Their Courage
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your contribution helps us continue our work of educating people about facing their fears. Every donation empowers someone to understand and overcome their fears.
            </p>
          </div>

          {/* Donation Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-[16/20] relative">
                <iframe
                  title="Donation form powered by Zeffy"
                  className="absolute inset-0 w-full h-full border-0"
                  src={ZEFFY_DONATION_URL}
                  allow="payment"
                  loading="lazy"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Donate; 