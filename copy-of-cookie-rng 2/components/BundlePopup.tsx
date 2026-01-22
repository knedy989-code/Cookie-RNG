
import React, { useEffect, useState } from 'react';
import { BundleOffer } from '../types';
import { Gift, X, Timer } from 'lucide-react';

interface BundlePopupProps {
  offer: BundleOffer;
  onBuy: () => void;
  onClose: () => void;
  canAfford: boolean;
}

const BundlePopup: React.FC<BundlePopupProps> = ({ offer, onBuy, onClose, canAfford }) => {
  const [timeLeft, setTimeLeft] = useState(offer.duration);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Reset timer when offer changes
    setTimeLeft(offer.duration);
    setIsExiting(false);
  }, [offer.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [offer.id]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  const progressPercent = (timeLeft / offer.duration) * 100;

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 w-80 
      transition-all duration-300 ease-out transform
      ${isExiting ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}
      animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]
    `}>
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-slate-800 w-full">
            <div 
              className="h-full bg-amber-500 transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
        </div>

        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>

        <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-slate-800 ${offer.iconColor} animate-bounce`}>
                    <Gift size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-white leading-tight">{offer.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                         <Timer size={10} /> Limited Offer
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">{offer.description}</p>

            <div className="space-y-1 mb-4">
                {offer.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                         <span>{item.count}x {item.id === 'buff_sugar' ? 'Sugar Rush Vial' : item.id === 'repair_kit' ? "Baker's Glue" : 'Titanium Wrapper'}</span>
                    </div>
                ))}
            </div>

            <button 
              onClick={onBuy}
              disabled={!canAfford}
              className={`
                w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                transition-all
                ${canAfford 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
              `}
            >
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] line-through opacity-70 decoration-red-500">{offer.originalCost}</span>
                    <span>{offer.cost} Bits</span>
                </div>
                <span className="ml-auto text-xs bg-black/20 px-2 py-1 rounded">
                    -{Math.round(((offer.originalCost - offer.cost) / offer.originalCost) * 100)}%
                </span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default BundlePopup;
