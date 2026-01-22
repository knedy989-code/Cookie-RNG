
import React from 'react';
import { GameState, QuestType } from '../types';
import { QUEST_DEFS } from '../constants';
import { Scroll, Check, Coins, Lock } from 'lucide-react';

interface QuestBoardProps {
  state: GameState;
  onClaim: (questId: string, reward: number) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ state, onClaim }) => {
  const getProgress = (type: QuestType): number => {
    switch (type) {
      case QuestType.TOTAL_CLICKS:
        return state.clickCount;
      case QuestType.TOTAL_EARNED:
        return state.totalBitsEarned;
      case QuestType.COLLECTION_SIZE:
        // Use set to ensure unique cookies by original ID prefix if needed, 
        // but current logic makes every roll unique ID. 
        // For "Unique" cookies, strictly we might want to check name or base ID.
        // For simplicity in this clicker: Just total inventory size is usually fine,
        // OR unique names. Let's do unique names for "Collector".
        const uniqueNames = new Set(state.cookies.map(c => c.name));
        return uniqueNames.size;
      case QuestType.UPGRADE_LEVELS:
        return state.upgrades.clickPowerLevel + state.upgrades.luckLevel + state.upgrades.autoClickerLevel;
      default:
        return 0;
    }
  };

  // Sort quests: Unclaimed & Complete > Unclaimed & Incomplete > Claimed
  const sortedQuests = [...QUEST_DEFS].sort((a, b) => {
    const isClaimedA = state.claimedQuestIds.includes(a.id);
    const isClaimedB = state.claimedQuestIds.includes(b.id);
    
    if (isClaimedA && !isClaimedB) return 1;
    if (!isClaimedA && isClaimedB) return -1;

    const progressA = getProgress(a.type);
    const progressB = getProgress(b.type);
    const isCompleteA = progressA >= a.target;
    const isCompleteB = progressB >= b.target;

    if (isCompleteA && !isCompleteB) return -1;
    if (!isCompleteA && isCompleteB) return 1;

    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-3">
        <Scroll className="text-amber-500" /> Quest Log
      </h2>
      <p className="text-slate-400 mb-6 text-sm">Complete milestones to earn extra Bits.</p>

      <div className="grid gap-4">
        {sortedQuests.map((quest) => {
          const currentProgress = getProgress(quest.type);
          const isClaimed = state.claimedQuestIds.includes(quest.id);
          const isComplete = currentProgress >= quest.target;
          const progressPercent = Math.min(100, (currentProgress / quest.target) * 100);

          return (
            <div 
              key={quest.id}
              className={`
                relative rounded-xl border p-4 transition-all
                ${isClaimed 
                  ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                  : isComplete 
                    ? 'bg-slate-800 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'bg-slate-800 border-slate-700'}
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Info Section */}
                <div className="flex-grow">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${isClaimed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {quest.name}
                      </h3>
                      {isClaimed && <Check size={16} className="text-green-500" />}
                   </div>
                   <p className="text-sm text-slate-400 mb-3">{quest.description}</p>
                   
                   {/* Progress Bar */}
                   <div className="w-full max-w-md bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                   </div>
                   <div className="text-xs font-mono text-slate-500 mt-1">
                     {Math.floor(currentProgress).toLocaleString()} / {quest.target.toLocaleString()}
                   </div>
                </div>

                {/* Reward Section */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Reward</div>
                        <div className="font-bold text-amber-400 flex items-center justify-end gap-1">
                             <Coins size={14} /> {quest.reward.toLocaleString()}
                        </div>
                    </div>

                    <button
                        onClick={() => !isClaimed && isComplete && onClaim(quest.id, quest.reward)}
                        disabled={isClaimed || !isComplete}
                        className={`
                            px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 min-w-[120px] justify-center
                            ${isClaimed 
                                ? 'bg-slate-800 text-slate-600 cursor-default border border-slate-700' 
                                : isComplete 
                                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:scale-105 shadow-lg animate-pulse hover:animate-none' 
                                    : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'}
                        `}
                    >
                        {isClaimed ? (
                            'Claimed'
                        ) : isComplete ? (
                            <>
                                <Check size={16} /> Claim
                            </>
                        ) : (
                            <>
                                <Lock size={14} /> Locked
                            </>
                        )}
                    </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestBoard;
