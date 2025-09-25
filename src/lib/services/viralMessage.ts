/**
 * Viral Message Engine
 * 
 * Generates contextually appropriate sharing messages based on:
 * - Score achieved
 * - Player level (Seeker, Learner, Thinker, Creator, Visionary)
 * - Achievement type (milestone, high score beat)
 * - Personality variants (humble, competitive, casual)
 */

import { LEVELS } from '@/src/constants/gameConfig';

export interface ViralMessageContext {
  score: number;
  levelIndex: number;
  isHighScoreBeat: boolean;
  previousHighScore?: number;
}

export interface ViralMessage {
  text: string;
  hashtags?: string[];
  appStoreLink: string;
}

// App store links (no tracking)
const APP_STORE_LINKS = {
  ios: 'https://apps.apple.com/us/app/gifted-minds/id6751567047',
  android: 'https://play.google.com/store/apps/details?id=com.shiel.giftedminds',
  web: 'https://giftedminds.app'
};

/**
 * Extensive message template collection (50+ variations)
 */
const MESSAGE_TEMPLATES = {
  // Milestone-based messages
  milestone_50: [
    "Just hit 50 points in Gifted Minds! 🧠 My brain's getting stronger",
    "50 puzzles conquered! Think you can keep up? 💪",
    "Brain training milestone: 50 points unlocked! 🎯",
    "Halfway to 100! 50 points and counting in Gifted Minds 🚀",
    "50-point brain workout complete! Who's next? 💭"
  ],
  
  milestone_100: [
    "Triple digits! 100 points in Gifted Minds 🔥",
    "My puzzle-solving skills are on fire - 100 points! 🚀",
    "Just crossed 100 points. Who's ready for a brain battle? ⚡",
    "100 points achieved! My neurons are officially warmed up 🧠",
    "Century mark reached! 100 points of pure brain power 💪"
  ],
  
  milestone_250: [
    "250 points! My brain is officially in beast mode 🔥",
    "Quarter-thousand points achieved! Puzzle mastery level rising 📈",
    "250-point brain explosion! Think you can match this? 💥",
    "My cognitive engines are firing on all cylinders - 250 points! ⚡",
    "Just hit 250 points. My brain cells are throwing a party! 🎉"
  ],
  
  milestone_500: [
    "Half a thousand! 500 points in Gifted Minds 🚀",
    "500-point brain marathon complete! Who dares to challenge? 🏆",
    "My puzzle-solving superpowers just hit 500 points! ⚡",
    "500 points achieved! My brain is officially dangerous 🧠💥",
    "Just conquered 500 points. Feeling like a puzzle wizard! 🧙‍♂️"
  ],
  
  milestone_1000: [
    "ONE THOUSAND POINTS! My brain just broke the sound barrier! 🚀",
    "4-digit domination! 1000 points of pure cognitive power 🔥",
    "1000 points achieved! My neurons are now classified weapons 💥",
    "Just hit the thousand-point club! Brain level: MAXIMUM 🧠⚡",
    "1000 points unlocked! My puzzle-solving game is unreal 🎯"
  ],

  // Level-based achievement messages
  seeker: [
    "New Seeker high score! Every journey starts somewhere 🌱",
    "Just beat my personal best as a Seeker! Starting strong 🎯",
    "Seeker level progress! My brain adventure begins 🧭",
    "First milestone achieved! Seeker status confirmed 📈",
    "New Seeker record set! Foundation building mode activated 🏗️"
  ],
  
  learner: [
    "Learner level unlocked! My brain is gaining momentum 📚",
    "Just advanced to Learner status! Knowledge is power 💪",
    "Learner achievement unlocked! The plot thickens 🧠",
    "New Learner high score! My cognitive gears are turning ⚙️",
    "Learner level mastery! Brain training is paying off 📈"
  ],
  
  thinker: [
    "Thinker level achieved! My brain is hitting its stride 🧠⚡",
    "Just unlocked Thinker status! Deep thoughts engaged 💭",
    "Thinker level conquered! My neurons are dancing 💃",
    "New Thinker high score! Cognitive complexity embraced 🎯",
    "Thinker achievement unlocked! Brain power intensifying 🔥"
  ],
  
  creator: [
    "Creator level unlocked! My brain is in creative overdrive 🎨",
    "Just achieved Creator status! Innovation mode activated 💡",
    "Creator level mastery! My puzzle-solving is becoming art 🖼️",
    "New Creator high score! Imagination meets intellect 🚀",
    "Creator achievement unlocked! My brain is painting masterpieces 🎭"
  ],
  
  visionary: [
    "VISIONARY LEVEL! My brain has transcended mortal limits 🚀",
    "Visionary status achieved! I can see the puzzle matrix 👁️",
    "Just reached Visionary level! My brain is now legendary 🏆",
    "Visionary mastery unlocked! Puzzle enlightenment achieved 🌟",
    "VISIONARY! My cognitive powers are now off the charts 📊"
  ],

  // Personality variants
  humble: [
    "Not bad for a puzzle game newbie! Can you beat my score? 😊",
    "Slowly getting better at these brain teasers! Progress feels good 🤓",
    "My brain workout is paying off! Anyone else playing? 💪",
    "Just had a decent puzzle session! Room for improvement though 📈",
    "Small wins add up! New personal best achieved 🎯"
  ],
  
  competitive: [
    "Challenge accepted and dominated! Your turn 💪",
    "Just set the bar higher. Think you can reach it? 🏆",
    "New record established! Who's brave enough to challenge? ⚡",
    "My brain just flexed harder than your brain 🧠💪",
    "Puzzle competition: Me 1, Everyone Else 0 🏆"
  ],
  
  casual: [
    "Had some fun with brain puzzles today! Pretty satisfying 😄",
    "Just wrapped up a good puzzle session! Brain feels refreshed 🧠",
    "These Gifted Minds puzzles are oddly addictive! New high score 📱",
    "Brain break well spent! Anyone else love a good puzzle challenge? 🧩",
    "Puzzle time = me time! Just hit a new personal best ✨"
  ],
  
  excited: [
    "YESSS! Just crushed my previous best! Brain power activated! 🔥",
    "OH MY BRAIN! New high score achieved! This feels AMAZING! 🎉",
    "BOOM! Just exploded my old record! Puzzle mastery unlocked! 💥",
    "I'M ON FIRE! New personal best in Gifted Minds! 🚀",
    "BRAIN EXPLOSION! Just set a new record! Can't contain the excitement! ⚡"
  ],

  // Time-based variants
  morning: [
    "Good morning brain workout complete! Starting the day right ☀️",
    "Morning puzzle session: CRUSHED IT! Ready to conquer the day 🌅",
    "Early bird brain training! New high score before breakfast 🐦",
    "Morning cognitive boost achieved! Day officially started properly ☕",
    "Dawn patrol puzzle mastery! Early brain gets the score 🌄"
  ],
  
  evening: [
    "End-of-day brain workout: NAILED IT! Perfect way to unwind 🌙",
    "Evening puzzle session complete! Brain relaxation achieved 🛋️",
    "Nighttime cognitive challenge conquered! Sweet dreams ahead 😴",
    "After-hours brain training! New record before bedtime 🌃",
    "Evening mental marathon complete! Time to rest these neurons 🧠"
  ]
};

/**
 * Generate contextually appropriate viral message
 */
export function generateViralMessage(context: ViralMessageContext): ViralMessage {
  const { score, levelIndex, isHighScoreBeat } = context;
  const levelName = LEVELS[levelIndex].name.toLowerCase();
  
  let selectedTemplate: string;
  let hashtags: string[] = ['#GiftedMinds', '#BrainTraining', '#PuzzleGame'];

  // Priority 1: Milestone messages
  if (score >= 1000) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES.milestone_1000);
    hashtags.push('#ThousandClub', '#BrainPower');
  } else if (score >= 500) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES.milestone_500);
    hashtags.push('#BrainMarathon', '#PuzzleMaster');
  } else if (score >= 250) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES.milestone_250);
    hashtags.push('#BrainBeast', '#CognitiveGains');
  } else if (score >= 100) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES.milestone_100);
    hashtags.push('#TripleDigits', '#BrainFire');
  } else if (score >= 50) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES.milestone_50);
    hashtags.push('#BrainGains', '#PuzzleProgress');
  }
  // Priority 2: Level-based messages
  else if (isHighScoreBeat && MESSAGE_TEMPLATES[levelName as keyof typeof MESSAGE_TEMPLATES]) {
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES[levelName as keyof typeof MESSAGE_TEMPLATES]);
    hashtags.push(`#${LEVELS[levelIndex].name}Level`);
  }
  // Priority 3: Personality-based fallback
  else {
    const personalityType = getPersonalityType(score, isHighScoreBeat);
    selectedTemplate = getRandomTemplate(MESSAGE_TEMPLATES[personalityType]);
  }

  // Create professionally formatted message
  const levelDisplayName = LEVELS[levelIndex]?.name || 'Seeker';
  const achievementStatus = isHighScoreBeat ? '🏆 New Personal Best!' : '💪 Challenge yourself!';

  const finalMessage = `🧠 ${selectedTemplate}

🎯 Level: ${levelDisplayName}
📊 Score: ${score} points
${achievementStatus}

Try Gifted Minds:
${getAppStoreLink()}

#GiftedMinds #BrainTraining #PuzzleGame`;

  return {
    text: finalMessage,
    hashtags,
    appStoreLink: getAppStoreLink()
  };
}

/**
 * Get random template from array
 */
function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Determine personality type based on context
 */
function getPersonalityType(score: number, isHighScoreBeat: boolean): keyof typeof MESSAGE_TEMPLATES {
  const hour = new Date().getHours();
  
  // Time-based selection
  if (hour < 10) return 'morning';
  if (hour > 20) return 'evening';
  
  // Score-based personality
  if (isHighScoreBeat && score > 200) return 'excited';
  if (score > 100) return 'competitive';
  if (score < 50) return 'humble';
  
  return 'casual'; // Default fallback
}

/**
 * Get appropriate app store link based on platform
 */
function getAppStoreLink(): string {
  // Default to iOS app store - could be made platform-specific
  return APP_STORE_LINKS.ios;
}

/**
 * Get sharing analytics data (for local tracking only)
 */
export function getShareAnalytics() {
  return {
    timestamp: Date.now(),
    platform: 'unknown', // Will be set by sharing component
    messageCategory: 'viral_share',
    version: '1.0'
  };
}