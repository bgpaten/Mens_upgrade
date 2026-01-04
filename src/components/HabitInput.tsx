import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface HabitInputProps {
  habit: Habit;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export default function HabitInput({ habit, value, onChange, disabled }: HabitInputProps) {
  const { inputType, config, name } = habit;

  // Boolean input (checkbox)
  if (inputType === 'boolean') {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="font-medium">{name}</span>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-6 h-6 rounded-md bg-white/10 border-white/20 checked:bg-blue-400 disabled:opacity-50"
        />
      </div>
    );
  }

  // Number input
  if (inputType === 'number') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/40">
          {name}
          {config?.unit && <span className="ml-1">({config.unit})</span>}
        </label>
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={config?.min}
          max={config?.max}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        />
      </div>
    );
  }

  // Time input
  if (inputType === 'time') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/40">{name}</label>
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        />
      </div>
    );
  }

  // Rating input (1-5 or 1-10)
  if (inputType === 'rating') {
    const min = config?.min || 1;
    const max = config?.max || 5;
    const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-white/40">{name}</label>
        <div className="flex justify-between gap-2">
          {options.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              disabled={disabled}
              className={cn(
                "flex-1 py-3 rounded-xl border transition-all disabled:opacity-50",
                value === val
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Text input
  if (inputType === 'text') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/40">{name}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config?.placeholder}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        />
      </div>
    );
  }

  // Select input
  if (inputType === 'select') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/40">{name}</label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        >
          <option value="">Select...</option>
          {config?.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Photo input (placeholder for now, will implement upload later)
  if (inputType === 'photo') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/40">{name}</label>
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-white/20" />
          <p className="text-sm text-white/40">Photo upload coming soon</p>
        </div>
      </div>
    );
  }

  return null;
}
