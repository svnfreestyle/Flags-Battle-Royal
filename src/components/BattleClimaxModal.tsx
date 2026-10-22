import React from 'react';
import { BattleClimax, Country } from '../types';
import { Swords, Trophy, Shield, Flame, ThumbsUp, X } from 'lucide-react';

interface BattleClimaxModalProps {
  battle: BattleClimax;
  countries: Country[];
  onDismiss: () => void;
}

export const BattleClimaxModal: React.FC<BattleClimaxModalProps> = ({
  battle,
  countries,
  onDismiss,
}) => {
  const attacker = countries.find((c) => c.id === battle.attackerId);
  const defender = countries.find((c) => c.id === battle.defenderId);

  if (!attacker || !defender) return null;

  const winner = battle.winnerId ? countries.find((c) => c.id === battle.winnerId) : null;
  const loser = battle.loserId ? countries.find((c) => c.id === battle.loserId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-600/70 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" /> 3-Minute Major Conquest
            </span>
            <span className="font-mono-numbers text-xs text-slate-400">
              Round #{battle.roundNumber}
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Headline */}
        <h2 className="text-xl sm:text-2xl font-black text-center font-display tracking-tight text-white mb-6">
          {battle.headline}
        </h2>

        {/* The VS Clash Arena */}
        <div className="grid grid-cols-11 items-center gap-2 mb-6">
          {/* Attacker Card (5 cols) */}
          <div
            className={`col-span-5 p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              winner?.id === attacker.id
                ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <span className="text-5xl sm:text-6xl mb-2 drop-shadow-md">{attacker.flag}</span>
            <h3 className="font-bold text-base sm:text-lg text-white">{attacker.name}</h3>
            <span className="text-[11px] text-slate-400 mb-3">
              {attacker.leaderTitle} {attacker.leader}
            </span>

            <div className="w-full space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between px-2 py-1 bg-slate-950/60 rounded">
                <span className="text-slate-400">Base Power:</span>
                <span className="font-bold text-amber-400">{battle.attackerBasePower}</span>
              </div>
              <div className="flex justify-between px-2 py-1 bg-slate-950/60 rounded">
                <span className="text-cyan-400 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Chat Votes:
                </span>
                <span className="font-bold text-cyan-300">+{battle.attackerVoteBoost}</span>
              </div>
              {battle.attackerFinalPower > 0 && (
                <div className="flex justify-between px-2 py-1 bg-red-950/60 rounded border border-red-700/50">
                  <span className="text-red-300 font-bold">Final Roll:</span>
                  <span className="font-black text-white text-sm">{battle.attackerFinalPower}</span>
                </div>
              )}
            </div>

            {winner?.id === attacker.id && (
              <div className="mt-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Conquered!
              </div>
            )}
          </div>

          {/* VS Center Pillar (1 col) */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {battle.state === 'countdown' ? (
              <div className="flex flex-col items-center">
                <span className="font-mono-numbers text-2xl sm:text-3xl font-black text-amber-400 animate-pulse">
                  {battle.countdownSeconds}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">SEC</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center font-black text-sm text-red-300 animate-spin-slow">
                VS
              </div>
            )}
          </div>

          {/* Defender Card (5 cols) */}
          <div
            className={`col-span-5 p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
              winner?.id === defender.id
                ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <span className="text-5xl sm:text-6xl mb-2 drop-shadow-md">{defender.flag}</span>
            <h3 className="font-bold text-base sm:text-lg text-white">{defender.name}</h3>
            <span className="text-[11px] text-slate-400 mb-3">
              {defender.leaderTitle} {defender.leader}
            </span>

            <div className="w-full space-y-1.5 font-mono-numbers text-xs">
              <div className="flex justify-between px-2 py-1 bg-slate-950/60 rounded">
                <span className="text-slate-400">Base Power:</span>
                <span className="font-bold text-amber-400">{battle.defenderBasePower}</span>
              </div>
              <div className="flex justify-between px-2 py-1 bg-slate-950/60 rounded">
                <span className="text-cyan-400 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Chat Votes:
                </span>
                <span className="font-bold text-cyan-300">+{battle.defenderVoteBoost}</span>
              </div>
              {defender.hasShield && (
                <div className="flex justify-between px-2 py-1 bg-blue-950/60 rounded border border-blue-700/50">
                  <span className="text-blue-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Iron Dome:
                  </span>
                  <span className="font-bold text-blue-200">+40 Defense</span>
                </div>
              )}
              {battle.defenderFinalPower > 0 && (
                <div className="flex justify-between px-2 py-1 bg-red-950/60 rounded border border-red-700/50">
                  <span className="text-red-300 font-bold">Final Roll:</span>
                  <span className="font-black text-white text-sm">{battle.defenderFinalPower}</span>
                </div>
              )}
            </div>

            {winner?.id === defender.id && (
              <div className="mt-3 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Repelled & Conquered!
              </div>
            )}
          </div>
        </div>

        {/* Narrative Broadcast Ticker */}
        <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg text-center text-xs text-slate-300 italic mb-4">
          🎙️ {battle.aiBroadcastNarrative}
        </div>

        {/* Resolution details if victory concluded */}
        {winner && loser && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-lg flex items-center justify-between text-xs text-emerald-200 font-mono-numbers">
            <div>
              <span className="font-bold text-white">{winner.name}</span> annexed{' '}
              <span className="font-bold text-slate-300">{loser.name}</span>
            </div>
            <div>
              Territory Absorbed: <span className="text-emerald-400 font-bold">+{battle.territoryTransferred} pts</span>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onDismiss}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Return to World Map
          </button>
        </div>
      </div>
    </div>
  );
};
