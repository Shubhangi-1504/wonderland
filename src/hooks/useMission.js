import { useState, useCallback } from 'react';
import { soundFX } from '../utils/audio';

export function useMission(onMissionCompleted) {
  const [activeMission, setActiveMission] = useState(null);
  const [missionPhase, setMissionPhase] = useState(null); // 'intro' | 'learning' | 'complete'
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const startMission = useCallback((mission) => {
    soundFX.playBuildingSelect();
    setActiveMission(mission);
    setMissionPhase('intro');
    setCurrentSectionIndex(0);
  }, []);

  const startLearning = useCallback(() => {
    soundFX.playClick();
    setMissionPhase('learning');
    setCurrentSectionIndex(0);
  }, []);

  const completeMission = useCallback((mission) => {
    soundFX.playSuccess();
    setMissionPhase('complete');
    if (onMissionCompleted) {
      onMissionCompleted(mission.id);
    }
  }, [onMissionCompleted]);

  const exitMission = useCallback(() => {
    soundFX.playClick();
    setActiveMission(null);
    setMissionPhase(null);
    setCurrentSectionIndex(0);
  }, []);

  return {
    activeMission,
    missionPhase,
    currentSectionIndex,
    startMission,
    startLearning,
    completeMission,
    exitMission,
  };
}
