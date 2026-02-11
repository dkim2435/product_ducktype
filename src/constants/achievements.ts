import type { AchievementDef } from '../types/gamification';

export const ACHIEVEMENTS: AchievementDef[] = [
  // Speed
  { id: 'speed-50', name: 'Getting Started', description: 'Reach 50 WPM', icon: '⌨️', category: 'speed' },
  { id: 'speed-75', name: 'Quick Fingers', description: 'Reach 75 WPM', icon: '💨', category: 'speed' },
  { id: 'speed-100', name: 'Speed Demon', description: 'Reach 100 WPM', icon: '⚡', category: 'speed' },
  { id: 'speed-125', name: 'Lightning Fast', description: 'Reach 125 WPM', icon: '🌩️', category: 'speed' },
  { id: 'speed-150', name: 'Supersonic', description: 'Reach 150 WPM', icon: '🚀', category: 'speed' },

  // Accuracy
  { id: 'acc-95', name: 'Sharp Shooter', description: 'Achieve 95% accuracy', icon: '🎯', category: 'accuracy' },
  { id: 'acc-98', name: 'Precision Master', description: 'Achieve 98% accuracy', icon: '💎', category: 'accuracy' },
  { id: 'acc-100', name: 'Flawless', description: 'Achieve 100% accuracy', icon: '🏆', category: 'accuracy' },

  // Consistency
  { id: 'cons-90', name: 'Steady Hands', description: 'Achieve 90% consistency', icon: '🎵', category: 'consistency' },
  { id: 'cons-95', name: 'Metronome', description: 'Achieve 95% consistency', icon: '🎶', category: 'consistency' },

  // Volume
  { id: 'tests-1', name: 'First Steps', description: 'Complete your first test', icon: '🐣', category: 'volume' },
  { id: 'tests-10', name: 'Getting Warmed Up', description: 'Complete 10 tests', icon: '🔟', category: 'volume' },
  { id: 'tests-50', name: 'Dedicated Typist', description: 'Complete 50 tests', icon: '📝', category: 'volume' },
  { id: 'tests-100', name: 'Century Club', description: 'Complete 100 tests', icon: '💯', category: 'volume' },
  { id: 'tests-500', name: 'Typing Veteran', description: 'Complete 500 tests', icon: '🎖️', category: 'volume' },
  { id: 'tests-1000', name: 'Typing Legend', description: 'Complete 1000 tests', icon: '👑', category: 'volume' },

  // Streak
  { id: 'streak-3', name: 'Three-peat', description: '3 day streak', icon: '3️⃣', category: 'streak' },
  { id: 'streak-7', name: 'Weekly Warrior', description: '7 day streak', icon: '📅', category: 'streak' },
  { id: 'streak-14', name: 'Two Week Streak', description: '14 day streak', icon: '🔥', category: 'streak' },
  { id: 'streak-30', name: 'Monthly Master', description: '30 day streak', icon: '📆', category: 'streak' },
  { id: 'streak-100', name: 'Unstoppable', description: '100 day streak', icon: '🌋', category: 'streak' },

  // Special
  { id: 'night-owl', name: 'Night Owl', description: 'Type between 10 PM and 4 AM', icon: '🦉', category: 'special' },
  { id: 'early-bird', name: 'Early Bird', description: 'Type between 5 AM and 7 AM', icon: '🌅', category: 'special' },
  { id: 'marathon', name: 'Marathon Runner', description: '120s test with 100+ WPM', icon: '🏃', category: 'special' },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% accuracy with 50+ WPM', icon: '✨', category: 'special' },
  { id: 'polyglot', name: 'Polyglot', description: 'Complete tests in 2+ languages', icon: '🌍', category: 'special' },
  { id: 'daily-7', name: 'Daily Devotee', description: '7 daily challenges in a row', icon: '📋', category: 'special' },
  { id: 'level-25', name: 'Quarter Century', description: 'Reach level 25', icon: '🥈', category: 'special' },
  { id: 'level-50', name: 'Half Way There', description: 'Reach level 50', icon: '🥇', category: 'special' },
  { id: 'level-100', name: 'Max Level', description: 'Reach level 100', icon: '💫', category: 'special' },
  { id: 'all-lessons', name: 'Graduate', description: 'Complete all lessons', icon: '🎓', category: 'special' },
  { id: 'first-share', name: 'Social Butterfly', description: 'Share your results for the first time', icon: '📢', category: 'special' },

  // Adventure
  { id: 'adventure-first-clear', name: 'Brave Duck', description: 'Clear your first adventure stage', icon: '⚔️', category: 'special' },
  { id: 'adventure-world-1', name: 'Village Hero', description: 'Complete World 1: Duck Village', icon: '🏰', category: 'special' },
  { id: 'adventure-boss-slayer', name: 'Boss Slayer', description: 'Defeat the Shadow Wolf', icon: '🐺', category: 'special' },
  { id: 'adventure-perfect-stage', name: 'Three Stars', description: 'Earn 3 stars on any adventure stage', icon: '⭐', category: 'special' },
  { id: 'adventure-combo-master', name: 'Combo Master', description: 'Reach a 15-hit combo in adventure', icon: '💥', category: 'special' },
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
