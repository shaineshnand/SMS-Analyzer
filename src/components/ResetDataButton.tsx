import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetDataButtonProps {
  onReset: () => void;
  disabled?: boolean;
  dayCount?: number;
  variant?: 'full' | 'compact';
}

export const ResetDataButton: React.FC<ResetDataButtonProps> = ({
  onReset,
  disabled = false,
  dayCount = 0,
  variant = 'full',
}) => {
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    onReset();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-rose-700 font-medium">
          Wipe {dayCount.toLocaleString()} day{dayCount === 1 ? '' : 's'} and start over?
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
        >
          Yes, reset
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-40"
      >
        Reset all data
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold disabled:opacity-40"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Reset all data
    </button>
  );
};
