import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FearCategory } from '@/models/ActivityTypes';
import { Heart as CourageIcon, Brain as FearIcon, Compass as ExploreIcon } from 'lucide-react';

// Quiz questions data
const quizQuestions = [
  {
    id: 1,
    category: 'heights', 
    question: "How do you feel when standing at a significant height?",
    options: [
      { text: "Completely comfortable", score: 1, fear: "heights" },
      { text: "Slightly nervous", score: 2, fear: "heights" },
      { text: "Very uncomfortable", score: 3, fear: "heights" },
      { text: "Terrified", score: 4, fear: "heights" }
    ]
  },
  {
    id: 2,
    category: 'water', 
    question: "What's your reaction to being in water or large bodies of water?",
    options: [
      { text: "I love swimming in water", score: 1, fear: "water" },
      { text: "I'm okay near the shore", score: 2, fear: "water" },
      { text: "I prefer to stay on the beach", score: 3, fear: "water" },
      { text: "I avoid large bodies of water entirely", score: 4, fear: "water" }
    ]
  },
  {
    id: 3,
    category: 'social', 
    question: "How do you feel about public speaking?",
    options: [
      { text: "I enjoy the spotlight", score: 1, fear: "social" },
      { text: "I get nervous but can manage", score: 2, fear: "social" },
      { text: "I avoid it whenever possible", score: 3, fear: "social" },
      { text: "The thought alone makes me anxious", score: 4, fear: "social" }
    ]
  },
  {
    id: 4,
    category: 'confined', 
    question: "What's your reaction to small enclosed spaces?",
    options: [
      { text: "No problem at all", score: 1, fear: "confined" },
      { text: "Mildly uncomfortable", score: 2, fear: "confined" },
      { text: "I start feeling anxious", score: 3, fear: "confined" },
      { text: "I avoid them at all costs", score: 4, fear: "confined" }
    ]
  },
  {
    id: 5,
    category: 'extreme_sports', 
    question: "How do you feel about extreme sports like bungee jumping?",
    options: [
      { text: "Excited to try it!", score: 1, fear: "extreme_sports" },
      { text: "Nervous but would try with encouragement", score: 2, fear: "extreme_sports" },
      { text: "Very reluctant", score: 3, fear: "extreme_sports" },
      { text: "Absolutely not", score: 4, fear: "extreme_sports" }
    ]
  }
];

type FearScore = {
  fear: string;
  score: number;
  count: number;
};

interface OnboardingFearAssessmentProps {
  onComplete: (fearResults: FearScore[]) => void;
}

const OnboardingFearAssessment: React.FC<OnboardingFearAssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; option: any }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [topFears, setTopFears] = useState<FearScore[]>([]);
  const [animateIn, setAnimateIn] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  // Handle answer selection
  const handleSelectOption = (option: any) => {
    // Add answer
    setAnswers([...answers, { questionId: quizQuestions[currentQuestion].id, option }]);
    
    // Animate out current question
    setAnimateOut(true);
    
    setTimeout(() => {
      setAnimateOut(false);
      
      // If last question, calculate results
      if (currentQuestion === quizQuestions.length - 1) {
        const allAnswers = [...answers, { questionId: quizQuestions[currentQuestion].id, option }];
        const fearResults = calculateResults(allAnswers);
        setTopFears(fearResults);
        setShowResults(true);
      } else {
        // Move to next question
        setCurrentQuestion(currentQuestion + 1);
      }
      
      // Animate in next content
      setAnimateIn(true);
    }, 300);
  };

  // Calculate quiz results
  const calculateResults = (allAnswers: { questionId: number; option: any }[]): FearScore[] => {
    // Group and calculate scores by fear type
    const fearScores: { [key: string]: FearScore } = {};
    
    allAnswers.forEach(answer => {
      const { fear, score } = answer.option;
      
      if (!fearScores[fear]) {
        fearScores[fear] = { fear, score, count: 1 };
      } else {
        fearScores[fear].score += score;
        fearScores[fear].count += 1;
      }
    });
    
    // Convert to array and normalize scores
    const fearsArray = Object.values(fearScores).map(item => ({
      ...item,
      score: item.score / item.count // Average score
    }));
    
    // Sort by score (highest first)
    return fearsArray.sort((a, b) => b.score - a.score);
  };

  // Get fear level description
  const getFearLevel = (score: number): string => {
    if (score <= 1.5) return "Minimal";
    if (score <= 2.5) return "Mild";
    if (score <= 3.5) return "Moderate";
    return "Significant";
  };

  // Get fear color class
  const getFearColor = (score: number): string => {
    if (score <= 1.5) return "from-green-500 to-green-700";
    if (score <= 2.5) return "from-yellow-500 to-yellow-700";
    if (score <= 3.5) return "from-orange-500 to-orange-700";
    return "from-red-500 to-red-700";
  };

  // Get fear description
  const getFearDescription = (fear: string): string => {
    switch (fear) {
      case "heights":
        return "Fear of heights (acrophobia)";
      case "water":
        return "Fear of water (aquaphobia)";
      case "social":
        return "Social anxiety or fear of judgment";
      case "confined":
        return "Fear of enclosed spaces (claustrophobia)";
      case "extreme_sports":
        return "Fear of extreme sports or activities";
      default:
        return fear;
    }
  };
  
  // Get suggested activity
  const getSuggestedActivity = (fear: string): string => {
    switch (fear) {
      case "heights":
        return "Gradually build comfort with heights through rock climbing or zip-lining activities.";
      case "water":
        return "Try supervised swimming lessons or shallow water activities to build confidence.";
      case "social":
        return "Join small group activities or workshops to practice social interaction in a supportive environment.";
      case "confined":
        return "Practice relaxation techniques in progressively smaller spaces with easy exit options.";
      case "extreme_sports":
        return "Start with low-risk extreme sports and gradually progress to more challenging activities.";
      default:
        return "We have custom activities that can help you face this fear gradually.";
    }
  };

  const handleComplete = () => {
    // Calculate top fears
    const sortedFears = topFears.slice(0, 3);
    onComplete(sortedFears);
  };

  const handleRetake = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setAnimateOut(false);
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResults(false);
      setAnimateIn(true);
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      {showResults ? (
        // Results display
        <div 
          className={`transform transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <div className="text-center mb-6">
            <CourageIcon size={48} className="mx-auto mb-2 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Fear Profile</h3>
            <p className="text-gray-600">Based on your answers, here are the areas where you might benefit from courage-building activities:</p>
          </div>
          
          <div className="space-y-6 mb-8">
            {topFears.slice(0, 3).map((fear, index) => (
              <div 
                key={fear.fear} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all hover:border-blue-300 hover:bg-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-800">{getFearDescription(fear.fear)}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getFearColor(fear.score)} text-white`}>
                    {getFearLevel(fear.score)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full bg-gradient-to-r ${getFearColor(fear.score)}`} 
                    style={{ width: `${(fear.score / 4) * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-600 text-sm">{getSuggestedActivity(fear.fear)}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
              <ExploreIcon size={20} className="mr-2" />
              Next Steps
            </h4>
            <p className="text-gray-600 text-sm">
              Now that you understand your fear profile, we'll use this information to personalize your
              courage journey. Our app will recommend activities designed specifically to help you build
              courage in these areas.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="default"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleComplete}
            >
              Continue
            </Button>
            <Button 
              variant="outline"
              className="w-full py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={handleRetake}
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      ) : (
        // Question display
        <div 
          className={`transform transition-all duration-300 ${animateIn && !animateOut ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" 
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="mb-2 text-sm text-gray-500">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {quizQuestions[currentQuestion].question}
          </h3>
          
          <div className="space-y-3">
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => handleSelectOption(option)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-xs transition-colors ${
                    option.score === 1 ? 'bg-green-50 border-green-500 text-green-700' : 
                    option.score === 2 ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 
                    option.score === 3 ? 'bg-orange-50 border-orange-500 text-orange-700' : 
                    'bg-red-50 border-red-500 text-red-700'
                  }`}>
                    {option.score}
                  </div>
                  <span className="text-gray-800">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFearAssessment;
