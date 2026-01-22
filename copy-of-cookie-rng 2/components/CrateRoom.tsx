import React, { useState } from 'react';
import { GameState } from '../types';
import { CRATE_DEFS } from '../constants';
import { Loader2, Coins, Hammer, Zap, Trophy, X, Info } from 'lucide-react';

interface CrateRoomProps {
  state: GameState;
  onOpenCrate: (crateId: string) => Promise<{
    type: 'bits' | 'repair' | 'buff' | 'jackpot' | 'frenzy';
    value: number;
    message: string;
  }>;
}

const CrateRoom: React.FC<CrateRoomProps> = ({ state, onOpenCrate }) => {
  const [openingCrateId, setOpeningCrateId] = useState<string | null>(null);
  const [viewingInfoId, setViewingInfoId] = useState<string | null>(null);
  const [reward, setReward] = useState<{
    type: 'bits' | 'repair' | 'buff' | 'jackpot' | 'frenzy';
    value: number;
    message: string;
  } | null>(null);

  const handleOpen = async (crateId: string) => {
    if (openingCrateId) return;
    setOpeningCrateId(crateId);
    setReward(null);

    // Minimum visual delay
    await new Promise(r => setTimeout(r, 1000));

    const result = await onOpenCrate(crateId);
    setReward(result);
    setOpeningCrateId(null);
  };

  const closeReward = () => {
    setReward(null);
  };

  const activeInfoCrate = viewingInfoId ? CRATE_DEFS.find(c => c.id === viewingInfoId) : null;

  return (
    <div className="max-w-5xl mx-auto p-4 relative min-h-[500px]">
      <h2 className="text-2xl font-display font-bold text-white mb-2">The Vault</h2>
      <p className="text-slate-400 mb-8 text-sm">Risk your Bits for a chance at greater fortune or powerful boons.</p>

      {/* Crate Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CRATE_DEFS.map((crate) => {
          const Icon = crate.icon;
          const canAfford = state.bits >= crate.cost;
          const isOpening = openingCrateId === crate.id;
          const isOtherOpening = openingCrateId !== null && openingCrateId !== crate.id;

          return (
            <div 
                key={crate.id} 
                className={`
                    relative rounded-2xl transition-all duration-300
                    ${isOtherOpening ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}
                    ${isOpening ? 'scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]' : ''}
                `}
            >
                {/* Info Button - Positioned absolutely on top of the button area */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setViewingInfoId(crate.id);
                    }}
                    className="absolute top-2 right-2 z-20 p-2 text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                    title="View Drop Rates"
                >
                    <Info size={18} />
                </button>

                <button
                onClick={() => handleOpen(crate.id)}
                disabled={!canAfford || openingCrateId !== null}
                className={`
                    flex flex-col items-center p-6 rounded-2xl border-2 w-full h-full
                    ${!canAfford && !isOpening 
                    ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' 
                    : `${crate.bgColor} ${crate.borderColor} hover:-translate-y-2 hover:shadow-2xl`}
                `}
                >
                {/* Icon */}
                <div className={`
                    mb-6 p-6 rounded-full bg-black/20 shadow-inner
                    ${isOpening ? 'animate-[bounce_0.5s_infinite]' : ''}
                `}>
                    {isOpening ? <Loader2 size={48} className={`animate-spin ${crate.color}`} /> : <Icon size={48} className={crate.color} />}
                </div>

                {/* Info */}
                <h3 className={`text-xl font-bold mb-2 ${crate.color}`}>{crate.name}</h3>
                <p className="text-xs text-slate-400 text-center mb-6 min-h-[3rem]">{crate.description}</p>

                {/* Cost */}
                <div className={`
                    px-4 py-2 rounded-lg font-bold font-mono text-sm border
                    ${canAfford ? 'bg-black/40 border-white/10 text-white' : 'bg-red-900/20 border-red-500/20 text-red-400'}
                `}>
                    {crate.cost.toLocaleString()} Bits
                </div>
                </button>
            </div>
          );
        })}
      </div>

      {/* Drop Info Modal */}
      {activeInfoCrate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-[fadeIn_0.2s]">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                <button 
                    onClick={() => setViewingInfoId(null)}
                    className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className={`text-xl font-bold mb-1 ${activeInfoCrate.color}`}>{activeInfoCrate.name}</h3>
                <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Drop Probabilities</p>

                <div className="space-y-3">
                    {activeInfoCrate.contents.map((item, idx) => {
                        let colorClass = "text-slate-300";
                        let barClass = "bg-slate-600";
                        if (item.type === 'bad') { colorClass = "text-red-400"; barClass = "bg-red-900"; }
                        if (item.type === 'common') { colorClass = "text-white"; barClass = "bg-slate-500"; }
                        if (item.type === 'rare') { colorClass = "text-blue-400"; barClass = "bg-blue-500"; }
                        if (item.type === 'epic') { colorClass = "text-purple-400"; barClass = "bg-purple-500"; }
                        if (item.type === 'legendary') { colorClass = "text-amber-400"; barClass = "bg-amber-500 animate-pulse"; }

                        return (
                            <div key={idx} className="bg-black/20 rounded p-2">
                                <div className="flex justify-between text-sm font-bold mb-1">
                                    <span className={colorClass}>{item.label}</span>
                                    <span className="text-slate-500">{item.chance}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${barClass}`} 
                                        style={{ width: `${item.chance}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setViewingInfoId(null)}
                        className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reward Overlay */}
      {reward && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-[fadeIn_0.3s]">
           <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
             
             <button 
                onClick={closeReward}
                className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white"
             >
                <X size={20} />
             </button>

             {/* Background Burst */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
             
             {/* Icon */}
             <div className="flex justify-center mb-4">
                {reward.type === 'bits' || reward.type === 'jackpot' ? <Coins size={64} className={reward.type === 'jackpot' ? 'text-yellow-400 animate-bounce' : 'text-amber-500'} /> :
                 reward.type === 'repair' ? <Hammer size={64} className="text-blue-400 animate-pulse" /> :
                 reward.type === 'frenzy' ? <Zap size={64} className="text-purple-400 animate-pulse" /> :
                 <Trophy size={64} className="text-white" />}
             </div>

             <h3 className="text-2xl font-bold text-white mb-2">{reward.message}</h3>
             
             {reward.type === 'bits' || reward.type === 'jackpot' ? (
                 <div className="text-4xl font-display font-bold text-amber-400 mb-6">
                    +{reward.value.toLocaleString()} Bits
                 </div>
             ) : (
                 <p className="text-slate-400 mb-6 text-sm">Effect Applied Successfully!</p>
             )}

             <button 
               onClick={closeReward}
               className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
             >
               Collect
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CrateRoom;