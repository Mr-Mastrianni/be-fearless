// This file implements an Edge Function to save user data to Airtable
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to map user data to Airtable fields
function mapUserToAirtableFields(user: any, profile: any, activities: any[], fearAssessment: any) {
  // Extract fear assessment results
  const fearResults = fearAssessment?.results || [];
  const topFears = Array.isArray(fearResults) ? 
    fearResults.slice(0, 5).map((f: any) => f.fear || f.category || '').filter(Boolean) : [];
  
  // Create the base fields object with ALL CAPS fields to match Airtable
  const fields: any = {
    "USER ID": user.id,
    "EMAIL": user.email,
    "PHONE": user.phone || user.user_metadata?.phone || profile.phone_number || '',
    "NAME": profile.full_name || user.user_metadata?.full_name || '',
    // Removed "DATE CREATED" as it's a computed field in Airtable
    "LAST SIGN IN": user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString() : null,
    "LOCATION": profile.location || user.user_metadata?.location || '',
    "BIRTHDAY": profile.date_of_birth || user.user_metadata?.date_of_birth || '',
    "EXPERIENCE LEVEL": profile.experience_level || user.user_metadata?.experience_level || '',
    "CHALLENGE INTENSITY": profile.challenge_intensity || user.user_metadata?.challenge_intensity || '',
    "LEARNING STYLE": profile.learning_style || user.user_metadata?.learning_style || '',
    "BIO": profile.bio || user.user_metadata?.bio || '',
    // Removed "PROFILE COMPLETED" as it's causing errors
    "KEY FEARS": Array.isArray(profile.key_fears) ? profile.key_fears.join(", ") : '',
    // Removed FEAR ASSESSMENT fields as they're not needed
    // Removed "ACTIVITIES COMPLETED" as it's causing errors
    // Removed "ACTIVITY LIST" as user removed this column from Airtable
    // Removed "IS ADMIN" as it's causing errors
    "ONBOARDING DATE": profile.created_at ? new Date(profile.created_at).toISOString() : null
  };
  
  return fields;
}

// Function to inspect the Airtable schema
async function inspectAirtableSchema() {
  try {
    // First, check if Airtable API key and base ID are set
    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY") || "";
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID") || "";
    const AIRTABLE_TABLE_NAME = "Users"; // Default table name for user data

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return {
        error: "Airtable API key or base ID not configured"
      };
    }

    // Make a request to get table metadata
    const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!metaResponse.ok) {
      const errorData = await metaResponse.json();
      return {
        error: "Failed to retrieve Airtable metadata",
        details: errorData
      };
    }

    const metaData = await metaResponse.json();

    // Also make a simple query to see fields
    const queryResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let queryData = {};
    let sampleRecord = null;
    
    if (queryResponse.ok) {
      queryData = await queryResponse.json();
      if (queryData.records && queryData.records.length > 0) {
        sampleRecord = queryData.records[0];
      }
    }

    // Return the schema information
    return {
      tables: metaData.tables,
      sampleRecord: sampleRecord,
      rawQueryResponse: queryResponse.ok ? queryData : { error: await queryResponse.text() }
    };
  } catch (error) {
    return {
      error: "Error inspecting Airtable schema",
      message: error.message || String(error)
    };
  }
}

// Function to create a user record in Airtable if it doesn't exist, otherwise update it
async function syncUserToAirtable(supabase: any, userId: string): Promise<any> {
  try {
    // Get the user from Supabase
    console.log(`Getting user ${userId} from Supabase...`);
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error("Error fetching user:", userError?.message || "User not found");
      return { success: false, error: userError?.message || "User not found" };
    }
    
    // Get the user profile
    console.log("Getting user profile...");
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
      return { success: false, error: profileError.message };
    }
    
    // Get activities
    console.log("Getting user activities...");
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*, activity_id(*)')
      .eq('user_id', userId);
    
    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError.message);
      return { success: false, error: activitiesError.message };
    }
    
    // Get fear assessment
    console.log("Getting fear assessment...");
    const { data: fearAssessment, error: fearAssessmentError } = await supabase
      .from('fear_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (fearAssessmentError) {
      console.error("Error fetching fear assessment:", fearAssessmentError.message);
      // We'll continue anyway, just without the fear assessment data
    }
    
    // Check if user exists in Airtable
    console.log("Checking if user exists in Airtable...");
    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error("Airtable API key or Base ID not found in environment variables");
    }

    // Map user data to Airtable fields
    const fields = mapUserToAirtableFields(user.user, profile, activities || [], fearAssessment || {});
    
    // Check if record exists
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users?filterByFormula={USER ID}="${userId}"`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable API error:", errorData);
      return { success: false, error: `Airtable API error: ${JSON.stringify(errorData)}` };
    }
    
    const airtableData = await response.json();
    
    // Create or update the record
    let result;
    if (airtableData.records && airtableData.records.length > 0) {
      // Update existing record
      console.log("Updating existing Airtable record...");
      const recordId = airtableData.records[0].id;
      
      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields }) // This now passes an object with correct type
        }
      );
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Error updating Airtable record:", errorData);
        return { success: false, error: `Error updating Airtable record: ${JSON.stringify(errorData)}` };
      }
      
      result = await updateResponse.json();
    } else {
      // Create new record
      console.log("Creating new Airtable record...");
      const createResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields }) // This now passes an object with correct type
        }
      );
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Error creating Airtable record:", errorData);
        return { success: false, error: `Error creating Airtable record: ${JSON.stringify(errorData)}` };
      }
      
      result = await createResponse.json();
    }
    
    console.log("Airtable sync successful!");
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Error in syncUserToAirtable:", error);
    return { success: false, error: error.message || "Unknown error in syncUserToAirtable" };
  }
}

// Handle the HTTP request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Airtable Edge Function called");
    
    // Get API key and Base ID from environment
    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log environment variable status
    console.log("Environment variables status:", {
      AIRTABLE_API_KEY: AIRTABLE_API_KEY ? `Found (${AIRTABLE_API_KEY.length} chars)` : "Not found",
      AIRTABLE_BASE_ID: AIRTABLE_BASE_ID || "Not found",
      SUPABASE_URL: SUPABASE_URL ? "Found" : "Not found",
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? "Found" : "Not found"
    });
    
    // Validate environment variables
    if (!AIRTABLE_API_KEY) {
      throw new Error("Missing Airtable API Key in environment variables");
    }
    
    if (!AIRTABLE_BASE_ID) {
      throw new Error("Missing Airtable Base ID in environment variables");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    // Parse request data
    const requestData = await req.json();
    const { action, userId } = requestData;
    console.log(`Received request with action: ${action}, userId: ${userId || 'N/A'}`);
    
    if (!action) {
      throw new Error("Required parameter 'action' is missing");
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Define table name - must match Airtable exactly
    const TABLE_NAME = 'Users';
    
    // Handle different actions
    if (action === 'sync_user') {
      if (!userId) {
        throw new Error("Required parameter 'userId' is missing for sync_user action");
      }

      // Get user data from Supabase
      const { data: userData, error: userError } = await supabase
        .auth.admin.getUserById(userId);
      
      if (userError || !userData) {
        throw new Error(`Failed to fetch user: ${userError?.message || 'User not found'}`);
      }

      // Get user profile from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') { // Not found is ok
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      // Get user activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*, activity_id(*)')
        .eq('user_id', userId);
      
      if (activitiesError) {
        console.warn(`Warning: Failed to fetch activities: ${activitiesError.message}`);
        // Continue anyway, activities are optional
      }

      // Get fear assessment results if available
      const { data: fearData, error: fearError } = await supabase
        .from('fear_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fearError) {
        console.warn(`Warning: Failed to fetch fear assessment: ${fearError.message}`);
        // Continue anyway, fear assessment is optional
      }

      // Combine all user data
      const user = userData.user;
      const profile = profileData || {};
      const activities = activitiesData || [];
      const fearAssessment = fearData?.[0] || {};

      // Map fields to Airtable format
      const fields = mapUserToAirtableFields(user, profile, activities, fearAssessment);
      
      // Prepare data for Airtable API
      const airtableData = {
        records: [{ fields }]
      };
      
      // Log the data we're sending
      console.log(`Sending data to Airtable base ${AIRTABLE_BASE_ID}, table ${TABLE_NAME}:`, 
        JSON.stringify(airtableData));
      
      // Send data to Airtable API
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtableData),
        }
      );
      
      // Get and log response
      const responseText = await response.text();
      console.log(`Airtable API response (${response.status}):`, responseText);

      // Handle errors based on HTTP status
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Table "${TABLE_NAME}" not found in Airtable base. Check the table name. Base ID: ${AIRTABLE_BASE_ID}`);
        } else if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication failed. Check your Airtable API key permissions. Key length: ${AIRTABLE_API_KEY.length}`);
        } else if (response.status === 422) {
          throw new Error(`Field names don't match Airtable schema. Check column names in the Airtable base. Response: ${responseText}`);
        } else {
          throw new Error(`Airtable API error (${response.status}): ${responseText}`);
        }
      }

      // Success response
      return new Response(
        JSON.stringify({
          success: true,
          message: "User data saved successfully to Airtable",
          data: JSON.parse(responseText)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'sync_all_users') {
      // Get all users from auth.users
      // Note: This may need pagination for large user bases
      const { data: allUsers, error: usersError } = await supabase
        .auth.admin.listUsers({ page: 1, perPage: 100 });
      
      if (usersError) {
        throw new Error(`Failed to fetch users: ${usersError.message}`);
      }

      if (!allUsers || !allUsers.users || allUsers.users.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "No users found to sync",
            count: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Found ${allUsers.users.length} users to sync`);

      // Process users in batches of 10 to avoid overwhelming Airtable API
      const BATCH_SIZE = 10;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process users in batches
      for (let i = 0; i < allUsers.users.length; i += BATCH_SIZE) {
        const userBatch = allUsers.users.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1}, users ${i+1}-${Math.min(i+BATCH_SIZE, allUsers.users.length)}`);
        
        const batchRecords = [];

        // Process each user in the batch
        for (const user of userBatch) {
          try {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.warn(`Warning: Failed to fetch profile for user ${user.id}: ${profileError.message}`);
            }

            // Get user activities
            const { data: activities, error: activitiesError } = await supabase
              .from('user_activities')
              .select('*, activity_id(*)')
              .eq('user_id', user.id);
            
            if (activitiesError) {
              console.warn(`Warning: Failed to fetch activities for user ${user.id}: ${activitiesError.message}`);
            }

            // Get fear assessment
            const { data: fearData, error: fearError } = await supabase
              .from('fear_assessments')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (fearError) {
              console.warn(`Warning: Failed to fetch fear assessment for user ${user.id}: ${fearError.message}`);
            }

            // Map user data to Airtable fields
            const fields = mapUserToAirtableFields(
              user, 
              profile || {}, 
              activities || [], 
              fearData?.[0] || {}
            );

            // Add to batch records
            batchRecords.push({ fields });
          } catch (error) {
            console.error(`Error processing user ${user.id}:`, error);
            errorCount++;
            errors.push({
              userId: user.id,
              error: error.message || 'Unknown error'
            });
          }
        }

        // Skip if no records to send
        if (batchRecords.length === 0) {
          console.log('No valid records in this batch, skipping');
          continue;
        }

        // Send batch to Airtable
        try {
          const airtableData = { records: batchRecords };
          
          console.log(`Sending batch of ${batchRecords.length} users to Airtable`);
          
          const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(airtableData),
            }
          );
          
          const responseText = await response.text();
          
          if (!response.ok) {
            throw new Error(`Airtable API error (${response.status}): ${responseText}`);
          }
          
          // Parse response to get number of successful records
          const responseData = JSON.parse(responseText);
          successCount += responseData.records?.length || 0;
          
          console.log(`Successfully synced batch, ${successCount} total users synced so far`);
        } catch (error) {
          console.error(`Error sending batch to Airtable:`, error);
          errorCount += batchRecords.length;
          errors.push({
            batch: `${i+1}-${Math.min(i+BATCH_SIZE, allUsers.users.length)}`,
            error: error.message || 'Unknown error'
          });
        }
        
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Return summary response
      return new Response(
        JSON.stringify({
          success: true,
          message: `Synced ${successCount} users to Airtable${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
          count: successCount,
          errors: errorCount > 0 ? errors : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'inspect_schema') {
      // New schema inspection functionality
      const schemaInfo = await inspectAirtableSchema();
      return new Response(
        JSON.stringify(schemaInfo),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    // Log and return error
    console.error("Error in Airtable Edge Function:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to save user data to Airtable",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
