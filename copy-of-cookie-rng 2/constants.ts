
import React from 'react';
import { Cookie, Rarity, BundleOffer, Quest, QuestType } from './types';
import { Sparkles, Cookie as CookieIcon, Crown, Zap, Star, Ghost, Sun, Flame, Moon, Hammer, Shield, Gift, Timer, Package, Container, Gem, Infinity, Diamond } from 'lucide-react';

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#A0A0A0',      // Gray
  [Rarity.UNCOMMON]: '#4ADE80',    // Green
  [Rarity.RARE]: '#60A5FA',        // Blue
  [Rarity.ULTRA_RARE]: '#9333EA',  // Purple
  [Rarity.EPIC]: '#C084FC',        // Light Purple
  [Rarity.LEGENDARY]: '#FACC15',   // Gold
  [Rarity.MYTHICAL]: '#F43F5E',    // Red/Pink
  [Rarity.ASCENDED]: '#22D3EE',    // Cyan/Electric Blue
  [Rarity.DIVINE]: '#FFFFFF',      // Pure White/Glowing
};

export const RARITY_DURABILITY: Record<Rarity, number> = {
  [Rarity.COMMON]: 50,
  [Rarity.UNCOMMON]: 100,
  [Rarity.RARE]: 250,
  [Rarity.ULTRA_RARE]: 600,
  [Rarity.EPIC]: 1000,
  [Rarity.LEGENDARY]: 2500,
  [Rarity.MYTHICAL]: 5000,
  [Rarity.ASCENDED]: 10000,
  [Rarity.DIVINE]: 25000,
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 5000,
  [Rarity.UNCOMMON]: 3000,
  [Rarity.RARE]: 1500,
  [Rarity.ULTRA_RARE]: 400,
  [Rarity.EPIC]: 0,
  [Rarity.LEGENDARY]: 0,
  [Rarity.MYTHICAL]: 0,
  [Rarity.ASCENDED]: 0,
  [Rarity.DIVINE]: 0, 
};

export const RARE_ROLL_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 4500,
  [Rarity.UNCOMMON]: 0,
  [Rarity.RARE]: 3000,
  [Rarity.ULTRA_RARE]: 500,
  [Rarity.EPIC]: 0,
  [Rarity.LEGENDARY]: 10,
  [Rarity.MYTHICAL]: 0,
  [Rarity.ASCENDED]: 0,
  [Rarity.DIVINE]: 0,
};

export const EPIC_ROLL_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0,
  [Rarity.UNCOMMON]: 0,
  [Rarity.RARE]: 3000,
  [Rarity.ULTRA_RARE]: 4000,
  [Rarity.EPIC]: 2500,
  [Rarity.LEGENDARY]: 500,
  [Rarity.MYTHICAL]: 0,
  [Rarity.ASCENDED]: 0,
  [Rarity.DIVINE]: 0,
};

export const MYTHICAL_ROLL_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0,
  [Rarity.UNCOMMON]: 0,
  [Rarity.RARE]: 4000, 
  [Rarity.ULTRA_RARE]: 3000,
  [Rarity.EPIC]: 2000,
  [Rarity.LEGENDARY]: 800,
  [Rarity.MYTHICAL]: 200, 
  [Rarity.ASCENDED]: 0,
  [Rarity.DIVINE]: 0,
};

export const ASCENDED_ROLL_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0,
  [Rarity.UNCOMMON]: 0,
  [Rarity.RARE]: 0,
  [Rarity.ULTRA_RARE]: 0,
  [Rarity.EPIC]: 0,
  [Rarity.LEGENDARY]: 6000, // Common for this tier (Universe/Black Hole)
  [Rarity.MYTHICAL]: 3000,  // (Void Cookie)
  [Rarity.ASCENDED]: 900,   // (Lord of Cookies) ~9%
  [Rarity.DIVINE]: 100,     // (Cookie God) ~1%
};

export const UPGRADE_COSTS = {
  clickPower: (level: number) => Math.floor(50 * Math.pow(1.5, level)), 
  luck: (level: number) => {
    switch (level) {
      case 0: return 250;
      case 1: return 500;   
      case 2: return 600;   
      case 3: return 700;   
      case 4: return 888;   
      case 5: return 1000;  
      default:
        return Math.floor(1000 * Math.pow(1.5, level - 4));
    }
  },
  autoClicker: (level: number) => {
    switch (level) {
      case 0: return 300;   
      case 1: return 500;   
      case 2: return 680;   
      case 3: return 790;   
      case 4: return 1000;  
      default:
        return Math.floor(1000 * Math.pow(1.5, level - 4));
    }
  },
  ascension: (level: number) => {
      if (level === 0) return 100000; 
      if (level === 1) return 500000; 
      return 999999999;
  }
};

export const ROLL_COST = 100;
export const RARE_ROLL_COST = 200;
export const EPIC_ROLL_COST = 500;
export const MYTHICAL_ROLL_COST = 1000;
export const ASCENDED_ROLL_COST = 200000;

export const SHOP_ITEMS = [
  {
    id: 'repair_kit',
    name: "Baker's Glue",
    description: "Repairs the currently equipped cookie by 50%.",
    cost: 250,
    icon: Hammer,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20'
  },
  {
    id: 'shield',
    name: "Titanium Wrapper",
    description: "Prevents durability loss for the next 100 clicks.",
    cost: 500,
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20'
  },
  {
    id: 'buff_sugar',
    name: "Sugar Rush Vial",
    description: "Doubles your click power for 60 seconds.",
    cost: 400,
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20'
  }
];

export const BUNDLES: BundleOffer[] = [
  {
    id: 'b_safety',
    name: 'Safety First',
    description: 'Keep your cookies in one piece.',
    items: [
      { id: 'repair_kit', count: 1 },
      { id: 'shield', count: 1 }
    ],
    cost: 550,
    originalCost: 750, 
    duration: 15000, // 15s
    iconColor: 'text-blue-400'
  },
  {
    id: 'b_rush',
    name: 'Adrenaline Pack',
    description: 'Double the sugar, double the speed.',
    items: [
      { id: 'buff_sugar', count: 2 }
    ],
    cost: 600,
    originalCost: 800,
    duration: 12000, // 12s
    iconColor: 'text-yellow-400'
  },
  {
    id: 'b_mega',
    name: 'Mechanic Special',
    description: 'Everything you need to keep clicking.',
    items: [
      { id: 'repair_kit', count: 2 },
      { id: 'shield', count: 2 },
      { id: 'buff_sugar', count: 1 }
    ],
    cost: 1200,
    originalCost: 1900,
    duration: 20000, // 20s
    iconColor: 'text-emerald-400'
  }
];

export const CRATE_DEFS = [
  {
    id: 'crate_rusty',
    name: 'Rusty Lockbox',
    cost: 500,
    description: 'A rusty old box. Usually contains pocket change.',
    color: 'text-amber-700',
    borderColor: 'border-amber-700/50',
    bgColor: 'bg-amber-900/10',
    icon: Package,
    contents: [
      { label: "100 - 300 Bits", chance: 20, type: 'bad' },
      { label: "400 - 900 Bits", chance: 70, type: 'common' },
      { label: "1,000 - 2,000 Bits", chance: 10, type: 'rare' },
    ]
  },
  {
    id: 'crate_iron',
    name: 'Iron Strongbox',
    cost: 2500,
    description: 'Sturdy and reliable. Good bits and occasional repairs.',
    color: 'text-slate-300',
    borderColor: 'border-slate-400/50',
    bgColor: 'bg-slate-800/50',
    icon: Container,
    contents: [
      { label: "Repair Kit (Full Heal)", chance: 30, type: 'rare' },
      { label: "1,500 - 2,500 Bits", chance: 50, type: 'common' },
      { label: "3,000 - 6,000 Bits", chance: 20, type: 'epic' },
    ]
  },
  {
    id: 'crate_gilded',
    name: 'Gilded Treasury',
    cost: 10000,
    description: 'High stakes, high rewards. Jackpots and multipliers inside.',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-900/20',
    icon: Gem,
    contents: [
      { label: "5,000 - 8,000 Bits", chance: 40, type: 'bad' },
      { label: "12,000 - 20,000 Bits", chance: 40, type: 'common' },
      { label: "Frenzy (5x Power / 20s)", chance: 15, type: 'epic' },
      { label: "JACKPOT (50,000 Bits)", chance: 5, type: 'legendary' },
    ]
  },
  {
    id: 'crate_diamond',
    name: 'Shiny Diamond Crate',
    cost: 50000,
    description: 'A blindingly bright box. Extreme risk, extreme power.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/50',
    bgColor: 'bg-cyan-900/20',
    icon: Diamond,
    contents: [
      { label: "Coal (1 Bit)", chance: 5, type: 'bad' },
      { label: "Money Back (50k)", chance: 25, type: 'common' },
      { label: "100k - 200k Bits", chance: 40, type: 'rare' },
      { label: "Time Warp (20x / 30s)", chance: 20, type: 'epic' },
      { label: "DIAMOND RAIN (1M Bits)", chance: 10, type: 'legendary' },
    ]
  }
];

export const QUEST_DEFS: Quest[] = [
  // Clicks
  { id: 'q_click_1', name: 'Baby Steps', description: 'Click the cookie 50 times.', type: QuestType.TOTAL_CLICKS, target: 50, reward: 200 },
  { id: 'q_click_2', name: 'Finger Workout', description: 'Click the cookie 250 times.', type: QuestType.TOTAL_CLICKS, target: 250, reward: 800 },
  { id: 'q_click_3', name: 'Carpal Tunnel', description: 'Click the cookie 1,000 times.', type: QuestType.TOTAL_CLICKS, target: 1000, reward: 2500 },
  { id: 'q_click_4', name: 'Machine', description: 'Click the cookie 5,000 times.', type: QuestType.TOTAL_CLICKS, target: 5000, reward: 10000 },
  
  // Earnings
  { id: 'q_earn_1', name: 'Pocket Change', description: 'Earn 1,000 Bits total.', type: QuestType.TOTAL_EARNED, target: 1000, reward: 500 },
  { id: 'q_earn_2', name: 'Entrepreneur', description: 'Earn 10,000 Bits total.', type: QuestType.TOTAL_EARNED, target: 10000, reward: 2000 },
  { id: 'q_earn_3', name: 'Tycoon', description: 'Earn 100,000 Bits total.', type: QuestType.TOTAL_EARNED, target: 100000, reward: 15000 },
  { id: 'q_earn_4', name: 'Millionaire', description: 'Earn 1,000,000 Bits total.', type: QuestType.TOTAL_EARNED, target: 1000000, reward: 100000 },

  // Collection
  { id: 'q_col_1', name: 'Collector I', description: 'Own 5 unique cookies.', type: QuestType.COLLECTION_SIZE, target: 5, reward: 1000 },
  { id: 'q_col_2', name: 'Collector II', description: 'Own 15 unique cookies.', type: QuestType.COLLECTION_SIZE, target: 15, reward: 5000 },
  { id: 'q_col_3', name: 'Curator', description: 'Own 30 unique cookies.', type: QuestType.COLLECTION_SIZE, target: 30, reward: 20000 },

  // Upgrades
  { id: 'q_upg_1', name: 'Tech Savvy', description: 'Have 5 total upgrade levels.', type: QuestType.UPGRADE_LEVELS, target: 5, reward: 1500 },
  { id: 'q_upg_2', name: 'Maximized', description: 'Have 15 total upgrade levels.', type: QuestType.UPGRADE_LEVELS, target: 15, reward: 10000 },
];


export const STANDARD_COOKIES: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[] = [
  // Common
  { id: 'c_rust', name: 'Rust Cookie', description: 'Tastes like old metal.', rarity: Rarity.COMMON, baseValue: 1, colorHex: '#8B4513' },
  { id: 'c_sugar', name: 'Sugar Cookie', description: 'Just pure sugar.', rarity: Rarity.COMMON, baseValue: 1, colorHex: '#F5F5DC' },
  
  // Uncommon
  { id: 'c_ice', name: 'Ice Cookie', description: 'Freezing cold to the touch.', rarity: Rarity.UNCOMMON, baseValue: 1.5, colorHex: '#A5F2F3' },
  { id: 'c_hard', name: 'Hard Cookie', description: 'You might break a tooth.', rarity: Rarity.UNCOMMON, baseValue: 1.6, colorHex: '#708090' },

  // Rare
  { id: 'c_red', name: 'Red Velvet', description: 'Rich and smooth.', rarity: Rarity.RARE, baseValue: 2, colorHex: '#990000' },
  { id: 'c_macha', name: 'Macha Delight', description: 'Earthy green tea flavor.', rarity: Rarity.RARE, baseValue: 2.4, colorHex: '#90EE90' },

  // Ultra Rare
  { id: 'c_smoke', name: 'Smoke Cookie', description: 'Made of solidified smoke.', rarity: Rarity.ULTRA_RARE, baseValue: 2.8, colorHex: '#696969' },
  { id: 'c_dark', name: 'Dark Cookie', description: 'Absorbs all light.', rarity: Rarity.ULTRA_RARE, baseValue: 3.0, colorHex: '#111111' },
];

export const RARE_ROLL_COOKIES: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[] = [
  { id: 'c_cloud', name: 'Cloud Cookie', description: 'Light as air.', rarity: Rarity.COMMON, baseValue: 2.5, colorHex: '#E0FFFF' },
  { id: 'c_basic', name: 'Basic Batch', description: 'A standard issue cookie.', rarity: Rarity.COMMON, baseValue: 1.5, colorHex: '#C0C0C0' },
  { id: 'c_red_velvet', name: 'Red Velvet', description: 'Rich and smooth red delight.', rarity: Rarity.RARE, baseValue: 2, colorHex: '#990000' },
  { id: 'c_scookie', name: 'Scookie', description: 'A mysterious striped cookie.', rarity: Rarity.RARE, baseValue: 3, colorHex: '#5D4037' },
  { id: 'c_gookie', name: 'Gookie', description: 'Ideally gooey inside.', rarity: Rarity.RARE, baseValue: 3.5, colorHex: '#76FF03' },
  { id: 'c_ricky', name: 'Ricky Cookie', description: 'The fan favorite.', rarity: Rarity.RARE, baseValue: 3.9, colorHex: '#FF4081' },
  { id: 'c_cook', name: 'Cook Cookie', description: 'Baked to absolute perfection.', rarity: Rarity.ULTRA_RARE, baseValue: 4, colorHex: '#6200EA' },
  { id: 'c_super', name: 'Super Cookie', description: 'Radiating immense power.', rarity: Rarity.LEGENDARY, baseValue: 5, colorHex: '#FFD700' },
];

export const EPIC_ROLL_COOKIES: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[] = [
    { id: 'c_gold_leaf', name: 'Gold Leaf', description: 'Covered in edible gold.', rarity: Rarity.RARE, baseValue: 6, colorHex: '#FFD700' },
    { id: 'c_emerald', name: 'Emerald Chip', description: 'Hard as a gem.', rarity: Rarity.ULTRA_RARE, baseValue: 7, colorHex: '#50C878' },
    { id: 'c_amethyst', name: 'Amethyst Bite', description: 'Crystalline crunch.', rarity: Rarity.ULTRA_RARE, baseValue: 7.5, colorHex: '#9966CC' },
    { id: 'c_fortune', name: 'Fortune Cookie', description: 'Contains a vague prophecy.', rarity: Rarity.EPIC, baseValue: 10, colorHex: '#F4C430' },
    { id: 'c_sapphire', name: 'Sapphire Swirl', description: 'Deep blue mystery.', rarity: Rarity.EPIC, baseValue: 11, colorHex: '#0F52BA' },
    { id: 'c_ruby', name: 'Ruby Glaze', description: 'Red hot value.', rarity: Rarity.LEGENDARY, baseValue: 18, colorHex: '#E0115F' },
];

export const MYTHICAL_ROLL_COOKIES: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[] = [
    { id: 'c_golden_chip', name: 'Golden Chip', description: 'A rare cookie with real gold flakes.', rarity: Rarity.RARE, baseValue: 5, colorHex: '#DAA520' },
    { id: 'c_plasma', name: 'Plasma Cookie', description: 'Vibrating with high energy.', rarity: Rarity.EPIC, baseValue: 8, colorHex: '#D946EF' },
    { id: 'c_magma', name: 'Magma Cookie', description: 'Still molten on the inside.', rarity: Rarity.EPIC, baseValue: 8.5, colorHex: '#EA580C' },
    { id: 'c_dragon', name: 'Dragon Scale', description: 'Forged in dragonfire.', rarity: Rarity.LEGENDARY, baseValue: 12, colorHex: '#DC143C' },
    { id: 'c_unicorn', name: 'Unicorn Horn', description: 'Spiral shaped and magical.', rarity: Rarity.LEGENDARY, baseValue: 13, colorHex: '#EC4899' },
    { id: 'c_super_myth', name: 'Super Cookie', description: 'Radiating immense power.', rarity: Rarity.LEGENDARY, baseValue: 5, colorHex: '#FFD700' }, 
    { id: 'c_nebula', name: 'Nebula Swirl', description: 'Contains a baby universe.', rarity: Rarity.MYTHICAL, baseValue: 25, colorHex: '#4B0082' },
    { id: 'c_void', name: 'Void Biscuit', description: 'Stares back at you.', rarity: Rarity.MYTHICAL, baseValue: 28, colorHex: '#000000' },
    { id: 'c_chrono', name: 'Chrono-Crunch', description: 'Tastes like time itself.', rarity: Rarity.MYTHICAL, baseValue: 30, colorHex: '#06B6D4' },
];

export const ASCENDED_ROLL_COOKIES: Omit<Cookie, 'dateObtained' | 'durability' | 'maxDurability'>[] = [
    // Legendary (Fodder for this tier)
    { id: 'c_universe', name: 'Universe Cookie', description: 'Contains the dust of a billion stars.', rarity: Rarity.LEGENDARY, baseValue: 14, colorHex: '#4B0082' },
    { id: 'c_blackhole', name: 'Black Hole', description: 'Consumes light, emits flavor.', rarity: Rarity.LEGENDARY, baseValue: 20, colorHex: '#121212' },
    
    // Mythical
    { id: 'c_void_cookie', name: 'Void Cookie', description: 'Absolute emptiness, absolute power.', rarity: Rarity.MYTHICAL, baseValue: 30, colorHex: '#2E0249' },
    
    // Ascended
    { id: 'c_lord', name: 'Lord of Cookies', description: 'Bow before the Lord.', rarity: Rarity.ASCENDED, baseValue: 50, colorHex: '#22D3EE' },
    
    // Divine (God Tier)
    { id: 'c_god', name: 'Cookie God', description: 'The Creator of all crumbs.', rarity: Rarity.DIVINE, baseValue: 225, colorHex: '#FFFFFF' },
];

export const RARITY_ICONS: Record<Rarity, React.ElementType> = {
  [Rarity.COMMON]: CookieIcon,
  [Rarity.UNCOMMON]: Zap,
  [Rarity.RARE]: Star,
  [Rarity.ULTRA_RARE]: Flame,
  [Rarity.EPIC]: Sparkles,
  [Rarity.LEGENDARY]: Crown,
  [Rarity.MYTHICAL]: Ghost,
  [Rarity.ASCENDED]: Infinity,
  [Rarity.DIVINE]: Sun,
};
