import React from 'react';
import { GameState } from '../types';
import { SHOP_ITEMS } from '../constants';

interface ItemShopProps {
  state: GameState;
  onBuy: (itemId: string, cost: number) => void;
}

const ItemShop: React.FC<ItemShopProps> = ({ state, onBuy }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-display font-bold text-white mb-2">The Celestial Pantry</h2>
      <p className="text-slate-400 mb-6 text-sm">Consumables and repairs to keep your factory running.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOP_ITEMS.map((item) => {
          const Icon = item.icon;
          const canAfford = state.bits >= item.cost;

          // Disable repair if no cookie equipped or fully healed
          let disabled = !canAfford;
          let disabledReason = '';

          if (item.id === 'repair_kit') {
             const activeCookie = state.activeCookieId ? state.cookies.find(c => c.id === state.activeCookieId) : null;
             if (!activeCookie) {
                disabled = true;
                disabledReason = 'No cookie equipped';
             } else if (activeCookie.durability >= activeCookie.maxDurability) {
                disabled = true;
                disabledReason = 'Cookie is pristine';
             }
          }

          if (item.id === 'buff_sugar' && state.activeEffects.clickMultiplier > 1) {
             disabled = true;
             disabledReason = 'Effect active';
          }

          if (item.id === 'shield' && state.activeEffects.protectedClicks > 0) {
             disabled = true;
             disabledReason = 'Shield active';
          }

          return (
            <button
              key={item.id}
              onClick={() => onBuy(item.id, item.cost)}
              disabled={disabled}
              className={`
                group relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                ${disabled 
                  ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed' 
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-amber-500/50 hover:-translate-y-0.5 shadow-lg'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center shrink-0
                ${item.bgColor} ${item.color}
              `}>
                <Icon size={24} />
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start">
                   <h3 className="font-bold text-slate-100">{item.name}</h3>
                   <span className={`
                     text-xs font-bold px-2 py-1 rounded bg-black/40 border border-white/5
                     ${canAfford ? 'text-amber-500' : 'text-slate-500'}
                   `}>
                     {item.cost} Bits
                   </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                {disabledReason && (
                    <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wide font-bold">
                        {disabledReason}
                    </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
         <h3 className="font-bold text-blue-400 mb-2 text-sm uppercase tracking-widest">Active Effects</h3>
         <div className="space-y-2 text-sm text-slate-300">
            {state.activeEffects.clickMultiplier > 1 && (
                <div className="flex justify-between">
                    <span>⚡ Sugar Rush (2x Power)</span>
                    <span className="text-white font-mono">
                        {Math.max(0, Math.ceil((state.activeEffects.clickMultiplierEndTime - Date.now()) / 1000))}s
                    </span>
                </div>
            )}
            {state.activeEffects.protectedClicks > 0 && (
                <div className="flex justify-between">
                    <span>🛡️ Titanium Wrapper</span>
                    <span className="text-white font-mono">{state.activeEffects.protectedClicks} Clicks</span>
                </div>
            )}
            {state.activeEffects.clickMultiplier === 1 && state.activeEffects.protectedClicks === 0 && (
                <div className="text-slate-500 italic text-xs">No active effects. Buy items to boost your production!</div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ItemShop;