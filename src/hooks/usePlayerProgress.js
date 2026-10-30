import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadPlayerProgress,
  savePlayerProgress,
  calculateLevel,
} from '../utils/progressStorage';
import { BADGES_DATA } from '../data/badges';
import { soundFX } from '../utils/audio';

export function usePlayerProgress() {
  const [progress, setProgress] = useState(() => loadPlayerProgress());
  const [activeNotification, setActiveNotification] = useState(null); // { type: 'badge'|'levelup'|'xp', data }

  // Sync state to localStorage on update
  useEffect(() => {
    savePlayerProgress(progress);
  }, [progress]);

  const levelInfo = useMemo(() => {
    return calculateLevel(progress.totalXP);
  }, [progress.totalXP]);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  // Internal helper to trigger badge unlock if not already unlocked
  const checkAndUnlockBadge = useCallback((badgeId, currentProgress) => {
    if (currentProgress.unlockedBadges.includes(badgeId)) {
      return { unlocked: false, updatedProgress: currentProgress };
    }
    const badge = BADGES_DATA.find((b) => b.id === badgeId);
    if (!badge) return { unlocked: false, updatedProgress: currentProgress };

    const updatedBadges = [...currentProgress.unlockedBadges, badgeId];
    const updatedDates = {
      ...currentProgress.badgeUnlockDates,
      [badgeId]: new Date().toISOString(),
    };
    const bonusXp = badge.rewardXp || 0;
    const newTotalXp = currentProgress.totalXP + bonusXp;

    const updated = {
      ...currentProgress,
      unlockedBadges: updatedBadges,
      badgeUnlockDates: updatedDates,
      totalXP: newTotalXp,
    };

    soundFX.playBadgeUnlock();
    setActiveNotification({
      type: 'badge',
      badge,
      bonusXp,
    });

    return { unlocked: true, updatedProgress: updated };
  }, []);

  // Record a completed learning mission
  const recordMissionComplete = useCallback((missionId) => {
    setProgress((prev) => {
      if (prev.completedMissions.includes(missionId)) {
        return prev; // No duplicate rewards
      }

      const missionRewardXp = 50;
      const newXp = prev.totalXP + missionRewardXp;
      const oldLevelInfo = calculateLevel(prev.totalXP);
      const newLevelInfo = calculateLevel(newXp);

      let updated = {
        ...prev,
        completedMissions: [...prev.completedMissions, missionId],
        totalXP: newXp,
      };

      // Check level-up
      if (newLevelInfo.level > oldLevelInfo.level) {
        soundFX.playLevelUp();
        setActiveNotification({
          type: 'levelup',
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          newTitle: newLevelInfo.title,
        });
      } else {
        soundFX.playXPReward();
        setActiveNotification({
          type: 'xp',
          amount: missionRewardXp,
          source: 'Mission Completed',
        });
      }

      // Check badges
      if (updated.completedMissions.length >= 1) {
        const badgeRes = checkAndUnlockBadge('first-steps', updated);
        if (badgeRes.unlocked) updated = badgeRes.updatedProgress;
      }
      if (updated.completedMissions.length >= 3) {
        const badgeRes = checkAndUnlockBadge('knowledge-seeker', updated);
        if (badgeRes.unlocked) updated = badgeRes.updatedProgress;
      }

      return updated;
    });
  }, [checkAndUnlockBadge]);

  // Record a completed quiz with full XP calculation and badge evaluation
  const recordQuizComplete = useCallback((quizId, score, totalQuestions) => {
    setProgress((prev) => {
      const percentage = Math.round((score / totalQuestions) * 100);
      const prevResult = prev.completedQuizzes[quizId];

      let xpToAward = 0;
      // Award base 50 XP if quiz was never completed before
      if (!prevResult) {
        xpToAward += 50;
        if (percentage >= 80) xpToAward += 25; // Bonus for >= 80%
        if (percentage === 100) xpToAward += 25; // Perfect score bonus
      } else {
        // If improving score
        if (prevResult.percentage < 80 && percentage >= 80) xpToAward += 25;
        if (prevResult.percentage < 100 && percentage === 100) xpToAward += 25;
      }

      const newXp = prev.totalXP + xpToAward;
      const oldLevelInfo = calculateLevel(prev.totalXP);
      const newLevelInfo = calculateLevel(newXp);

      let updated = {
        ...prev,
        totalXP: newXp,
        completedQuizzes: {
          ...prev.completedQuizzes,
          [quizId]: {
            score,
            total: totalQuestions,
            percentage,
            xpEarned: (prevResult?.xpEarned || 0) + xpToAward,
            completedAt: new Date().toISOString(),
          },
        },
      };

      // Notification
      if (newLevelInfo.level > oldLevelInfo.level) {
        soundFX.playLevelUp();
        setActiveNotification({
          type: 'levelup',
          oldLevel: oldLevelInfo.level,
          newLevel: newLevelInfo.level,
          newTitle: newLevelInfo.title,
        });
      } else if (xpToAward > 0) {
        soundFX.playXPReward();
        setActiveNotification({
          type: 'xp',
          amount: xpToAward,
          source: percentage === 100 ? 'Perfect Quiz Score!' : 'Quiz Completed',
        });
      }

      // Check badges
      const badge1 = checkAndUnlockBadge('quiz-rookie', updated);
      if (badge1.unlocked) updated = badge1.updatedProgress;

      if (percentage === 100) {
        const badge2 = checkAndUnlockBadge('perfect-investor', updated);
        if (badge2.unlocked) updated = badge2.updatedProgress;
      }

      return updated;
    });
  }, [checkAndUnlockBadge]);

  // Record a building visit
  const recordBuildingVisit = useCallback((buildingId) => {
    setProgress((prev) => {
      if (prev.visitedBuildings.includes(buildingId)) {
        return prev;
      }

      let updated = {
        ...prev,
        visitedBuildings: [...prev.visitedBuildings, buildingId],
      };

      // Check if all 3 landmark buildings visited
      const allThree = ['technova', 'greenenergy', 'foodsphere'].every((b) =>
        updated.visitedBuildings.includes(b)
      );

      if (allThree) {
        const badgeRes = checkAndUnlockBadge('market-explorer', updated);
        if (badgeRes.unlocked) updated = badgeRes.updatedProgress;
      }

      return updated;
    });
  }, [checkAndUnlockBadge]);

  const isMissionCompleted = useCallback(
    (id) => progress.completedMissions.includes(id),
    [progress.completedMissions]
  );

  const getQuizResult = useCallback(
    (id) => progress.completedQuizzes[id] || null,
    [progress.completedQuizzes]
  );

  const isBadgeUnlocked = useCallback(
    (id) => progress.unlockedBadges.includes(id),
    [progress.unlockedBadges]
  );

  return {
    progress,
    levelInfo,
    activeNotification,
    dismissNotification,
    recordMissionComplete,
    recordQuizComplete,
    recordBuildingVisit,
    isMissionCompleted,
    getQuizResult,
    isBadgeUnlocked,
    badgeCount: {
      unlocked: progress.unlockedBadges.length,
      total: BADGES_DATA.length,
    },
  };
}
