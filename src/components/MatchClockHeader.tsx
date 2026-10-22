import React from 'react';
import { SimulationSpeed, Country } from '../types';
import { Play, Pause, FastForward, Volume2, VolumeX, Radio, Swords, Eye, HelpCircle } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface MatchClockHeaderProps {
  simSecondsElapsed: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  speed: SimulationSpeed;
  onTogglePlay: () => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
  onForceBattle: () => void;
  countries: Country[];
  roundCounter: number;
  streamMode: boolean;
  onToggleStreamMode: () => void;
  onOpenAudioModal: () => void;
  onOpenHelpModal: () => void;
}

export const MatchClockHeader: React.FC<MatchClockHeaderProps> = ({
  simSecondsElapsed,
  totalDurationSeconds,
  isRunning,
  speed,
  onTogglePlay,
  onSetSpeed,
  onForceBattle,
  countries,
  roundCounter,
  streamMode,
  onToggleStreamMode,
  onOpenAudioModal,
  onOpenHelpModal,
}) => {
  // 100-Minute countdown
  const secondsRemaining = Math.max(0, totalDurationSeconds - simSecondsElapsed);
  const matchMins = Math.floor(secondsRemaining / 60);
  const matchSecs = secondsRemaining % 60;
  const matchTimeFormatted = `${String(matchMins).padStart(2, '0')}:${String(matchSecs).padStart(2, '0')}`;

  // 3-Minute (180s) battle interval countdown
  const battleCycleProgress = simSecondsElapsed % 180;
  const battleSecondsUntilNext = 180 - battleCycleProgress;
  const battleMins = Math.floor(battleSecondsUntilNext / 60);
  const battleSecs = battleSecondsUntilNext % 60;
  const nextBattleFormatted = `${String(battleMins).padStart(2, '0')}:${String(battleSecs).padStart(2, '0')}`;

  // Active sovereign count & leading empire
  const aliveCountries = countries.filter((c) => c.isAlive);
  const sortedByTerritory = [...aliveCountries].sort(
    (a, b) => b.territorySize * 2 + b.power - (a.territorySize * 2 + a.power)
  );
  const leadingEmpire = sortedByTerritory[0];

  const isWarningSoon = battleSecondsUntilNext <= 15;

  return (
    <header className="relative z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 text-slate-100 select-none shadow-lg">
      {/* Brand & Live Streamer Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            GLOBAL HEGEMONY
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono-numbers bg-red-950/60 border border-red-800/50 text-red-300 font-semibold uppercase tracking-wider">
          <Radio className="w-3 h-3 text-red-400 animate-pulse" />
          <span>YouTube Live Ready</span>
        </div>
      </div>

      {/* Central Timers Cluster */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* 100-Min Match Clock */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            100-Min Match Clock
          </span>
          <div className="font-mono-numbers text-xl sm:text-2xl font-black text-white tracking-wider">
            {matchTimeFormatted}
          </div>
        </div>

        {/* 3-Minute Major Conquest Countdown */}
        <div
          className={`flex items-center gap-2.5 px-3 py-1 rounded-lg border transition-all ${
            isWarningSoon
              ? 'bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-500/20 animate-pulse text-amber-200'
              : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
          }`}
        >
          <Swords className={`w-4 h-4 ${isWarningSoon ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              {isWarningSoon ? 'Conquest Imminent!' : 'Next 3-Min Conquest'}
            </span>
            <span className="font-mono-numbers text-base sm:text-lg font-bold text-amber-400">
              {nextBattleFormatted}
            </span>
          </div>
        </div>

        {/* Global Hegemon Leader */}
        {leadingEmpire && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-xl">{leadingEmpire.flag}</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Leading Power
              </span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
                {leadingEmpire.name}
              </span>
            </div>
            <span className="font-mono-numbers text-xs font-semibold text-emerald-400 ml-1">
              {leadingEmpire.territorySize} pts
            </span>
          </div>
        )}
      </div>

      {/* Primary Actions & Streamer Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title={isRunning ? 'Pause Simulation' : 'Start Simulation'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Start Simulation'}</span>
        </button>

        {/* Speed Selector */}
        {!streamMode && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md">
            {([1, 2, 5, 10, 30] as SimulationSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-0.5 text-[11px] font-mono-numbers rounded transition-colors ${
                  speed === s
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Simulation Speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}

        {/* Force 3-Min Battle Button */}
        <button
          onClick={onForceBattle}
          className="px-2.5 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow transition-colors"
          title="Force an instant 3-Minute Conquest battle round"
        >
          <Swords className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Force Conquest</span>
        </button>

        {/* Audio Mixer Modal Toggle */}
        <button
          onClick={onOpenAudioModal}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Royalty-Free Audio Mixer"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Stream Overlay Mode Toggle */}
        <button
          onClick={onToggleStreamMode}
          className={`p-1.5 rounded-md transition-colors ${
            streamMode
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={streamMode ? 'Exit OBS Clean Overlay Mode' : 'OBS Clean Stream Overlay Mode'}
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Commands & Rules Help */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Interactive Chat Commands & Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
