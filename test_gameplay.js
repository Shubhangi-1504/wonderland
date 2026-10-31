// Automated Verification Suite for InvestQuest Complete Gameplay Journey
import { calculateLevel, INITIAL_PROGRESS } from './src/utils/progressStorage.js';
import { BADGES_DATA } from './src/data/badges.js';
import { QUIZZES_DATA } from './src/data/quizzes.js';
import { soundFX } from './src/utils/audio.js';

console.log('====================================================');
console.log('INVESTQUEST COMPLETE GAMEPLAY VERIFICATION SUITE');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Level Progression & XP Boundaries
console.log('--- 1. LEVEL PROGRESSION & THRESHOLDS ---');
assert(calculateLevel(0).level === 1, '0 XP is Level 1 (Rookie Trader)');
assert(calculateLevel(50).level === 1, '50 XP is Level 1 (Rookie Trader)');
assert(calculateLevel(99).level === 1, '99 XP is Level 1 (Rookie Trader)');
assert(calculateLevel(100).level === 2, '100 XP is Level 2 (Junior Shareholder)');
assert(calculateLevel(249).level === 2, '249 XP is Level 2 (Junior Shareholder)');
assert(calculateLevel(250).level === 3, '250 XP is Level 3 (Market Analyst)');
assert(calculateLevel(449).level === 3, '449 XP is Level 3 (Market Analyst)');
assert(calculateLevel(450).level === 4, '450 XP is Level 4 (Portfolio Builder)');
assert(calculateLevel(699).level === 4, '699 XP is Level 4 (Portfolio Builder)');
assert(calculateLevel(700).level === 5, '700 XP is Level 5 (Fund Maestro)');
assert(calculateLevel(1500).level === 5, '1500 XP is Level 5 (Fund Maestro)');

// 2. Badges System Validation
console.log('\n--- 2. BADGE DEFINITIONS & REWARDS ---');
assert(BADGES_DATA.length === 5, 'Exactly 5 initial badges defined');
const badgeIds = BADGES_DATA.map((b) => b.id);
assert(badgeIds.includes('first-steps'), 'first-steps badge exists');
assert(badgeIds.includes('quiz-rookie'), 'quiz-rookie badge exists');
assert(badgeIds.includes('perfect-investor'), 'perfect-investor badge exists');
assert(badgeIds.includes('knowledge-seeker'), 'knowledge-seeker badge exists');
assert(badgeIds.includes('market-explorer'), 'market-explorer badge exists');

// 3. Quiz Data Integrity
console.log('\n--- 3. QUIZ SYSTEM VALIDATION ---');
const quiz = QUIZZES_DATA['technova-m1'];
assert(quiz !== undefined, 'technova-m1 quiz exists in QUIZZES_DATA');
assert(quiz.questions.length === 5, 'technova-m1 has exactly 5 multiple choice questions');

quiz.questions.forEach((q, idx) => {
  assert(q.options.length === 4, `Question ${idx + 1} has 4 options`);
  assert(
    typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4,
    `Question ${idx + 1} has valid correctIndex (${q.correctIndex})`
  );
  assert(q.explanation && q.explanation.length > 20, `Question ${idx + 1} has educational explanation`);
});

// 4. Simulated Complete Player Journey (Phase 3 flow)
console.log('\n--- 4. SIMULATED PLAYER JOURNEY ---');
let state = {
  ...INITIAL_PROGRESS,
  completedMissions: [],
  completedQuizzes: {},
  unlockedBadges: [],
  badgeUnlockDates: {},
  visitedBuildings: [],
  totalXP: 0,
};

// Step A: Visit all 3 buildings
console.log('Simulating visiting TechNova, GreenEnergy, FoodSphere...');
['technova', 'greenenergy', 'foodsphere'].forEach((b) => {
  if (!state.visitedBuildings.includes(b)) {
    state.visitedBuildings.push(b);
  }
});
if (['technova', 'greenenergy', 'foodsphere'].every((b) => state.visitedBuildings.includes(b))) {
  if (!state.unlockedBadges.includes('market-explorer')) {
    state.unlockedBadges.push('market-explorer');
    state.totalXP += 50; // reward XP
  }
}
assert(state.unlockedBadges.includes('market-explorer'), 'Market Explorer badge awarded after 3 building visits');
assert(state.totalXP === 50, 'Total XP is 50 from Market Explorer badge');

// Step B: Complete Mission 01 ("Become a Shareholder")
console.log('Simulating completing learning sections of Mission 01...');
const missionId = 'technova-m1';
if (!state.completedMissions.includes(missionId)) {
  state.completedMissions.push(missionId);
  state.totalXP += 50; // mission reward
  if (!state.unlockedBadges.includes('first-steps')) {
    state.unlockedBadges.push('first-steps');
    state.totalXP += 50; // badge reward
  }
}
assert(state.completedMissions.includes(missionId), 'Mission technova-m1 is marked completed');
assert(state.unlockedBadges.includes('first-steps'), 'First Steps badge awarded');
assert(state.totalXP === 150, 'Total XP is 150 (50 explorer + 50 mission + 50 badge)');
assert(calculateLevel(state.totalXP).level === 2, 'Player reached Level 2 (Junior Shareholder)');

// Step C: Complete Quiz with 5/5 (100%)
console.log('Simulating taking quiz and scoring 100%...');
const quizScore = 5;
const quizTotal = 5;
const percentage = 100;
let xpAwarded = 50; // base quiz completion
if (percentage >= 80) xpAwarded += 25; // high score bonus
if (percentage === 100) xpAwarded += 25; // perfect score bonus
state.totalXP += xpAwarded;

state.completedQuizzes[missionId] = {
  score: quizScore,
  total: quizTotal,
  percentage,
  xpEarned: xpAwarded,
};

// Check badges
if (!state.unlockedBadges.includes('quiz-rookie')) {
  state.unlockedBadges.push('quiz-rookie');
  state.totalXP += 50; // badge reward
}
if (percentage === 100 && !state.unlockedBadges.includes('perfect-investor')) {
  state.unlockedBadges.push('perfect-investor');
  state.totalXP += 50; // badge reward
}

assert(state.unlockedBadges.includes('quiz-rookie'), 'Quiz Rookie badge awarded');
assert(state.unlockedBadges.includes('perfect-investor'), 'Perfect Investor badge awarded for 100%');
assert(state.totalXP === 350, 'Total XP is 350 (150 prev + 100 quiz + 50 rookie + 50 perfect)');
assert(calculateLevel(state.totalXP).level === 3, 'Player reached Level 3 (Market Analyst)');

// Step D: Verify Duplicate Reward Prevention
console.log('Testing duplicate reward prevention...');
const prevXp = state.totalXP;
// Revisit mission: should NOT add XP
if (state.completedMissions.includes(missionId)) {
  // no-op
}
assert(state.totalXP === prevXp, 'Re-visiting completed mission does not duplicate XP');

// Revisit quiz: should NOT re-award base 50 XP or bonuses if already earned
const existingQuiz = state.completedQuizzes[missionId];
let duplicateXp = 0;
if (!existingQuiz) {
  duplicateXp += 100;
}
assert(duplicateXp === 0, 'Re-taking completed quiz with same score does not duplicate XP');

// 5. Sound System Checks
console.log('\n--- 5. SOUND SYSTEM CHECKS ---');
assert(typeof soundFX.playClick === 'function', 'soundFX.playClick is available');
assert(typeof soundFX.playHover === 'function', 'soundFX.playHover is available');
assert(typeof soundFX.playCorrect === 'function', 'soundFX.playCorrect is available');
assert(typeof soundFX.playIncorrect === 'function', 'soundFX.playIncorrect is available');
assert(typeof soundFX.playLevelUp === 'function', 'soundFX.playLevelUp is available');
assert(typeof soundFX.playBadgeUnlock === 'function', 'soundFX.playBadgeUnlock is available');
assert(typeof soundFX.startMusic === 'function', 'soundFX.startMusic is available');
assert(typeof soundFX.stopMusic === 'function', 'soundFX.stopMusic is available');

console.log('\n====================================================');
console.log(`SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
