import React from 'react';
import { Slider } from './slider';
import { Label } from './label';

interface SliderPickerProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number[];
  onChange: (value: number[]) => void;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
  formatValue?: (value: number) => string;
}

export const SliderPicker: React.FC<SliderPickerProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  minLabel,
  maxLabel,
  className = '',
  formatValue = (val) => val.toString(),
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {formatValue(value[0])}
          {value.length > 1 && ` - ${formatValue(value[1])}`}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onChange}
      />
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>{minLabel || min}</span>
          <span>{maxLabel || max}</span>
        </div>
      )}
    </div>
  );
};
