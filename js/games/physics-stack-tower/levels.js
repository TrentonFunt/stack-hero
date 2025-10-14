/**
 * @file levels.js
 * @game Stack Hero
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Level definitions and difficulty progression for Stack Hero.
 * Defines game parameters for each level including speed, block sizes,
 * and special challenges.
 *
 * @dependencies
 * - game.js: Core game logic
 */

/**
 * Base game configuration
 * @constant
 * @type {Object}
 */
const BASE_CONFIG = {
  pointsPerBlock: 10,
  comboMultiplier: 1.5,
  minBlockWidth: 40,
  maxBlockWidth: 200
};

/**
 * Array of level definitions with increasing difficulty
 * @constant
 * @type {Array}
 */
const LEVELS = [
  {
    id: 1,
    name: "Foundation Builder",
    description: "🏗️ Learn the basics of block stacking. Take your time and build a solid foundation!",
    blocksToComplete: 3,
    blockSpeed: 0.4,
    blockWidthRange: { min: 140, max: 180 },
    perfectThreshold: 0.4,
    speedIncrease: 0.01,
    specialMechanics: {
      type: "tutorial",
      description: "Large blocks, slow speed - perfect for learning!"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 0,
      achievement: "First Steps"
    }
  },
  {
    id: 2,
    name: "Confidence Climber",
    description: "🎯 Build your first small tower. Blocks are slightly smaller now!",
    blocksToComplete: 3,
    blockSpeed: 0.6,
    blockWidthRange: { min: 120, max: 160 },
    perfectThreshold: 0.5,
    speedIncrease: 0.02,
    specialMechanics: {
      type: "size_reduction",
      description: "Blocks get 5% smaller each drop"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 50,
      achievement: "Rising Star"
    }
  },
  {
    id: 3,
    name: "Speed Demon",
    description: "⚡ Blocks are getting faster! Your reflexes will be tested.",
    blocksToComplete: 3,
    blockSpeed: 0.8,
    blockWidthRange: { min: 100, max: 140 },
    perfectThreshold: 0.55,
    speedIncrease: 0.03,
    specialMechanics: {
      type: "speed_boost",
      description: "Speed increases by 2% every 3 blocks"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 100,
      achievement: "Speed Runner"
    }
  },
  {
    id: 4,
    name: "Precision Master",
    description: "🎪 Perfect alignment is crucial! Small blocks require steady hands.",
    blocksToComplete: 3,
    blockSpeed: 1.0,
    blockWidthRange: { min: 80, max: 120 },
    perfectThreshold: 0.65,
    speedIncrease: 0.04,
    specialMechanics: {
      type: "precision_challenge",
      description: "Perfect drops give 2x combo multiplier"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 150,
      achievement: "Precision Expert"
    }
  },
  {
    id: 5,
    name: "Wind Walker",
    description: "🌪️ Blocks now sway in the wind! Timing is everything.",
    blocksToComplete: 3,
    blockSpeed: 1.0,
    blockWidthRange: { min: 80, max: 120 },
    perfectThreshold: 0.6,
    speedIncrease: 0.04,
    specialMechanics: {
      type: "wind_effect",
      description: "Blocks have slight random movement"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 200,
      achievement: "Wind Master"
    }
  },
  {
    id: 6,
    name: "Gravity Shift",
    description: "🔄 Gravity changes direction! Adapt to the new physics.",
    blocksToComplete: 3,
    blockSpeed: 1.4,
    blockWidthRange: { min: 60, max: 100 },
    perfectThreshold: 0.65,
    speedIncrease: 0.06,
    specialMechanics: {
      type: "gravity_shift",
      description: "Blocks fall from different directions"
    },
    rewards: {
      unlockNext: true,
      bonusPoints: 300,
      achievement: "Gravity Defier"
    }
  },
  {
    id: 7,
    name: "Tower Master",
    description: "👑 The ultimate challenge! All mechanics combined in perfect harmony.",
    blocksToComplete: 3,
    blockSpeed: 1.6,
    blockWidthRange: { min: 50, max: 90 },
    perfectThreshold: 0.7,
    speedIncrease: 0.08,
    specialMechanics: {
      type: "ultimate_challenge",
      description: "All previous mechanics combined!"
    },
    rewards: {
      unlockNext: false,
      bonusPoints: 500,
      achievement: "Tower Master"
    }
  }
];

/**
 * Challenge mode configurations
 * @constant
 * @type {Object}
 */
const CHALLENGE_MODES = {
  daily: {
    name: "Daily Challenge",
    description: "Complete today's special challenge",
    duration: 24, // hours
    specialRules: {
      type: "daily",
      blocks: 30,
      timeLimit: 300, // 5 minutes
      perfectOnly: false
    }
  },
  
  perfect: {
    name: "Perfect Challenge",
    description: "Build a tower with only perfect drops",
    specialRules: {
      type: "perfect_only",
      blocks: 20,
      allowMiss: false
    }
  },
  
  speed: {
    name: "Speed Challenge",
    description: "Build as high as possible in 2 minutes",
    specialRules: {
      type: "time_limit",
      timeLimit: 120, // 2 minutes
      speedMultiplier: 1.5
    }
  },
  
  narrow: {
    name: "Narrow Tower",
    description: "Build with only narrow blocks",
    specialRules: {
      type: "narrow_blocks",
      blockWidth: 40,
      blocks: 25
    }
  }
};

/**
 * Gets level configuration by level number
 * @param {number} levelNumber - Level number (1-based)
 * @returns {Object} Level configuration object
 * @example
 * const level1 = getLevelConfig(1);
 */
function getLevelConfig(levelNumber) {
  const level = LEVELS.find(l => l.id === levelNumber);
  if (!level) {
    // Return default level for endless mode
    return {
      id: levelNumber,
      name: `Level ${levelNumber}`,
      description: "Endless mode - keep building!",
      blocksToComplete: null,
      blockSpeed: 1.5,
      blockWidthRange: { min: 50, max: 90 },
      perfectThreshold: 0.8,
      speedIncrease: 0.08,
      rewards: {
        unlockNext: true,
        bonusPoints: levelNumber * 10
      }
    };
  }
  return level;
}


/**
 * Calculates level-specific game parameters
 * @param {number} levelNumber - Current level number
 * @returns {Object} Calculated game parameters
 */
function calculateLevelParameters(levelNumber) {
  const level = getLevelConfig(levelNumber);
  
  // Base parameters from level configuration
  let params = {
    blockSpeed: level.blockSpeed,
    blockWidthRange: level.blockWidthRange,
    perfectThreshold: level.perfectThreshold,
    speedIncrease: level.speedIncrease,
    pointsPerBlock: BASE_CONFIG.pointsPerBlock,
    comboMultiplier: BASE_CONFIG.comboMultiplier
  };
  
  // Apply level-specific modifications
  if (level.specialRules) {
    params = applySpecialRules(params, level.specialRules, levelNumber);
  }
  
  // Apply endless mode scaling for levels beyond 7
  if (levelNumber > 7) {
    params = applyEndlessScaling(params, levelNumber);
  }
  
  return params;
}

/**
 * Applies special rules to level parameters
 * @param {Object} params - Base parameters
 * @param {Object} specialRules - Special rules to apply
 * @param {number} levelNumber - Current level number
 * @returns {Object} Modified parameters
 */
function applySpecialRules(params, specialRules, levelNumber) {
  const modified = { ...params };
  
  switch (specialRules.type) {
    case "speed_increase":
      modified.blockSpeed *= specialRules.value;
      break;
      
    case "perfect_threshold":
      modified.perfectThreshold = specialRules.value;
      break;
      
    case "block_size":
      modified.blockWidthRange.min *= specialRules.value;
      modified.blockWidthRange.max *= specialRules.value;
      break;
      
    case "combined":
      if (specialRules.speed) {
        modified.blockSpeed *= specialRules.speed;
      }
      if (specialRules.precision) {
        modified.perfectThreshold = specialRules.precision;
      }
      if (specialRules.blockSize) {
        modified.blockWidthRange.min *= specialRules.blockSize;
        modified.blockWidthRange.max *= specialRules.blockSize;
      }
      break;
      
    case "ultimate":
      modified.blockSpeed *= specialRules.speed;
      modified.perfectThreshold = specialRules.precision;
      modified.blockWidthRange.min *= specialRules.blockSize;
      modified.blockWidthRange.max *= specialRules.blockSize;
      break;
  }
  
  return modified;
}

/**
 * Applies endless mode scaling for levels beyond 10
 * @param {Object} params - Base parameters
 * @param {number} levelNumber - Current level number
 * @returns {Object} Scaled parameters
 */
function applyEndlessScaling(params, levelNumber) {
  const scaleFactor = 1 + (levelNumber - 10) * 0.1;
  
  return {
    ...params,
    blockSpeed: params.blockSpeed * scaleFactor,
    blockWidthRange: {
      min: Math.max(30, params.blockWidthRange.min * (1 - (levelNumber - 10) * 0.02)),
      max: Math.max(60, params.blockWidthRange.max * (1 - (levelNumber - 10) * 0.02))
    },
    perfectThreshold: Math.min(0.99, params.perfectThreshold + (levelNumber - 10) * 0.01),
    pointsPerBlock: Math.floor(params.pointsPerBlock * scaleFactor)
  };
}

/**
 * Gets challenge mode configuration
 * @param {string} challengeType - Type of challenge
 * @returns {Object} Challenge configuration
 */
function getChallengeConfig(challengeType) {
  return CHALLENGE_MODES[challengeType] || null;
}

/**
 * Generates a random challenge for daily mode
 * @returns {Object} Random daily challenge configuration
 */
function generateDailyChallenge() {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  // Use seed for consistent daily challenges
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  const challenges = [
    {
      name: "Speed Builder",
      blocks: 25,
      timeLimit: 180,
      speedMultiplier: 1.3
    },
    {
      name: "Precision Master",
      blocks: 20,
      perfectThreshold: 0.9,
      allowMiss: false
    },
    {
      name: "Tiny Tower",
      blocks: 30,
      blockWidth: 45,
      speedMultiplier: 1.1
    },
    {
      name: "Lightning Round",
      blocks: 15,
      timeLimit: 60,
      speedMultiplier: 2.0
    }
  ];
  
  const selectedChallenge = challenges[Math.floor(random * challenges.length)];
  
  return {
    date: today,
    ...selectedChallenge,
    rewards: {
      bonusPoints: selectedChallenge.blocks * 20,
      achievement: `Daily: ${selectedChallenge.name}`
    }
  };
}

/**
 * Checks if a level is unlocked
 * @param {number} levelNumber - Level to check
 * @param {number} currentProgress - Current player progress
 * @returns {boolean} Whether level is unlocked
 */
function isLevelUnlocked(levelNumber, currentProgress) {
  if (levelNumber === 1) return true;
  
  const previousLevel = getLevelConfig(levelNumber - 1);
  if (!previousLevel) return true;
  
  return currentProgress >= (levelNumber - 1) * 5; // Unlock every 5 blocks placed
}

/**
 * Gets available levels for player
 * @param {number} currentProgress - Current player progress
 * @returns {Array} Array of available level numbers
 */
function getAvailableLevels(currentProgress) {
  return LEVELS
    .filter(level => isLevelUnlocked(level.id, currentProgress))
    .map(level => level.id);
}

/**
 * Calculates experience points for level completion
 * @param {number} levelNumber - Completed level
 * @param {number} score - Final score
 * @param {number} perfectDrops - Number of perfect drops
 * @returns {number} Experience points earned
 */
function calculateExperience(levelNumber, score, perfectDrops) {
  const baseXP = levelNumber * 10;
  const scoreXP = Math.floor(score / 100);
  const perfectXP = perfectDrops * 5;
  
  return baseXP + scoreXP + perfectXP;
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LEVELS,
    CHALLENGE_MODES,
    getLevelConfig,
    calculateLevelParameters,
    getChallengeConfig,
    generateDailyChallenge,
    isLevelUnlocked,
    getAvailableLevels,
    calculateExperience
  };
} else {
  window.LevelManager = {
    LEVELS,
    CHALLENGE_MODES,
    getLevelConfig,
    calculateLevelParameters,
    getChallengeConfig,
    generateDailyChallenge,
    isLevelUnlocked,
    getAvailableLevels,
    calculateExperience
  };
}
