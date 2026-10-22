import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { X, Volume2, VolumeX, ShieldCheck, Play, Mic, Music, Bell } from 'lucide-react';

interface AudioControlsModalProps {
  onClose: () => void;
}

export const AudioControlsModal: React.FC<AudioControlsModalProps> = ({ onClose }) => {
  const [master, setMaster] = useState(soundEngine.masterVolume);
  const [music, setMusic] = useState(soundEngine.musicVolume);
  const [sfx, setSfx] = useState(soundEngine.sfxVolume);
  const [announcer, setAnnouncer] = useState(soundEngine.announcerVolume);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [announcerEnabled, setAnnouncerEnabled] = useState(soundEngine.announcerEnabled);

  const handleMasterChange = (val: number) => {
    setMaster(val);
    soundEngine.setMasterVolume(val);
  };

  const handleMusicChange = (val: number) => {
    setMusic(val);
    soundEngine.setMusicVolume(val);
  };

  const handleSfxChange = (val: number) => {
    setSfx(val);
    soundEngine.setSfxVolume(val);
  };

  const handleAnnouncerChange = (val: number) => {
    setAnnouncer(val);
    soundEngine.announcerVolume = val;
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAnnouncer = () => {
    soundEngine.announcerEnabled = !announcerEnabled;
    setAnnouncerEnabled(!announcerEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-display text-white">
              AI Sound Engine & Broadcast Mixer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* YouTube Safe Copyright-Free Badge */}
        <div className="mb-5 p-2.5 bg-emerald-950/60 border border-emerald-700/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white">100% Royalty-Free & Stream Safe</span>
            <div className="text-[11px] text-emerald-300/80">
              Generated in real-time via Web Audio oscillators & Web Speech synthesis. Zero copyright strikes on YouTube!
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs font-medium">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Master Volume</span>
              <span className="font-mono-numbers text-slate-400">{Math.round(master * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={master}
              onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Procedural Music */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-blue-400" /> Procedural War Drums & BGM
              </span>
              <span className="font-mono-numbers text-slate-400">{Math.round(music * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={music}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Sound Effects */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-red-400" /> Sound FX (Sirens, Explosions, Fanfares)
              </span>
              <span className="font-mono-numbers text-slate-400">{Math.round(sfx * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfx}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
          </div>

          {/* AI Announcer Voice */}
          <div>
            <div className="flex justify-between items-center text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" /> AI Announcer Voice
              </span>
              <button
                onClick={handleToggleAnnouncer}
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  announcerEnabled
                    ? 'bg-purple-900 text-purple-200 border border-purple-700'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {announcerEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={announcer}
              disabled={!announcerEnabled}
              onChange={(e) => handleAnnouncerChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Test Audio Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 mb-2 font-bold uppercase tracking-wider">
            Test Sound FX:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => soundEngine.playAirRaidSiren()}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
            >
              Air Raid Siren
            </button>
            <button
              onClick={() => soundEngine.playArtilleryExplosion()}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
            >
              Artillery Blast
            </button>
            <button
              onClick={() => soundEngine.playVictoryFanfare()}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
            >
              Victory Trumpets
            </button>
            <button
              onClick={() => soundEngine.speak('Attention live stream viewers! 3-minute conquest countdown initiated!')}
              className="py-1.5 px-2 bg-purple-900/60 hover:bg-purple-800 rounded text-purple-200 transition-colors"
            >
              Test AI Voice
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Unmute All' : 'Mute All'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
