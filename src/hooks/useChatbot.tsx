import { useState, useEffect, useCallback } from 'react';
import { logConversationToAirtable, saveUserToAirtable } from '@/lib/api';
import sendMessageToClaudeDirect from '@/lib/claude';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type UserData = {
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  fear?: string;
  adventures?: string[];
};

type ChatState = {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  userData: UserData;
  fearInfo: {
    activities?: string[];
    reasons?: string;
    rootCause?: string;
  };
  step: 'initial' | 'name' | 'fear' | 'email' | 'phone' | 'birthday' | 'adventures' | 'confirmation' | 'completed';
};

export default function useChatbot() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userId] = useState(`user_${Math.random().toString(36).substring(2, 9)}`);
  const [state, setState] = useState<ChatState>(() => {
    // Try to load saved state from localStorage
    try {
      const savedState = localStorage.getItem('chatState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Convert string timestamps back to Date objects
        if (parsedState.messages) {
          parsedState.messages = parsedState.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
        
        console.log('Loaded chat state from localStorage:', parsedState);
        return parsedState;
      }
    } catch (error) {
      console.error('Error loading chat state from localStorage:', error);
    }

    // Default state if no saved messages
    return {
      isOpen: false,
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears, but first I'd like to get to know you better. \n\n**What's your name?**",
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      userData: {},
      fearInfo: {},
      step: 'name',
    };
  });

  // Toggle chatbot visibility
  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Reset chat to initial state
  const resetChat = useCallback(() => {
    const initialState = {
      isOpen: true,
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears, but first I'd like to get to know you better. \n\n**What's your name?**",
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      userData: {},
      fearInfo: {},
      step: 'name',
    };
    
    setState(initialState);
    localStorage.setItem('chatState', JSON.stringify(initialState));
    
    toast({
      title: "Conversation Reset",
      description: "Starting a new conversation.",
      duration: 3000,
    });
  }, [toast]);

  // Process user message to extract information based on current step
  const processMessage = useCallback((message: string, currentStep: ChatState['step'], currentUserData: UserData) => {
    console.log(`Processing message for step: ${currentStep}`, message);
    
    const updatedUserData = { ...currentUserData };
    let nextStep = currentStep;

    // Check if user is authenticated before collecting sensitive information
    if ((currentStep === 'email' || currentStep === 'phone' || currentStep === 'birthday') && !user) {
      // Prompt user to log in first to continue assessment
      toast({
        title: "Login Required",
        description: "Please log in or create an account to continue the assessment.",
        duration: 5000,
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      // Return current step without proceeding
      return {
        nextStep: currentStep,
        updatedUserData
      };
    }

    // Process message based on current step
    switch (currentStep) {
      case 'name':
        updatedUserData.name = message;
        nextStep = 'fear';
        break;
      case 'fear':
        updatedUserData.fear = message;
        nextStep = 'email';
        break;
      case 'email':
        // Simple email validation
        if (message.includes('@') && message.includes('.')) {
          updatedUserData.email = message;
          nextStep = 'phone';
        } else {
          // Stay on the same step if invalid
          console.log('Invalid email format');
        }
        break;
      case 'phone':
        // Store phone regardless of format
        updatedUserData.phone = message;
        nextStep = 'birthday';
        break;
      case 'birthday':
        updatedUserData.birthday = message;
        nextStep = 'adventures';
        break;
      case 'adventures':
        // Parse adventures as an array
        updatedUserData.adventures = message
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        nextStep = 'confirmation';
        break;
      case 'confirmation':
        // If user confirms, move to completed
        if (message.toLowerCase().includes('yes')) {
          nextStep = 'completed';

          // Log the final user data
          console.log('User data confirmed:', updatedUserData);

          // Save to Airtable if user is logged in
          if (user) {
            saveUserToAirtable({
              name: updatedUserData.name || '',
              email: updatedUserData.email || '',
              phone: updatedUserData.phone || '',
              birthday: updatedUserData.birthday || '',
              fear: updatedUserData.fear || '',
              adventures: updatedUserData.adventures?.join(', ') || ''
            }).catch(error => {
              console.error('Error saving to Airtable:', error);
            });
          }
        } else {
          // If user says no, restart from name
          nextStep = 'name';
          // Clear user data
          return {
            nextStep,
            updatedUserData: {}
          };
        }
        break;
      default:
        // For any other step, just keep the conversation going
        break;
    }

    console.log(`Next step: ${nextStep}`, updatedUserData);
    return { nextStep, updatedUserData };
  }, [user, toast, navigate]);

  // Get AI response based on current step
  const getAIResponse = useCallback(async (
    message: string, 
    currentStep: ChatState['step'],
    userData: UserData,
    nextStep: ChatState['step']
  ) => {
    console.log(`Getting AI response for step: ${currentStep} -> ${nextStep}`);
    
    // Create context for the AI
    const context = `
      Current conversation step: ${currentStep}
      Next step: ${nextStep}
      User data so far: ${JSON.stringify(userData)}
    `;
    
    // Format history for the AI
    const historyWithContext = [
      {
        role: 'system',
        content: `You are the Be Courageous assistant, helping users understand and overcome their fears.
        The user is currently at step "${currentStep}" and will move to "${nextStep}" after this message.
        User data so far: ${JSON.stringify(userData)}
        
        Based on the current step, guide the conversation appropriately:
        - If step is "name": Thank them for sharing their name and ask about their biggest fear
        - If step is "fear": Thank them for sharing their fear and ask for their email to continue
        - If step is "email": Thank them and ask for their phone number (mention it's optional)
        - If step is "phone": Thank them and ask for their birthday
        - If step is "birthday": Thank them and ask what adventures they'd like to try (comma-separated list)
        - If step is "adventures": Thank them and summarize all their information, asking for confirmation (yes/no)
        - If step is "confirmation" and they said yes: Thank them for completing the assessment and offer to help with their fear
        - If step is "completed": Provide helpful information about their specific fear and suggest next steps
        
        Keep responses conversational, supportive and under 3 paragraphs.`
      },
      ...state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Call the Claude API directly
    const response = await sendMessageToClaudeDirect(message, historyWithContext);
    
    if (!response.success) {
      console.error('Error getting AI response:', response);
      return `I'm sorry, I'm having trouble responding right now. Please try again in a moment.`;
    }
    
    return response.message;
  }, [state.messages]);

  // Send message to chatbot
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    console.log('Sending message:', content);
    
    // Create user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Update state with user message and set loading
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));
    
    try {
      // Process message with improved error handling
      const processMessageWithErrorHandling = async () => {
        console.log('Processing message with improved error handling');

        // Process the message to determine conversation flow
        let { nextStep, updatedUserData } = processMessage(content, state.step, state.userData);

        // If the user has confirmed their information, save to Airtable
        if (state.step === 'confirmation' && content.toLowerCase().includes('yes')) {
          console.log('User confirmed information, saving to Airtable:', updatedUserData);
          
          try {
            if (user) {
              await saveUserToAirtable({
                name: updatedUserData.name || '',
                email: updatedUserData.email || '',
                phone: updatedUserData.phone || '',
                birthday: updatedUserData.birthday || '',
                fear: updatedUserData.fear || '',
                adventures: updatedUserData.adventures?.join(', ') || ''
              });
              console.log('Successfully saved user data to Airtable');
            } else {
              console.log('User not logged in, skipping Airtable save');
            }
          } catch (airtableError) {
            console.error('Error saving to Airtable:', airtableError);
            // Continue despite error
          }
        }

        // Get response using AI instead of static function
        // Pass the nextStep to ensure the AI includes the appropriate next question
        console.log('Getting AI response for step:', state.step, 'with next step:', nextStep);
        const responseContent = await getAIResponse(content, state.step, state.userData, nextStep);

        // Check if the response indicates an error
        if (responseContent.includes('error') && responseContent.includes('try again')) {
          console.warn('AI response contains error message:', responseContent);
        }

        return { nextStep, updatedUserData, responseContent };
      };

      // Execute the message processing with error handling
      const { nextStep, updatedUserData, responseContent } = await processMessageWithErrorHandling();

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      // Update state with assistant message and new user data
      setState(prev => {
        const newState = {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          userData: updatedUserData,
          step: nextStep,
        };
        
        // Save state to localStorage
        try {
          localStorage.setItem('chatState', JSON.stringify(newState));
        } catch (error) {
          console.error('Error saving chat state to localStorage:', error);
        }
        
        return newState;
      });

      // Log conversation to Airtable for analysis
      try {
        if (user) {
          await logConversationToAirtable({
            userId: user.id,
            userMessage: content,
            assistantMessage: responseContent,
            step: state.step,
          });
        }
      } catch (logError) {
        console.error('Error logging conversation:', logError);
        // Non-critical, continue despite error
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: `assistant_error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      // Update state with error message
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
      
      // Show toast notification
      toast({
        title: "Error",
        description: "There was a problem processing your message. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [state.step, state.userData, processMessage, getAIResponse, toast, user]);

  // Save chat state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving chat state to localStorage:', error);
    }
  }, [state]);

  return {
    isOpen: state.isOpen,
    messages: state.messages,
    isLoading: state.isLoading,
    sendMessage,
    toggleChat,
    resetChat
  };
}
