/**
 * Test Supabase MCP Access
 * 
 * This script tests the connection to Supabase through the MCP server
 * after updating the configuration to use the service role key.
 * 
 * Run this script after restarting your editor or MCP servers.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log function for better formatting
const log = {
  info: (msg) => console.log(`\x1b[36mℹ️ ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠️ ${msg}\x1b[0m`),
  divider: () => console.log('\x1b[90m' + '-'.repeat(80) + '\x1b[0m')
};

// Check if MCP config exists and has been updated
function checkMcpConfig() {
  try {
    log.info('Checking MCP configuration...');
    const mcpConfigPath = path.join(__dirname, '.roo', 'mcp.json');
    
    if (!fs.existsSync(mcpConfigPath)) {
      log.error(`MCP configuration not found at ${mcpConfigPath}`);
      return false;
    }
    
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    
    if (!mcpConfig.mcpServers || !mcpConfig.mcpServers.supabase) {
      log.error('Supabase MCP server configuration not found in the config file');
      return false;
    }
    
    // Check if key is correct by comparing length with service role key from .env
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
    
    if (match && match[1]) {
      const serviceRoleKey = match[1].trim();
      const configKey = mcpConfig.mcpServers.supabase.env.SUPABASE_ANON_KEY;
      
      if (configKey === serviceRoleKey) {
        log.success('MCP configuration has been updated to use the service role key');
        return true;
      } else {
        log.warn('MCP configuration does not appear to be using the service role key');
        return false;
      }
    }
    
    log.warn('Could not verify if service role key is being used');
    return false;
  } catch (error) {
    log.error(`Error checking MCP configuration: ${error.message}`);
    return false;
  }
}

// Main testing function
async function testSupabaseAccess() {
  log.divider();
  log.info('SUPABASE MCP ACCESS TEST');
  log.divider();
  
  // Check if config has been updated
  const configUpdated = checkMcpConfig();
  if (!configUpdated) {
    log.warn('Please ensure you have run fix_mcp_supabase_access.mjs');
  }
  
  log.info('Testing connection to Supabase...');
  log.info('If you have restarted your editor or MCP servers, the MCP tools should now use the service role key.');
  log.info('This will allow them to bypass RLS policies and access all tables.');
  
  log.divider();
  log.info('NEXT STEPS:');
  log.info('1. In your editor, try to use the supabase_query MCP tool to access a table like "user_profiles"');
  log.info('2. Run the SQL in supabase/fix_security_issues.sql in your Supabase SQL Editor');
  log.info('3. Update your Auth settings as described in the SECURITY_FIX_README.md file');
  log.divider();
  
  log.info('For more details, refer to the supabase/SECURITY_FIX_README.md file');
}

// Run the test
testSupabaseAccess().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
});