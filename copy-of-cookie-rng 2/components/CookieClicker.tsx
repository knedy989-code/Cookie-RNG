import React, { useState, useCallback, useRef } from 'react';
import { GameState, Cookie } from '../types';
import { Cookie as CookieIcon, AlertTriangle, ShieldAlert, Shield, Zap } from 'lucide-react';

interface CookieClickerProps {
  state: GameState;
  onCookieClick: () => void;
  clickPower: number;
  selectedCookie: Cookie | null;
  soundEnabled: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: string;
}

interface Crumb {
  id: number;
  x: number;
  y: number;
  tx: number; // translate x target
  ty: number; // translate y target
  r: number; // rotation target
  size: number;
  color: string;
}

const CookieClicker: React.FC<CookieClickerProps> = ({ state, onCookieClick, clickPower, selectedCookie, soundEnabled }) => {
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const particleIdCounter = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Use the passed selectedCookie for visuals. If null, use fallback color.
  const cookieColor = selectedCookie ? selectedCookie.colorHex : '#D2691E';

  const playCrunchSound = () => {
    try {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Create white noise
        const bufferSize = ctx.sampleRate * 0.1; // 100ms clip
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter for "crunchiness" (Lowpass)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

        // Amplitude Envelope (Fast decay)
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        // Pitch variation
        noise.playbackRate.value = 0.8 + Math.random() * 0.4;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
    } catch (e) {
        console.warn("Audio play failed", e);
    }
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onCookieClick();
    if (soundEnabled) {
        playCrunchSound();
    }
    
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 50); // Faster click response

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Score Particle
    const isCrit = state.activeEffects.clickMultiplier > 1;
    const newParticle: Particle = {
      id: particleIdCounter.current++,
      x,
      y,
      value: `${isCrit ? '⚡' : ''}+${clickPower.toFixed(1)}`,
    };

    setParticles(prev => [...prev, newParticle]);

    // 2. Crumb Particles (The "Crush" Effect)
    const crumbCount = 8 + Math.floor(Math.random() * 5); // 8-12 crumbs
    const newCrumbs: Crumb[] = [];
    
    for (let i = 0; i < crumbCount; i++) {
        // Random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50; // Fly out distance
        
        newCrumbs.push({
            id: particleIdCounter.current++,
            x,
            y,
            tx: Math.cos(angle) * velocity,
            ty: Math.sin(angle) * velocity,
            r: Math.random() * 720 - 360, // Spin
            size: Math.random() * 8 + 4, // 4px to 12px
            color: cookieColor
        });
    }

    setCrumbs(prev => [...prev, ...newCrumbs]);

    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    // Cleanup crumbs
    setTimeout(() => {
        // We can batch remove, but filtering by ID is safe
        const idsToRemove = new Set(newCrumbs.map(c => c.id));
        setCrumbs(prev => prev.filter(c => !idsToRemove.has(c.id)));
    }, 800); // Crumbs fade faster

  }, [onCookieClick, clickPower, cookieColor, state.activeEffects.clickMultiplier, soundEnabled]);

  // Durability calculation
  const currentDurability = selectedCookie?.durability ?? 0;
  const maxDurability = selectedCookie?.maxDurability ?? 1;
  const durabilityPct = (currentDurability / maxDurability) * 100;
  
  // Visual Crack Stages
  const showCracksLight = selectedCookie && durabilityPct < 75;
  const showCracksMedium = selectedCookie && durabilityPct < 50;
  const showCracksHeavy = selectedCookie && durabilityPct < 25;

  let meterColor = 'bg-emerald-500';
  if (durabilityPct < 50) meterColor = 'bg-yellow-500';
  if (durabilityPct < 25) meterColor = 'bg-red-600 animate-pulse';

  // Buff Visuals
  const hasShield = state.activeEffects.protectedClicks > 0;
  const hasBuff = state.activeEffects.clickMultiplier > 1;

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      <div className="relative">
        
        {/* Active Effect Halos */}
        {hasBuff && (
            <div className="absolute inset-[-20px] rounded-full border-4 border-yellow-400/50 animate-spin-slow opacity-60 pointer-events-none z-0 border-dashed"></div>
        )}
        {hasShield && (
            <div className="absolute inset-[-10px] rounded-full bg-cyan-500/10 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse pointer-events-none z-10"></div>
        )}

        <button
          onClick={handleClick}
          className={`
            relative w-64 h-64 md:w-80 md:h-80 rounded-full 
            transition-all duration-75 ease-out
            focus:outline-none select-none z-20
            ${isClicking ? 'scale-90 brightness-90' : 'scale-100 hover:scale-105 hover:brightness-110'}
          `}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${cookieColor}, #1a1a1a)`,
            boxShadow: `0 0 ${isClicking ? '30px' : '60px'} ${cookieColor}40`,
          }}
        >
          {/* Cookie Texture / Face */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)', backgroundSize: '30px 30px' }}>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {!selectedCookie && <CookieIcon size={120} className="text-white opacity-20" />}
             {selectedCookie && (
               <div className="text-white/30 font-display text-4xl uppercase tracking-widest font-bold rotate-[-15deg]">
                 {selectedCookie.name.split(' ')[0]}
               </div>
             )}
          </div>

          {/* Visual Cracks Overlay */}
          {selectedCookie && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 100 100">
               {showCracksLight && (
                 <path d="M 20 20 L 30 35 L 25 45" fill="none" stroke="black" strokeWidth="0.5" />
               )}
               {showCracksMedium && (
                 <>
                   <path d="M 80 80 L 70 60 L 75 50" fill="none" stroke="black" strokeWidth="0.8" />
                   <path d="M 50 10 L 50 25 L 55 30" fill="none" stroke="black" strokeWidth="0.6" />
                 </>
               )}
               {showCracksHeavy && (
                 <>
                    <path d="M 10 50 L 30 50 L 40 55 M 60 90 L 60 70 L 50 60" fill="none" stroke="black" strokeWidth="1" />
                    <path d="M 90 20 L 70 40" fill="none" stroke="black" strokeWidth="1" />
                 </>
               )}
            </svg>
          )}

        </button>

        {/* Floating Numbers */}
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute pointer-events-none text-3xl font-bold z-30 ${hasBuff ? 'text-yellow-300' : 'text-white'}`}
            style={{ 
              left: p.x, 
              top: p.y, 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              animation: 'floatUp 0.8s ease-out forwards'
            }}
          >
            {p.value}
          </div>
        ))}

        {/* Crumb Debris */}
        {crumbs.map(c => (
             <div
                key={c.id}
                className="absolute pointer-events-none rounded-sm z-10"
                style={{
                    left: c.x,
                    top: c.y,
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                    '--tx': `${c.tx}px`,
                    '--ty': `${c.ty}px`,
                    '--r': `${c.r}deg`,
                    animation: 'crumble 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                } as React.CSSProperties}
             />
        ))}

      </div>

      {/* Active Buff Indicators */}
      <div className="flex gap-2 mt-4 h-6">
        {hasShield && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-900/40 px-2 rounded-full border border-cyan-500/30 animate-[fadeIn_0.3s]">
                <Shield size={10} /> {state.activeEffects.protectedClicks} Protected
            </div>
        )}
        {hasBuff && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-900/40 px-2 rounded-full border border-yellow-500/30 animate-[fadeIn_0.3s]">
                <Zap size={10} /> 2x Power
            </div>
        )}
      </div>

      {/* Structural Integrity Meter */}
      {selectedCookie && (
          <div className="mt-4 flex flex-col items-center w-full max-w-xs animate-[fadeIn_0.5s]">
             <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
               {durabilityPct < 25 ? <ShieldAlert className="text-red-500 animate-bounce" size={16} /> : null}
               <span>Structural Integrity</span>
             </div>
             
             <div className="relative w-full h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                 <div 
                   className={`h-full transition-all duration-200 ${meterColor}`}
                   style={{ width: `${durabilityPct}%` }}
                 ></div>
                 
                 {/* Striped overlay for 'meter' look */}
                 <div className="absolute inset-0 pointer-events-none opacity-20" 
                      style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}
                 ></div>

                 <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md tracking-wider">
                    {Math.ceil(durabilityPct)}%
                 </div>
             </div>
             <div className="mt-1 text-[10px] text-slate-500 font-mono">
                {currentDurability} / {maxDurability} Hits Remaining
             </div>
          </div>
      )}

      <div className="mt-6 text-center">
        <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-1">Current Balance</h2>
        <div className="text-5xl font-display font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
          {Math.floor(state.bits).toLocaleString()} <span className="text-2xl text-amber-500">Bits</span>
        </div>
      </div>
    </div>
  );
};

export default CookieClicker;