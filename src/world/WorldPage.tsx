import { useState } from "react";
import StockMarketCity from "../components/City/StockMarketCity";
import GameHUD from "../components/UI/GameHUD";
import BuildingInteraction from "../components/Buildings/BuildingInteraction";
import MissionIntroduction from "../components/Missions/MissionIntroduction";
import MissionLearningScreen from "../components/Missions/MissionLearningScreen";
import QuizScreen from "../components/Quiz/QuizScreen";
import BadgeCollection from "../components/Badges/BadgeCollection";
import PlayerProgressPanel from "../components/Player/PlayerProgressPanel";
import MissionsModal from "../components/UI/MissionsModal";
import SettingsModal from "../components/UI/SettingsModal";
import BadgeUnlockNotification from "../components/Notifications/BadgeUnlockNotification";
import LevelUpNotification from "../components/Player/LevelUpNotification";
import XPRewardAnimation from "../components/Player/XPRewardAnimation";
import ConfettiCelebration from "../components/UI/ConfettiCelebration";
import { usePlayerProgress } from "../hooks/usePlayerProgress";
import { useMission } from "../hooks/useMission";
import { soundFX } from "../utils/audio";
import { useGameStore } from "../store/useGameStore";

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function WorldPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"missions" | "settings" | null>(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showPlayerProgressModal, setShowPlayerProgressModal] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [webGLSupported] = useState(() => checkWebGLSupport());

  // Global Moneyverse store synchronization
  const addGlobalXP = useGameStore((state) => state.addXP);
  const completeGlobalMission = useGameStore((state) => state.completeMission);

  // Centralized Player Progression Hook
  const {
    progress,
    levelInfo,
    activeNotification,
    dismissNotification,
    recordMissionComplete,
    recordQuizComplete,
    recordBuildingVisit,
    badgeCount,
  } = usePlayerProgress();

  // Custom Mission Management Hook
  const {
    activeMission,
    missionPhase,
    startMission,
    startLearning,
    completeMission,
    exitMission,
  } = useMission((missionId: string) => {
    recordMissionComplete(missionId);
    try {
      completeGlobalMission(missionId);
      addGlobalXP(50);
    } catch {
      // safe fallback if store state differs
    }
  });

  const handleSelectBuilding = (buildingId: string | null) => {
    setSelectedBuilding(buildingId);
    setActiveModal(null);
    if (buildingId) {
      soundFX.playClick();
      recordBuildingVisit(buildingId);
    }
  };

  const handleResetCamera = () => {
    setSelectedBuilding(null);
    soundFX.playClick();
  };

  const handleStartQuiz = (quizId?: string) => {
    exitMission();
    setSelectedBuilding(null);
    setActiveQuizId(quizId || "technova-m1");
    soundFX.playClick();
  };

  const handleCompleteQuiz = (score: number, totalQuestions: number) => {
    if (activeQuizId) {
      recordQuizComplete(activeQuizId, score, totalQuestions);
      try {
        addGlobalXP(score * 20);
      } catch {
        // safe fallback
      }
      if (score === totalQuestions) {
        setShowConfetti(true);
      }
    }
  };

  const handleCloseQuiz = () => {
    setActiveQuizId(null);
  };

  if (!webGLSupported) {
    return (
      <main className="flex h-[calc(100vh-49px)] items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-md p-8 rounded-3xl glass-panel border border-red-500/40 shadow-2xl">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-2xl font-bold font-heading mb-2">WebGL Unavailable</h2>
          <p className="text-sm text-slate-400 mb-4">
            Stock Market City requires WebGL hardware acceleration to render the interactive 3D financial world. Please enable WebGL or try a modern browser.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full h-[calc(100vh-49px)] overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Stock Market City Canvas */}
      <div className="w-full h-full absolute inset-0">
        <StockMarketCity
          selectedBuilding={selectedBuilding}
          onSelectBuilding={handleSelectBuilding}
          onResetTarget={handleResetCamera}
        />
      </div>

      {/* Game HUD Overlay */}
      <GameHUD
        selectedBuilding={selectedBuilding}
        onSelectBuilding={handleSelectBuilding}
        onResetCamera={handleResetCamera}
        onOpenMissions={() => setActiveModal("missions")}
        onOpenAchievements={() => setShowBadgesModal(true)}
        onOpenSettings={() => setActiveModal("settings")}
        onOpenPlayerProgress={() => setShowPlayerProgressModal(true)}
        onOpenBadges={() => setShowBadgesModal(true)}
        playerXP={progress.totalXP}
        levelInfo={levelInfo}
        walletBalance={progress.walletBalance || 10000}
        badgeCount={badgeCount}
        completedMissionsCount={progress.completedMissions.length}
      />

      {/* Building Information Side Panel */}
      {selectedBuilding && !missionPhase && !activeQuizId && (
        <BuildingInteraction
          selectedBuildingId={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
          onStartMission={startMission}
          onStartQuiz={handleStartQuiz}
          completedMissionIds={progress.completedMissions}
          completedQuizzes={progress.completedQuizzes}
        />
      )}

      {/* Mission Introduction Screen */}
      {missionPhase === "intro" && activeMission && (
        <MissionIntroduction
          mission={activeMission}
          onStartLearning={startLearning}
          onBack={exitMission}
        />
      )}

      {/* Interactive Mission Learning Screen */}
      {(missionPhase === "learning" || missionPhase === "complete") && activeMission && (
        <MissionLearningScreen
          mission={activeMission}
          onComplete={completeMission}
          onExit={exitMission}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Interactive Quiz Screen */}
      {activeQuizId && (
        <QuizScreen
          quizId={activeQuizId}
          onClose={handleCloseQuiz}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}

      {/* Badge & Achievement Collection Modal */}
      {showBadgesModal && (
        <BadgeCollection
          unlockedBadges={progress.unlockedBadges}
          badgeUnlockDates={progress.badgeUnlockDates}
          onClose={() => setShowBadgesModal(false)}
        />
      )}

      {/* Player Profile & XP Progression Panel */}
      {showPlayerProgressModal && (
        <PlayerProgressPanel
          progress={progress}
          levelInfo={levelInfo}
          onClose={() => setShowPlayerProgressModal(false)}
          onOpenBadges={() => {
            setShowPlayerProgressModal(false);
            setShowBadgesModal(true);
          }}
          onResetProgress={() => {
            window.location.reload();
          }}
        />
      )}

      {/* City-wide HUD Modals */}
      {activeModal === "missions" && (
        <MissionsModal
          onClose={() => setActiveModal(null)}
          onSelectBuilding={handleSelectBuilding}
        />
      )}

      {activeModal === "settings" && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onResetCamera={handleResetCamera}
        />
      )}

      {/* Global Notifications for Level Ups, Badge Unlocks, and XP rewards */}
      {(activeNotification as any)?.type === "badge" && (
        <BadgeUnlockNotification
          badge={(activeNotification as any).badge}
          bonusXp={(activeNotification as any).bonusXp}
          onDismiss={dismissNotification}
        />
      )}

      {(activeNotification as any)?.type === "levelup" && (
        <LevelUpNotification
          oldLevel={(activeNotification as any).oldLevel}
          newLevel={(activeNotification as any).newLevel}
          newTitle={(activeNotification as any).newTitle}
          onDismiss={dismissNotification}
        />
      )}

      {(activeNotification as any)?.type === "xp" && (
        <XPRewardAnimation
          amount={(activeNotification as any).amount}
          source={(activeNotification as any).source}
          onDismiss={dismissNotification}
        />
      )}

      {/* Celebratory Particle / Confetti System */}
      {(showConfetti ||
        (activeNotification as any)?.type === "levelup" ||
        (activeNotification as any)?.type === "badge") && (
        <ConfettiCelebration onComplete={() => setShowConfetti(false)} />
      )}
    </main>
  );
}
