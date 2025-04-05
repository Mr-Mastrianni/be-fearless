import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { FearCategory } from '@/models/ActivityTypes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Heart as CourageIcon, Heart as HeartIcon, Brain as FearIcon, Compass as ExploreIcon } from 'lucide-react';

// Supabase client
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  }
];

type FearScore = {
  fear: string;
  score: number;
  count: number;
};

interface FearAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
}

const FearAssessment: React.FC<FearAssessmentProps> = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; option: any }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [topFears, setTopFears] = useState<FearScore[]>([]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setAnimateIn(false);
      setAnimateOut(false);
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResults(false);
      onClose();
    }, 300);
  };

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
        calculateResults([...answers, { questionId: quizQuestions[currentQuestion].id, option }]);
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
  const calculateResults = (allAnswers: { questionId: number; option: any }[]) => {
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
    const sortedFears = fearsArray.sort((a, b) => b.score - a.score);
    
    // Take top fears
    setTopFears(sortedFears.slice(0, 3));
    
    // Save results if user is logged in
    if (user) {
      saveAssessmentResults(sortedFears);
    }
  };

  // Save assessment results to Supabase
  const saveAssessmentResults = async (fearResults: FearScore[]) => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Convert top fears to FearCategory type for profile
      const topFearCategories = fearResults.slice(0, 3).map(fear => fear.fear as FearCategory);
      
      // First, just update the user profile with top fears
      // This should work even if the fear_assessments table doesn't exist
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          key_fears: topFearCategories,
          last_assessment: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (profileError) {
        console.error('Error updating user profile:', profileError);
        throw profileError;
      }

      // Try to save to fear_assessments table, but don't block on failure
      try {
        const { error: assessmentError } = await supabase
          .from('fear_assessments')
          .insert({
            user_id: user.id,
            timestamp: new Date().toISOString(),
            results: fearResults,
          });
          
        if (assessmentError) {
          console.error('Error saving to fear_assessments table:', assessmentError);
          // Don't throw error here - we still want to continue if just this part fails
        }
      } catch (assessmentTableError) {
        console.error('Error with fear_assessments table:', assessmentTableError);
        // Continue without throwing
      }

      toast({
        title: 'Assessment Saved',
        description: 'Your fear profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your assessment results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
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
        return "Try supervised activities near the shore or shallow waters to build confidence.";
      case "social":
        return "Join small group activities or workshops to practice social interaction in a supportive environment.";
      case "confined":
        return "Practice mindfulness and breathing techniques in progressively smaller spaces with support.";
      default:
        return "We have custom activities that can help you face this fear gradually.";
    }
  };
  
  if (!isOpen) return null;

  return (
    <ErrorBoundary fallback={<div>Something went wrong with the fear assessment. Please refresh the page and try again.</div>}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}  
        />
        
        {/* Modal */}
        <div 
          className={`relative bg-gray-900 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-growth-800/30 transform transition-all duration-300 
            ${animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} 
            ${animateOut ? 'scale-95 opacity-0' : ''}`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#modal-grid)" />
            </svg>
          </div>
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-courage-800 to-growth-900 py-4 px-6 flex justify-between items-center">
            <h2 className="text-white text-xl font-bold flex items-center">
              <FearIcon size={24} className="mr-2" />
              Fear Assessment Quiz
            </h2>
            <button 
              onClick={handleClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {showResults ? (
              // Results display
              <div 
                className={`transform transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <div className="text-center mb-6">
                  <CourageIcon size={48} className="mx-auto mb-2 text-growth-400" />
                  <h3 className="text-2xl font-bold text-white mb-2">Your Fear Profile</h3>
                  <p className="text-gray-400">Based on your answers, here are the areas where you might benefit from courage-building activities:</p>
                </div>
                
                <div className="space-y-6 mb-8">
                  {topFears.map((fear, index) => (
                    <div 
                      key={fear.fear} 
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 transition-all hover:border-growth-700 hover:bg-gray-800/80"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-white">{getFearDescription(fear.fear)}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getFearColor(fear.score)} text-white`}>
                          {getFearLevel(fear.score)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div 
                          className={`h-2.5 rounded-full bg-gradient-to-r ${getFearColor(fear.score)}`} 
                          style={{ width: `${(fear.score / 4) * 100}%` }}
                        ></div>
                      </div>
                      
                      <p className="text-gray-300 text-sm">{getSuggestedActivity(fear.fear)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-growth-900/30 border border-growth-800/30 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-growth-300 mb-2 flex items-center">
                    <ExploreIcon size={20} className="mr-2" />
                    Next Steps
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Now that you understand your fear profile, explore our activities designed specifically
                    to help you build courage in these areas. Our experienced guides can create a personalized
                    journey to gradually face these fears in a safe, supportive environment.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="default"
                    className="w-full py-5 bg-gradient-to-r from-courage-600 to-growth-600 hover:from-courage-700 hover:to-growth-700 text-white font-semibold mb-3 btn-micro-interaction"
                    onClick={() => {
                      handleClose();
                      // Navigate to activities page if logged in
                      if (user) {
                        navigate('/activities');
                      } else {
                        // For non-logged in users, scroll to activities section
                        const activitiesSection = document.getElementById('activities');
                        if (activitiesSection) {
                          activitiesSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Explore Recommended Activities'}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full py-5 border-gray-600 text-gray-300 hover:bg-gray-800 btn-micro-interaction"
                    onClick={() => {
                      setAnimateOut(true);
                      setTimeout(() => {
                        setAnimateOut(false);
                        setCurrentQuestion(0);
                        setAnswers([]);
                        setShowResults(false);
                        setAnimateIn(true);
                      }, 300);
                    }}
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
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-courage-500 to-growth-500 transition-all duration-500" 
                    style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="mb-2 text-sm text-gray-400">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-6">
                  {quizQuestions[currentQuestion].question}
                </h3>
                
                <div className="space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-growth-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-growth-500 btn-micro-interaction"
                      onClick={() => handleSelectOption(option)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center mr-3 text-xs transition-colors ${option.score === 1 ? 'bg-green-900/30 border-green-700' : option.score === 2 ? 'bg-yellow-900/30 border-yellow-700' : option.score === 3 ? 'bg-orange-900/30 border-orange-700' : 'bg-red-900/30 border-red-700'}`}>
                          {option.score}
                        </div>
                        <span className="text-white">{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FearAssessment;
