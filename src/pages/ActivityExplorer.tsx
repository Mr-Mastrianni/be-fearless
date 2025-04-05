import React, { useEffect, useState } from 'react';
import { ActivityMatcherProvider } from '@/contexts/ActivityMatcherContext';
import { ActivityMatcher } from '@/components/activity-matcher';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ActivityExplorerPage: React.FC = () => {
  return (
    <ErrorBoundary fallback={
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          <div className="text-growth-400 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-4">Activity Explorer Error</h2>
          <p className="text-gray-300 mb-6 text-center">
            We encountered a problem loading the activity explorer. 
            This could be due to missing activity data or a temporary connection issue.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-2 bg-growth-600 hover:bg-growth-700 text-white rounded-md transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-full py-2 bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    }>
      <div className="flex flex-col min-h-screen">
        <ActivityMatcherProvider>
          <ActivityMatcher />
        </ActivityMatcherProvider>
      </div>
    </ErrorBoundary>
  );
};

export default ActivityExplorerPage;
