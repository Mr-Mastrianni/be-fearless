// Simple script to check if all required environment variables are set
// Run with: node check-env.js

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID'
];

const optionalVars = [
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ACCESS_TOKEN'
];

console.log('Checking environment variables...\n');

// Check required variables
let missingRequired = false;
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Required variable ${varName} is missing`);
    missingRequired = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
}

// Check optional variables
console.log('\nChecking optional variables:');
for (const varName of optionalVars) {
  if (!process.env[varName]) {
    console.warn(`⚠️ Optional variable ${varName} is not set`);
  } else {
    console.log(`✅ ${varName} is set`);
  }
}

// Final result
if (missingRequired) {
  console.error('\n❌ Some required environment variables are missing. Please set them before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set. You are ready to deploy!');
}
