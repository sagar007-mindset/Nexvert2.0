import React from 'react';
import { Check } from 'lucide-react';

interface TargetFormatSelectorProps {
  formats: string[];
  selectedFormat: string;
  onChange: (format: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function TargetFormatSelector({
  formats,
  selectedFormat,
  onChange,
  label = 'Target Output Format',
  disabled = false,
}: TargetFormatSelectorProps) {
  if (!formats || formats.length === 0) return null;

  return (
    <div className="space-y-2.5 text-left w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block font-mono">
          {label}
        </label>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 font-mono">
          {formats.length} {formats.length === 1 ? 'Supported Format' : 'Supported Formats'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {formats.map((fmt) => {
          const isSelected = selectedFormat.toUpperCase() === fmt.toUpperCase();
          return (
            <button
              key={fmt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(fmt)}
              className={`relative px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer min-h-[44px] select-none ${
                isSelected
                  ? 'bg-red-600 dark:bg-[#b93c3c] text-white shadow-md shadow-red-200/50 dark:shadow-none ring-2 ring-red-600/30'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
              <span>{fmt.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
