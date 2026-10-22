import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Country } from '../types';
import { Send, Sparkles, MessageSquare, Shield, Flame, ThumbsUp, DollarSign, ChevronRight, ChevronLeft } from 'lucide-react';

interface LiveChatOverlayProps {
  messages: ChatMessage[];
  onSendCommand: (text: string) => { success: boolean; feedback: string };
  countries: Country[];
  selectedCountry: Country | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  streamMode?: boolean;
}

export const LiveChatOverlay: React.FC<LiveChatOverlayProps> = ({
  messages,
  onSendCommand,
  countries,
  selectedCountry,
  isOpen,
  onToggleOpen,
  streamMode = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const res = onSendCommand(inputText);
    setInputText('');
    setFeedback(res.feedback);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleQuickCommand = (cmd: string) => {
    const targetName = selectedCountry ? selectedCountry.name : 'United States';
    const text = `!${cmd} ${targetName}`;
    const res = onSendCommand(text);
    setFeedback(res.feedback);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Top voted countries
  const topVoted = [...countries]
    .filter((c) => c.viewerVotes > 0)
    .sort((a, b) => b.viewerVotes - a.viewerVotes)
    .slice(0, 3);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed bottom-14 right-4 z-40 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
        title="Open YouTube Live Chat"
      >
        <MessageSquare className="w-4 h-4 text-red-500" />
        <span className="hidden sm:inline">Live Chat Triggers</span>
      </button>
    );
  }

  return (
    <aside
      className={`fixed top-14 bottom-10 right-0 z-40 w-80 sm:w-96 flex flex-col bg-slate-950/95 backdrop-blur-md border-l border-slate-800 text-slate-100 shadow-2xl transition-transform duration-200 ${
        streamMode ? 'bg-slate-950/80 border-slate-800/60' : ''
      }`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-red-500" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            YouTube Live Chat
          </span>
          <span className="text-[10px] font-mono-numbers text-slate-400">
            ({messages.length} msgs)
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          title="Minimize Chat"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Voted Crowd Favorites Banner */}
      {topVoted.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-cyan-400" /> Top Votes:
          </span>
          <div className="flex items-center gap-2">
            {topVoted.map((c) => (
              <span key={c.id} className="font-mono-numbers text-slate-300 font-semibold">
                {c.flag} {c.name.slice(0, 8)} ({c.viewerVotes})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs font-sans">
        {messages.map((msg) => {
          const isSuperChat = msg.badge === 'SUPER_CHAT';

          if (isSuperChat) {
            return (
              <div
                key={msg.id}
                className="bg-gradient-to-r from-amber-950/70 to-red-950/70 border border-amber-600/60 rounded-lg p-2.5 shadow-md"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                      style={{ backgroundColor: msg.avatarColor }}
                    >
                      $
                    </span>
                    <span className="font-bold text-amber-300">{msg.sender}</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono-numbers px-1.5 py-0.2 rounded font-bold">
                    {msg.superChatAmount || '$5.00'}
                  </span>
                </div>
                <div className="text-amber-100 font-medium">{msg.text}</div>
                {msg.commandTriggered && (
                  <div className="mt-1 text-[10px] text-amber-300/90 font-mono-numbers">
                    ⚡ {msg.commandTriggered.result}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2 leading-tight">
              <span className="text-[10px] font-mono-numbers text-slate-500 shrink-0 mt-0.5">
                {msg.simTime}
              </span>

              <div className="flex-1 min-w-0">
                <span
                  className="font-bold mr-1.5 cursor-pointer hover:underline"
                  style={{ color: msg.avatarColor }}
                >
                  {msg.sender}
                </span>

                {msg.badge === 'MOD' && (
                  <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-[9px] px-1 py-0.2 rounded mr-1.5 font-bold uppercase">
                    MOD
                  </span>
                )}
                {msg.badge === 'MEMBER' && (
                  <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-[9px] px-1 py-0.2 rounded mr-1.5 font-bold uppercase">
                    MEMBER
                  </span>
                )}

                <span className="text-slate-300 break-words">{msg.text}</span>

                {msg.commandTriggered && (
                  <div className="mt-0.5 text-[10px] text-cyan-400 font-mono-numbers">
                    ⚡ {msg.commandTriggered.result}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Interactive Command Buttons */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-900/40">
        <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
          <span>Quick Triggers {selectedCountry ? `(${selectedCountry.flag} ${selectedCountry.name})` : '(US)'}:</span>
          <span className="text-[9px] text-slate-500">Click to run</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handleQuickCommand('vote')}
            className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Vote for country (+4 combat roll boost)"
          >
            <ThumbsUp className="w-2.5 h-2.5" /> !vote
          </button>
          <button
            onClick={() => handleQuickCommand('aid')}
            className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Drop military aid (+10 power)"
          >
            <Sparkles className="w-2.5 h-2.5" /> !aid
          </button>
          <button
            onClick={() => handleQuickCommand('shield')}
            className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 text-blue-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Deploy 3-min Iron Dome Shield"
          >
            <Shield className="w-2.5 h-2.5" /> !shield
          </button>
          <button
            onClick={() => handleQuickCommand('nuke')}
            className="px-2 py-1 bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Launch tactical warhead"
          >
            <Flame className="w-2.5 h-2.5" /> !nuke
          </button>
          <button
            onClick={() => handleQuickCommand('revolt')}
            className="px-2 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Trigger independence rebellion if annexed"
          >
            !revolt
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-950">
        {feedback && (
          <div className="mb-1.5 px-2 py-1 bg-blue-950/90 border border-blue-700/60 text-blue-200 text-[10px] rounded font-mono-numbers">
            {feedback}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type !vote, !aid, !nuke, !shield..."
            className="flex-1 bg-slate-900 border border-slate-700/70 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
            title="Send Chat Command"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};
