// Player progress storage manager with localStorage persistence and migration safeguards

const STORAGE_KEY = 'investquest_player_progress_v3';

export const LEVEL_TIERS = [
  { level: 1, minXp: 0, maxXp: 99, title: 'Rookie Trader', icon: 'User' },
  { level: 2, minXp: 100, maxXp: 249, title: 'Junior Shareholder', icon: 'Award' },
  { level: 3, minXp: 250, maxXp: 449, title: 'Market Analyst', icon: 'TrendingUp' },
  { level: 4, minXp: 450, maxXp: 699, title: 'Portfolio Builder', icon: 'Briefcase' },
  { level: 5, minXp: 700, maxXp: Infinity, title: 'Fund Maestro', icon: 'Crown' },
];

export const INITIAL_PROGRESS = {
  totalXP: 0,
  currentLevel: 1,
  levelTitle: 'Rookie Trader',
  walletBalance: 10000,
  completedMissions: [], // ['technova-m1']
  completedQuizzes: {},  // { [quizId]: { score: 5, total: 5, percentage: 100, xpEarned: 100, date: '...' } }
  unlockedBadges: [],    // ['first-steps', 'quiz-rookie', ...]
  badgeUnlockDates: {},  // { [badgeId]: 'ISO string' }
  visitedBuildings: [],  // ['technova', 'greenenergy', 'foodsphere']
  lastUpdated: Date.now(),
};

export function calculateLevel(xp) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXp) {
      const tier = LEVEL_TIERS[i];
      const nextTier = LEVEL_TIERS[i + 1] || null;
      const progressInTier = xp - tier.minXp;
      const tierSpan = nextTier ? nextTier.minXp - tier.minXp : 100;
      const progressPercent = nextTier
        ? Math.min(100, Math.floor((progressInTier / tierSpan) * 100))
        : 100;

      return {
        level: tier.level,
        title: tier.title,
        icon: tier.icon,
        currentXp: xp,
        minXp: tier.minXp,
        maxXp: tier.maxXp,
        nextTierMinXp: nextTier ? nextTier.minXp : null,
        xpToNext: nextTier ? nextTier.minXp - xp : 0,
        progressPercent,
      };
    }
  }
  return {
    level: 1,
    title: 'Rookie Trader',
    icon: 'User',
    currentXp: xp,
    minXp: 0,
    maxXp: 99,
    nextTierMinXp: 100,
    xpToNext: 100 - xp,
    progressPercent: Math.min(100, xp),
  };
}

export function loadPlayerProgress() {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate v1/v2 if present
      const oldXp = localStorage.getItem('investquest_xp');
      const oldMissions = localStorage.getItem('investquest_completed_missions');
      if (oldXp || oldMissions) {
        const migratedXp = oldXp ? parseInt(oldXp, 10) : 0;
        const migratedMissions = oldMissions ? JSON.parse(oldMissions) : [];
        const levelData = calculateLevel(migratedXp);
        const migrated = {
          ...INITIAL_PROGRESS,
          totalXP: migratedXp,
          currentLevel: levelData.level,
          levelTitle: levelData.title,
          completedMissions: migratedMissions,
        };
        savePlayerProgress(migrated);
        return migrated;
      }
      return INITIAL_PROGRESS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all keys exist
    const merged = {
      ...INITIAL_PROGRESS,
      ...parsed,
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      completedQuizzes: parsed.completedQuizzes || {},
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      badgeUnlockDates: parsed.badgeUnlockDates || {},
      visitedBuildings: Array.isArray(parsed.visitedBuildings) ? parsed.visitedBuildings : [],
    };
    // Recalculate level to guarantee integrity
    const levelInfo = calculateLevel(merged.totalXP);
    merged.currentLevel = levelInfo.level;
    merged.levelTitle = levelInfo.title;
    return merged;
  } catch (err) {
    console.error('Failed to load player progress from localStorage:', err);
    return INITIAL_PROGRESS;
  }
}

export function savePlayerProgress(progress) {
  if (typeof window === 'undefined') return;
  try {
    const levelInfo = calculateLevel(progress.totalXP || 0);
    const dataToSave = {
      ...progress,
      currentLevel: levelInfo.level,
      levelTitle: levelInfo.title,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return dataToSave;
  } catch (err) {
    console.error('Failed to save player progress to localStorage:', err);
  }
}

export function clearPlayerProgress() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('investquest_xp');
    localStorage.removeItem('investquest_completed_missions');
  } catch (err) {
    console.error('Failed to clear player progress:', err);
  }
}
