import React from 'react';
import { Country } from '../types';
import { Trophy, Crown, RotateCcw, Swords, Globe2 } from 'lucide-react';

interface VictoryModalProps {
  winner: Country;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl shadow-2xl p-8 text-slate-100 text-center">
        {/* Crown & Trophy Icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>

        <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1">
          100-Minute Flags Battle Royale Champion
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight mb-2">
          GLOBAL HEGEMONY ACHIEVED!
        </h1>

        <div className="my-6 p-4 bg-slate-900/90 border border-amber-500/40 rounded-2xl">
          <span className="text-7xl block mb-2">{winner.flag}</span>
          <h2 className="text-2xl font-bold text-white">{winner.name}</h2>
          <div className="text-xs text-amber-300 font-semibold mb-3">
            {winner.leaderTitle} {winner.leader} · Supreme Sovereign
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono-numbers text-xs pt-3 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Territories</span>
              <span className="font-bold text-emerald-400 text-base">{winner.territorySize} pts</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Nations Annexed</span>
              <span className="font-bold text-amber-400 text-base">{winner.annexedNations.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Chat Support</span>
              <span className="font-bold text-cyan-400 text-base">{winner.viewerVotes} votes</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-6 italic">
          "From the ashes of the 100-minute global conflict, {winner.name} united the world under a single banner. All rival empires have sworn fealty."
        </p>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Start New 100-Minute Flags Battle
        </button>
      </div>
    </div>
  );
};
