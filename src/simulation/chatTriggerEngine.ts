import { ChatMessage, Country } from '../types';
import { GeopoliticalSimulation } from './geopoliticalEngine';

export interface ChatEngineListener {
  (messages: ChatMessage[]): void;
}

const SAMPLE_VIEWER_NAMES = [
  'GeoStreamer99',
  'FlagWatcher24',
  'HistoryBuff_Alex',
  'TokyoKnight',
  'ParisianGamer',
  'RioDefender',
  'MapEnthusiast',
  'EmpireWatcher',
  'DiplomatDan',
  'SuperStrat_Gamer',
  'BorderLineFan',
  'VoterSupreme',
  'TacticalAce',
  'ObserverX',
  'NordicShield',
];

const AVATAR_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
];

export class ChatTriggerEngine {
  private messages: ChatMessage[] = [];
  private simulation: GeopoliticalSimulation;
  private listener: ChatEngineListener;
  private autoChatTimer: number | null = null;

  constructor(simulation: GeopoliticalSimulation, listener: ChatEngineListener) {
    this.simulation = simulation;
    this.listener = listener;
    this.initWelcomeMessages();
    this.startAutoChat();
  }

  private initWelcomeMessages() {
    this.messages = [
      {
        id: 'msg-0',
        simTime: '00:01',
        sender: 'NightBot',
        avatarColor: '#3B82F6',
        badge: 'MOD',
        text: '🔥 Welcome to 100-Minute Flags Battle Royale! Every 3 mins a country wins/annexes another. Type !vote [Country], !aid [Country], !nuke [Country], !shield [Country] to trigger live map events!',
      },
      {
        id: 'msg-1',
        simTime: '00:03',
        sender: 'GlobalAdmin',
        avatarColor: '#10B981',
        badge: 'MOD',
        text: 'Royalty-free procedural AI synth audio is active. 100% YouTube stream safe! Enjoy the stream!',
      },
    ];
    this.listener([...this.messages]);
  }

  public startAutoChat() {
    if (this.autoChatTimer !== null) return;
    this.scheduleNextAutoChat();
  }

  public stopAutoChat() {
    if (this.autoChatTimer !== null) {
      window.clearTimeout(this.autoChatTimer);
      this.autoChatTimer = null;
    }
  }

  private scheduleNextAutoChat() {
    // Generate a simulated chat message every 3-6 seconds
    const delay = 2500 + Math.random() * 3000;
    this.autoChatTimer = window.setTimeout(() => {
      this.generateSimulatedMessage();
      this.scheduleNextAutoChat();
    }, delay);
  }

  private generateSimulatedMessage() {
    if (!this.simulation.state.isRunning) return;

    const countries = this.simulation.state.countries.filter((c) => c.isAlive);
    if (countries.length === 0) return;

    const country = countries[Math.floor(Math.random() * countries.length)];
    const sender = SAMPLE_VIEWER_NAMES[Math.floor(Math.random() * SAMPLE_VIEWER_NAMES.length)];
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const simMinutes = Math.floor(this.simulation.state.simSecondsElapsed / 60);
    const simSecs = this.simulation.state.simSecondsElapsed % 60;
    const timeStr = `${String(simMinutes).padStart(2, '0')}:${String(simSecs).padStart(2, '0')}`;

    const roll = Math.random();

    if (roll < 0.45) {
      // Viewer triggers a !vote command
      const cmdResult = this.simulation.handleChatCommand('vote', country.name);
      this.addMessage({
        id: `chat-${Date.now()}-${Math.random()}`,
        simTime: timeStr,
        sender,
        avatarColor,
        text: `Let's go ${country.flag} ${country.name}!! !vote ${country.name}`,
        commandTriggered: {
          type: 'vote',
          countryName: country.name,
          result: cmdResult.message,
        },
      });
    } else if (roll < 0.65) {
      // General commentary
      const comments = [
        `Look at ${country.name}'s territory expansion! Huge moves`,
        `Next 3-minute conquest round is going to be intense!!`,
        `Who do you think takes Europe?`,
        `The map looks insane right now`,
        `Loving the procedural war synth music, so hype`,
        `${country.name} leader is playing 4D chess`,
        `Don't let them take the capital!`,
      ];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      this.addMessage({
        id: `chat-${Date.now()}-${Math.random()}`,
        simTime: timeStr,
        sender,
        avatarColor,
        text: comment,
      });
    } else if (roll < 0.8) {
      // Super Chat with Aid or Shield!
      const isAid = Math.random() < 0.5;
      const cmdType = isAid ? 'aid' : 'shield';
      const cmdResult = this.simulation.handleChatCommand(cmdType, country.name);

      this.addMessage({
        id: `chat-${Date.now()}-${Math.random()}`,
        simTime: timeStr,
        sender,
        avatarColor,
        badge: 'SUPER_CHAT',
        superChatAmount: `$${(Math.floor(Math.random() * 4) + 1) * 5}.00`,
        text: `${country.name} must survive! Sending support: !${cmdType} ${country.name}`,
        commandTriggered: {
          type: cmdType,
          countryName: country.name,
          result: cmdResult.message,
        },
      });
    } else if (roll < 0.95) {
      // Tactical viewer !aid
      const cmdResult = this.simulation.handleChatCommand('aid', country.name);
      this.addMessage({
        id: `chat-${Date.now()}-${Math.random()}`,
        simTime: timeStr,
        sender,
        avatarColor,
        badge: 'MEMBER',
        text: `Emergency supplies incoming! !aid ${country.name}`,
        commandTriggered: {
          type: 'aid',
          countryName: country.name,
          result: cmdResult.message,
        },
      });
    }
  }

  public sendUserCommand(text: string): { success: boolean; feedback: string } {
    const trimmed = text.trim();
    if (!trimmed) return { success: false, feedback: 'Please type a command or message.' };

    const simMinutes = Math.floor(this.simulation.state.simSecondsElapsed / 60);
    const simSecs = this.simulation.state.simSecondsElapsed % 60;
    const timeStr = `${String(simMinutes).padStart(2, '0')}:${String(simSecs).padStart(2, '0')}`;

    if (trimmed.startsWith('!')) {
      const parts = trimmed.slice(1).split(' ');
      const command = parts[0].toLowerCase();
      const target1 = parts[1];
      const target2 = parts[2];

      if (['vote', 'aid', 'nuke', 'shield', 'revolt', 'alliance', 'meteor'].includes(command)) {
        const cmdType = command as 'vote' | 'aid' | 'nuke' | 'shield' | 'revolt' | 'alliance' | 'meteor';
        const res = this.simulation.handleChatCommand(cmdType, target1, target2);

        this.addMessage({
          id: `chat-${Date.now()}`,
          simTime: timeStr,
          sender: 'You (Streamer / Viewer)',
          avatarColor: '#F59E0B',
          badge: 'MOD',
          text: trimmed,
          commandTriggered: {
            type: cmdType,
            countryName: target1,
            secondCountryName: target2,
            result: res.message,
          },
        });

        return { success: res.success, feedback: res.message };
      }
    }

    // Regular chat message
    this.addMessage({
      id: `chat-${Date.now()}`,
      simTime: timeStr,
      sender: 'You',
      avatarColor: '#10B981',
      badge: 'MOD',
      text: trimmed,
    });

    return { success: true, feedback: 'Message sent to stream chat.' };
  }

  private addMessage(msg: ChatMessage) {
    this.messages.push(msg);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
    this.listener([...this.messages]);
  }
}
