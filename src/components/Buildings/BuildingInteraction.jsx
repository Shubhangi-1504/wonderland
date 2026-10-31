import { BUILDINGS_DATA } from '../../data/buildings';
import BuildingInfoPanel from './BuildingInfoPanel';

export default function BuildingInteraction({
  selectedBuildingId,
  onClose,
  onStartMission,
  onStartQuiz,
  completedMissionIds = [],
  completedQuizzes = {},
}) {
  if (!selectedBuildingId || !BUILDINGS_DATA[selectedBuildingId]) {
    return null;
  }

  const building = BUILDINGS_DATA[selectedBuildingId];

  return (
    <BuildingInfoPanel
      building={building}
      onClose={onClose}
      onStartMission={onStartMission}
      onStartQuiz={onStartQuiz}
      completedMissionIds={completedMissionIds}
      completedQuizzes={completedQuizzes}
    />
  );
}
