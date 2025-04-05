import React from 'react';

interface ProgressChartProps {
  data: any[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-lg font-medium mb-4">Fear Levels Over Time</h3>
      <p className="text-sm text-gray-500 mb-4">Track how your fear levels decrease as you face your fears</p>
      
      {data.length > 0 ? (
        <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center">
          {/* Placeholder for actual chart implementation */}
          <p className="text-gray-400">Chart visualization would appear here</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-2">No fear progress data available yet.</p>
          <p className="text-sm text-gray-400">Complete the fear assessment or log activities to start tracking your progress.</p>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;