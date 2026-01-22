
import React from 'react';
import { GameState, Cookie } from '../types';
import { RARITY_COLORS, RARITY_ICONS } from '../constants';
import { Trash2, CheckCircle, MousePointer2 } from 'lucide-react';

interface InventoryProps {
  state: GameState;
  onSell: (cookieId: string) => void;
  onEquip: (cookieId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ state, onSell, onEquip }) => {
  // Sort cookies: Rarity (Divine -> Common) -> BaseValue -> Date
  const sortedCookies = [...state.cookies].sort((a, b) => {
    // Simple priority map for sorting
    const rarityValue: Record<string, number> = {
      'Divine': 10,
      'Ascended': 9, 
      'Mythical': 7, 
      'Legendary': 6, 
      'Epic': 5, 
      'Ultra Rare': 4.5,
      'Rare': 3, 
      'Uncommon': 2, 
      'Common': 1
    };
    
    // Fallback for unknown rarities
    const valA = rarityValue[a.rarity] || 0;
    const valB = rarityValue[b.rarity] || 0;

    const diff = valB - valA;
    if (diff !== 0) return diff;
    return b.baseValue - a.baseValue;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
        Inventory <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{state.cookies.length} Cookies</span>
      </h2>

      {sortedCookies.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          No cookies collected yet. Start rolling!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedCookies.map((cookie) => {
            const isEquipped = state.activeCookieId === cookie.id;
            
            return (
              <div 
                key={cookie.id}
                className={`
                  group relative bg-slate-800 rounded-xl p-3 border transition-all hover:-translate-y-1 overflow-hidden cursor-pointer
                  ${isEquipped ? 'border-amber-500 shadow-amber-900/20 shadow-lg' : 'border-white/5 hover:border-white/20'}
                `}
                onClick={() => onEquip(cookie.id)}
              >
                {/* Rarity Stripe */}
                <div 
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: RARITY_COLORS[cookie.rarity] }}
                ></div>

                <div className="flex justify-between items-start mb-2">
                   <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${RARITY_COLORS[cookie.rarity]}20`, color: RARITY_COLORS[cookie.rarity] }}
                   >
                      {React.createElement(RARITY_ICONS[cookie.rarity] || RARITY_ICONS['Common'], { size: 14 })}
                   </div>
                   
                   <div className="flex gap-2">
                     {isEquipped && (
                       <div className="text-amber-500" title="Equipped">
                         <CheckCircle size={14} fill="currentColor" className="text-slate-900" />
                       </div>
                     )}
                     {/* Sell Button - Stop propagation to prevent equip when selling */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); onSell(cookie.id); }}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sell Cookie"
                     >
                        <Trash2 size={14} />
                     </button>
                   </div>
                </div>

                <div className="text-center mb-2">
                   <div 
                      className="w-12 h-12 mx-auto rounded-full mb-2 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: cookie.colorHex }}
                   ></div>
                   <h4 className="font-bold text-sm text-slate-200 truncate leading-tight" title={cookie.name}>
                      {cookie.name}
                   </h4>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider">{cookie.rarity}</p>
                </div>

                <div className="bg-black/20 rounded p-1 text-center flex items-center justify-center gap-1">
                   {isEquipped ? (
                     <span className="text-[10px] font-bold text-amber-500 uppercase">Equipped</span>
                   ) : (
                     <>
                        <MousePointer2 size={10} className="text-slate-500" />
                        <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">Equip</span>
                     </>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inventory;
