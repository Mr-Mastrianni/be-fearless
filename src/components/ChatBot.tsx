import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, X, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import useChatbot from "@/hooks/useChatbot";
import { useToast } from '@/hooks/use-toast';
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

  const [inputValue, setInputValue] = useState("");
  const [renderKey, setRenderKey] = useState(Date.now());
  const [displayMessages, setDisplayMessages] = useState(messages);
  const [retryCount, setRetryCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Determine if we're on a mobile device
  const [isMobileView, setIsMobileView] = useState(isMobile());

  // Update mobile status on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [displayMessages, isOpen]);

  useEffect(() => {
    setDisplayMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (displayMessages.length === 0 && retryCount < 3) {
      try {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          if (parsedMessages && parsedMessages.length > 0 && displayMessages.length < parsedMessages.length) {
            console.log('Recovering messages from localStorage:', parsedMessages);
            setDisplayMessages(parsedMessages);
            setRetryCount(prev => prev + 1);

            setRenderKey(Date.now());

            toast({
              title: "Message Recovery",
              description: "Successfully recovered your conversation.",
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error('Error recovering messages from localStorage:', error);
      }
    }
  }, [displayMessages.length, retryCount, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      try {
        setChatError(null);
        setRetryCount(0); // Reset retry count on new message
        await sendMessage(inputValue);
        setInputValue("");
      } catch (error) {
        console.error('Error sending message:', error);

        // Determine the appropriate error message based on the error type
        let errorMessage = 'Failed to send message. Please try again.';

        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('abort')) {
            errorMessage = 'The request timed out. Our servers might be busy right now.';
          } else if (error.message.includes('network') || error.message.includes('connection')) {
            errorMessage = 'Network connection issue detected. Please check your internet.';
          } else if (error.message.includes('API key')) {
            errorMessage = 'Chat service configuration issue. Please contact support.';
          }
        }

        setChatError(errorMessage);
        toast({
          title: "Chat Error",
          description: "We're having trouble connecting to our chat service. Please try again later.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only auto-submit on Enter for desktop users
    // Mobile users need to use the send button to avoid accidental submissions
    if (e.key === 'Enter' && !e.shiftKey && !isMobileView) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  const handleRetryMessageLoad = () => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (parsedMessages && parsedMessages.length > 0) {
          setDisplayMessages(parsedMessages);
          setRenderKey(Date.now());
          toast({
            title: "Message Recovery",
            description: "Successfully recovered your conversation.",
            duration: 3000,
          });
        } else {
          toast({
            title: "No Messages",
            description: "No saved messages found to recover.",
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "No Messages",
          description: "No saved messages found to recover.",
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
          isOpen ? `chatbot-open ${isMobileView ? 'h-[85vh]' : 'h-[90vh] sm:h-auto'}` : 'chatbot-closed'
        }`}
        style={{ maxHeight: isMobileView ? 'calc(100vh - 60px)' : 'auto' }}
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
                title="Start a new conversation"
              >
                <RefreshCw size={16} className="mr-1" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-courage-700 h-8"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
                    resetChat();
                    toast({
                      title: "Conversation cleared",
                      description: "Your conversation has been reset.",
                      duration: 3000,
                    });
                  }
                }}
                title="Clear conversation history"
              >
                <Trash2 size={16} className="mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-courage-700 h-8 w-8"
                onClick={toggleChat}
                title="Close chat"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Chat messages */}
          <CardContent className="p-0">
            {chatError && (
              <Alert variant="destructive" className="m-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {chatError}
                  <div className="flex mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        // Try to reconnect to the chat service
                        setRetryCount(prev => prev + 1);
                        setChatError(null);
                        // Force a re-render of the chat component
                        setRenderKey(Date.now());
                      }}
                    >
                      <RefreshCw size={12} className="mr-1" />
                      Retry Connection
                    </Button>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-white underline"
                      onClick={() => setChatError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div
              className="h-[calc(60vh-120px)] sm:h-96 overflow-y-auto p-3 sm:p-4 bg-gray-50 chatbot-messages"
              ref={messagesContainerRef}
              key={`message-container-${renderKey}`}
              style={{ height: isMobileView ? 'calc(60vh - 100px)' : '400px' }}
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
                    key={`${message.id}-${renderKey}`}
                    className={`mb-4 flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    role={message.role}
                  >
                    <div
                      className={`rounded-lg px-3 sm:px-4 py-2 max-w-[90%] sm:max-w-[85%] animate-scale-in ${
                        message.role === 'user'
                          ? 'bg-courage-600 text-white user-message'
                          : 'bg-white border border-gray-300 shadow-sm assistant-message'
                      }`}
                      style={{
                        color: message.role === 'user' ? 'white' : 'black',
                        fontSize: isMobileView ? '0.875rem' : '0.9375rem'
                      }}
                    >
                      {message.role === 'user' ? (
                        <p
                          className="text-sm whitespace-pre-wrap"
                          style={{ color: 'white !important', visibility: 'visible' }}
                        >
                          {message.content}
                        </p>
                      ) : (
                        <div
                          className="text-sm max-w-none"
                          style={{ color: 'black !important', visibility: 'visible' }}
                        >
                          <ReactMarkdown components={{
                            p: ({node, ...props}) => <p style={{ color: 'black !important', marginBottom: '8px', visibility: 'visible' }} {...props} />,
                            strong: ({node, ...props}) => <strong style={{ color: 'black !important', fontWeight: 'bold', visibility: 'visible' }} {...props} />,
                            ul: ({node, ...props}) => <ul style={{ color: 'black !important', paddingLeft: '16px', listStyleType: 'disc', marginBottom: '8px', visibility: 'visible' }} {...props} />,
                            ol: ({node, ...props}) => <ol style={{ color: 'black !important', paddingLeft: '16px', listStyleType: 'decimal', marginBottom: '8px', visibility: 'visible' }} {...props} />,
                            li: ({node, ...props}) => <li style={{ color: 'black !important', marginBottom: '4px', visibility: 'visible' }} {...props} />,
                            h1: ({node, ...props}) => <h1 style={{ color: 'black !important', fontWeight: 'bold', fontSize: '1.2em', marginTop: '12px', marginBottom: '8px', visibility: 'visible' }} {...props} />,
                            h2: ({node, ...props}) => <h2 style={{ color: 'black !important', fontWeight: 'bold', fontSize: '1.1em', marginTop: '10px', marginBottom: '6px', visibility: 'visible' }} {...props} />,
                            a: ({node, ...props}) => <a style={{ color: '#3b82f6 !important', textDecoration: 'underline', visibility: 'visible' }} {...props} />
                          }}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Improved typing indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <TypingIndicator />
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
                className="min-h-10 resize-none flex-1 text-sm sm:text-base"
                rows={isMobileView ? 2 : 1}
                disabled={isLoading}
                style={{
                  color: 'black',
                  backgroundColor: 'white',
                  padding: isMobileView ? '8px 10px' : '10px 12px'
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="bg-courage-600 hover:bg-courage-700 h-10 w-10"
              >
                <Send size={isMobileView ? 16 : 18} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChatBot;
