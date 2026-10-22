export type Continent = 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';

export type AIPersonality = 'expansionist' | 'diplomat' | 'turtle' | 'opportunist' | 'coalition_builder';

export interface Country {
  id: string; // ISO 2/3 code
  name: string;
  flag: string; // Emoji flag or code
  continent: Continent;
  capital: string;
  coords: { x: number; y: number }; // Normalized 0..1000, 0..600 map coordinate
  color: string;
  initialPower: number;
  initialEco: number;
  population: number; // in Millions
  leader: string;
  leaderTitle: string;
  aiPersonality: AIPersonality;
  
  // Dynamic Game State
  isAlive: boolean;
  territorySize: number;
  power: number;
  economy: number;
  morale: number;
  alliances: string[]; // List of country IDs
  pacts: string[]; // Non-aggression pact IDs
  rivals: string[];
  controlledBy: string | null; // Country ID if annexed
  annexedNations: string[]; // List of absorbed country names
  viewerVotes: number;
  viewerAid: number;
  hasShield: boolean;
  shieldSecondsLeft: number;
  radiationLevel: number; // 0..100
  battlesWon: number;
  statusMessage: string;
}

export interface BattleClimax {
  id: string;
  roundNumber: number;
  attackerId: string;
  defenderId: string;
  attackerAlliance: string[];
  defenderAlliance: string[];
  attackerBasePower: number;
  defenderBasePower: number;
  attackerVoteBoost: number;
  defenderVoteBoost: number;
  attackerFinalPower: number;
  defenderFinalPower: number;
  winnerId: string | null;
  loserId: string | null;
  territoryTransferred: number;
  casualties: number;
  state: 'countdown' | 'clash' | 'victory_celebration';
  countdownSeconds: number;
  headline: string;
  aiBroadcastNarrative: string;
}

export interface GeopoliticalEvent {
  id: string;
  simTimeSeconds: number;
  type: 'conquest' | 'alliance' | 'betrayal' | 'nuke' | 'aid' | 'revolt' | 'sanction' | 'vote_surge';
  title: string;
  description: string;
  actorId: string;
  targetId?: string;
  importance: 'critical' | 'high' | 'normal';
}

export interface ChatMessage {
  id: string;
  simTime: string;
  sender: string;
  avatarColor: string;
  badge?: 'MEMBER' | 'MOD' | 'SUPER_CHAT';
  superChatAmount?: string;
  text: string;
  commandTriggered?: {
    type: 'vote' | 'aid' | 'nuke' | 'shield' | 'revolt' | 'alliance' | 'meteor';
    countryName: string;
    secondCountryName?: string;
    result: string;
  };
}

export type SimulationSpeed = 1 | 2 | 5 | 10 | 30;

export interface MapParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'nuke_cloud' | 'laser' | 'confetti';
}

export interface TroopMarch {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0 to 1
  color: string;
  flag: string;
  size: number;
  attackerName: string;
}
