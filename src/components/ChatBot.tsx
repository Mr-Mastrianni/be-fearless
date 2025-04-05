import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, X, RefreshCw } from "lucide-react";
import useChatbot from "@/hooks/useChatbot";
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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

      {/* Chat window */}
      <div
        className={`fixed right-4 bottom-20 z-40 w-full sm:max-w-sm md:max-w-md transition-all duration-300 ease-in-out chatbot-container ${
          isOpen ? 'chatbot-open' : 'chatbot-closed'
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
              >
                <RefreshCw size={16} className="mr-1" />
                <span>New Conversation</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-courage-700 h-8 w-8"
                onClick={toggleChat}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Chat messages */}
          <CardContent className="p-0">
            <div 
              className="h-96 overflow-y-auto p-4 bg-gray-50 chatbot-messages" 
              ref={messagesContainerRef}
              key={`message-container-${renderKey}`}
            >
              {displayMessages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <p className="text-gray-500 mb-4">No messages yet. Start a conversation!</p>
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
                      className={`rounded-lg px-4 py-2 max-w-[85%] animate-scale-in ${
                        message.role === 'user'
                          ? 'bg-courage-600 text-white user-message'
                          : 'bg-white border border-gray-300 shadow-sm assistant-message'
                      }`}
                      style={{
                        color: message.role === 'user' ? 'white' : 'black'
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
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 max-w-[85%] shadow-sm assistant-message">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-courage-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                      <span className="text-sm text-gray-500 ml-2" style={{ color: 'black !important', visibility: 'visible' }}>Thinking...</span>
                    </div>
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
