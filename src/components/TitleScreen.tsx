import React from 'react';
import { Play, Swords, ShieldCheck, Youtube, Radio, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onOpenGuide }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Floating Flag Insignias Banner */}
      <div className="flex items-center gap-3 text-3xl sm:text-4xl mb-6 opacity-80 animate-pulse">
        <span>🇺🇸</span>
        <span>🇯🇵</span>
        <span>🇧🇷</span>
        <span>🇬🇧</span>
        <span>🇩🇪</span>
        <span>🇮🇳</span>
        <span>🇫🇷</span>
        <span>🇨🇦</span>
        <span>🇦🇺</span>
      </div>

      {/* Bespoke SVG Title Lockup */}
      <div className="text-center max-w-2xl mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-700/50 rounded-full text-xs font-mono-numbers text-red-300 font-bold uppercase tracking-wider mb-4">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Automatic 100-Minute Flags Simulation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-none mb-4">
          GLOBAL <span className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">HEGEMONY</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 font-medium max-w-lg mx-auto">
          AI agents simulate world conflicts. Every 3 minutes a nation conquers another in a climactic showdown. Powered by royalty-free synth audio and live YouTube chat event triggers.
        </p>
      </div>

      {/* Key Features Pill Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full mb-8 z-10">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
          <div className="text-amber-400 font-black text-lg font-mono-numbers">100 MINS</div>
          <div className="text-[11px] text-slate-400 font-medium">Automatic World Battle Clock</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
          <div className="text-red-400 font-black text-lg font-mono-numbers">EVERY 3 MIN</div>
          <div className="text-[11px] text-slate-400 font-medium">Conquest Climax & Annexation</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
          <div className="text-emerald-400 font-black text-lg font-mono-numbers">100% ROYALTY-FREE</div>
          <div className="text-[11px] text-slate-400 font-medium">YouTube Safe AI Audio & Voice</div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
        <button
          onClick={onStart}
          className="w-56 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START SIMULATION</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="w-56 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>STREAMER GUIDE</span>
        </button>
      </div>

      {/* Control Hint Line */}
      <div className="mt-8 text-xs text-slate-500 font-mono-numbers z-10">
        Space / Click to Start · Real-time OBS Stream Ready · Live Chat Triggers Active
      </div>
    </div>
  );
};
