import { Country, BattleClimax, GeopoliticalEvent, SimulationSpeed } from '../types';
import { INITIAL_COUNTRIES } from '../data/countries';
import { soundEngine } from '../audio/soundEngine';

export const TOTAL_SIMULATION_SECONDS = 100 * 60; // 100 minutes = 6,000 seconds
export const BATTLE_INTERVAL_SECONDS = 3 * 60; // Every 3 minutes = 180 seconds

export interface SimulationState {
  simSecondsElapsed: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  speed: SimulationSpeed;
  countries: Country[];
  activeBattle: BattleClimax | null;
  battleHistory: BattleClimax[];
  events: GeopoliticalEvent[];
  roundCounter: number;
  winner: Country | null;
}

export class GeopoliticalSimulation {
  public state: SimulationState;
  private timerId: number | null = null;
  private onStateChange: (state: SimulationState) => void;
  private nextBattleTime: number = BATTLE_INTERVAL_SECONDS;

  constructor(onStateChange: (state: SimulationState) => void) {
    this.onStateChange = onStateChange;
    this.state = this.getInitialState();
  }

  private getInitialState(): SimulationState {
    return {
      simSecondsElapsed: 0,
      totalDurationSeconds: TOTAL_SIMULATION_SECONDS,
      isRunning: false,
      speed: 1,
      countries: JSON.parse(JSON.stringify(INITIAL_COUNTRIES)),
      activeBattle: null,
      battleHistory: [],
      events: [
        {
          id: 'init-1',
          simTimeSeconds: 0,
          type: 'alliance',
          title: 'Simulation Initialized',
          description: '100-Minute automated flags battle began. Major conquest rounds scheduled every 3 minutes.',
          actorId: 'US',
          importance: 'high',
        },
      ],
      roundCounter: 0,
      winner: null,
    };
  }

  public start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    soundEngine.startMusic();
    this.runLoop();
    this.notify();
  }

  public pause() {
    this.state.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    soundEngine.stopMusic();
    this.notify();
  }

  public reset() {
    this.pause();
    this.state = this.getInitialState();
    this.nextBattleTime = BATTLE_INTERVAL_SECONDS;
    this.notify();
  }

  public setSpeed(speed: SimulationSpeed) {
    this.state.speed = speed;
    this.notify();
  }

  private runLoop() {
    if (!this.state.isRunning) return;

    // Tick duration in milliseconds (real-world)
    // At 1x speed, 1 real second = 1 sim second
    const stepMs = 1000 / this.state.speed;

    this.timerId = window.setTimeout(() => {
      this.tick();
      if (this.state.isRunning) {
        this.runLoop();
      }
    }, Math.max(20, stepMs));
  }

  public tick() {
    if (this.state.winner) return;

    this.state.simSecondsElapsed += 1;

    // Check match completion
    if (this.state.simSecondsElapsed >= this.state.totalDurationSeconds) {
      this.concludeMatch();
      return;
    }

    // Update ongoing battle if active
    if (this.state.activeBattle) {
      this.tickBattle();
    } else {
      // Background AI diplomacy and tensions
      this.simulateAIDiplomacy();

      // Check if it's time for the 3-minute major conquest
      if (this.state.simSecondsElapsed >= this.nextBattleTime) {
        this.triggerMajorConquestRound();
        this.nextBattleTime = this.state.simSecondsElapsed + BATTLE_INTERVAL_SECONDS;
      }
    }

    // Tick country shields and radiation
    this.tickCountryModifiers();

    // Check alive countries count
    const aliveCountries = this.state.countries.filter((c) => c.isAlive);
    if (aliveCountries.length === 1) {
      this.state.winner = aliveCountries[0];
      soundEngine.playVictoryFanfare();
      soundEngine.speak(`Global Domination Achieved! ${aliveCountries[0].name} has conquered the entire planet!`);
      this.pause();
    }

    this.notify();
  }

  private tickCountryModifiers() {
    this.state.countries.forEach((c) => {
      if (c.hasShield) {
        c.shieldSecondsLeft -= 1;
        if (c.shieldSecondsLeft <= 0) {
          c.hasShield = false;
          c.shieldSecondsLeft = 0;
        }
      }
      if (c.radiationLevel > 0) {
        c.radiationLevel = Math.max(0, c.radiationLevel - 0.2);
      }
    });
  }

  // --- 3-MINUTE MAJOR CONQUEST BATTLE ---

  public triggerMajorConquestRound(forceAttackerId?: string, forceDefenderId?: string) {
    if (this.state.activeBattle) return; // Battle already in progress

    const alive = this.state.countries.filter((c) => c.isAlive);
    if (alive.length < 2) return;

    let attacker: Country;
    let defender: Country;

    if (forceAttackerId && forceDefenderId) {
      attacker = alive.find((c) => c.id === forceAttackerId) || alive[0];
      defender = alive.find((c) => c.id === forceDefenderId) || alive[1];
    } else {
      // Pick dynamic rivals or geographically close nations with tension
      // Or highest voted / highest power nation attacking another
      const sortedByVotes = [...alive].sort((a, b) => b.viewerVotes - a.viewerVotes);
      if (sortedByVotes[0].viewerVotes > 0 && Math.random() < 0.6) {
        attacker = sortedByVotes[0];
      } else {
        attacker = alive[Math.floor(Math.random() * alive.length)];
      }

      // Pick defender: prefer rival or neighbor or random
      const possibleDefenders = alive.filter((c) => c.id !== attacker.id && !attacker.alliances.includes(c.id));
      if (possibleDefenders.length > 0) {
        defender = possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
      } else {
        defender = alive.filter((c) => c.id !== attacker.id)[0];
      }
    }

    if (!attacker || !defender || attacker.id === defender.id) return;

    this.state.roundCounter += 1;

    // Siren and audio cue
    soundEngine.playAirRaidSiren();
    soundEngine.setIntensity('battle');

    const battle: BattleClimax = {
      id: `battle-${Date.now()}`,
      roundNumber: this.state.roundCounter,
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerAlliance: attacker.alliances.filter((id) => this.state.countries.find((c) => c.id === id)?.isAlive),
      defenderAlliance: defender.alliances.filter((id) => this.state.countries.find((c) => c.id === id)?.isAlive),
      attackerBasePower: attacker.power,
      defenderBasePower: defender.power,
      attackerVoteBoost: attacker.viewerVotes * 4,
      defenderVoteBoost: defender.viewerVotes * 4,
      attackerFinalPower: 0,
      defenderFinalPower: 0,
      winnerId: null,
      loserId: null,
      territoryTransferred: 0,
      casualties: 0,
      state: 'countdown',
      countdownSeconds: 8, // 8-second dramatic windup
      headline: `Round ${this.state.roundCounter} Conquest: ${attacker.name} vs. ${defender.name}!`,
      aiBroadcastNarrative: `Geopolitical alert! ${attacker.name} launches an all-out conquest campaign against ${defender.name}! Chat votes are modifying combat rolls!`,
    };

    this.state.activeBattle = battle;
    soundEngine.speak(`Emergency Broadcast! Major battle underway: ${attacker.name} against ${defender.name}!`);

    this.addEvent({
      simTimeSeconds: this.state.simSecondsElapsed,
      type: 'conquest',
      title: `3-Minute Climax: ${attacker.name} vs ${defender.name}`,
      description: `War sirens sound across ${defender.continent}! Viewer votes: ${attacker.name} (${attacker.viewerVotes}) vs ${defender.name} (${defender.viewerVotes}).`,
      actorId: attacker.id,
      targetId: defender.id,
      importance: 'critical',
    });

    this.notify();
  }

  private tickBattle() {
    const battle = this.state.activeBattle;
    if (!battle) return;

    if (battle.state === 'countdown') {
      battle.countdownSeconds -= 1;
      if (battle.countdownSeconds <= 0) {
        battle.state = 'clash';
        soundEngine.playArtilleryExplosion();
      }
    } else if (battle.state === 'clash') {
      // Calculate outcome
      const attacker = this.state.countries.find((c) => c.id === battle.attackerId)!;
      const defender = this.state.countries.find((c) => c.id === battle.defenderId)!;

      const attackerRoll = attacker.power * (0.8 + Math.random() * 0.4) + battle.attackerVoteBoost + attacker.viewerAid * 2;
      const defenderRoll =
        defender.power * (0.8 + Math.random() * 0.4) +
        battle.defenderVoteBoost +
        defender.viewerAid * 2 +
        (defender.hasShield ? 40 : 0);

      battle.attackerFinalPower = Math.round(attackerRoll);
      battle.defenderFinalPower = Math.round(defenderRoll);

      let winner: Country;
      let loser: Country;

      if (attackerRoll >= defenderRoll) {
        winner = attacker;
        loser = defender;
      } else {
        winner = defender;
        loser = attacker;
      }

      battle.winnerId = winner.id;
      battle.loserId = loser.id;
      battle.territoryTransferred = Math.min(100, Math.round(loser.territorySize * 0.8 + 15));
      battle.casualties = Math.round((loser.population * 0.05 + 1.2) * 10) / 10;

      // Annexation / Conquest execution
      loser.isAlive = false;
      loser.controlledBy = winner.id;
      winner.territorySize += loser.territorySize;
      winner.annexedNations.push(loser.name, ...loser.annexedNations);
      winner.battlesWon += 1;
      winner.power = Math.min(120, Math.round(winner.power * 0.95 + loser.power * 0.4 + 5));
      winner.morale = Math.min(100, winner.morale + 10);
      winner.statusMessage = `Annexed ${loser.name}! Expanding global borders.`;

      // Clear loser's alliances
      loser.statusMessage = `Fallen under ${winner.name} dominion.`;

      battle.state = 'victory_celebration';
      battle.aiBroadcastNarrative = `VICTORY! ${winner.name} has decisively annexed ${loser.name} in Round ${battle.roundNumber}! ${winner.name} absorbs their territory and flags!`;

      soundEngine.playVictoryFanfare();
      soundEngine.speak(`Decisive victory! ${winner.name} has annexed ${loser.name}! The map has shifted!`);

      this.addEvent({
        simTimeSeconds: this.state.simSecondsElapsed,
        type: 'conquest',
        title: `${winner.name} Annexes ${loser.name}!`,
        description: `${winner.name} scored ${Math.max(battle.attackerFinalPower, battle.defenderFinalPower)} pts. ${loser.name} is now a sovereign territory under ${winner.name}!`,
        actorId: winner.id,
        targetId: loser.id,
        importance: 'critical',
      });
    } else if (battle.state === 'victory_celebration') {
      // Close battle after celebration
      this.state.battleHistory.unshift({ ...battle });
      this.state.activeBattle = null;
      soundEngine.setIntensity('peace');
    }
  }

  // --- BACKGROUND AI DIPLOMACY ---

  private simulateAIDiplomacy() {
    // Fire dynamic diplomatic move every ~15-20 seconds
    if (this.state.simSecondsElapsed % 16 !== 0) return;

    const alive = this.state.countries.filter((c) => c.isAlive);
    if (alive.length < 2) return;

    const actor = alive[Math.floor(Math.random() * alive.length)];
    const roll = Math.random();

    if (roll < 0.35) {
      // Form Alliance
      const candidates = alive.filter((c) => c.id !== actor.id && !actor.alliances.includes(c.id));
      if (candidates.length > 0) {
        const partner = candidates[Math.floor(Math.random() * candidates.length)];
        actor.alliances.push(partner.id);
        partner.alliances.push(actor.id);
        actor.statusMessage = `Signed defense treaty with ${partner.name}.`;
        partner.statusMessage = `Formed mutual defense pact with ${actor.name}.`;

        soundEngine.playTreatyChime();
        this.addEvent({
          simTimeSeconds: this.state.simSecondsElapsed,
          type: 'alliance',
          title: `Treaty Formed: ${actor.name} & ${partner.name}`,
          description: `AI diplomats agreed to a bilateral defensive alliance to counter rising regional threats.`,
          actorId: actor.id,
          targetId: partner.id,
          importance: 'high',
        });
      }
    } else if (roll < 0.6) {
      // Economic buildup & power increase
      actor.power = Math.min(100, actor.power + Math.floor(Math.random() * 3) + 1);
      actor.morale = Math.min(100, actor.morale + 2);
      actor.statusMessage = 'Upgrading sovereign defense grid.';
    } else if (roll < 0.8) {
      // Diplomatic sanction or betrayal
      if (actor.alliances.length > 0 && Math.random() < 0.4) {
        const betrayedId = actor.alliances.pop()!;
        const betrayed = this.state.countries.find((c) => c.id === betrayedId);
        if (betrayed) {
          betrayed.alliances = betrayed.alliances.filter((id) => id !== actor.id);
          this.addEvent({
            simTimeSeconds: this.state.simSecondsElapsed,
            type: 'betrayal',
            title: `Pact Dissolved: ${actor.name} Leaves ${betrayed.name}`,
            description: `${actor.name}'s AI leader unilaterally withdrew from their military pact over strategic disagreements.`,
            actorId: actor.id,
            targetId: betrayed.id,
            importance: 'high',
          });
        }
      }
    }
  }

  // --- LIVE CHAT TRIGGER HANDLERS ---

  public handleChatCommand(
    command: 'vote' | 'aid' | 'nuke' | 'shield' | 'revolt' | 'alliance' | 'meteor',
    targetCountryName: string,
    secondCountryName?: string
  ): { success: boolean; message: string } {
    const findCountry = (query: string) => {
      const q = query.trim().toLowerCase();
      return this.state.countries.find(
        (c) => c.name.toLowerCase() === q || c.id.toLowerCase() === q || c.name.toLowerCase().includes(q)
      );
    };

    const target = findCountry(targetCountryName);

    if (!target) {
      return { success: false, message: `Country "${targetCountryName}" not found.` };
    }

    if (command === 'vote') {
      target.viewerVotes += 1;
      soundEngine.playVoteCheer();
      this.addEvent({
        simTimeSeconds: this.state.simSecondsElapsed,
        type: 'vote_surge',
        title: `Chat Vote Surge: ${target.name}`,
        description: `Live viewers cast votes for ${target.name}! (+4 battle bonus for next conquest).`,
        actorId: target.id,
        importance: 'normal',
      });
      this.notify();
      return { success: true, message: `Voted for ${target.name}! Current votes: ${target.viewerVotes}` };
    }

    if (command === 'aid') {
      target.viewerAid += 1;
      target.power = Math.min(120, target.power + 10);
      target.morale = Math.min(100, target.morale + 15);
      soundEngine.playTreatyChime();
      this.addEvent({
        simTimeSeconds: this.state.simSecondsElapsed,
        type: 'aid',
        title: `Viewer Aid Dropped for ${target.name}`,
        description: `Military airlift dispatched! Power boosted to ${target.power}.`,
        actorId: target.id,
        importance: 'high',
      });
      this.notify();
      return { success: true, message: `Military aid dispatched to ${target.name}! Power +10.` };
    }

    if (command === 'shield') {
      target.hasShield = true;
      target.shieldSecondsLeft = 180; // 3 minutes
      soundEngine.playTreatyChime();
      this.addEvent({
        simTimeSeconds: this.state.simSecondsElapsed,
        type: 'aid',
        title: `Iron Dome Shield Activated: ${target.name}`,
        description: `Chat viewers erected an orbital defense shield for 3 minutes!`,
        actorId: target.id,
        importance: 'high',
      });
      this.notify();
      return { success: true, message: `${target.name} shielded for 180 seconds!` };
    }

    if (command === 'nuke') {
      target.radiationLevel = 100;
      target.power = Math.max(10, target.power - 35);
      target.morale = Math.max(20, target.morale - 40);
      soundEngine.playNukeDetonation();
      soundEngine.speak(`Tactical nuclear strike confirmed! ${target.name} has suffered major fallout!`);
      this.addEvent({
        simTimeSeconds: this.state.simSecondsElapsed,
        type: 'nuke',
        title: `TACTICAL STRIKE on ${target.name}!`,
        description: `Viewer chat detonated a tactical warhead! Severe fallout and power reduction.`,
        actorId: target.id,
        importance: 'critical',
      });
      this.notify();
      return { success: true, message: `Nuke detonated in ${target.name}! -35 Power.` };
    }

    if (command === 'revolt') {
      if (!target.isAlive && target.controlledBy) {
        const formerMaster = this.state.countries.find((c) => c.id === target.controlledBy);
        target.isAlive = true;
        target.controlledBy = null;
        target.power = 60;
        target.morale = 95;
        if (formerMaster) {
          formerMaster.annexedNations = formerMaster.annexedNations.filter((n) => n !== target.name);
          formerMaster.territorySize = Math.max(20, formerMaster.territorySize - target.territorySize);
        }
        soundEngine.playVictoryFanfare();
        soundEngine.speak(`Breaking News! ${target.name} has revolted and reclaimed national independence!`);
        this.addEvent({
          simTimeSeconds: this.state.simSecondsElapsed,
          type: 'revolt',
          title: `INDEPENDENCE REVOLT: ${target.name}!`,
          description: `Popular revolution reclaimed ${target.name}'s sovereignty from former occupier!`,
          actorId: target.id,
          importance: 'critical',
        });
        this.notify();
        return { success: true, message: `${target.name} has revolted and restored independence!` };
      } else {
        return { success: false, message: `${target.name} is already sovereign and not annexed.` };
      }
    }

    if (command === 'alliance' && secondCountryName) {
      const target2 = findCountry(secondCountryName);
      if (target2 && target.id !== target2.id) {
        if (!target.alliances.includes(target2.id)) {
          target.alliances.push(target2.id);
          target2.alliances.push(target.id);
          soundEngine.playTreatyChime();
          this.addEvent({
            simTimeSeconds: this.state.simSecondsElapsed,
            type: 'alliance',
            title: `Chat-Mandated Treaty: ${target.name} + ${target2.name}`,
            description: `Stream viewers forced a grand coalition between ${target.name} and ${target2.name}!`,
            actorId: target.id,
            targetId: target2.id,
            importance: 'high',
          });
          this.notify();
          return { success: true, message: `Allied ${target.name} and ${target2.name}!` };
        }
      }
    }

    return { success: false, message: 'Invalid command or parameters.' };
  }

  private addEvent(event: Omit<GeopoliticalEvent, 'id'> | GeopoliticalEvent) {
    const fullEvent: GeopoliticalEvent = {
      id: 'id' in event ? event.id : `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...event,
    };
    this.state.events.unshift(fullEvent);
    if (this.state.events.length > 50) {
      this.state.events.pop();
    }
  }

  private concludeMatch() {
    // 100 minutes reached! The nation with highest territory & power wins
    const alive = this.state.countries.filter((c) => c.isAlive);
    alive.sort((a, b) => b.territorySize * 2 + b.power - (a.territorySize * 2 + a.power));
    this.state.winner = alive[0];
    soundEngine.playVictoryFanfare();
    soundEngine.speak(`100-Minute match complete! ${alive[0].name} reigns supreme as the Global Hegemon!`);
    this.pause();
  }

  private notify() {
    this.onStateChange({ ...this.state });
  }
}
