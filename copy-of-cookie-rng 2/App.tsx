
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Cookie, Rarity, BundleOffer } from './types';
import { UPGRADE_COSTS, RARITY_DURABILITY, BUNDLES } from './constants';
import CookieClicker from './components/CookieClicker';
import RngSystem from './components/RngSystem';
import Inventory from './components/Inventory';
import Upgrades from './components/Upgrades';
import ItemShop from './components/ItemShop';
import CrateRoom from './components/CrateRoom';
import BundlePopup from './components/BundlePopup';
import QuestBoard from './components/QuestBoard';
import { LayoutGrid, Cookie as CookieIcon, ShoppingBag, ArrowUpCircle, Package, Volume2, VolumeX, X, Terminal, Infinity, Scroll } from 'lucide-react';

const INITIAL_STATE: GameState = {
  bits: 0,
  totalBitsEarned: 0,
  clickCount: 0,
  cookies: [],
  upgrades: {
    clickPowerLevel: 1,
    luckLevel: 0,
    autoClickerLevel: 0,
    ascensionLevel: 0
  },
  activeEffects: {
    clickMultiplier: 1,
    clickMultiplierEndTime: 0,
    protectedClicks: 0
  },
  unlockedRarities: [],
  activeCookieId: undefined,
  settings: {
    soundEnabled: true
  },
  cheatMode: false,
  chronoSpawnerUnlocked: false,
  claimedQuestIds: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'roll' | 'inventory' | 'upgrades' | 'shop' | 'crates' | 'quests'>('roll');
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'info' | 'success'} | null>(null);
  const [activeBundle, setActiveBundle] = useState<BundleOffer | null>(null);
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretCodeInput, setSecretCodeInput] = useState('');

  // Load Game
  useEffect(() => {
    const saved = localStorage.getItem('cookie_rng_save_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({
          ...INITIAL_STATE,
          ...parsed,
          upgrades: {
            ...INITIAL_STATE.upgrades,
            ...parsed.upgrades,
            // Ensure ascension exists for older saves
            ascensionLevel: parsed.upgrades.ascensionLevel ?? 0
          },
          activeEffects: parsed.activeEffects || INITIAL_STATE.activeEffects,
          settings: parsed.settings || INITIAL_STATE.settings,
          cookies: parsed.cookies.map((c: any) => {
            const defDurability = RARITY_DURABILITY[c.rarity as Rarity] || 100;
            return {
             ...c,
             durability: c.durability ?? defDurability,
             maxDurability: c.maxDurability ?? defDurability
            };
          }),
          cheatMode: parsed.cheatMode || false,
          chronoSpawnerUnlocked: parsed.chronoSpawnerUnlocked || false,
          claimedQuestIds: parsed.claimedQuestIds || []
        }));
      } catch (e) {
        console.error("Save file corrupted", e);
      }
    }
  }, []);

  // Save Game
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('cookie_rng_save_v3', JSON.stringify(gameState));
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameState]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Bundle Spawner
  useEffect(() => {
    const interval = setInterval(() => {
        // 15% chance every 10s to spawn a bundle if none is active
        if (!activeBundle && Math.random() < 0.15) { 
             const randomBundle = BUNDLES[Math.floor(Math.random() * BUNDLES.length)];
             setActiveBundle(randomBundle);
        }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeBundle]);

  // Effect Timer Logic (Buff Expiration)
  useEffect(() => {
    const timer = setInterval(() => {
        setGameState(prev => {
            if (prev.activeEffects.clickMultiplier > 1 && Date.now() > prev.activeEffects.clickMultiplierEndTime) {
                return {
                    ...prev,
                    activeEffects: {
                        ...prev.activeEffects,
                        clickMultiplier: 1
                    }
                };
            }
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto Clicker Logic
  useEffect(() => {
    if (gameState.upgrades.autoClickerLevel === 0) return;

    const interval = setInterval(() => {
      // Calculate total multiplier from collection
      const collectionMultiplier = gameState.cookies.reduce((sum, cookie) => sum + (cookie.baseValue * 0.1), 0);
      const baseAuto = gameState.upgrades.autoClickerLevel * 0.5;
      const earnings = baseAuto * (1 + collectionMultiplier);

      setGameState(prev => ({
        ...prev,
        bits: prev.bits + earnings,
        totalBitsEarned: prev.totalBitsEarned + earnings
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.upgrades.autoClickerLevel, gameState.cookies]);

  // Helper: Calculate Click Power
  const getClickPower = useCallback(() => {
    const base = gameState.upgrades.clickPowerLevel;
    
    // Ascension Bonus (Flat)
    let ascensionBonus = 0;
    if (gameState.upgrades.ascensionLevel === 1) ascensionBonus = 3;
    if (gameState.upgrades.ascensionLevel >= 2) ascensionBonus = 8;

    // Each cookie owned adds a small % bonus to click power based on its value
    const collectionBonus = gameState.cookies.reduce((sum, cookie) => sum + cookie.baseValue, 0);
    
    // Add base + ascension before applying collection % multiplier logic
    const rawPower = base + ascensionBonus + (collectionBonus * 0.1);
    
    // Apply temporary multiplier
    return rawPower * gameState.activeEffects.clickMultiplier;
  }, [gameState.upgrades.clickPowerLevel, gameState.upgrades.ascensionLevel, gameState.cookies, gameState.activeEffects.clickMultiplier]);

  // Determine Active Cookie Object
  const activeCookie = gameState.activeCookieId 
    ? gameState.cookies.find(c => c.id === gameState.activeCookieId) || null
    : (gameState.cookies.length > 0 
        ? gameState.cookies.reduce((prev, current) => (prev.baseValue > current.baseValue) ? prev : current) 
        : null);

  const handleCookieClick = () => {
    const power = getClickPower();
    
    setGameState(prev => {
      let nextCookies = prev.cookies;
      let nextActiveId = prev.activeCookieId;
      let brokenMsg = null;
      let nextProtectedClicks = prev.activeEffects.protectedClicks;

      // Handle Durability Logic (Permanent Mechanic)
      if (activeCookie && !prev.cheatMode) {
         // Check shield
         if (nextProtectedClicks > 0) {
             nextProtectedClicks -= 1;
             // No durability loss
         } else {
             const newDurability = activeCookie.durability - 1;
             
             if (newDurability <= 0) {
                // Cookie breaks
                nextCookies = prev.cookies.filter(c => c.id !== activeCookie.id);
                nextActiveId = undefined; // Reset selection
                brokenMsg = `Your ${activeCookie.name} crumbled into dust!`;
             } else {
                // Update durability
                nextCookies = prev.cookies.map(c => 
                  c.id === activeCookie.id ? { ...c, durability: newDurability } : c
                );
             }
         }
      }

      if (brokenMsg) {
          setToast({ msg: brokenMsg, type: 'error' });
      }

      return {
        ...prev,
        bits: prev.bits + power,
        totalBitsEarned: prev.totalBitsEarned + power,
        clickCount: prev.clickCount + 1,
        cookies: nextCookies,
        activeCookieId: nextActiveId,
        activeEffects: {
            ...prev.activeEffects,
            protectedClicks: nextProtectedClicks
        }
      };
    });
  };

  const spendBits = (amount: number): boolean => {
    if (gameState.cheatMode) return true; // Free stuff in cheat mode

    if (gameState.bits >= amount) {
      setGameState(prev => ({ ...prev, bits: prev.bits - amount }));
      return true;
    }
    return false;
  };

  const handleRollComplete = (newCookie: Cookie) => {
    setGameState(prev => ({
      ...prev,
      cookies: [...prev.cookies, newCookie],
      unlockedRarities: Array.from(new Set([...prev.unlockedRarities, newCookie.rarity])),
      activeCookieId: newCookie.id // Auto equip newly rolled cookie
    }));
  };

  const handleEquipCookie = (id: string) => {
    setGameState(prev => ({ ...prev, activeCookieId: id }));
  };

  const handleSellCookie = (id: string) => {
    const cookie = gameState.cookies.find(c => c.id === id);
    if (!cookie) return;
    
    const sellValue = Math.floor(cookie.baseValue * 10);
    
    setGameState(prev => ({
      ...prev,
      bits: prev.bits + sellValue,
      cookies: prev.cookies.filter(c => c.id !== id),
      activeCookieId: prev.activeCookieId === id ? undefined : prev.activeCookieId
    }));
  };

  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !prev.settings.soundEnabled
      }
    }));
  };

  const handleBuyItem = (itemId: string, cost: number) => {
      if (!spendBits(cost)) {
          setToast({ msg: "Not enough Bits!", type: 'error' });
          return;
      }

      setGameState(prev => {
          const newState = { ...prev };
          let msg = "Item purchased!";

          switch (itemId) {
              case 'repair_kit':
                  if (activeCookie) {
                      const amountToHeal = Math.floor(activeCookie.maxDurability * 0.5);
                      const newDurability = Math.min(activeCookie.maxDurability, activeCookie.durability + amountToHeal);
                      
                      newState.cookies = prev.cookies.map(c => 
                          c.id === activeCookie.id ? { ...c, durability: newDurability } : c
                      );
                      msg = "Cookie repaired!";
                  }
                  break;
              
              case 'shield':
                  newState.activeEffects = {
                      ...prev.activeEffects,
                      protectedClicks: prev.activeEffects.protectedClicks + 100
                  };
                  msg = "Titanium Wrapper applied! Next 100 clicks safe.";
                  break;

              case 'buff_sugar':
                  // Add time if already active, or start new
                  const currentEndTime = Math.max(Date.now(), prev.activeEffects.clickMultiplierEndTime);
                  newState.activeEffects = {
                      ...prev.activeEffects,
                      clickMultiplier: 2,
                      clickMultiplierEndTime: currentEndTime + 60000 // Add 60s
                  };
                  msg = "Sugar Rush! 2x Click Power for 60s.";
                  break;
          }
          
          setToast({ msg, type: 'success' });
          return newState;
      });
  };

  const handleBuyBundle = () => {
      if (!activeBundle) return;
      if (!spendBits(activeBundle.cost)) {
          setToast({ msg: "Not enough Bits for bundle!", type: 'error' });
          return;
      }

      setGameState(prev => {
          const newState = { ...prev };
          let totalRepairs = 0;
          let totalShields = 0;
          let totalSugar = 0;

          activeBundle.items.forEach(item => {
              if (item.id === 'repair_kit') totalRepairs += item.count;
              if (item.id === 'shield') totalShields += (item.count * 100);
              if (item.id === 'buff_sugar') totalSugar += item.count;
          });

          // Apply Repairs
          if (totalRepairs > 0 && activeCookie) {
             const amountToHeal = Math.floor(activeCookie.maxDurability * 0.5) * totalRepairs;
             const newDurability = Math.min(activeCookie.maxDurability, activeCookie.durability + amountToHeal);
             newState.cookies = prev.cookies.map(c => 
                 c.id === activeCookie.id ? { ...c, durability: newDurability } : c
             );
          }

          // Apply Shields
          if (totalShields > 0) {
              newState.activeEffects.protectedClicks += totalShields;
          }

          // Apply Sugar Rush
          if (totalSugar > 0) {
              const currentEndTime = Math.max(Date.now(), prev.activeEffects.clickMultiplierEndTime);
              newState.activeEffects.clickMultiplier = 2;
              newState.activeEffects.clickMultiplierEndTime = currentEndTime + (totalSugar * 60000);
          }

          return newState;
      });

      setToast({ msg: "Bundle Acquired!", type: 'success' });
      setActiveBundle(null);
  };

  const handleOpenCrate = async (crateId: string): Promise<{ type: any; value: number; message: string }> => {
      let cost = 0;
      if (crateId === 'crate_rusty') cost = 500;
      if (crateId === 'crate_iron') cost = 2500;
      if (crateId === 'crate_gilded') cost = 10000;
      if (crateId === 'crate_diamond') cost = 50000;

      if (!spendBits(cost)) {
          setToast({ msg: "Not enough Bits!", type: 'error' });
          return { type: 'bits', value: 0, message: 'Failed' };
      }

      // Logic
      let type: 'bits' | 'repair' | 'buff' | 'jackpot' | 'frenzy' = 'bits';
      let value = 0;
      let message = "";
      
      // Defaults for buff
      let buffMultiplier = 5;
      let buffDuration = 20000;

      const rand = Math.random();

      if (crateId === 'crate_rusty') {
         // Low risk, low reward
         if (rand < 0.2) {
             value = Math.floor(Math.random() * 200) + 100; // Loss (100-300)
             message = "Scraps found.";
         } else if (rand < 0.9) {
             value = Math.floor(Math.random() * 500) + 400; // Break even / small profit (400-900)
             message = "Solid haul.";
         } else {
             value = Math.floor(Math.random() * 1000) + 1000; // Win (1000-2000)
             message = "Lucky find!";
         }
      } 
      else if (crateId === 'crate_iron') {
         // Utility focus
         if (rand < 0.3) {
             // Repair
             type = 'repair';
             message = "Emergency Repair Kit found!";
         } else if (rand < 0.8) {
             // Standard Bits
             value = Math.floor(Math.random() * 1000) + 1500; // 1500-2500
             message = "Iron-clad earnings.";
         } else {
             // High Bits
             value = Math.floor(Math.random() * 3000) + 3000; // 3000-6000
             message = "Heavy payout!";
         }
      }
      else if (crateId === 'crate_gilded') {
         // High variance
         if (rand < 0.4) {
             value = Math.floor(Math.random() * 3000) + 5000; // 5000-8000 (Loss)
             message = "A disappointing chest...";
         } else if (rand < 0.8) {
             value = Math.floor(Math.random() * 8000) + 12000; // 12k-20k (Win)
             message = "Golden Riches!";
         } else if (rand < 0.95) {
             type = 'frenzy';
             value = 0;
             message = "FRENZY! 5x Power for 20s";
         } else {
             type = 'jackpot';
             value = 50000;
             message = "JACKPOT! 50,000 Bits!";
         }
      }
      else if (crateId === 'crate_diamond') {
          // Extremely High Stakes
          if (rand < 0.05) {
             // Troll
             value = 1;
             message = "Just... coal. (1 Bit)";
          } else if (rand < 0.30) {
             // Refund
             value = 50000;
             message = "Money Back Guarantee.";
          } else if (rand < 0.70) {
             // Profit
             value = Math.floor(Math.random() * 100000) + 100000; // 100k - 200k
             message = "Shiny Profits!";
          } else if (rand < 0.90) {
             // Time Warp Buff
             type = 'frenzy';
             value = 0;
             buffMultiplier = 20;
             buffDuration = 30000;
             message = "TIME WARP! 20x Power for 30s";
          } else {
             // Mega Jackpot
             type = 'jackpot';
             value = 1000000;
             message = "DIAMOND RAIN! 1M Bits!";
          }
      }

      // Apply effects
      if (type === 'bits' || type === 'jackpot') {
          setGameState(prev => ({ ...prev, bits: prev.bits + value, totalBitsEarned: prev.totalBitsEarned + value }));
      }
      if (type === 'repair' && activeCookie) {
          setGameState(prev => ({
              ...prev,
              cookies: prev.cookies.map(c => 
                  c.id === activeCookie.id ? { ...c, durability: c.maxDurability } : c
              )
          }));
      }
      if (type === 'frenzy') {
          setGameState(prev => ({
              ...prev,
              activeEffects: {
                  ...prev.activeEffects,
                  clickMultiplier: buffMultiplier,
                  clickMultiplierEndTime: Date.now() + buffDuration
              }
          }));
      }

      return { type, value, message };
  };

  const buyUpgrade = (type: 'clickPower' | 'luck' | 'autoClicker' | 'ascension') => {
    // Cheat Mode Override
    if (gameState.cheatMode) {
        setGameState(prev => {
            const upgrades = { ...prev.upgrades };
            if (type === 'luck') upgrades.luckLevel = 5;
            if (type === 'autoClicker') upgrades.autoClickerLevel = 5;
            if (type === 'ascension') upgrades.ascensionLevel = 2;
            // clickPower not generally used in UI but kept for safety
            if (type === 'clickPower') upgrades.clickPowerLevel = 100;
            return { ...prev, upgrades };
        });
        setToast({ msg: "MAXIMIZED.", type: 'success' });
        return;
    }

    const currentLevel = gameState.upgrades[type === 'clickPower' ? 'clickPowerLevel' : type === 'luck' ? 'luckLevel' : type === 'autoClicker' ? 'autoClickerLevel' : 'ascensionLevel'];
    const cost = UPGRADE_COSTS[type](currentLevel);

    // ASCENSION SPECIAL LOGIC
    if (type === 'ascension') {
        if (gameState.bits >= cost) {
            setGameState(prev => ({
                ...INITIAL_STATE,
                bits: 0,
                totalBitsEarned: prev.totalBitsEarned, // Keep lifetime stats
                clickCount: 0, 
                cookies: [], 
                upgrades: {
                    ...INITIAL_STATE.upgrades,
                    ascensionLevel: prev.upgrades.ascensionLevel + 1
                },
                activeEffects: INITIAL_STATE.activeEffects,
                unlockedRarities: [],
                activeCookieId: undefined,
                settings: prev.settings,
                cheatMode: prev.cheatMode,
                chronoSpawnerUnlocked: prev.chronoSpawnerUnlocked,
                claimedQuestIds: prev.claimedQuestIds // Keep quest progress
            }));
            setToast({ msg: "ASCENSION ACHIEVED. REALITY RESET.", type: 'success' });
            setActiveTab('roll'); // Reset view to roll
        } else {
             setToast({ msg: "Not enough Bits to Ascend.", type: 'error' });
        }
        return;
    }

    if (spendBits(cost)) {
      setGameState(prev => ({
        ...prev,
        upgrades: {
          ...prev.upgrades,
          [type === 'clickPower' ? 'clickPowerLevel' : type === 'luck' ? 'luckLevel' : type === 'autoClicker' ? 'autoClickerLevel' : 'ascensionLevel']: currentLevel + 1
        }
      }));
    }
  };

  const handleClaimQuest = (questId: string, reward: number) => {
      setGameState(prev => ({
          ...prev,
          bits: prev.bits + reward,
          totalBitsEarned: prev.totalBitsEarned + reward,
          claimedQuestIds: [...prev.claimedQuestIds, questId]
      }));
      setToast({ msg: `Quest Complete! +${reward} Bits`, type: 'success' });
  };

  const handleSpawnChrono = () => {
        const spawnedCookie: Cookie = {
            id: `c_chrono_spawn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: "Replicated Chrono Cookie",
            description: "A cookie duplicated from the timeline.",
            rarity: Rarity.DIVINE,
            baseValue: 100,
            colorHex: '#06B6D4',
            dateObtained: Date.now(),
            durability: Number.MAX_SAFE_INTEGER,
            maxDurability: Number.MAX_SAFE_INTEGER
        };

        setGameState(prev => ({
            ...prev,
            cookies: [...prev.cookies, spawnedCookie],
            unlockedRarities: Array.from(new Set([...prev.unlockedRarities, Rarity.DIVINE]))
        }));
        setToast({ msg: "Chrono Cookie Materialized.", type: 'success' });
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = secretCodeInput.trim().toLowerCase();

    if (code === "chronocookie") {
         setGameState(prev => ({
             ...prev,
             bits: 999_999_999_999_999, // Infinite money
             cheatMode: true
         }));
         setToast({ msg: "TIMELINE ALTERED. GOD MODE ACTIVE.", type: 'success' });
         setShowSecretInput(false);
         setSecretCodeInput('');
    } else if (code === "chronocookie1") {
        // Indestructible Chrono Cookie + 5M Bits + Infinite 5x Multiplier
        const indestructibleCookie: Cookie = {
            id: `c_chrono_infinite_${Date.now()}`,
            name: "Eternal Chrono Cookie",
            description: "A cookie frozen in time. It will never break.",
            rarity: Rarity.DIVINE,
            baseValue: 100,
            colorHex: '#06B6D4',
            dateObtained: Date.now(),
            durability: Number.MAX_SAFE_INTEGER, // Indestructible for all practical purposes
            maxDurability: Number.MAX_SAFE_INTEGER
        };

        setGameState(prev => ({
            ...prev,
            bits: prev.bits + 5000000,
            cookies: [...prev.cookies, indestructibleCookie],
            unlockedRarities: Array.from(new Set([...prev.unlockedRarities, Rarity.DIVINE])),
            activeCookieId: indestructibleCookie.id,
            activeEffects: {
                ...prev.activeEffects,
                clickMultiplier: 5,
                // Approx 100 years duration
                clickMultiplierEndTime: Date.now() + (1000 * 60 * 60 * 24 * 365 * 100)
            },
            chronoSpawnerUnlocked: true
        }));
        setToast({ msg: "ETERNAL POWER GRANTED. SPAWNER UNLOCKED.", type: 'success' });
        // Do not close input so user can see button
        setSecretCodeInput('');
    } else {
        setToast({ msg: "ACCESS DENIED", type: 'error' });
        setSecretCodeInput(''); // clear input on fail
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-gray-100 flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden relative">
      
      {/* Secret Cheat Button */}
      <button 
        onClick={() => setShowSecretInput(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 w-10 h-24 bg-red-900/50 hover:bg-red-600 border-l-2 border-red-500 z-[999] cursor-pointer shadow-lg backdrop-blur-sm flex items-center justify-center transition-all duration-300 group rounded-l-xl"
        title="Dev Tools" 
      >
         <span className="-rotate-90 text-[10px] font-bold text-red-200 group-hover:text-white uppercase tracking-widest whitespace-nowrap">
            Secret
         </span>
      </button>

      {/* Secret Input Modal */}
      {showSecretInput && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-[fadeIn_0.2s]">
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-green-500/30 rounded-lg p-8 shadow-[0_0_100px_rgba(34,197,94,0.1)] relative overflow-hidden">
                {/* CRT Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
                
                <button 
                    onClick={() => setShowSecretInput(false)} 
                    className="absolute top-4 right-4 text-green-700 hover:text-green-400 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8 text-green-500 animate-pulse">
                        <Terminal size={32} />
                        <h3 className="font-mono text-2xl tracking-[0.2em] font-bold">SYSTEM OVERRIDE</h3>
                    </div>

                    {/* CHRONO SPAWNER BUTTON */}
                    {gameState.chronoSpawnerUnlocked && (
                         <button
                            type="button"
                            onClick={handleSpawnChrono}
                            className="w-full mb-8 bg-cyan-900/20 border border-cyan-500 text-cyan-400 font-mono py-4 hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                            <Infinity size={20} className="group-hover:animate-spin" />
                            <span>Summon Chrono Cookie</span>
                            <Infinity size={20} className="group-hover:animate-spin" />
                        </button>
                    )}
                    
                    <form onSubmit={handleSecretSubmit}>
                        <div className="mb-2 text-green-800 font-mono text-xs uppercase tracking-widest">Authentication Required</div>
                        <input 
                            autoFocus
                            type="text" 
                            value={secretCodeInput}
                            onChange={(e) => setSecretCodeInput(e.target.value)}
                            className="w-full bg-black border-2 border-green-900 text-green-400 font-mono p-4 text-xl outline-none focus:border-green-500 placeholder-green-900/30 tracking-widest uppercase transition-colors"
                            placeholder="ENTER CODE..."
                        />
                        <button 
                            type="submit"
                            className="w-full mt-6 bg-green-900/10 border border-green-500/30 text-green-500 font-mono py-4 hover:bg-green-500 hover:text-black transition-all uppercase tracking-[0.2em] font-bold"
                        >
                            Execute Sequence
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] animate-[popIn_0.3s_ease-out]">
           <div className={`px-6 py-3 rounded-full shadow-2xl font-bold border border-white/10 ${
               toast.type === 'error' ? 'bg-red-600 text-white' : 
               toast.type === 'success' ? 'bg-emerald-600 text-white' :
               'bg-blue-600 text-white'
           }`}>
             {toast.msg}
           </div>
        </div>
      )}

      {/* Bundle Popup */}
      {activeBundle && (
        <BundlePopup 
          offer={activeBundle}
          onClose={() => setActiveBundle(null)}
          onBuy={handleBuyBundle}
          canAfford={gameState.bits >= activeBundle.cost || !!gameState.cheatMode}
        />
      )}

      {/* Left Panel: Clicker Area */}
      <div className="w-full md:w-1/3 min-h-[40vh] md:min-h-screen border-b md:border-b-0 md:border-r border-white/5 bg-[#161616] flex flex-col relative z-10">
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                Infinite Crumb
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-1">
                Power: {getClickPower().toFixed(1)} / click
            </p>
          </div>
          
          <button 
            onClick={toggleSound}
            className={`p-2 rounded-full transition-colors ${gameState.settings.soundEnabled ? 'text-amber-500 bg-amber-900/20' : 'text-gray-600 bg-gray-800'}`}
            title={gameState.settings.soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
             {gameState.settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
        
        <div className="flex-grow flex items-center justify-center">
          <CookieClicker 
            state={gameState} 
            onCookieClick={handleCookieClick} 
            clickPower={getClickPower()} 
            selectedCookie={activeCookie}
            soundEnabled={gameState.settings.soundEnabled}
          />
        </div>

        {/* Quick Stats Footer */}
        <div className="p-4 text-center border-t border-white/5 text-xs text-gray-500">
          <div>
             <span className="block text-white font-bold text-sm">{gameState.clickCount}</span>
             Total Clicks
          </div>
        </div>
      </div>

      {/* Right Panel: Game Systems */}
      <div className="w-full md:w-2/3 flex flex-col h-screen overflow-hidden">
        
        {/* Navigation */}
        <div className="flex border-b border-white/5 bg-[#161616] overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('roll')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'roll' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <CookieIcon size={16} /> <span className="hidden sm:inline">Summon</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'inventory' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <LayoutGrid size={16} /> <span className="hidden sm:inline">Inv</span>
          </button>
          <button 
            onClick={() => setActiveTab('quests')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'quests' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Scroll size={16} /> <span className="hidden sm:inline">Quests</span>
          </button>
          <button 
            onClick={() => setActiveTab('crates')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'crates' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Package size={16} /> <span className="hidden sm:inline">Crates</span>
          </button>
          <button 
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'upgrades' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <ArrowUpCircle size={16} /> <span className="hidden sm:inline">Tech</span>
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-4 px-2 min-w-[80px] flex items-center justify-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${activeTab === 'shop' ? 'text-amber-500 bg-white/5 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <ShoppingBag size={16} /> <span className="hidden sm:inline">Shop</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto bg-[#111] p-4 relative">
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <div className="relative z-10">
            {activeTab === 'roll' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center mb-8 mt-4">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Cookie Summoning</h2>
                  <p className="text-gray-400">Spend bits to obtain rare and mythical cookies.</p>
                </div>
                <RngSystem 
                  state={gameState} 
                  onRollComplete={handleRollComplete} 
                  spendBits={spendBits}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <Inventory 
                  state={gameState} 
                  onSell={handleSellCookie} 
                  onEquip={handleEquipCookie}
                />
              </div>
            )}

            {activeTab === 'quests' && (
               <div className="animate-[fadeIn_0.3s_ease-out]">
                  <QuestBoard state={gameState} onClaim={handleClaimQuest} />
               </div>
            )}

            {activeTab === 'crates' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <CrateRoom 
                  state={gameState} 
                  onOpenCrate={handleOpenCrate}
                />
              </div>
            )}

            {activeTab === 'upgrades' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center mb-8 mt-4">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Tech Upgrades</h2>
                  <p className="text-gray-400">Enhance your clicking power and luck stats.</p>
                </div>
                <Upgrades state={gameState} buyUpgrade={buyUpgrade} />
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                 <ItemShop state={gameState} onBuy={handleBuyItem} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default App;
