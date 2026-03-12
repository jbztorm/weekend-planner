import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  marks?: { value: number; label: string }[];
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, marks, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            className={cn(
              'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]',
              className
            )}
            {...props}
          />
          {marks && (
            <div className="flex justify-between mt-2">
              {marks.map((mark) => (
                <span key={mark.value} className="text-xs text-gray-500">
                  {mark.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
