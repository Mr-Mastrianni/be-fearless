import { useState, useEffect, useCallback } from 'react';
import { sendMessageToOpenAI, logConversationToAirtable, saveUserToAirtable } from '@/lib/api';
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

export function useChatbot() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userId] = useState(`user_${Math.random().toString(36).substring(2, 9)}`);
  
  // Initialize state with saved messages from localStorage if available
  const [state, setState] = useState<ChatState>(() => {
    // Try to load saved messages from localStorage
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        console.log('Loaded saved messages from localStorage:', parsedMessages);
        
        // If we have saved messages, use them
        if (parsedMessages && parsedMessages.length > 0) {
          return {
            isOpen: false,
            messages: parsedMessages,
            isLoading: false,
            userData: {},
            fearInfo: {},
            step: 'completed', // Assume we're in a continued conversation
          };
        }
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
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

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (state.messages.length > 0) {
      try {
        localStorage.setItem('chatMessages', JSON.stringify(state.messages));
        console.log('Saved messages to localStorage:', state.messages);
      } catch (error) {
        console.error('Error saving messages to localStorage:', error);
      }
    }
  }, [state.messages]);

  // Reset chat to initial state
  const resetChat = useCallback(() => {
    // Clear saved messages from localStorage
    try {
      localStorage.removeItem('chatMessages');
      console.log('Cleared saved messages from localStorage');
    } catch (error) {
      console.error('Error clearing saved messages:', error);
    }
    
    // Create a new welcome message with a timestamp
    const welcomeMessage = {
      id: `welcome_${Date.now()}`,
      role: 'assistant' as const,
      content: "Hi there! I'm your Be Courageous guide. I'd like to help you understand and face your fears, but first I'd like to get to know you better. \n\n**What's your name?**",
      timestamp: new Date(),
    };
    
    // Reset the state completely
    setState({
      isOpen: true,
      messages: [welcomeMessage],
      isLoading: false,
      userData: {},
      fearInfo: {},
      step: 'name',
    });
    
    // Save the initial message to localStorage
    try {
      localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
      console.log('Saved initial message to localStorage');
    } catch (error) {
      console.error('Error saving initial message to localStorage:', error);
    }
    
    // Show a toast notification
    toast({
      title: "Conversation Reset",
      description: "Started a new conversation.",
      duration: 3000,
    });
  }, [toast]);

  // Process the message and determine the next step in the conversation flow
  const processMessage = useCallback((message: string, currentStep: ChatState['step'], currentUserData: UserData) => {
    console.log(`Processing message for step: ${currentStep}`, message);
    
    // Create a copy of the current user data
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

    // Update the appropriate field based on the current step
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
        updatedUserData.email = message;
        nextStep = 'phone';
        break;
      case 'phone':
        // Allow skipping phone
        if (message.toLowerCase() !== 'skip') {
          updatedUserData.phone = message;
        }
        nextStep = 'birthday';
        break;
      case 'birthday':
        // Allow skipping birthday
        if (message.toLowerCase() !== 'skip') {
          updatedUserData.birthday = message;
        }
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
          
          // Here we would typically save to Airtable
          // For now, just log that we would save
          console.log('Would save to Airtable:', {
            name: updatedUserData.name,
            email: updatedUserData.email,
            phone: updatedUserData.phone || 'Not provided',
            birthday: updatedUserData.birthday || 'Not provided',
            adventures: updatedUserData.adventures?.join(', ') || 'None specified'
          });
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

  // Get response from OpenAI
  const getAIResponse = useCallback(async (message: string, currentStep: ChatState['step'], userData: UserData) => {
    try {
      // Prepare the conversation history for the AI
      const historyMessages = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add system message with context about the user and the current step
      const systemMessage = {
        role: 'system',
        content: `You are a compassionate courage coach helping users overcome their fears. 
        The user's name is ${userData.name || 'unknown'}.
        Their primary fear is ${userData.fear || 'not shared yet'}.
        The current conversation step is: ${currentStep}.
        
        If this is a structured conversation step, help the user complete it by guiding them to provide the required information.
        Use a supportive, encouraging tone. Provide specific, actionable advice when possible.
        Remember that the user is in a vulnerable state sharing their fears.
        Use markdown formatting for emphasis. Keep responses concise but helpful.`
      };
      
      // Add context to the history
      const historyWithContext = [systemMessage, ...historyMessages];
      
      // Call the OpenAI API through our Supabase Edge Function
      const response = await sendMessageToOpenAI(message, historyWithContext);
      
      if (response.success) {
        return response.message;
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to deterministic responses for critical steps if AI fails
      if (currentStep === 'name') {
        return `Nice to meet you, ${message}! What's something you're afraid of that you'd like to overcome?`;
      } else if (currentStep === 'fear') {
        return `I understand that ${message} can be scary. What email address can we reach you at?`;
      } else if (currentStep === 'email') {
        return `Thanks for sharing your email. What's your phone number? (This is optional, you can say 'skip' if you prefer not to share it)`;
      } else if (currentStep === 'phone') {
        return `Got it! When is your birthday? (Format: MM/DD/YYYY, or you can say 'skip')`;
      } else if (currentStep === 'birthday') {
        return `Thanks for that information! What are the top 3 adventure activities you're most scared of but interested in trying?`;
      } else if (currentStep === 'adventures') {
        const adventures = message.split(',').map(a => a.trim()).join(', ');
        return `**Thank you for sharing!** Here's what I've got:\n\n- **Name**: ${userData.name}\n- **Fear**: ${userData.fear}\n- **Email**: ${userData.email}\n- **Phone**: ${userData.phone || "Not provided"}\n- **Birthday**: ${userData.birthday || "Not provided"}\n- **Top Feared Adventures**: ${adventures}\n\n**Is this information correct?** (Yes/No)`;
      } else if (currentStep === 'confirmation') {
        if (message.toLowerCase().includes('yes')) {
          return `Great! I've saved your information. Now, let's talk more about your fear of ${userData.fear}. What specifically about ${userData.fear} makes you afraid?`;
        } else {
          return `I understand. Let's start over. What's your name?`;
        }
      } else {
        return `Thanks for sharing. I'm here to help you with your fear of ${userData.fear || 'your fears'}. Is there anything specific you'd like to know?`;
      }
    }
  }, [state.messages]);
  
  // For backward compatibility - use as fallback
  const getStaticResponse = useCallback((message: string, currentStep: ChatState['step'], userData: UserData) => {
    if (currentStep === 'name') {
      return `Nice to meet you, ${message}! What's something you're afraid of that you'd like to overcome?`;
    } else if (currentStep === 'fear') {
      return `I understand that ${message} can be scary. What email address can we reach you at?`;
    } else if (currentStep === 'email') {
      return `Thanks for sharing your email. What's your phone number? (This is optional, you can say 'skip' if you prefer not to share it)`;
    } else if (currentStep === 'phone') {
      return `Got it! When is your birthday? (Format: MM/DD/YYYY, or you can say 'skip')`;
    } else if (currentStep === 'birthday') {
      return `Thanks for that information! What are the top 3 adventure activities you're most scared of but interested in trying?`;
    } else if (currentStep === 'adventures') {
      const adventures = message.split(',').map(a => a.trim()).join(', ');
      return `**Thank you for sharing!** Here's what I've got:\n\n- **Name**: ${userData.name}\n- **Fear**: ${userData.fear}\n- **Email**: ${userData.email}\n- **Phone**: ${userData.phone || "Not provided"}\n- **Birthday**: ${userData.birthday || "Not provided"}\n- **Top Feared Adventures**: ${adventures}\n\n**Is this information correct?** (Yes/No)`;
    } else if (currentStep === 'confirmation') {
      if (message.toLowerCase().includes('yes')) {
        return `Great! I've saved your information. Now, let's talk more about your fear of ${userData.fear}. What specifically about ${userData.fear} makes you afraid?`;
      } else {
        return `I understand. Let's start over. What's your name?`;
      }
    } else {
      return `Thanks for sharing. I'm here to help you with your fear of ${userData.fear || 'your fears'}. Is there anything specific you'd like to know?`;
    }
  }, []);

  // Generate next question based on conversation step
  const getNextQuestion = useCallback((step: ChatState['step'], userData: UserData) => {
    switch (step) {
      case 'name':
        return "**What's your name?**";
      case 'fear':
        return `**Thanks, ${userData.name}!** What's something you're afraid of that you'd like to overcome?`;
      case 'email':
        return `**I understand that ${userData.fear} can be scary.** What email address can we reach you at?`;
      case 'phone':
        return `**Thanks for your email!** What's your phone number? (This is optional, you can say 'skip' if you prefer not to share it)`;
      case 'birthday':
        return "**Thanks for that!** When is your birthday? (Format: MM/DD/YYYY, or you can say 'skip')";
      case 'adventures':
        return "**Now, I'd love to know about your fears.** What are the top 3 adventure activities you're most scared of but interested in trying?";
      case 'confirmation':
        const adventures = userData.adventures?.join(', ') || "None specified";
        return `**Thank you for sharing!** Here's what I've got:\n\n- **Name**: ${userData.name}\n- **Fear**: ${userData.fear}\n- **Email**: ${userData.email}\n- **Phone**: ${userData.phone || "Not provided"}\n- **Birthday**: ${userData.birthday || "Not provided"}\n- **Top Feared Adventures**: ${adventures}\n\n**Is this information correct?** (Yes/No)`;
      case 'completed':
        return `**Great! I've saved your information.** Now, let's talk more about your fear of ${userData.fear}. What specifically makes you afraid of ${userData.fear}?`;
      default:
        return '';
    }
  }, []);

  // Send a message to the chatbot
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    console.log('Sending message:', content);
    
    // Create a unique ID for this message
    const messageId = `msg_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create the user message
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Update state with the user message
    setState(prev => {
      const updatedMessages = [...prev.messages, userMessage];
      console.log('Updated messages with user message:', updatedMessages);
      
      // Save to localStorage immediately
      try {
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Error saving messages to localStorage:', error);
      }
      
      return {
        ...prev,
        messages: updatedMessages,
        isLoading: true,
      };
    });

    try {
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });

      // Process message with timeout
      const processMessageWithTimeout = async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Process the message to determine conversation flow
        let { nextStep, updatedUserData } = processMessage(content, state.step, state.userData);

        // If the user has confirmed their information, save to Airtable
        if (state.step === 'confirmation' && content.toLowerCase().includes('yes')) {
          console.log('User confirmed information, saving to Airtable:', updatedUserData);
          
          // Check if we have the required fields
          if (updatedUserData.name && updatedUserData.email) {
            try {
              // Save to Airtable with timeout
              const savePromise = saveUserToAirtable(updatedUserData.email);
              
              const saveResult = await Promise.race([savePromise, timeoutPromise]);
              
              if (saveResult.success) {
                toast({
                  title: "Success",
                  description: "Your information has been saved successfully!",
                  duration: 5000,
                });
                console.log('Successfully saved to Airtable:', saveResult);
                
                // Also initialize progress tracking for this user if they're logged in
                if (user) {
                  try {
                    const { error: progressError } = await supabase.rpc('init_progress_tracking', { 
                      user_id_param: user.id 
                    });
                    
                    if (progressError) {
                      console.error('Error initializing progress tracking:', progressError);
                    } else {
                      console.log('Successfully initialized progress tracking');
                    }
                  } catch (progressError) {
                    console.error('Error initializing progress tracking:', progressError);
                  }
                }
              } else {
                toast({
                  title: "Error",
                  description: saveResult.message || "Failed to save your information. Please try again.",
                  variant: "destructive",
                  duration: 5000,
                });
                console.error('Failed to save to Airtable:', saveResult);
              }
            } catch (error) {
              console.error('Error saving to Airtable:', error);
              toast({
                title: "Error",
                description: error instanceof Error && error.message === 'Request timed out' 
                  ? "Request timed out. Please try again." 
                  : "Failed to save your information. Please try again.",
                variant: "destructive",
                duration: 5000,
              });
              
              // Don't reset on timeout, just continue the conversation
              if (!(error instanceof Error && error.message === 'Request timed out')) {
                nextStep = 'completed';
              }
            }
          } else {
            toast({
              title: "Error",
              description: "Missing required information. Please provide your name and email.",
              variant: "destructive",
              duration: 5000,
            });
            console.error('Missing required fields for Airtable:', updatedUserData);
            
            // Reset to name step if information is missing
            nextStep = 'name';
            updatedUserData = {};
          }
        }
        
        // Get response using AI instead of static function
        const responseContent = await getAIResponse(content, state.step, state.userData);
        
        return { nextStep, updatedUserData, responseContent };
      };

      // Execute the process with timeout
      const { nextStep, updatedUserData, responseContent } = await Promise.race([
        processMessageWithTimeout(),
        timeoutPromise
      ]);
      
      // Create the assistant's response
      const assistantMessage: Message = {
        id: `resp_${messageId}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      
      // Update state with the assistant's response
      setState(prev => {
        const updatedMessages = [...prev.messages, assistantMessage];
        console.log('Updated messages with assistant response:', updatedMessages);
        
        // Save to localStorage immediately
        try {
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        } catch (error) {
          console.error('Error saving messages to localStorage:', error);
        }
        
        return {
          ...prev,
          messages: updatedMessages,
          isLoading: false,
          userData: updatedUserData,
          step: nextStep,
        };
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // Create a fallback message for timeout errors
      const errorMessage = error instanceof Error && error.message === 'Request timed out'
        ? "I'm sorry, but the request timed out. Please try again."
        : "I'm sorry, but something went wrong. Please try again.";
      
      // Create an error response message
      const errorResponseMessage: Message = {
        id: `error_${messageId}`,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      
      // Update state to show error and stop loading
      setState(prev => {
        const updatedMessages = [...prev.messages, errorResponseMessage];
        
        // Save to localStorage
        try {
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        } catch (storageError) {
          console.error('Error saving messages to localStorage:', storageError);
        }
        
        return {
          ...prev,
          messages: updatedMessages,
          isLoading: false,
        };
      });
      
      toast({
        title: "Error",
        description: error instanceof Error && error.message === 'Request timed out'
          ? "Request timed out. Please try again."
          : "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [state.step, state.userData, toast, processMessage, getAIResponse]);

  return {
    ...state,
    sendMessage,
    toggleChat,
    resetChat,
    getAIResponse,
  };
}

export default useChatbot;
