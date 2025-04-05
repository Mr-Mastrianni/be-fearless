import React from 'react';
import { AlertTriangle, HelpCircle, ExternalLink } from 'lucide-react';

interface DatabaseSchemaAlertProps {
  errorMessage: string | null;
}

const DatabaseSchemaAlert: React.FC<DatabaseSchemaAlertProps> = ({ errorMessage }) => {
  // Only show for database schema related errors
  if (!errorMessage || 
      (!errorMessage.includes('schema') && 
       !errorMessage.includes('column') && 
       !errorMessage.includes('database'))) {
    return null;
  }

  const isDateOfBirthMissing = errorMessage.includes('date_of_birth');
  const isAgeRangeError = errorMessage.includes('age_range');
  
  return (
    <div className="mt-4 p-4 border border-amber-300 bg-amber-50 rounded-md">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-amber-800">Database Schema Update Required</h3>
          
          <p className="mt-1 text-sm text-amber-700">
            {isDateOfBirthMissing ? (
              <>The database needs to be updated to include the new <code>date_of_birth</code> field.</>
            ) : isAgeRangeError ? (
              <>The database schema has been partially updated. The <code>age_range</code> field needs to be removed.</>
            ) : (
              <>A database schema update is required to continue.</>
            )}
          </p>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-amber-800">How to fix:</h4>
            <ol className="mt-1 text-sm text-amber-700 list-decimal pl-5 space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Create a new query</li>
              <li>Copy and paste the following SQL:</li>
            </ol>
            
            <div className="mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs font-mono overflow-x-auto">
              {isDateOfBirthMissing && !isAgeRangeError ? (
                <pre>ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;</pre>
              ) : isAgeRangeError && !isDateOfBirthMissing ? (
                <pre>ALTER TABLE user_profiles DROP COLUMN age_range;</pre>
              ) : (
                <pre>
                  ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
                  ALTER TABLE user_profiles DROP COLUMN age_range;
                </pre>
              )}
            </div>
            
            <div className="mt-3 flex items-center">
              <HelpCircle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-xs text-amber-700">
                Need help? Check the <a href="/DATABASE_MIGRATION.md" target="_blank" className="text-amber-600 hover:text-amber-800 underline inline-flex items-center">
                  migration guide
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaAlert;
