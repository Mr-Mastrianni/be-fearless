/**
 * Fix MCP Supabase Access
 * 
 * This script updates the Supabase MCP server configuration to use
 * the service role key instead of the anonymous key, allowing it
 * to bypass Row Level Security (RLS) policies.
 */

const fs = require('fs');
const path = require('path');

// Path to MCP configuration
const mcpConfigPath = path.join(__dirname, '.roo', 'mcp.json');

// Read the .env file to get the service role key
function getServiceRoleKey() {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    throw new Error('Service role key not found in .env file');
  } catch (error) {
    console.error('Error reading service role key:', error.message);
    process.exit(1);
  }
}

// Update the MCP configuration
function updateMcpConfig() {
  try {
    console.log('Reading MCP configuration...');
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    
    const serviceRoleKey = getServiceRoleKey();
    
    // Check if the supabase server config exists
    if (!mcpConfig.mcpServers || !mcpConfig.mcpServers.supabase) {
      console.error('Supabase MCP server configuration not found');
      process.exit(1);
    }

    // Backup the original config
    const backupPath = `${mcpConfigPath}.backup`;
    fs.writeFileSync(backupPath, JSON.stringify(mcpConfig, null, 2));
    console.log(`Original configuration backed up to ${backupPath}`);

    // Update the configuration to use service role key
    mcpConfig.mcpServers.supabase.env = {
      ...mcpConfig.mcpServers.supabase.env,
      SUPABASE_ANON_KEY: serviceRoleKey
    };

    // Save the updated configuration
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    console.log('MCP configuration updated successfully');
    console.log('\nYou will need to restart any running MCP servers for changes to take effect.');
    console.log('To do this, restart your editor or use the appropriate command to restart the server.');
    console.log('\nWARNING: Using the service role key grants admin privileges to the MCP server.');
    console.log('This should only be used for development and debugging purposes.');
    
  } catch (error) {
    console.error('Error updating MCP configuration:', error.message);
    process.exit(1);
  }
}

// Run the update
updateMcpConfig();