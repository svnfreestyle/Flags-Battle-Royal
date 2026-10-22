import React from 'react';
import { X, Youtube, Radio, Swords, ShieldCheck, HelpCircle } from 'lucide-react';

interface StreamerToolsModalProps {
  onClose: () => void;
}

export const StreamerToolsModal: React.FC<StreamerToolsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-bold font-display text-white">
              YouTube Streamer Guide & Chat Commands
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Stream Safe Notice */}
          <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-xl flex items-start gap-3">
            <Radio className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">How to Stream on YouTube</div>
              <p className="text-slate-300 mt-1">
                Open OBS or Streamlabs. Add a <strong>Window Capture</strong> or <strong>Browser Source</strong> targeting this applet. Click the <strong>Eye icon</strong> in the top header to enable <strong>OBS Clean Stream Mode</strong>, which expands the map and places chat overlay cleanly on screen.
              </p>
            </div>
          </div>

          {/* Sound & Music YouTube Guarantee */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-200 text-sm">100% Royalty-Free AI Audio Guarantee</div>
              <p className="text-emerald-300/80 mt-1">
                All background war music (cinematic percussion, bass drones, brass horns) and sound effects (air raid sirens, explosions, victory trumpets) are generated <em>procedurally</em> via the Web Audio API. No recorded music files are used. You can monetize and stream without copyright claims!
              </p>
            </div>
          </div>

          {/* 100-Minute & 3-Minute Battle Rules */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
              <Swords className="w-4 h-4 text-amber-400" /> Match Structure & 3-Minute Conquests
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>Total Duration:</strong> 100 Minutes (6,000 seconds). Match culminates in crowning 1 Global Hegemon.</li>
              <li><strong>Every 3 Minutes (180s):</strong> A major conquest round triggers! Air raid sirens wail, 2 nations clash, viewer votes are tabulated, and the victor annexes the loser's territory!</li>
              <li><strong>Territory Expansion:</strong> When a country wins, its flag and borders swallow the conquered nation's map area.</li>
              <li><strong>Simulation Speed:</strong> Use 1x for genuine 100-minute YouTube streams, or 5x/10x/30x for rapid testing.</li>
            </ul>
          </div>

          {/* Chat Commands Reference Table */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2">
              Interactive Viewer Chat Commands
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden font-mono-numbers">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-[11px]">
                  <tr>
                    <th className="p-2">Command</th>
                    <th className="p-2">Effect</th>
                    <th className="p-2">Bonus / Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr>
                    <td className="p-2 font-bold text-cyan-300">!vote [Country]</td>
                    <td className="p-2 text-slate-300">Boosts country in next 3-min battle</td>
                    <td className="p-2 text-cyan-400">+4 Combat Roll</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-emerald-300">!aid [Country]</td>
                    <td className="p-2 text-slate-300">Airdrops emergency military resources</td>
                    <td className="p-2 text-emerald-400">+10 Power / +15 Morale</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-blue-300">!shield [Country]</td>
                    <td className="p-2 text-slate-300">Deploys orbital Iron Dome defense</td>
                    <td className="p-2 text-blue-400">180s Invulnerability</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-red-300">!nuke [Country]</td>
                    <td className="p-2 text-slate-300">Detonates tactical warhead</td>
                    <td className="p-2 text-red-400">-35 Power & Radiation</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-purple-300">!revolt [Country]</td>
                    <td className="p-2 text-slate-300">Sparks independence for annexed nation</td>
                    <td className="p-2 text-purple-400">Reclaims Sovereignty</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-amber-300">!alliance [C1] [C2]</td>
                    <td className="p-2 text-slate-300">Forces diplomatic defense coalition</td>
                    <td className="p-2 text-amber-400">Mutual Defense</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Got It, Let's Stream!
          </button>
        </div>
      </div>
    </div>
  );
};
