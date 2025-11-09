export const allGarageParts = [
  // STARTER TIER - Unlocked through basic exercises
  { 
    name: 'Titanium Exhaust', 
    category: 'Performance', 
    boost: '+15 HP',
    tier: 'Starter',
    unlockRequirement: 'Complete 5 Journal entries',
    unlockType: 'journal_count',
    unlockValue: 5,
    description: 'Lightens your mental load through self-reflection.',
    skillMapping: 'Self-awareness through journaling'
  },
  { 
    name: 'Carbon Fiber Hood', 
    category: 'Weight Reduction', 
    boost: '-20 lbs',
    tier: 'Starter',
    unlockRequirement: 'Complete 3 Bonfire breathing sessions',
    unlockType: 'bonfire_count',
    unlockValue: 3,
    description: 'Reduces burden through mindful breathing.',
    skillMapping: 'Emotional regulation through breathwork'
  },

  // KNIGHT TIER - Requires specific exercise mastery
  { 
    name: 'Brembo Brake Kit', 
    category: 'Braking', 
    boost: 'Enhanced Stopping',
    tier: 'Knight',
    unlockRequirement: 'Complete 10 Reforge exercises',
    unlockType: 'reforge_count',
    unlockValue: 10,
    description: 'Gain control over racing thoughts through cognitive restructuring.',
    skillMapping: 'Thought-stopping and cognitive flexibility (CBT)'
  },
  { 
    name: 'Coilover Suspension', 
    category: 'Handling', 
    boost: 'Improved Cornering',
    tier: 'Knight',
    unlockRequirement: 'Reach Level 5',
    unlockType: 'level',
    unlockValue: 5,
    description: 'Navigate life challenges with improved adaptability.',
    skillMapping: 'Flexibility and adaptive coping (DBT)'
  },
  { 
    name: 'Active Center Differential', 
    category: 'Performance', 
    boost: 'Dynamic Adaptability',
    tier: 'Knight',
    unlockRequirement: 'Maintain 7-day journal streak',
    unlockType: 'journal_streak',
    unlockValue: 7,
    description: 'Balance different aspects of life through consistent practice.',
    skillMapping: 'Mindfulness and consistent self-care'
  },

  // LEGENDARY TIER - Requires sustained commitment
  { 
    name: 'HKS Turbo Kit', 
    category: 'Performance', 
    boost: '+50 HP',
    tier: 'Legendary',
    unlockRequirement: 'Reach Level 10 and earn 2000 XP',
    unlockType: 'level_and_xp',
    unlockValue: { level: 10, xp: 2000 },
    description: 'Supercharge your mental resilience through mastery.',
    skillMapping: 'Advanced coping and thriving under pressure'
  },
  { 
    name: 'Roll Cage', 
    category: 'Durability', 
    boost: 'Enhanced Resilience',
    tier: 'Legendary',
    unlockRequirement: 'Complete 25 total exercises across all tools',
    unlockType: 'total_exercises',
    unlockValue: 25,
    description: 'Build unshakeable inner strength through diverse practice.',
    skillMapping: 'Comprehensive resilience and crisis tolerance (DBT)'
  },
];

export const partTiers = {
  'Starter': {
    color: 'text-slate-400',
    borderColor: 'border-slate-500',
    bgColor: 'bg-slate-500/10',
    description: 'Foundation upgrades unlocked through early practice'
  },
  'Knight': {
    color: 'text-blue-400',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Advanced upgrades requiring skill mastery'
  },
  'Legendary': {
    color: 'text-gold-accent',
    borderColor: 'border-gold-accent',
    bgColor: 'bg-gold-accent/10',
    description: 'Elite upgrades for sustained commitment'
  }
};

export const getUnlockProgress = (user, part) => {
  if (!user) return { progress: 0, total: 0, unlocked: false };

  const isUnlocked = user.unlocked_parts?.includes(part.name) || false;
  if (isUnlocked) return { progress: part.unlockValue, total: part.unlockValue, unlocked: true };

  switch (part.unlockType) {
    case 'journal_count':
      return { 
        progress: user.journal_count || 0, 
        total: part.unlockValue,
        unlocked: (user.journal_count || 0) >= part.unlockValue
      };
    case 'bonfire_count':
      return { 
        progress: user.bonfire_count || 0, 
        total: part.unlockValue,
        unlocked: (user.bonfire_count || 0) >= part.unlockValue
      };
    case 'reforge_count':
      return { 
        progress: user.reforge_count || 0, 
        total: part.unlockValue,
        unlocked: (user.reforge_count || 0) >= part.unlockValue
      };
    case 'level':
      return { 
        progress: user.level || 1, 
        total: part.unlockValue,
        unlocked: (user.level || 1) >= part.unlockValue
      };
    case 'journal_streak':
      return { 
        progress: user.journal_streak || 0, 
        total: part.unlockValue,
        unlocked: (user.journal_streak || 0) >= part.unlockValue
      };
    case 'level_and_xp':
      const levelMet = (user.level || 1) >= part.unlockValue.level;
      const xpMet = (user.xp || 0) >= part.unlockValue.xp;
      return { 
        progress: levelMet && xpMet ? 1 : 0, 
        total: 1,
        unlocked: levelMet && xpMet,
        levelProgress: user.level || 1,
        xpProgress: user.xp || 0
      };
    case 'total_exercises':
      const total = (user.journal_count || 0) + (user.bonfire_count || 0) + 
                   (user.reforge_count || 0) + (user.exposure_count || 0);
      return { 
        progress: total, 
        total: part.unlockValue,
        unlocked: total >= part.unlockValue
      };
    default:
      return { progress: 0, total: 0, unlocked: false };
  }
};
