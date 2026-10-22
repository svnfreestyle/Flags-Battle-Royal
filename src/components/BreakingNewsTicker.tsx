import React from 'react';
import { GeopoliticalEvent } from '../types';
import { Radio } from 'lucide-react';

interface BreakingNewsTickerProps {
  events: GeopoliticalEvent[];
  onOpenEventHistory?: () => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ events, onOpenEventHistory }) => {
  const latestEvents = events.slice(0, 8);

  return (
    <div
      onClick={onOpenEventHistory}
      className="fixed bottom-0 left-0 right-0 z-30 h-9 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center px-3 text-xs text-slate-200 select-none cursor-pointer hover:bg-slate-900 transition-colors shadow-2xl"
      title="Click to view full geopolitical event history"
    >
      {/* Broadcast Flash Badge */}
      <div className="flex items-center gap-1.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 mr-3 shadow-sm">
        <Radio className="w-3 h-3 text-white animate-pulse" />
        <span>BREAKING FLASH</span>
      </div>

      {/* Ticker Stream */}
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="inline-flex items-center gap-6 animate-marquee">
          {latestEvents.map((evt) => (
            <span key={evt.id} className="inline-flex items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-white">{evt.title}:</span>
              <span className="text-slate-400">{evt.description}</span>
              <span className="text-slate-600 mx-2">///</span>
            </span>
          ))}
          {latestEvents.length === 0 && (
            <span className="text-slate-500">Global forces in position. Monitoring worldwide borders...</span>
          )}
        </div>
      </div>
    </div>
  );
};
