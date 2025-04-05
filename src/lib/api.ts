// API utilities for chatbot, donations, and video uploads
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabase";

// Function to send user messages to OpenAI API via Supabase Edge Function
export async function sendMessageToOpenAI(message: string, history: Array<{role: string, content: string}>) {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message, history }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error: ${error.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending message to OpenAI:", error);
    return {
      success: false,
      message: "Sorry, I'm having trouble connecting to my brain. Please try again."
    };
  }
}

// Function to save user data to Airtable
export async function saveUserToAirtable(userId: string) {
  try {
    console.log("Syncing user data to Airtable for userId:", userId);
    
    // Call the Airtable Edge Function with the sync_user action
    const { data, error } = await supabase.functions.invoke('airtable', {
      body: { 
        action: 'sync_user',
        userId: userId
      }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error: ${error.message || 'Unknown error'}`);
    }

    console.log("Airtable sync response:", data);
    return data;
  } catch (error) {
    console.error("Error syncing to Airtable:", error);
    return {
      success: false,
      message: "Sorry, we couldn't sync your information to Airtable. Please try again."
    };
  }
}

// Function to sync all users to Airtable (admin only)
export async function syncAllUsersToAirtable() {
  try {
    console.log("Syncing all users to Airtable");
    
    // Call the Airtable Edge Function with the sync_all_users action
    const { data, error } = await supabase.functions.invoke('airtable', {
      body: { 
        action: 'sync_all_users'
      }
    });

    if (error) {
      console.error("Supabase Edge Function error:", error);
      throw new Error(`Error: ${error.message || 'Unknown error'}`);
    }

    console.log("Airtable bulk sync response:", data);
    return data;
  } catch (error) {
    console.error("Error syncing all users to Airtable:", error);
    return {
      success: false,
      message: "Sorry, we couldn't sync all users to Airtable. Please try again."
    };
  }
}

// Function to log conversation to Airtable
export async function logConversationToAirtable(
  conversation: Array<{role: string, content: string}>, 
  userId: string,
  fearInfo: {
    activities?: string[],
    reasons?: string,
    intensity?: number
  } = {}
) {
  try {
    const { data, error } = await supabase.functions.invoke('conversation-log', {
      body: { 
        conversation, 
        userId,
        fearInfo
      }
    });

    if (error) {
      console.error("Error logging conversation:", error);
      return { success: false };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error logging conversation:", error);
    return { success: false };
  }
}
