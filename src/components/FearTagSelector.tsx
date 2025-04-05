import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FearTagSelectorProps {
  selectedFears: string[];
  onChange: (fears: string[]) => void;
}

// Common fears people might want to overcome
const commonFears = [
  // Original fears
  'Public Speaking',
  'Heights',
  'Failure',
  'Rejection',
  'Social Situations',
  'Flying',
  'Confined Spaces',
  'Darkness',
  'Ocean',
  'Making Decisions',
  'Change',
  'Being Alone',
  'Driving',
  'Success',
  
  // Adventure-related fears
  'Extreme Heights',
  'Deep Ocean',
  'Wilderness Survival',
  'Rock Climbing',
  'Skydiving',
  'Scuba Diving',
  'White Water Rafting',
  'Solo Travel',
  'Camping Alone',
  'Cliff Jumping',
  'Zip Lining',
  'Mountain Biking',
  'Surfing',
  'Bungee Jumping',
  'Paragliding',
  'Caving',
  'Hiking Remote Trails',
  'Extreme Weather',
  'Off-Grid Living'
];

const FearTagSelector: React.FC<FearTagSelectorProps> = ({ selectedFears, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Show suggestions that start with the input value and aren't already selected
    if (value.trim()) {
      const filteredSuggestions = commonFears.filter(
        (fear) => 
          fear.toLowerCase().includes(value.toLowerCase()) && 
          !selectedFears.includes(fear)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addFear = (fear: string) => {
    const fearTrimmed = fear.trim();
    if (fearTrimmed && !selectedFears.includes(fearTrimmed)) {
      onChange([...selectedFears, fearTrimmed]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const removeFear = (fearToRemove: string) => {
    onChange(selectedFears.filter((fear) => fear !== fearToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addFear(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedFears.length > 0) {
      // Remove the last tag when backspace is pressed with empty input
      removeFear(selectedFears[selectedFears.length - 1]);
    }
  };

  // Separate fears into categories for display
  const adventureFears = commonFears.filter(fear => [
    'Extreme Heights', 'Deep Ocean', 'Wilderness Survival', 'Rock Climbing', 
    'Skydiving', 'Scuba Diving', 'White Water Rafting', 'Solo Travel',
    'Cliff Jumping', 'Bungee Jumping', 'Paragliding'
  ].includes(fear));
  
  const commonGeneralFears = commonFears.filter(fear => 
    !adventureFears.includes(fear)
  ).slice(0, 5);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px] bg-white">
        {selectedFears.map((fear) => (
          <div 
            key={fear} 
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            <span>{fear}</span>
            <button
              type="button"
              onClick={() => removeFear(fear)}
              className="rounded-full hover:bg-blue-200 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          id="fearInput"
          name="fearInput"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedFears.length === 0 ? "Add fears you want to overcome" : ""}
          className="flex-grow min-w-[120px] outline-none text-sm py-1"
        />
      </div>
      
      {suggestions.length > 0 && (
        <div className="mt-1 p-2 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => addFear(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-1">Common fears:</p>
        <div className="flex flex-wrap gap-1">
          {commonGeneralFears.map((fear) => (
            !selectedFears.includes(fear) && (
              <button
                key={fear}
                type="button"
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700"
                onClick={() => addFear(fear)}
              >
                + {fear}
              </button>
            )
          ))}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-1">Adventure-related fears:</p>
        <div className="flex flex-wrap gap-1">
          {adventureFears.slice(0, 7).map((fear) => (
            !selectedFears.includes(fear) && (
              <button
                key={fear}
                type="button"
                className="px-2 py-1 bg-green-50 hover:bg-green-100 rounded-full text-xs text-green-700"
                onClick={() => addFear(fear)}
              >
                + {fear}
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default FearTagSelector;
