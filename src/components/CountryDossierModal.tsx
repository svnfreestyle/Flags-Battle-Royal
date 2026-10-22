import React from 'react';
import { Country } from '../types';
import { X, Shield, Swords, ThumbsUp, Sparkles, Flame, RotateCcw, Users, Globe2, Crown } from 'lucide-react';

interface CountryDossierModalProps {
  country: Country;
  onClose: () => void;
  onExecuteCommand: (cmd: 'vote' | 'aid' | 'nuke' | 'shield' | 'revolt') => void;
  onTriggerTargetedBattle: (targetId: string) => void;
  allCountries: Country[];
}

export const CountryDossierModal: React.FC<CountryDossierModalProps> = ({
  country,
  onClose,
  onExecuteCommand,
  onTriggerTargetedBattle,
  allCountries,
}) => {
  const overlord = country.controlledBy
    ? allCountries.find((c) => c.id === country.controlledBy)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow">{country.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">{country.name}</h2>
                <span className="text-xs font-mono-numbers px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                  {country.id}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {country.capital} · {country.continent} · {country.population}M Population
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-md ${
              country.isAlive
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-red-950 text-red-300 border border-red-700/60'
            }`}
          >
            {country.isAlive ? '✓ Sovereign Nation' : `✗ Annexed by ${overlord?.name || 'Empire'}`}
          </span>

          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
            Leader: {country.leaderTitle} {country.leader} ({country.aiPersonality})
          </span>

          {country.hasShield && (
            <span className="px-2.5 py-1 text-xs font-bold bg-blue-950 text-blue-300 border border-blue-700/60 rounded-md flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Shielded ({country.shieldSecondsLeft}s)
            </span>
          )}

          {country.radiationLevel > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold bg-green-950 text-green-300 border border-green-700/60 rounded-md">
              ☢️ Radiation: {Math.round(country.radiationLevel)}%
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 font-mono-numbers text-center">
          <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Military</div>
            <div className="text-lg font-bold text-amber-400">{country.power}</div>
          </div>
          <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Territory</div>
            <div className="text-lg font-bold text-emerald-400">{country.territorySize}</div>
          </div>
          <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Morale</div>
            <div className="text-lg font-bold text-blue-400">{country.morale}%</div>
          </div>
          <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Chat Votes</div>
            <div className="text-lg font-bold text-cyan-400">{country.viewerVotes}</div>
          </div>
        </div>

        {/* Annexation History */}
        {country.annexedNations.length > 0 && (
          <div className="mb-4 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs">
            <div className="text-amber-300 font-bold flex items-center gap-1 mb-1">
              <Crown className="w-3.5 h-3.5" /> Conquered Territories ({country.annexedNations.length}):
            </div>
            <div className="text-slate-300 font-medium">
              {country.annexedNations.join(', ')}
            </div>
          </div>
        )}

        {/* Alliances List */}
        <div className="mb-4 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
          <div className="text-slate-400 font-bold mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Diplomatic Alliances:
          </div>
          <div className="flex flex-wrap gap-1">
            {country.alliances.length > 0 ? (
              country.alliances.map((allyId) => {
                const ally = allCountries.find((c) => c.id === allyId);
                return (
                  <span
                    key={allyId}
                    className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]"
                  >
                    {ally?.flag} {ally?.name || allyId}
                  </span>
                );
              })
            ) : (
              <span className="text-slate-500 italic">No active formal treaties</span>
            )}
          </div>
        </div>

        {/* Live Interactive Viewer Commands on this Country */}
        <div className="border-t border-slate-800 pt-3">
          <div className="text-xs font-bold text-slate-300 mb-2">
            Trigger Live Action on {country.name}:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => onExecuteCommand('vote')}
              className="py-1.5 px-2 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <ThumbsUp className="w-3 h-3" /> !vote (+4)
            </button>
            <button
              onClick={() => onExecuteCommand('aid')}
              className="py-1.5 px-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" /> !aid (+10)
            </button>
            <button
              onClick={() => onExecuteCommand('shield')}
              className="py-1.5 px-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3" /> !shield
            </button>
            <button
              onClick={() => onExecuteCommand('nuke')}
              className="py-1.5 px-2 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Flame className="w-3 h-3" /> !nuke (-35)
            </button>
          </div>

          {!country.isAlive && (
            <button
              onClick={() => onExecuteCommand('revolt')}
              className="w-full mt-2 py-1.5 bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Trigger Independence Revolt (!revolt)
            </button>
          )}

          {country.isAlive && (
            <button
              onClick={() => onTriggerTargetedBattle(country.id)}
              className="w-full mt-2 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <Swords className="w-3.5 h-3.5" /> Force 3-Min Conquest Involving {country.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
