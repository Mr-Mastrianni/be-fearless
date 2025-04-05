/**
 * Direct Claude API integration for Be Courageous chatbot
 * This file handles direct communication with Anthropic's Claude API
 */

// Claude API endpoint
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-haiku-20240307"; // Using the fastest Claude model for quick responses

// Get API key from environment variables
const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

/**
 * Send a message to Claude API directly from the client
 * @param message The current message to send
 * @param history Previous conversation history
 * @returns Response with success status and message content
 */
export default async function sendMessageToClaudeDirect(
  message: string,
  history: Array<{ role: string; content: string }>
) {
  try {
    console.log('Sending message directly to Claude API');

    // Validate inputs
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    if (!Array.isArray(history)) {
      console.warn('History is not an array, using empty array instead');
      history = [];
    }

    // Add system message to guide Claude's behavior
    const systemMessage = {
      role: "system",
      content: `You are the Be Courageous assistant, a supportive guide helping users understand and overcome their fears. 
      Be empathetic, encouraging, and positive. Provide practical advice for facing fears gradually.
      Keep responses concise (2-3 paragraphs max) and conversational.
      If asked about specific phobias, provide accurate but reassuring information.
      Never suggest that users should avoid professional help for serious issues.`
    };

    // Convert history format to Claude format
    const claudeMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add the current message
    claudeMessages.push({
      role: 'user',
      content: message
    });

    // Prepare the Claude API payload
    const payload = {
      model: CLAUDE_MODEL,
      messages: [systemMessage, ...claudeMessages],
      max_tokens: 400,
      temperature: 0.7,
    };

    // Set up timeout for the API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log("Sending request to Claude API");
      const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Claude API error:", errorData);
        throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Claude API response received successfully");
      
      return {
        success: true,
        message: data.content[0].text,
        role: "assistant"
      };
    } catch (fetchError) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);

      // Handle timeout errors specifically
      if (fetchError.name === 'AbortError') {
        console.error("Claude API request timed out");
        throw new Error('Request timed out. Please try again.');
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Error in Claude API client:", error);
    
    let userMessage = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    const errorMessage = error.message || 'Unknown error';
    const isApiKeyIssue = !apiKey || errorMessage.includes('API key');
    
    if (isApiKeyIssue) {
      userMessage = "The chat service is currently unavailable. Please try again later.";
    } else if (errorMessage.includes('timeout')) {
      userMessage = "The request timed out. Please try again when the service is less busy.";
    } else if (errorMessage.includes('network')) {
      userMessage = "There was a network error. Please check your internet connection and try again.";
    }
    
    return {
      success: false,
      message: userMessage,
      role: "assistant",
      errorType: isApiKeyIssue ? 'api_key' : 'general'
    };
  }
}
