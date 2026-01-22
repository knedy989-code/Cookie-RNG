
import React from 'react';
import { GameState } from '../types';
import { UPGRADE_COSTS } from '../constants';
import { Clover, Clock, ChevronsUp, Sparkles, Crown, Zap } from 'lucide-react';

interface UpgradesProps {
  state: GameState;
  buyUpgrade: (type: 'clickPower' | 'luck' | 'autoClicker' | 'ascension') => void;
}

const Upgrades: React.FC<UpgradesProps> = ({ state, buyUpgrade }) => {
  const { upgrades, bits } = state;

  const costLuck = UPGRADE_COSTS.luck(upgrades.luckLevel);
  const costAuto = UPGRADE_COSTS.autoClicker(upgrades.autoClickerLevel);
  const costAscension = UPGRADE_COSTS.ascension(upgrades.ascensionLevel);

  const UpgradeCard = ({ 
    title, 
    level, 
    cost, 
    icon: Icon, 
    desc, 
    type,
    maxLevel,
  }: { 
    title: string, 
    level: number, 
    cost: number, 
    icon: any, 
    desc: string,
    type: 'clickPower' | 'luck' | 'autoClicker' | 'ascension',
    maxLevel?: number,
  }) => {
    const isMax = maxLevel ? level >= maxLevel : false;
    const canAfford = !isMax && bits >= cost;
    const isAscension = type === 'ascension';

    // Base wrapper classes
    let wrapperClasses = `
      relative overflow-hidden rounded-2xl border transition-all duration-500 text-left w-full
      flex flex-col group
    `;

    // Specific styling logic
    if (isAscension) {
      wrapperClasses += ` sm:col-span-2 min-h-[350px] p-8 md:p-12 `;
      if (isMax) {
        wrapperClasses += ` bg-[#12051f] border-purple-900/30 opacity-60 cursor-default`;
      } else if (canAfford) {
        // Divine Void Theme: Deepest Black/Purple/Fuchsia gradient, glowing borders
        wrapperClasses += ` 
          bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3b0764] via-[#1a0525] to-black
          border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.3)]
          hover:border-fuchsia-400 hover:shadow-[0_0_100px_rgba(216,180,254,0.6)]
          hover:-translate-y-2 hover:scale-[1.01] cursor-pointer
        `;
      } else {
        wrapperClasses += ` bg-[#050505] border-slate-900 opacity-70 cursor-not-allowed grayscale-[0.5]`;
      }
    } else {
      wrapperClasses += ` p-5 min-h-[140px] `;
      if (isMax) {
        wrapperClasses += ` bg-amber-900/10 border-amber-500/10 cursor-default opacity-60`;
      } else if (canAfford) {
        wrapperClasses += ` 
          bg-slate-800 border-slate-700 hover:bg-slate-750 
          hover:border-amber-500/50 hover:-translate-y-1 shadow-md cursor-pointer
        `;
      } else {
        wrapperClasses += ` bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed`;
      }
    }

    return (
      <button
        onClick={() => !isMax && buyUpgrade(type)}
        disabled={!canAfford && !isMax} 
        className={wrapperClasses}
      >
        {/* === ASCENSION SPECIFIC BACKGROUNDS === */}
        {isAscension && !isMax && (
            <>
                {/* Intense Stardust */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 pointer-events-none mix-blend-color-dodge"></div>
                
                {/* Divine Void Orbs - Moving */}
                <div className="absolute -right-32 -top-32 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute -left-32 -bottom-32 w-[600px] h-[600px] bg-fuchsia-900/30 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

                {/* Central Glow */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>

                {/* Rotating Rings */}
                <div className="absolute top-0 right-0 p-10 opacity-30 pointer-events-none animate-[spin_30s_linear_infinite]">
                    <div className="border border-dashed border-fuchsia-400 w-96 h-96 rounded-full opacity-50"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-10 opacity-30 pointer-events-none animate-[spin_40s_linear_infinite_reverse]">
                    <div className="border-2 border-dotted border-purple-500 w-80 h-80 rounded-full opacity-50"></div>
                </div>

                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
            </>
        )}
        
        {/* Standard Background Icon */}
        {!isAscension && (
            <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none group-hover:scale-110 transition-transform">
                <Icon size={100} />
            </div>
        )}

        {/* === HEADER === */}
        <div className="flex justify-between w-full mb-8 z-10 relative">
           <div className={`
             rounded-2xl flex items-center justify-center transition-all duration-500
             ${isAscension 
                ? 'bg-[#2e0b4d] text-fuchsia-200 shadow-[0_0_30px_rgba(216,180,254,0.4)] border border-purple-400 p-6 group-hover:scale-110 group-hover:bg-[#4a0e78] group-hover:text-white' 
                : isMax ? 'bg-amber-500/20 text-amber-500 p-3' : 'bg-slate-950 text-amber-500 border border-white/5 p-3'}
           `}>
             <Icon size={isAscension ? 52 : 24} className={isAscension ? 'animate-pulse drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]' : ''} />
           </div>
           
           <div className="flex flex-col items-end">
             <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isAscension ? 'text-fuchsia-300' : 'text-slate-500'}`}>
                Level {level} {maxLevel ? `/ ${maxLevel}` : ''}
             </span>
             {isAscension && isMax && (
                 <span className="text-xs font-bold text-amber-500 mt-1">MAXED</span>
             )}
           </div>
        </div>
        
        {/* === TITLE & DESC === */}
        <div className="z-10 relative flex-grow space-y-4">
            <h3 className={`font-display font-bold ${isAscension ? 'text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-300 to-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] tracking-tight' : 'text-lg text-slate-200'}`}>
                {title}
            </h3>
            <p className={`leading-relaxed ${isAscension ? 'text-purple-100/70 max-w-2xl text-xl font-light' : 'text-sm text-slate-400'}`}>
                {desc}
            </p>
        </div>
        
        {/* === COST BUTTON === */}
        <div className={`
          mt-10 text-sm font-bold w-full py-5 rounded-xl text-center z-10 transition-all border relative overflow-hidden
          ${isMax 
            ? 'bg-transparent border-transparent text-slate-600 uppercase tracking-widest' 
            : isAscension
                ? canAfford 
                    ? 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-purple-900 text-white border-purple-400/60 shadow-[0_0_30px_rgba(192,132,252,0.4)] group-hover:shadow-[0_0_50px_rgba(232,121,249,0.6)] group-hover:scale-[1.02]' 
                    : 'bg-black/60 text-slate-600 border-slate-800'
                : canAfford 
                    ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500' 
                    : 'bg-slate-800 text-slate-500 border-slate-700'}
        `}>
          {isMax 
            ? (isAscension ? 'DIVINITY ACHIEVED' : 'MAX LEVEL') 
            : (
                <div className="flex items-center justify-center gap-3 relative z-10">
                    {canAfford && isAscension && <Sparkles size={24} className="text-fuchsia-300 animate-pulse" />}
                    <span className={isAscension ? 'text-2xl font-display tracking-widest text-fuchsia-50 drop-shadow-md' : ''}>{cost.toLocaleString()} Bits</span>
                    {canAfford && isAscension && <Sparkles size={24} className="text-purple-300 animate-pulse delay-100" />}
                </div>
            )
          }
          {/* Intense sheen for ascension button */}
          {isAscension && canAfford && !isMax && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite] pointer-events-none"></div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto p-4 pb-20">
      <UpgradeCard 
        title="Ascension"
        level={upgrades.ascensionLevel}
        cost={costAscension}
        icon={ChevronsUp}
        desc={upgrades.ascensionLevel === 0 ? "Tear open the fabric of reality. Phase 1 grants +3 Flat Bits per click." : "Become one with the Eternal Void. Phase 2 grants +8 Flat Bits per click."}
        type="ascension"
        maxLevel={2}
      />
      
      <UpgradeCard 
        title="Auto Clicker"
        level={upgrades.autoClickerLevel}
        cost={costAuto}
        icon={Clock}
        desc="Hires a spectral baker to click for you automatically."
        type="autoClicker"
        maxLevel={5}
      />
      <UpgradeCard 
        title="Lucky Charm"
        level={upgrades.luckLevel}
        cost={costLuck}
        icon={Clover}
        desc="Increases the probability of rolling higher rarity cookies."
        type="luck"
        maxLevel={5}
      />
    </div>
  );
};

export default Upgrades;
