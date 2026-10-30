import { useState } from 'react';
import StockMarketCity from './components/City/StockMarketCity';
import GameHUD from './components/UI/GameHUD';
import LandingScreen from './components/UI/LandingScreen';
import LoadingScreen from './components/UI/LoadingScreen';
import BuildingInteraction from './components/Buildings/BuildingInteraction';
import MissionIntroduction from './components/Missions/MissionIntroduction';
import MissionLearningScreen from './components/Missions/MissionLearningScreen';
import MissionsModal from './components/UI/MissionsModal';
import SettingsModal from './components/UI/SettingsModal';
import QuizScreen from './components/Quiz/QuizScreen';
import BadgeCollection from './components/Badges/BadgeCollection';
import PlayerProgressPanel from './components/Player/PlayerProgressPanel';
import BadgeUnlockNotification from './components/Notifications/BadgeUnlockNotification';
import LevelUpNotification from './components/Player/LevelUpNotification';
import XPRewardAnimation from './components/Player/XPRewardAnimation';
import ConfettiCelebration from './components/UI/ConfettiCelebration';
import { useMission } from './hooks/useMission';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { soundFX } from './utils/audio';

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [gameState, setGameState] = useState('landing'); // 'landing' | 'loading' | 'city'
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // null | 'missions' | 'settings'
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showPlayerProgressModal, setShowPlayerProgressModal] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [webGLSupported] = useState(() => checkWebGLSupport());

  // Centralized Player Progression Hook (Phase 3)
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
  } = useMission((missionId) => {
    recordMissionComplete(missionId);
  });

  const handleEnterCity = () => {
    soundFX.init();
    if (soundFX.musicEnabled) {
      soundFX.startMusic();
    }
    soundFX.playClick();
    setGameState('loading');
  };

  const handleLoadingFinished = () => {
    setGameState('city');
  };

  const handleSelectBuilding = (buildingId) => {
    setSelectedBuilding(buildingId);
    // Close other HUD modals if opening a building
    setActiveModal(null);
    // Record visit for Market Explorer badge
    if (buildingId) {
      recordBuildingVisit(buildingId);
    }
  };

  const handleResetCamera = () => {
    setSelectedBuilding(null);
  };

  const handleStartQuiz = (quizId) => {
    exitMission();
    setSelectedBuilding(null);
    setActiveQuizId(quizId || 'technova-m1');
  };

  const handleCompleteQuiz = (score, totalQuestions) => {
    if (activeQuizId) {
      recordQuizComplete(activeQuizId, score, totalQuestions);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950 text-white text-center">
        <div className="max-w-md p-8 rounded-3xl glass-panel border border-red-500/40 shadow-2xl">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-2xl font-bold font-heading mb-2">WebGL Unavailable</h2>
          <p className="text-sm text-slate-400 mb-4">
            Stock Market City requires WebGL hardware acceleration to render the interactive 3D financial world. Please enable WebGL or try a modern browser like Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Landing Experience */}
      {gameState === 'landing' && (
        <LandingScreen onEnterCity={handleEnterCity} />
      )}

      {/* Loading Experience */}
      {gameState === 'loading' && (
        <LoadingScreen onLoaded={handleLoadingFinished} />
      )}

      {/* 3D Stock Market City (Persisted once loading starts for seamless shader warmup) */}
      {(gameState === 'loading' || gameState === 'city') && (
        <div
          className={`w-full h-full absolute inset-0 transition-opacity duration-1000 ${
            gameState === 'city' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <StockMarketCity
            selectedBuilding={selectedBuilding}
            onSelectBuilding={handleSelectBuilding}
            onResetTarget={handleResetCamera}
          />
        </div>
      )}

      {/* Game HUD Overlay (Active during City Exploration) */}
      {gameState === 'city' && (
        <GameHUD
          selectedBuilding={selectedBuilding}
          onSelectBuilding={handleSelectBuilding}
          onResetCamera={handleResetCamera}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenAchievements={() => setShowBadgesModal(true)}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenPlayerProgress={() => setShowPlayerProgressModal(true)}
          onOpenBadges={() => setShowBadgesModal(true)}
          playerXP={progress.totalXP}
          levelInfo={levelInfo}
          walletBalance={progress.walletBalance || 10000}
          badgeCount={badgeCount}
          completedMissionsCount={progress.completedMissions.length}
        />
      )}

      {/* Building Information Side Panel (Displays alongside 3D environment) */}
      {gameState === 'city' && selectedBuilding && !missionPhase && !activeQuizId && (
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
      {missionPhase === 'intro' && activeMission && (
        <MissionIntroduction
          mission={activeMission}
          onStartLearning={startLearning}
          onBack={exitMission}
        />
      )}

      {/* Interactive Mission Learning Screen */}
      {(missionPhase === 'learning' || missionPhase === 'complete') && activeMission && (
        <MissionLearningScreen
          mission={activeMission}
          onComplete={completeMission}
          onExit={exitMission}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Interactive Quiz Screen (Phase 3) */}
      {activeQuizId && (
        <QuizScreen
          quizId={activeQuizId}
          onClose={handleCloseQuiz}
          onCompleteQuiz={handleCompleteQuiz}
        />
      )}

      {/* Badge & Achievement Collection Modal (Phase 3) */}
      {showBadgesModal && (
        <BadgeCollection
          unlockedBadges={progress.unlockedBadges}
          badgeUnlockDates={progress.badgeUnlockDates}
          onClose={() => setShowBadgesModal(false)}
        />
      )}

      {/* Player Profile & XP Progression Panel (Phase 3) */}
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
            // State updates are handled automatically inside usePlayerProgress
            window.location.reload();
          }}
        />
      )}

      {/* City-wide HUD Modals */}
      {activeModal === 'missions' && (
        <MissionsModal
          onClose={() => setActiveModal(null)}
          onSelectBuilding={handleSelectBuilding}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onResetCamera={handleResetCamera}
        />
      )}

      {/* Global Notifications for Level Ups, Badge Unlocks, and XP rewards */}
      {activeNotification?.type === 'badge' && (
        <BadgeUnlockNotification
          badge={activeNotification.badge}
          bonusXp={activeNotification.bonusXp}
          onDismiss={dismissNotification}
        />
      )}

      {activeNotification?.type === 'levelup' && (
        <LevelUpNotification
          oldLevel={activeNotification.oldLevel}
          newLevel={activeNotification.newLevel}
          newTitle={activeNotification.newTitle}
          onDismiss={dismissNotification}
        />
      )}

      {activeNotification?.type === 'xp' && (
        <XPRewardAnimation
          amount={activeNotification.amount}
          source={activeNotification.source}
          onDismiss={dismissNotification}
        />
      )}

      {/* Celebratory Particle / Confetti System */}
      {(showConfetti || activeNotification?.type === 'levelup' || activeNotification?.type === 'badge') && (
        <ConfettiCelebration onComplete={() => setShowConfetti(false)} />
      )}
    </div>
  );
}
