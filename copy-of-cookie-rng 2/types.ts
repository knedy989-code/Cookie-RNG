
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  ULTRA_RARE = 'Ultra Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHICAL = 'Mythical',
  ASCENDED = 'Ascended',
  DIVINE = 'Divine' // AI Generated only
}

export interface Cookie {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  baseValue: number; // Multiplier for clicking
  colorHex: string; // Main color for the SVG
  isAiGenerated?: boolean;
  dateObtained: number;
  durability: number;
  maxDurability: number;
}

export interface ActiveEffects {
  clickMultiplier: number;
  clickMultiplierEndTime: number; // Timestamp
  protectedClicks: number; // Number of clicks that won't reduce durability
}

export interface GameSettings {
  soundEnabled: boolean;
}

export interface BundleOffer {
  id: string;
  name: string;
  description: string;
  items: { id: string; count: number }[]; // id references SHOP_ITEMS
  cost: number;
  originalCost: number;
  duration: number; // Duration the offer is valid in ms
  iconColor: string;
}

export enum QuestType {
  TOTAL_CLICKS = 'TOTAL_CLICKS',
  TOTAL_EARNED = 'TOTAL_EARNED',
  COLLECTION_SIZE = 'COLLECTION_SIZE',
  UPGRADE_LEVELS = 'UPGRADE_LEVELS' // Sum of all upgrade levels
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  target: number;
  reward: number;
}

export interface GameState {
  bits: number;
  totalBitsEarned: number;
  clickCount: number;
  cookies: Cookie[];
  upgrades: {
    clickPowerLevel: number;
    luckLevel: number;
    autoClickerLevel: number;
    ascensionLevel: number;
  };
  activeEffects: ActiveEffects;
  unlockedRarities: Rarity[];
  activeCookieId?: string; // The cookie currently displayed on the main clicker
  settings: GameSettings;
  cheatMode?: boolean;
  chronoSpawnerUnlocked?: boolean;
  claimedQuestIds: string[];
}

export interface RollResult {
  cookie: Cookie;
  isNew: boolean;
}
