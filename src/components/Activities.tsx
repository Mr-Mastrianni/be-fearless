import { useEffect, useRef } from "react";
import { Mountain, Waves } from "lucide-react";
import '../styles/micro-interactions.css';
import { FearIcon } from './CustomIcons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { waterActivities } from '../data/activities/waterActivities';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Define fear categories
type FearCategory = 'heights' | 'water';

const getCategoryIcon = (category: FearCategory) => {
  switch (category) {
    case 'heights':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-growth-800 rounded-full">
          <Mountain size={12} className="text-growth-300" />
        </div>
      );
    case 'water':
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-cyan-900 rounded-full">
          <Waves size={12} className="text-cyan-300" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-growth-800 rounded-full">
          <Mountain size={12} className="text-growth-300" />
        </div>
      );
  }
};

const getCategoryColor = (category: FearCategory) => {
  switch (category) {
    case 'heights':
      return 'from-growth-800 to-growth-950';
    case 'water':
      return 'from-cyan-800 to-cyan-950';
    default:
      return 'from-growth-800 to-growth-950';
  }
};

// Group activities by category
const groupActivitiesByCategory = (activities) => {
  return activities.reduce((groups, activity) => {
    const categories = activity.fearCategories || [activity.category];
    categories.forEach(category => {
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(activity);
    });
    return groups;
  }, {});
};

const activities = [
  {
    id: "skydiving",
    title: "Sky Diving",
    description: "Free fall from 14,000 feet and experience the ultimate adrenaline rush.",
    imageUrl: "https://images.unsplash.com/photo-1521673252667-e05da380b252?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "All jumps are tandem with certified instructors who have 1000+ jumps. Equipment undergoes rigorous safety checks.",
    fearCategories: ['heights']
  },
  {
    id: "hanggliding",
    title: "Hang Gliding",
    description: "Soar like a bird and experience the freedom of unpowered flight.",
    imageUrl: "https://images.pexels.com/photos/9532461/pexels-photo-9532461.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem flights with experienced pilots. Modern gliders with redundant safety systems and full certification.",
    fearCategories: ['heights']
  },
  {
    id: "rockclimbing",
    title: "Rock Climbing",
    description: "Scale natural rock formations and push your mental and physical limits.",
    imageUrl: "https://images.pexels.com/photos/303040/pexels-photo-303040.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Routes established by certified guides. All equipment meets UIAA safety standards with regular inspections.",
    fearCategories: ['heights']
  },
  {
    id: "basejumping",
    title: "Tandem Base Jumping",
    description: "Experience the thrill of jumping from fixed objects with a parachute.",
    imageUrl: "https://images.pexels.com/photos/11049262/pexels-photo-11049262.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Tandem jumps with world-class base jumpers having 500+ jumps. Modern equipment with redundant systems.",
    fearCategories: ['heights']
  },
  {
    id: "kayaking",
    title: "White Water Kayaking",
    description: "Navigate through challenging rapids and feel the power of rushing water.",
    imageUrl: "https://images.pexels.com/photos/2348108/pexels-photo-2348108.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Professional guides with swift water rescue training. Quality equipment and comprehensive safety briefings.",
    fearCategories: ['water']
  },
  {
    id: "wingwalking",
    title: "Wing Walking",
    description: "Stand on the wings of a flying biplane for an unforgettable experience.",
    imageUrl: "https://images.pexels.com/photos/30871452/pexels-photo-30871452/free-photo-of-airplane-wing-view-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Secured to the aircraft with professional harness systems. Planes maintained to strict aviation standards.",
    fearCategories: ['heights']
  },
  {
    id: "bungeejumping",
    title: "Bungee Jumping",
    description: "Take a leap of faith from great heights with nothing but a bungee cord.",
    imageUrl: "https://images.pexels.com/photos/26811613/pexels-photo-26811613/free-photo-of-man-jumping-bungee.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Equipment tested to withstand 10 times your weight. Comprehensive medical checks and professional supervision.",
    fearCategories: ['heights']
  },
  {
    id: "ziplines",
    title: "Zip Lines",
    description: "Glide through the air on cables stretched between points of different heights.",
    imageUrl: "https://images.pexels.com/photos/6422046/pexels-photo-6422046.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Lines tested daily. Redundant braking systems and professional guides to ensure safe takeoffs and landings.",
    fearCategories: ['heights']
  },
  {
    id: "ropeswings",
    title: "Rope Swings",
    description: "Swing from towering heights over canyons, valleys, or waterbodies.",
    imageUrl: "https://images.pexels.com/photos/10889628/pexels-photo-10889628.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Multiple attachment points and redundancy in all systems. Supervised by experienced adventure specialists.",
    fearCategories: ['heights']
  },
  {
    id: "whaleswimming",
    title: "Swimming with Whales",
    description: "Get close to these gentle giants in their natural oceanic habitat.",
    imageUrl: "https://images.pexels.com/photos/27026630/pexels-photo-27026630/free-photo-of-close-encounter-diving-with-a-whale-shark-in-the-deep-blue.jpeg?auto=compress&cs=tinysrgb&w=800",
    safety: "Small guided groups with marine biologists. Protocols to minimize impact on whales and ensure participant safety.",
    fearCategories: ['water']
  },
  {
    id: "deepdiving",
    title: "Deep Water Diving",
    description: "Explore the mysterious depths of the ocean and encounter fascinating marine life.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    safety: "PADI certified instructors. Top-quality diving equipment with regular maintenance and safety checks.",
    fearCategories: ['water']
  },
  ...waterActivities,
].filter(activity => activity.id !== "sharkswimming");

const Activities = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const groupedActivities = groupActivitiesByCategory(activities);
  const categories = Object.keys(groupedActivities);

  useEffect(() => {
    // Check if we've shown the donation message before
    const hasShownDonation = localStorage.getItem('hasShownDonationMessage');

    if (!hasShownDonation) {
      toast({
        title: "Support Our Mission",
        description: (
          <div className="mt-2">
            <p className="mb-3">Help us continue providing resources and support for people facing their fears.</p>
            <Button
              variant="default"
              className="bg-growth-600 hover:bg-growth-700 text-white"
              onClick={() => window.open('https://www.zeffy.com/your-donation-page', '_blank')}
            >
              Make a Donation
            </Button>
          </div>
        ),
        duration: 10000, // Show for 10 seconds
      });

      // Mark that we've shown the message
      localStorage.setItem('hasShownDonationMessage', 'true');
    }
  }, [toast]);

  return (
    <section id="activities" className="py-8 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative" ref={sectionRef}>
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="text-center mb-8 scroll-fade-in"
          ref={headingRef}
        >
          <div className="inline-block mb-2">
            <span className="bg-gradient-to-r from-growth-600 to-growth-800 h-1 w-20 block mx-auto"></span>
            <span className="text-sm font-medium text-growth-400 uppercase tracking-wider">Confronting Fear</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-growth-400 via-growth-500 to-growth-700 text-transparent bg-clip-text">
            <FearIcon size={28} className="inline-block mr-2 mb-1" />
            Popular Courage Activities
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
            Discover activities designed to help you confront your fears and build courage through gradual exposure and guided experiences.
          </p>
        </div>


        {/* Featured Categories (compact version) */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => (
              <AccordionItem
                key={category}
                value={category}
                className="border border-gray-800 rounded-lg mb-3 overflow-hidden"
              >
                <AccordionTrigger className="bg-gray-900 hover:bg-gray-800 px-4 py-2.5 text-left">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category as FearCategory)}
                    <span className="capitalize font-medium text-growth-300">
                      {category} Activities ({groupedActivities[category].length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-black/20 p-0">
                  {/* List of activities */}
                  <div className="divide-y divide-gray-800/50">
                    {groupedActivities[category].map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 hover:bg-gray-900/50 transition-colors flex items-center gap-3"
                      >
                        <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={activity.imageUrl}
                            alt={activity.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                          <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Our mission is to help you understand your fears, not to book adventures.
            We provide education, support, and empowerment to help you face your fears on your own terms.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Activities;