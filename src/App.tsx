/**
 * Global Hegemony - 100-Minute Flags Battle Royale Simulation
 * Automatic 100-minute simulation with 3-minute conquest rounds,
 * AI geopolitical agents, royalty-free audio, and live chat event triggers for YouTube streaming.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GeopoliticalSimulation, SimulationState } from './simulation/geopoliticalEngine';
import { ChatTriggerEngine } from './simulation/chatTriggerEngine';
import { ChatMessage, Country, SimulationSpeed } from './types';
import { soundEngine } from './audio/soundEngine';

import { WorldCanvasMap } from './components/WorldCanvasMap';
import { MatchClockHeader } from './components/MatchClockHeader';
import { LiveChatOverlay } from './components/LiveChatOverlay';
import { BattleClimaxModal } from './components/BattleClimaxModal';
import { CountryDossierModal } from './components/CountryDossierModal';
import { AudioControlsModal } from './components/AudioControlsModal';
import { StreamerToolsModal } from './components/StreamerToolsModal';
import { VictoryModal } from './components/VictoryModal';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { TitleScreen } from './components/TitleScreen';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // UI state
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isStreamerModalOpen, setIsStreamerModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [streamMode, setStreamMode] = useState<boolean>(false);

  // References to simulation and chat engines
  const simRef = useRef<GeopoliticalSimulation | null>(null);
  const chatRef = useRef<ChatTriggerEngine | null>(null);

  // Initialize engines on mount
  useEffect(() => {
    const simulation = new GeopoliticalSimulation((newState) => {
      setSimState({ ...newState });
    });

    const chatEngine = new ChatTriggerEngine(simulation, (newMessages) => {
      setChatMessages([...newMessages]);
    });

    simRef.current = simulation;
    chatRef.current = chatEngine;
    setSimState({ ...simulation.state });

    return () => {
      simulation.pause();
      chatEngine.stopAutoChat();
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept while typing in chat
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!hasStarted) {
          handleStartSimulation();
        } else if (simRef.current) {
          if (simRef.current.state.isRunning) {
            simRef.current.pause();
          } else {
            simRef.current.start();
          }
        }
      } else if (e.code === 'Escape') {
        setSelectedCountryId(null);
        setIsAudioModalOpen(false);
        setIsStreamerModalOpen(false);
      } else if (e.key === 'm' || e.key === 'M') {
        soundEngine.toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        setStreamMode((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        if (simRef.current) {
          simRef.current.triggerMajorConquestRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted]);

  const handleStartSimulation = () => {
    setHasStarted(true);
    if (simRef.current) {
      simRef.current.start();
    }
  };

  const handleTogglePlay = () => {
    if (!simRef.current) return;
    if (simRef.current.state.isRunning) {
      simRef.current.pause();
    } else {
      simRef.current.start();
    }
  };

  const handleSetSpeed = (speed: SimulationSpeed) => {
    if (simRef.current) {
      simRef.current.setSpeed(speed);
    }
  };

  const handleForceBattle = () => {
    if (simRef.current) {
      simRef.current.triggerMajorConquestRound();
    }
  };

  const handleTargetedBattle = (targetId: string) => {
    if (simRef.current) {
      const alive = simRef.current.state.countries.filter((c) => c.isAlive && c.id !== targetId);
      if (alive.length > 0) {
        const opponent = alive[Math.floor(Math.random() * alive.length)];
        simRef.current.triggerMajorConquestRound(opponent.id, targetId);
      }
    }
    setSelectedCountryId(null);
  };

  const handleChatCommandFromDossier = (
    cmd: 'vote' | 'aid' | 'nuke' | 'shield' | 'revolt'
  ) => {
    if (!simRef.current || !selectedCountry) return;
    simRef.current.handleChatCommand(cmd, selectedCountry.name);
  };

  const handleRestart = () => {
    if (simRef.current) {
      simRef.current.reset();
      simRef.current.start();
    }
  };

  if (!simState) {
    return <div className="w-screen h-screen bg-slate-950 text-white flex items-center justify-center">Loading flags battle simulation...</div>;
  }

  const selectedCountry = selectedCountryId
    ? simState.countries.find((c) => c.id === selectedCountryId) || null
    : null;

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-sans select-none">
      {/* Title Screen Overlay */}
      {!hasStarted && (
        <TitleScreen
          onStart={handleStartSimulation}
          onOpenGuide={() => setIsStreamerModalOpen(true)}
        />
      )}

      {/* Top Match Clock & Broadcast Header */}
      <MatchClockHeader
        simSecondsElapsed={simState.simSecondsElapsed}
        totalDurationSeconds={simState.totalDurationSeconds}
        isRunning={simState.isRunning}
        speed={simState.speed}
        onTogglePlay={handleTogglePlay}
        onSetSpeed={handleSetSpeed}
        onForceBattle={handleForceBattle}
        countries={simState.countries}
        roundCounter={simState.roundCounter}
        streamMode={streamMode}
        onToggleStreamMode={() => setStreamMode(!streamMode)}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenHelpModal={() => setIsStreamerModalOpen(true)}
      />

      {/* Main Interactive World Map Viewport (60fps Canvas) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <WorldCanvasMap
          countries={simState.countries}
          activeBattle={simState.activeBattle}
          selectedCountryId={selectedCountryId}
          onSelectCountry={(id) => setSelectedCountryId(id)}
          streamMode={streamMode}
        />

        {/* Live Chat Overlay (Interactive YouTube Stream Triggers) */}
        <LiveChatOverlay
          messages={chatMessages}
          onSendCommand={(text) => {
            if (chatRef.current) {
              return chatRef.current.sendUserCommand(text);
            }
            return { success: false, feedback: 'Chat engine offline.' };
          }}
          countries={simState.countries}
          selectedCountry={selectedCountry}
          isOpen={isChatOpen}
          onToggleOpen={() => setIsChatOpen(!isChatOpen)}
          streamMode={streamMode}
        />
      </main>

      {/* Bottom TV-Style Breaking News Flash Ticker */}
      <BreakingNewsTicker
        events={simState.events}
        onOpenEventHistory={() => setIsStreamerModalOpen(true)}
      />

      {/* 3-Minute Major Conquest Climax Modal */}
      {simState.activeBattle && (
        <BattleClimaxModal
          battle={simState.activeBattle}
          countries={simState.countries}
          onDismiss={() => {
            if (simRef.current) {
              simRef.current.state.activeBattle = null;
            }
          }}
        />
      )}

      {/* Country Strategic Dossier Modal */}
      {selectedCountry && (
        <CountryDossierModal
          country={selectedCountry}
          onClose={() => setSelectedCountryId(null)}
          onExecuteCommand={handleChatCommandFromDossier}
          onTriggerTargetedBattle={handleTargetedBattle}
          allCountries={simState.countries}
        />
      )}

      {/* Royalty-Free Audio Controls Modal */}
      {isAudioModalOpen && (
        <AudioControlsModal onClose={() => setIsAudioModalOpen(false)} />
      )}

      {/* Streamer Tools & YouTube Guide Modal */}
      {isStreamerModalOpen && (
        <StreamerToolsModal onClose={() => setIsStreamerModalOpen(false)} />
      )}

      {/* Final 100-Minute Winner Victory Ceremony */}
      {simState.winner && (
        <VictoryModal winner={simState.winner} onRestart={handleRestart} />
      )}
    </div>
  );
}
