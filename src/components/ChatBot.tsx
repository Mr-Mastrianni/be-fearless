import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, X, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import useChatbot from "@/hooks/useChatbot";
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TypingIndicator from "@/components/ui/typing-indicator";

// Lazy load ReactMarkdown for better performance
const ReactMarkdown = lazy(() => import('react-markdown'));

// Detect mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const ChatBot = () => {
  const {
    isOpen,
    messages,
    isLoading,
    sendMessage,
    toggleChat,
    resetChat
  } = useChatbot();
  
  const [inputValue, setInputValue] = useState('');
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [renderKey, setRenderKey] = useState(Date.now()); // Used to force re-render of messages container
  const [displayMessages, setDisplayMessages] = useState(messages);
  const [showError, setShowError] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update mobile view state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update display messages when messages change
  useEffect(() => {
    setDisplayMessages(messages);
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && isOpen) {
      const container = messagesContainerRef.current;
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [displayMessages, isOpen, isLoading]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle retry loading messages
  const handleRetryMessageLoad = async () => {
    try {
      // Force re-render of messages container
      setRenderKey(Date.now());
      
      // Try to load messages from localStorage
      const savedState = localStorage.getItem('chatState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Convert string timestamps back to Date objects
        if (parsedState.messages) {
          const recoveredMessages = parsedState.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          setDisplayMessages(recoveredMessages);
          toast({
            title: "Messages Recovered",
            description: `Recovered ${recoveredMessages.length} messages.`,
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "No Messages Found",
          description: "No saved messages were found.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error manually recovering messages:', error);
      toast({
        title: "Error",
        description: "Failed to recover messages. Please try starting a new conversation.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className={`fixed right-4 bottom-4 z-40 rounded-full w-12 h-12 p-0 shadow-lg ${
          isOpen ? 'bg-gray-700 hover:bg-gray-800' : 'bg-courage-600 hover:bg-courage-700'
        }`}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </Button>

      {/* Chat window - improved mobile responsiveness */}
      <div
        className={`fixed right-0 sm:right-4 bottom-0 sm:bottom-20 z-40 w-full sm:max-w-sm md:max-w-md transition-all duration-300 ease-in-out chatbot-container ${
          isOpen ? `chatbot-open ${isMobileView ? 'h-[95vh]' : 'h-[90vh] sm:h-auto'}` : 'chatbot-closed'
        }`}
      >
        <Card className="border border-gray-200 shadow-xl overflow-hidden chatbot-card">
          {/* Chat header */}
          <div className="bg-courage-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <h3 className="font-medium">Be Courageous Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-courage-700 h-8"
                onClick={resetChat}
                title="Reset conversation"
              >
                <Trash2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-courage-700 h-8"
                onClick={toggleChat}
                title="Close chat"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Error alert */}
          {showError && (
            <Alert variant="destructive" className="m-2 mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem connecting to the chat service. Please try again later.
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowError(false)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </Alert>
          )}

          {/* Chat messages */}
          <CardContent className="p-0 flex-grow overflow-hidden">
            <div
              className="h-[calc(90vh-120px)] sm:h-96 overflow-y-auto p-4 bg-gray-50 chatbot-messages"
              ref={messagesContainerRef}
              key={`message-container-${renderKey}`}
            >
              {displayMessages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-gray-500 mb-2">Start a conversation with the Be Courageous Assistant</p>
                  <p className="text-sm text-gray-400 mb-4">I'm here to help you understand and face your fears</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryMessageLoad}
                    className="flex items-center"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    <span>Recover Messages</span>
                  </Button>
                </div>
              ) : (
                displayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-courage-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <Suspense fallback={<div className="text-sm opacity-70">Loading message...</div>}>
                        <ReactMarkdown className="prose prose-sm max-w-none break-words">
                          {message.content}
                        </ReactMarkdown>
                      </Suspense>
                      <div
                        className={`text-xs mt-1 opacity-70 ${
                          message.role === 'user' ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="mb-4 text-left">
                  <div className="inline-block max-w-[85%] rounded-lg p-3 bg-white border border-gray-200">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Chat input */}
          <CardFooter className="p-2 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-10 resize-none flex-1"
                rows={isMobileView ? 2 : 1}
                disabled={isLoading}
                style={{ color: 'black', backgroundColor: 'white' }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="bg-courage-600 hover:bg-courage-700 h-10 w-10"
              >
                <Send size={18} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChatBot;
