import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Country, BattleClimax, MapParticle, TroopMarch } from '../types';

interface WorldCanvasMapProps {
  countries: Country[];
  activeBattle: BattleClimax | null;
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
  streamMode?: boolean;
}

export const WorldCanvasMap: React.FC<WorldCanvasMapProps> = ({
  countries,
  activeBattle,
  selectedCountryId,
  onSelectCountry,
  streamMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pan and Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tooltip hover state
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Particles and animations pool
  const particlesRef = useRef<MapParticle[]>([]);
  const troopsRef = useRef<TroopMarch[]>([]);
  const missileArcRef = useRef<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    progress: number;
  } | null>(null);

  // Trigger battle animations whenever activeBattle changes
  useEffect(() => {
    if (!activeBattle) {
      missileArcRef.current = null;
      return;
    }

    const attacker = countries.find((c) => c.id === activeBattle.attackerId);
    const defender = countries.find((c) => c.id === activeBattle.defenderId);

    if (attacker && defender) {
      missileArcRef.current = {
        fromX: attacker.coords.x,
        fromY: attacker.coords.y,
        toX: defender.coords.x,
        toY: defender.coords.y,
        progress: 0,
      };

      // Spawn marching troop battalions
      const troops: TroopMarch = {
        id: `troop-${Date.now()}`,
        fromX: attacker.coords.x,
        fromY: attacker.coords.y,
        toX: defender.coords.x,
        toY: defender.coords.y,
        progress: 0,
        color: attacker.color,
        flag: attacker.flag,
        size: 16,
        attackerName: attacker.name,
      };
      troopsRef.current.push(troops);
    }

    if (activeBattle.state === 'clash' && defender) {
      // Spawn explosion shockwaves & debris
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        particlesRef.current.push({
          id: Math.random(),
          x: defender.coords.x,
          y: defender.coords.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.4 ? '#F59E0B' : '#EF4444',
          size: 3 + Math.random() * 5,
          life: 1,
          maxLife: 40 + Math.random() * 20,
          type: 'spark',
        });
      }

      // Add shockwave ring
      particlesRef.current.push({
        id: Math.random(),
        x: defender.coords.x,
        y: defender.coords.y,
        vx: 0,
        vy: 0,
        color: '#F97316',
        size: 6,
        life: 1,
        maxLife: 50,
        type: 'shockwave',
      });
    }
  }, [activeBattle?.state, activeBattle?.roundNumber]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Resize dynamically to parent container
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Deep dark tactical background
      const oceanGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      oceanGrad.addColorStop(0, '#0a1020');
      oceanGrad.addColorStop(1, '#030712');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // Apply zoom & pan transformation
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Virtual map coordinate space: 1000 x 600
      const scaleX = width / 1000;
      const scaleY = height / 600;
      const baseScale = Math.min(scaleX, scaleY);

      // Center map in viewport
      const offsetX = (width - 1000 * baseScale) / 2;
      const offsetY = (height - 600 * baseScale) / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(baseScale, baseScale);

      // 1. Draw Lat/Long subtle coordinate grid
      drawWorldGrid(ctx);

      // 2. Draw Diplomatic Alliance Links
      drawAllianceLines(ctx, countries);

      // 3. Draw Active War Fronts
      if (activeBattle) {
        drawActiveWarFront(ctx, activeBattle, countries);
      }

      // 4. Draw Sovereign Country Territory Circles & Influence Zones
      drawTerritories(ctx, countries, selectedCountryId);

      // 5. Draw Missile Trajectories
      drawMissileArc(ctx);

      // 6. Draw Marching Troops
      drawTroopMarches(ctx);

      // 7. Update and Draw Particles
      drawParticles(ctx);

      // 8. Draw Country Capitals & Flag Badges
      drawCountryBadges(ctx, countries, selectedCountryId);

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [countries, activeBattle, selectedCountryId, zoom, pan]);

  // Coordinate Grid
  const drawWorldGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= 1000; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }

    for (let y = 0; y <= 600; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }

    // Equator highlight
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(1000, 300);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Alliance Links
  const drawAllianceLines = (ctx: CanvasRenderingContext2D, countryList: Country[]) => {
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);

    const drawnPairs = new Set<string>();

    countryList.forEach((c1) => {
      if (!c1.isAlive) return;
      c1.alliances.forEach((c2Id) => {
        const c2 = countryList.find((c) => c.id === c2Id);
        if (!c2 || !c2.isAlive) return;

        const pairKey = [c1.id, c2.id].sort().join('-');
        if (drawnPairs.has(pairKey)) return;
        drawnPairs.add(pairKey);

        const grad = ctx.createLinearGradient(c1.coords.x, c1.coords.y, c2.coords.x, c2.coords.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.35)');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(c1.coords.x, c1.coords.y);
        ctx.lineTo(c2.coords.x, c2.coords.y);
        ctx.stroke();
      });
    });

    ctx.setLineDash([]);
  };

  // Active War Front Line
  const drawActiveWarFront = (
    ctx: CanvasRenderingContext2D,
    battle: BattleClimax,
    countryList: Country[]
  ) => {
    const attacker = countryList.find((c) => c.id === battle.attackerId);
    const defender = countryList.find((c) => c.id === battle.defenderId);
    if (!attacker || !defender) return;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#EF4444';
    ctx.shadowColor = '#DC2626';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(attacker.coords.x, attacker.coords.y);
    ctx.lineTo(defender.coords.x, defender.coords.y);
    ctx.stroke();

    // Pulses along the line
    const pulseOffset = (Date.now() / 25) % 100;
    ctx.setLineDash([8, 12]);
    ctx.lineDashOffset = -pulseOffset;
    ctx.strokeStyle = '#FDE047';
    ctx.stroke();

    ctx.restore();
  };

  // Territory Influence Zones
  const drawTerritories = (
    ctx: CanvasRenderingContext2D,
    countryList: Country[],
    selectedId: string | null
  ) => {
    countryList.forEach((c) => {
      // Calculate territory radius based on initial size + annexed empires
      const baseRadius = 14 + Math.sqrt(c.territorySize) * 3.5;
      const x = c.coords.x;
      const y = c.coords.y;

      // Controller empire color if annexed
      let fillColor = c.color;
      if (!c.isAlive && c.controlledBy) {
        const overlord = countryList.find((item) => item.id === c.controlledBy);
        if (overlord) {
          fillColor = overlord.color;
        }
      }

      ctx.save();
      // Base radial territory glow
      const radGrad = ctx.createRadialGradient(x, y, 4, x, y, baseRadius);
      radGrad.addColorStop(0, `${fillColor}55`);
      radGrad.addColorStop(0.7, `${fillColor}22`);
      radGrad.addColorStop(1, `${fillColor}00`);

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Territory boundary perimeter
      ctx.strokeStyle = c.isAlive ? `${fillColor}aa` : `${fillColor}44`;
      ctx.lineWidth = c.id === selectedId ? 2.5 : 1;
      if (!c.isAlive) {
        ctx.setLineDash([2, 3]);
      }
      ctx.beginPath();
      ctx.arc(x, y, baseRadius * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // Radiation toxic cloud if irradiated
      if (c.radiationLevel > 0) {
        ctx.fillStyle = `rgba(34, 197, 94, ${c.radiationLevel / 220})`;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbital shield bubble
      if (c.hasShield) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  };

  // Missile Arc Animation
  const drawMissileArc = (ctx: CanvasRenderingContext2D) => {
    const missile = missileArcRef.current;
    if (!missile) return;

    missile.progress += 0.015;
    if (missile.progress > 1) {
      missile.progress = 0;
    }

    const { fromX, fromY, toX, toY, progress } = missile;
    const midX = (fromX + toX) / 2;
    const midY = Math.min(fromY, toY) - 50; // High arc

    // Quadratic bezier position
    const t = progress;
    const curX = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * midX + t * t * toX;
    const curY = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * midY + t * t * toY;

    // Draw arc trail
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(midX, midY, toX, toY);
    ctx.stroke();

    // Draw missile head
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Trailing spark particle
    if (Math.random() < 0.6) {
      particlesRef.current.push({
        id: Math.random(),
        x: curX,
        y: curY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        color: '#F59E0B',
        size: 2,
        life: 1,
        maxLife: 20,
        type: 'spark',
      });
    }

    ctx.restore();
  };

  // Troop marches
  const drawTroopMarches = (ctx: CanvasRenderingContext2D) => {
    troopsRef.current.forEach((t, index) => {
      t.progress += 0.01;
      const curX = t.fromX + (t.toX - t.fromX) * t.progress;
      const curY = t.fromY + (t.toY - t.fromY) * t.progress;

      ctx.save();
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Flag icon alongside troop march
      ctx.font = '12px sans-serif';
      ctx.fillText(t.flag, curX - 6, curY - 6);
      ctx.restore();

      if (t.progress >= 1) {
        troopsRef.current.splice(index, 1);
      }
    });
  };

  // Particles
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      const alpha = 1 - p.life / p.maxLife;
      if (alpha <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      if (p.type === 'shockwave') {
        const radius = (p.life / p.maxLife) * 60;
        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // Country Flags & Badges
  const drawCountryBadges = (
    ctx: CanvasRenderingContext2D,
    countryList: Country[],
    selectedId: string | null
  ) => {
    countryList.forEach((c) => {
      const x = c.coords.x;
      const y = c.coords.y;
      const isSelected = c.id === selectedId;
      const isAlive = c.isAlive;

      ctx.save();

      // Center point indicator
      ctx.fillStyle = isAlive ? '#FFFFFF' : '#6B7280';
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Flag badge background chip
      const badgeWidth = 44;
      const badgeHeight = 22;
      const bx = x - badgeWidth / 2;
      const by = y - 28;

      ctx.fillStyle = isSelected
        ? 'rgba(30, 58, 138, 0.95)'
        : isAlive
        ? 'rgba(15, 23, 42, 0.88)'
        : 'rgba(31, 41, 55, 0.65)';
      ctx.strokeStyle = isSelected ? '#60A5FA' : isAlive ? `${c.color}99` : '#4B5563';
      ctx.lineWidth = isSelected ? 1.5 : 1;

      // Rounded rect
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 5);
      ctx.fill();
      ctx.stroke();

      // Flag Emoji
      ctx.font = '12px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.flag, bx + 4, by + badgeHeight / 2);

      // Power / Territory count
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = isAlive ? '#F3F4F6' : '#9CA3AF';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(c.power)}`, bx + badgeWidth - 4, by + badgeHeight / 2);

      // Conquered crown or empire star indicator
      if (c.annexedNations.length > 0) {
        ctx.font = '10px sans-serif';
        ctx.fillText('👑', bx + badgeWidth - 2, by - 4);
      }

      ctx.restore();
    });
  };

  // Mouse interaction handlers for Zoom & Pan & Country Selection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }

    // Determine country hovered
    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    const scaleX = canvas.width / 1000;
    const scaleY = canvas.height / 600;
    const baseScale = Math.min(scaleX, scaleY);
    const offsetX = (canvas.width - 1000 * baseScale) / 2;
    const offsetY = (canvas.height - 600 * baseScale) / 2;

    // Convert mouse to world coordinates
    const worldX = (mouseCanvasX - pan.x - offsetX) / (baseScale * zoom);
    const worldY = (mouseCanvasY - pan.y - offsetY) / (baseScale * zoom);

    let found: Country | null = null;
    for (const c of countries) {
      const dist = Math.hypot(c.coords.x - worldX, c.coords.y - worldY);
      if (dist < 20) {
        found = c;
        break;
      }
    }
    setHoveredCountry(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredCountry) {
      onSelectCountry(hoveredCountry.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom((prev) => Math.max(0.6, Math.min(4.0, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Map Pan/Zoom HUD controls */}
      {!streamMode && (
        <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-lg p-1.5 shadow-xl pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.25))}
            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="px-2.5 h-7 flex items-center justify-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Reset Map View"
          >
            Reset
          </button>
          <span className="text-[11px] font-mono-numbers text-slate-400 px-1.5">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-900/95 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 shadow-2xl text-xs max-w-xs transition-opacity duration-100"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y + 16}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{hoveredCountry.flag}</span>
            <div>
              <div className="font-bold text-sm text-white">{hoveredCountry.name}</div>
              <div className="text-[11px] text-slate-400">
                {hoveredCountry.capital} · {hoveredCountry.continent}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 font-mono-numbers text-[11px]">
            <div>
              <span className="text-slate-400">Power:</span>{' '}
              <span className="font-semibold text-amber-400">{hoveredCountry.power}</span>
            </div>
            <div>
              <span className="text-slate-400">Territory:</span>{' '}
              <span className="font-semibold text-emerald-400">{hoveredCountry.territorySize}</span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>{' '}
              <span className={hoveredCountry.isAlive ? 'text-green-400' : 'text-red-400'}>
                {hoveredCountry.isAlive ? 'Sovereign' : `Annexed by ${hoveredCountry.controlledBy}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Chat Votes:</span>{' '}
              <span className="font-semibold text-cyan-400">{hoveredCountry.viewerVotes}</span>
            </div>
          </div>
          {hoveredCountry.annexedNations.length > 0 && (
            <div className="mt-1.5 text-[10px] text-amber-300">
              Absorbed: {hoveredCountry.annexedNations.slice(0, 3).join(', ')}
              {hoveredCountry.annexedNations.length > 3 ? ` +${hoveredCountry.annexedNations.length - 3} more` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
