
import React, { useState, useEffect } from 'react';
import { GameState, Cookie, Rarity } from '../types';
import { STANDARD_COOKIES, RARE_ROLL_COOKIES, EPIC_ROLL_COOKIES, MYTHICAL_ROLL_COOKIES, ASCENDED_ROLL_COOKIES, RARITY_WEIGHTS, RARE_ROLL_WEIGHTS, EPIC_ROLL_WEIGHTS, MYTHICAL_ROLL_WEIGHTS, ASCENDED_ROLL_WEIGHTS, ROLL_COST, RARE_ROLL_COST, EPIC_ROLL_COST, MYTHICAL_ROLL_COST, ASCENDED_ROLL_COST, RARITY_ICONS, RARITY_COLORS, RARITY_DURABILITY } from '../constants';
import { Sparkles, Loader2, Info, BrainCircuit, X, Star, Crown, Ghost, Gem, Infinity, Play, Square, Settings2 } from 'lucide-react';

interface RngSystemProps {
  state: GameState;
  onRollComplete: (cookie: Cookie) => void;
  spendBits: (amount: number) => boolean;
}

type RollType = 'standard' | 'rare' | 'epic' | 'mythical' | 'ascended';

const ROLL_CONFIG: Record<RollType, { cost: number, name: string }> = {
    standard: { cost: ROLL_COST, name: 'Standard Roll' },
    rare: { cost: RARE_ROLL_COST, name: 'Rare Roll' },
    epic: { cost: EPIC_ROLL_COST, name: 'Crystal Roll' },
    mythical: { cost: MYTHICAL_ROLL_COST, name: 'Mythical Roll' },
    ascended: { cost: ASCENDED_ROLL_COST, name: 'Ascend Roll' },
};

const RngSystem: React.FC<RngSystemProps> = ({ state, onRollComplete, spendBits }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [lastRolledCookie, setLastRolledCookie] = useState<Cookie | null>(null);
  const [rollMessage, setRollMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto Roll State
  const [isAutoRolling, setIsAutoRolling] = useState(false);
  const [autoRollType, setAutoRollType] = useState<RollType>('standard');

  const calculateDrop = (
    pool: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[], 
    baseWeights: Record<Rarity, number>
  ): Cookie => {
    // Basic weight calculation
    const luckMultiplier = 1 + (state.upgrades.luckLevel * 0.1);
    
    // Adjust weights based on luck
    let currentWeights = { ...baseWeights };
    // Boost rare+ chances
    if (currentWeights[Rarity.RARE]) currentWeights[Rarity.RARE] *= luckMultiplier;
    if (currentWeights[Rarity.ULTRA_RARE]) currentWeights[Rarity.ULTRA_RARE] *= luckMultiplier;
    if (currentWeights[Rarity.EPIC]) currentWeights[Rarity.EPIC] *= luckMultiplier;
    if (currentWeights[Rarity.LEGENDARY]) currentWeights[Rarity.LEGENDARY] *= luckMultiplier;
    if (currentWeights[Rarity.MYTHICAL]) currentWeights[Rarity.MYTHICAL] *= luckMultiplier;
    if (currentWeights[Rarity.ASCENDED]) currentWeights[Rarity.ASCENDED] *= luckMultiplier;
    if (currentWeights[Rarity.DIVINE]) currentWeights[Rarity.DIVINE] *= luckMultiplier;

    const totalWeight = Object.values(currentWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    let selectedRarity = Rarity.COMMON;
    for (const [rarity, weight] of Object.entries(currentWeights)) {
      if (random < weight) {
        selectedRarity = rarity as Rarity;
        break;
      }
      random -= weight;
    }

    // Pick a random cookie of that rarity from the specific pool
    const rarityPool = pool.filter(c => c.rarity === selectedRarity);
    
    // Use the pool or fallback to the first cookie in the passed pool if rarity pool is empty
    const baseCookie = rarityPool.length > 0 
      ? rarityPool[Math.floor(Math.random() * rarityPool.length)] 
      : pool[0];

    const maxDurability = RARITY_DURABILITY[baseCookie.rarity] || 50;

    return {
      ...baseCookie,
      dateObtained: Date.now(),
      id: `${baseCookie.id}_${Date.now()}`, // Unique instance ID
      durability: maxDurability,
      maxDurability: maxDurability
    };
  };

  const handleRoll = (type: RollType) => {
    if (isRolling) return;
    
    let cost = ROLL_COST;
    let pool = STANDARD_COOKIES;
    let weights = RARITY_WEIGHTS;
    let msg = "Baking Standard...";
    let delay = 1200;

    if (type === 'rare') {
        cost = RARE_ROLL_COST;
        pool = RARE_ROLL_COOKIES;
        weights = RARE_ROLL_WEIGHTS;
        msg = "Summoning Rare...";
    } else if (type === 'epic') {
        cost = EPIC_ROLL_COST;
        pool = EPIC_ROLL_COOKIES;
        weights = EPIC_ROLL_WEIGHTS;
        msg = "Refining Crystal...";
        delay = 1000; // Faster for auto-roll feel
    } else if (type === 'mythical') {
        cost = MYTHICAL_ROLL_COST;
        pool = MYTHICAL_ROLL_COOKIES;
        weights = MYTHICAL_ROLL_WEIGHTS;
        msg = "Opening the Rift...";
        delay = 1200;
    } else if (type === 'ascended') {
        cost = ASCENDED_ROLL_COST;
        pool = ASCENDED_ROLL_COOKIES;
        weights = ASCENDED_ROLL_WEIGHTS;
        msg = "TRANSCENDING REALITY...";
        delay = 1500;
    }

    if (!spendBits(cost)) {
        setErrorMsg(`Not enough Bits! Need ${cost.toLocaleString()}.`);
        setTimeout(() => setErrorMsg(""), 2000);
        // Stop auto rolling if out of funds
        if (isAutoRolling) setIsAutoRolling(false);
        return;
    }

    setIsRolling(true);
    setRollMessage(msg);
    // Don't clear last rolled cookie immediately if auto-rolling to prevent flickering
    if (!isAutoRolling) setLastRolledCookie(null);

    setTimeout(() => {
      const newCookie = calculateDrop(pool, weights);
      setLastRolledCookie(newCookie);
      onRollComplete(newCookie);
      setIsRolling(false);
      setRollMessage(`Obtained ${newCookie.rarity} cookie!`);
    }, isAutoRolling ? 500 : delay); // Faster animation when auto-rolling
  };

  const handleClose = () => {
    setLastRolledCookie(null);
    setRollMessage('');
    setIsAutoRolling(false);
  };

  // Auto Roll Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isAutoRolling && !isRolling) {
        // Delay next roll slightly to allow user to see result
        timeoutId = setTimeout(() => {
            const cost = ROLL_CONFIG[autoRollType].cost;
            if (state.bits >= cost) {
                handleRoll(autoRollType);
            } else {
                setIsAutoRolling(false);
                setErrorMsg("Auto-roll stopped: Insufficient Bits");
                setTimeout(() => setErrorMsg(""), 3000);
            }
        }, 800);
    }

    return () => clearTimeout(timeoutId);
  }, [isAutoRolling, isRolling, state.bits, autoRollType]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      
      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-bounce text-center min-w-[200px]">
          {errorMsg}
        </div>
      )}

      {/* Auto Roll Control Panel */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
         <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isAutoRolling ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                <Settings2 size={24} />
             </div>
             <div>
                 <h3 className="text-white font-bold text-sm">Auto-Roller 3000</h3>
                 <p className="text-slate-400 text-xs">Automate your summons</p>
             </div>
         </div>

         <div className="flex items-center gap-2 w-full sm:w-auto">
             <select 
                value={autoRollType}
                onChange={(e) => setAutoRollType(e.target.value as RollType)}
                disabled={isAutoRolling}
                className="bg-black border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 disabled:opacity-50 flex-grow sm:flex-grow-0"
             >
                 {Object.entries(ROLL_CONFIG).map(([key, config]) => (
                     <option key={key} value={key}>
                         {config.name} ({config.cost.toLocaleString()})
                     </option>
                 ))}
             </select>

             <button
                onClick={() => setIsAutoRolling(!isAutoRolling)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                    ${isAutoRolling 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' 
                        : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-white'}
                `}
             >
                 {isAutoRolling ? (
                     <>
                        <Square size={16} fill="currentColor" /> Stop
                     </>
                 ) : (
                     <>
                        <Play size={16} fill="currentColor" /> Start
                     </>
                 )}
             </button>
         </div>
      </div>

      {/* Control Panel (Manual Buttons) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isAutoRolling ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        
        {/* Standard Roll */}
        <button
          onClick={() => handleRoll('standard')}
          disabled={isRolling}
          className={`
            group relative overflow-hidden rounded-2xl p-6 text-left transition-all
            ${(isRolling) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl'}
            bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600
            flex flex-col items-center text-center
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={80} />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-1">Standard Roll</h3>
          <p className="text-xs text-slate-400 mb-2">Common & Rare cookies</p>
          <div className="flex items-center space-x-2 text-slate-300 font-bold bg-black/40 px-4 py-2 rounded-full border border-slate-500/30">
            <span>{ROLL_COST} Bits</span>
          </div>
        </button>

        {/* Rare Roll */}
        <button
          onClick={() => handleRoll('rare')}
          disabled={isRolling}
          className={`
            group relative overflow-hidden rounded-2xl p-6 text-left transition-all
            ${(isRolling) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl'}
            bg-gradient-to-br from-amber-700 to-purple-900 border border-amber-600/50
            flex flex-col items-center text-center
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <Crown size={80} className="text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-amber-100 mb-1">Rare Roll</h3>
          <p className="text-xs text-amber-200/70 mb-2">High chance for powerful cookies</p>
          <div className="flex items-center space-x-2 text-amber-400 font-bold bg-black/40 px-4 py-2 rounded-full border border-amber-500/30">
            <Star size={14} fill="currentColor" />
            <span>{RARE_ROLL_COST} Bits</span>
          </div>
        </button>

        {/* Crystal Roll (New - 500) */}
        <button
          onClick={() => handleRoll('epic')}
          disabled={isRolling}
          className={`
            md:col-span-2 group relative overflow-hidden rounded-2xl p-6 text-left transition-all
            ${(isRolling) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl'}
            bg-gradient-to-br from-indigo-900 to-violet-950 border border-indigo-500/50
            flex flex-row items-center justify-between
          `}
        >
           {/* Background Deco */}
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gem size={100} className="text-indigo-400" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                <Gem size={32} className="text-indigo-300" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-indigo-100 mb-1">Crystal Roll</h3>
                <p className="text-xs text-indigo-200/70">Exclusive <span className="text-indigo-300 font-bold">Ultra Rare</span> & <span className="text-violet-300 font-bold">Epics</span>.</p>
             </div>
          </div>

          <div className="relative z-10 flex items-center space-x-2 text-indigo-300 font-bold bg-black/40 px-4 py-2 rounded-full border border-indigo-500/30">
            <Gem size={14} fill="currentColor" />
            <span>{EPIC_ROLL_COST} Bits</span>
          </div>
        </button>

        {/* Mythical Roll (Full Width) */}
        <button
          onClick={() => handleRoll('mythical')}
          disabled={isRolling}
          className={`
            md:col-span-2 group relative overflow-hidden rounded-2xl p-8 text-left transition-all
            ${(isRolling) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20'}
            bg-slate-950 border border-pink-500/30
            flex flex-row items-center justify-between
          `}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
          {/* Animated Sparkles */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 bg-pink-500/20 rounded-full border border-pink-500/50 group-hover:scale-110 transition-transform duration-500">
                <Ghost size={40} className="text-pink-300" />
            </div>
            <div>
                <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300 mb-1">
                    Mythical Roll
                </h3>
                <p className="text-sm text-pink-200/70">Summon entities from the Void. Contains <span className="text-pink-400 font-bold">Epics</span> & <span className="text-purple-400 font-bold">Mythicals</span>.</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end">
             <div className="flex items-center gap-2 text-pink-300 font-bold bg-black/60 px-6 py-3 rounded-xl border border-pink-500/40 shadow-xl">
                 <Sparkles size={16} className="animate-pulse" />
                 <span className="text-lg">{MYTHICAL_ROLL_COST.toLocaleString()} Bits</span>
             </div>
          </div>
        </button>

         {/* ASCEND Roll (Full Width - Ultimate) */}
         <button
          onClick={() => handleRoll('ascended')}
          disabled={isRolling}
          className={`
            md:col-span-2 group relative overflow-hidden rounded-2xl p-10 text-left transition-all
            ${(isRolling) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/40'}
            bg-black border border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]
            flex flex-row items-center justify-between
          `}
        >
          {/* Animated Holo Gradient */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,1)_0%,rgba(8,51,68,1)_50%,rgba(0,0,0,1)_100%)] opacity-90"></div>
          
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[length:100%_4px] bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(34,211,238,0.2)_50%)]"></div>

          {/* Glowing Ring Decor */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 border-2 border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>

          <div className="relative z-10 flex items-center gap-8">
            <div className="p-5 bg-cyan-950/50 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-110 group-hover:rotate-180 transition-all duration-1000">
                <Infinity size={48} className="text-cyan-300" />
            </div>
            <div>
                <h3 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 mb-2 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                    ASCEND ROLL
                </h3>
                <p className="text-sm text-cyan-100/80 font-mono tracking-wider">
                    Transcend mortal limits.
                    <br/>
                    Chance for <span className="text-cyan-300 font-bold drop-shadow-md">ASCENDED</span> & <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">GOD TIER</span>.
                </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end">
             <div className="flex items-center gap-3 text-cyan-950 font-black bg-cyan-300/90 px-8 py-4 rounded-xl border-2 border-white shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:bg-white hover:text-cyan-600 transition-colors">
                 <Infinity size={20} className="animate-spin-slow" />
                 <span className="text-xl">{ASCENDED_ROLL_COST.toLocaleString()} Bits</span>
             </div>
          </div>
        </button>

      </div>

      {/* Animation Stage */}
      <div className="min-h-[300px] relative flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
        
        {/* Close Button */}
        {lastRolledCookie && !isRolling && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        )}

        {(isRolling) && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 size={48} className="animate-spin text-amber-500 mb-4" />
            <p className="text-slate-300 font-display tracking-widest text-lg animate-bounce">{rollMessage}</p>
          </div>
        )}

        {!isRolling && !lastRolledCookie && (
          <div className="text-slate-500 flex flex-col items-center opacity-60">
             <Info size={40} className="mb-4"/>
             <p className="text-lg">Select a banner to summon</p>
          </div>
        )}

        {!isRolling && lastRolledCookie && (
          <div className="flex flex-col items-center animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
            
            <div className="relative mb-6">
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: lastRolledCookie.colorHex, opacity: 0.6 }}
              ></div>
              
              <div 
                className="w-32 h-32 rounded-full relative z-10 flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: lastRolledCookie.colorHex }}
              >
                {/* Rarity Icon Overlay */}
                <div className="absolute -top-4 -right-4 bg-black/80 p-2 rounded-full border border-white/10">
                   {React.createElement(RARITY_ICONS[lastRolledCookie.rarity] || Sparkles, { 
                     size: 24, 
                     color: RARITY_COLORS[lastRolledCookie.rarity] 
                   })}
                </div>
                <span className="text-4xl">🍪</span>
              </div>
            </div>

            <h2 className="text-3xl font-display font-bold text-white mb-2 text-center drop-shadow-lg" style={{ color: lastRolledCookie.colorHex }}>
              {lastRolledCookie.name}
            </h2>
            <div className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4
              border border-white/20
            `} style={{ 
              backgroundColor: `${RARITY_COLORS[lastRolledCookie.rarity]}30`,
              color: RARITY_COLORS[lastRolledCookie.rarity] 
            }}>
              {lastRolledCookie.rarity}
            </div>
            <p className="text-slate-300 text-center max-w-md italic">
              "{lastRolledCookie.description}"
            </p>
            {lastRolledCookie.isAiGenerated && (
               <div className="mt-4 text-xs text-purple-400 flex items-center gap-1">
                 <BrainCircuit size={12} /> Generated by Gemini Oracle
               </div>
            )}
            
            <div className="mt-6 flex gap-4 text-sm text-slate-400">
               <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                 Base Value: <span className="text-white font-bold ml-1">{lastRolledCookie.baseValue}</span>
               </div>
               <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                 Durability: <span className="text-white font-bold ml-1">{lastRolledCookie.maxDurability}</span>
               </div>
            </div>
            
            <div className="mt-6 text-xs text-amber-400 animate-pulse font-bold tracking-wide uppercase">
                Automatically equipped!
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default RngSystem;
    