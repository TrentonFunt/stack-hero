/**
 * @file game.js
 * @game Stack Hero
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Core game logic for the Stack Hero game. Handles block management,
 * physics simulation, scoring, and level progression.
 *
 * @dependencies
 * - physics.js: Physics engine and collision detection
 * - levels.js: Level configurations
 * - renderer.js: Game rendering system
 */

/**
 * Game state object - stores all current game information
 * @type {Object}
 */
const gameState = {
  /** @type {Array} Current blocks in the tower */
  tower: [],
  
  /** @type {Object} Current moving block */
  currentBlock: null,
  
  /** @type {number} Current player score */
  score: 0,
  
  /** @type {number} Current level number */
  level: 1,
  
  /** @type {boolean} Whether game is currently active */
  isActive: false,
  
  /** @type {boolean} Whether game is paused */
  isPaused: false,
  
  /** @type {number} Number of blocks placed in current game */
  blocksPlaced: 0,
  
  /** @type {number} Number of blocks placed in current level */
  blocksInCurrentLevel: 0,
  
  /** @type {number} Current game speed multiplier */
  speedMultiplier: 1,
  
  /** @type {number} Perfect alignment threshold (percentage) */
  perfectThreshold: 0.8,
  
  /** @type {number} Combo streak counter */
  comboStreak: 0,
  
  /** @type {Object} Game configuration */
  config: {
    canvasWidth: 800,
    canvasHeight: 800,
    blockHeight: 30,
    minBlockWidth: 40,
    maxBlockWidth: 200,
    initialBlockWidth: 150,
    baseBlockSpeed: 0.8, // Much slower starting speed
    speedIncrease: 0.05
  },
  
};

/**
 * Block class representing a game block
 * @class
 */
class Block {
  /**
   * Create a new block
   * @param {number} id - Unique identifier for the block
   * @param {number} width - Width of the block
   * @param {number} x - X position of the block
   * @param {number} y - Y position of the block
   * @param {number} speed - Movement speed of the block
   * @param {boolean} isMoving - Whether the block is currently moving
   */
  constructor(id, width, x, y, speed = 0, isMoving = false) {
    this.id = id;
    this.width = width;
    this.position = { x, y };
    this.speed = speed;
    this.isMoving = isMoving;
    this.isPlaced = false;
    this.originalWidth = width;
    this.color = this.generateColor();
  }

  /**
   * Generate a random color for the block
   * @returns {string} CSS color value
   */
  generateColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update block position based on speed
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    if (this.isMoving) {
      // Apply wind effect if active
      let currentSpeed = this.speed;
      let verticalSpeed = this.verticalSpeed || 0;
      
      const specialMechanics = gameState.currentLevelConfig?.specialMechanics;
      if (specialMechanics?.type === 'wind_effect') {
        // Add noticeable wind sway effect
        const windEffect = Math.sin(Date.now() * 0.005) * 0.5;
        currentSpeed += windEffect;
      }
      
      // Apply gravity shift effect
      if (specialMechanics?.type === 'gravity_shift') {
        // Add slight vertical movement variation for gravity shift
        verticalSpeed += (Math.random() - 0.5) * 0.1;
      }
      
      this.position.x += currentSpeed * deltaTime;
      this.position.y += verticalSpeed * deltaTime;
      
      // Bounce off canvas edges
      if (this.position.x <= 0 || this.position.x + this.width >= gameState.config.canvasWidth) {
        this.speed = -this.speed;
        this.position.x = Math.max(0, Math.min(this.position.x, gameState.config.canvasWidth - this.width));
      }
      
      // Keep block within canvas bounds vertically - restrict to 1 block height deviation
      const baseY = gameState.config.canvasHeight - (gameState.tower.length + 2) * gameState.config.blockHeight;
      const maxDeviation = gameState.config.blockHeight; // 1 block height
      const minY = baseY - maxDeviation;
      const maxY = baseY + maxDeviation;
      
      if (this.position.y < minY) {
        this.position.y = minY;
        verticalSpeed = 0;
      } else if (this.position.y > maxY) {
        this.position.y = maxY;
        verticalSpeed = 0;
      }
      
      this.verticalSpeed = verticalSpeed;
    }
  }

  /**
   * Place the block at current position
   */
  place() {
    this.isMoving = false;
    this.isPlaced = true;
    this.speed = 0;
  }

  /**
   * Shrink block width to specified value
   * @param {number} newWidth - New width for the block
   */
  shrink(newWidth) {
    // Be more forgiving with minimum width
    const minWidth = Math.max(gameState.config.minBlockWidth * 0.7, 20);
    this.width = Math.max(newWidth, minWidth);
  }
}

/**
 * Initializes a new game at the specified level
 * @param {number} level - Level number to initialize (default: 1)
 * @returns {Object} Updated game state
 * @example
 * initGame(2); // Initializes level 2
 */
function initGame(level = 1) {
  // Reset game state
  gameState.tower = [];
  gameState.score = 0;
  gameState.level = level;
  gameState.blocksPlaced = 0;
  gameState.blocksInCurrentLevel = 0;
  gameState.comboStreak = 0;
  gameState.isActive = true;
  gameState.isPaused = false;
  
  // Get level configuration
  const levelConfig = getLevelConfig(level);
  const levelParams = calculateLevelParameters(level);
  
  // Apply level-specific settings
  gameState.currentLevelConfig = levelConfig;
  gameState.currentLevelParams = levelParams;
  gameState.perfectThreshold = levelParams.perfectThreshold;
  
  // Create initial tower base
  const baseBlock = new Block(
    0,
    gameState.config.initialBlockWidth,
    (gameState.config.canvasWidth - gameState.config.initialBlockWidth) / 2,
    gameState.config.canvasHeight - gameState.config.blockHeight,
    0,
    false
  );
  baseBlock.place();
  gameState.tower.push(baseBlock);
  // Generate first moving block
  generateNewBlock();
  
  // Update UI
  updateUI();
  
  return gameState;
}

/**
 * Generates a new moving block for the player to drop
 */
function generateNewBlock() {
  const blockId = gameState.blocksPlaced + 1;
  
  // Calculate block width based on level parameters
  const levelParams = gameState.currentLevelParams;
  let blockWidth = Math.max(
    gameState.config.minBlockWidth,
    levelParams.blockWidthRange.min + 
    Math.random() * (levelParams.blockWidthRange.max - levelParams.blockWidthRange.min)
  );
  
  // Calculate block speed based on level parameters
  let blockSpeed = levelParams.blockSpeed;
  
  // Apply special mechanics
  const specialMechanics = gameState.currentLevelConfig?.specialMechanics;
  if (specialMechanics) {
    console.log(`Special mechanic active: ${specialMechanics.type} - ${specialMechanics.description}`);
    if (gameState.level === 6) {
      console.log(`Level 6 - Block ${gameState.blocksInCurrentLevel + 1} generation`);
    }
    switch (specialMechanics.type) {
      case 'tutorial':
        // Tutorial level - slower speed, larger blocks (already handled by level config)
        // Add visual indicator for tutorial
        break;
      case 'size_reduction':
        // Blocks get smaller each drop - apply progressive size reduction
        const sizeReduction = 1 - (gameState.blocksInCurrentLevel * 0.05); // 5% smaller each block
        blockWidth *= Math.max(0.7, sizeReduction); // Minimum 70% of original size
        break;
      case 'speed_boost':
        // Speed increases with every block in current level
        if (gameState.blocksInCurrentLevel > 0) {
          blockSpeed *= (1 + gameState.blocksInCurrentLevel * 0.1); // 10% increase per block
        }
        break;
      case 'wind_effect':
        // Add noticeable random movement to block speed
        blockSpeed += (Math.random() - 0.5) * 0.4;
        break;
      case 'gravity_shift':
        // Vary the starting position and add slight speed variation
        blockSpeed += (Math.random() - 0.5) * 0.3;
        // Add initial vertical speed variation for gravity shift effect
        gameState.gravityShiftVerticalSpeed = (Math.random() - 0.5) * 0.2;
        break;
      case 'ultimate_challenge':
        // Combine all previous mechanics
        // Size reduction
        const ultimateSizeReduction = 1 - (gameState.blocksInCurrentLevel * 0.03);
        blockWidth *= Math.max(0.8, ultimateSizeReduction);
        // Speed boost
        if (gameState.blocksInCurrentLevel > 0) {
          blockSpeed *= (1 + gameState.blocksInCurrentLevel * 0.05); // 5% increase per block
        }
        // Wind effect
        blockSpeed += (Math.random() - 0.5) * 0.2;
        // Gravity shift
        blockSpeed += (Math.random() - 0.5) * 0.2;
        gameState.gravityShiftVerticalSpeed = (Math.random() - 0.5) * 0.15;
        break;
    }
  }
  
  gameState.currentBlock = new Block(
    blockId,
    blockWidth,
    0, // Start from left edge
    gameState.config.canvasHeight - (gameState.tower.length + 2) * gameState.config.blockHeight,
    blockSpeed,
    true
  );
  
  // Apply gravity shift vertical speed if active
  if ((specialMechanics?.type === 'gravity_shift' || specialMechanics?.type === 'ultimate_challenge') && gameState.gravityShiftVerticalSpeed) {
    gameState.currentBlock.verticalSpeed = gameState.gravityShiftVerticalSpeed;
  }
  
  // Apply visual effects for special mechanics
  if (specialMechanics) {
    switch (specialMechanics.type) {
      case 'tutorial':
        // Add visual indicator for tutorial
        gameState.currentBlock.tutorial = true;
        break;
      case 'size_reduction':
        // Add visual indicator for size reduction
        gameState.currentBlock.sizeReduction = true;
        break;
      case 'precision_challenge':
        // Add visual indicator for precision challenge
        gameState.currentBlock.precisionChallenge = true;
        break;
      case 'wind_effect':
        // Add a slight color tint to indicate wind effect
        gameState.currentBlock.windEffect = true;
        break;
      case 'gravity_shift':
        // Add a slight color tint to indicate gravity shift
        gameState.currentBlock.gravityShift = true;
        break;
      case 'ultimate_challenge':
        // Add visual indicator for ultimate challenge
        gameState.currentBlock.ultimateChallenge = true;
        break;
    }
  }
}

/**
 * Drops the current moving block onto the tower
 * @returns {Object} Result object with success status and score information
 */
function dropBlock() {
  if (!gameState.currentBlock || !gameState.currentBlock.isMoving) {
    return { success: false, message: "No block to drop" };
  }
  
  const currentBlock = gameState.currentBlock;
  const lastTowerBlock = gameState.tower[gameState.tower.length - 1];
  
  // Calculate overlap with the block below
  const overlap = calculateOverlap(currentBlock, lastTowerBlock);
  
  // Debug overlap calculation for level 6
  if (gameState.level === 6) {
    console.log(`Level 6 - Overlap: ${overlap.toFixed(1)}, Current block: x=${currentBlock.position.x.toFixed(1)}, width=${currentBlock.width.toFixed(1)}, Last block: x=${lastTowerBlock.position.x.toFixed(1)}, width=${lastTowerBlock.width.toFixed(1)}`);
  }
  
  if (overlap <= 0) {
    // Block missed - game over
    gameState.isActive = false;
    
    // Play miss sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playSound('blockMiss');
    }
    
    // Add failure animations
    addFailureAnimations(currentBlock, 'miss');
    
    return { 
      success: false, 
      gameOver: true, 
      message: "Block missed the tower!" 
    };
  }
  
  // Place the block
  currentBlock.place();
  // Reset Y position to proper tower position (ignore gravity shift vertical movement)
  currentBlock.position.y = lastTowerBlock.position.y - gameState.config.blockHeight;
  // Clear any vertical speed from gravity shift
  currentBlock.verticalSpeed = 0;
  
  // Check for perfect alignment - use the smaller of the two blocks for threshold
  const thresholdBlock = currentBlock.width < lastTowerBlock.width ? currentBlock : lastTowerBlock;
  const perfectAlignment = overlap >= (thresholdBlock.width * gameState.perfectThreshold);
  
  
  if (perfectAlignment) {
    // Perfect drop - no width reduction, bonus points
    gameState.comboStreak++;
    
    // Apply special mechanics for combo multipliers
    let comboMultiplier = 1;
    const specialMechanics = gameState.currentLevelConfig?.specialMechanics;
    if (specialMechanics?.type === 'precision_challenge') {
      comboMultiplier = 2; // Double combo multiplier for precision challenge
      // Add visual feedback for precision challenge
      showScorePopup(`PRECISION x${comboMultiplier}!`, true);
    }
    
    const bonusPoints = 100 * gameState.comboStreak * comboMultiplier;
    gameState.score += bonusPoints;
    
    // Add perfect drop animation
    currentBlock.perfectDrop = true;
    currentBlock.perfectTime = Date.now();
    
    // Clear the perfect drop effect after animation
    setTimeout(() => {
      if (currentBlock) {
        currentBlock.perfectDrop = false;
      }
    }, 1000);
    
    // Create particle explosion for perfect drop
    createParticleExplosion(currentBlock.position.x + currentBlock.width / 2, currentBlock.position.y, 'perfect');
    
    // Play perfect drop sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playSound('perfectDrop');
    }
  } else {
    // Imperfect drop - shrink block and reset combo
    currentBlock.shrink(overlap);
    gameState.comboStreak = 0;
    
    // Play regular drop sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playSound('blockDrop');
    }
    
    // Check if block is too small (but be more forgiving)
    const minWidth = Math.max(gameState.config.minBlockWidth * 0.7, 20); // More forgiving minimum width
    if (currentBlock.width < minWidth) {
      gameState.isActive = false;
      
      // Play collapse sound
      if (audioManager) {
        audioManager.playSound('towerCollapse');
      }
      
      // Add failure animations
      addFailureAnimations(currentBlock, 'collapse');
      
      return { 
        success: false, 
        gameOver: true, 
        message: "Block too small to continue!" 
      };
    }
  }
  
  // Add block to tower
  gameState.tower.push(currentBlock);
  gameState.blocksPlaced++;
  gameState.blocksInCurrentLevel++;
  
  // Add base points
  const basePoints = 10 + (gameState.level * 5);
  gameState.score += basePoints;
  
  // Check for level completion
  const levelConfig = gameState.currentLevelConfig;
  if (levelConfig.blocksToComplete && gameState.blocksInCurrentLevel >= levelConfig.blocksToComplete) {
    // Check if this is the final level (Level 7)
    if (gameState.level === 7) {
      // Game completed! Show special completion popup
      showGameCompleted();
      return;
    }
    
    // Level completed - advance to next level
    gameState.level++;
    gameState.blocksInCurrentLevel = 0; // Reset counter for new level
    
    // Get new level configuration
    const newLevelConfig = getLevelConfig(gameState.level);
    const newLevelParams = calculateLevelParameters(gameState.level);
    
    // Update level settings
    gameState.currentLevelConfig = newLevelConfig;
    gameState.currentLevelParams = newLevelParams;
    gameState.perfectThreshold = newLevelParams.perfectThreshold;
    
    // Play level complete sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playSound('levelComplete');
    }
    
    // Show level completion message
    showLevelComplete(newLevelConfig);
  }
  
  // Generate next block
  generateNewBlock();
  
  // Update UI
  updateUI();
  
  return {
    success: true,
    perfectAlignment,
    overlap,
    points: basePoints + (perfectAlignment ? 100 * gameState.comboStreak : 0)
  };
}

/**
 * Calculates the overlap between two blocks
 * @param {Block} block1 - First block
 * @param {Block} block2 - Second block
 * @returns {number} Overlap amount in pixels
 */
function calculateOverlap(block1, block2) {
  const block1Left = block1.position.x;
  const block1Right = block1.position.x + block1.width;
  const block2Left = block2.position.x;
  const block2Right = block2.position.x + block2.width;
  
  return Math.max(0, Math.min(block1Right, block2Right) - Math.max(block1Left, block2Left));
}

/**
 * Updates the game state (called every frame)
 * @param {number} deltaTime - Time elapsed since last update
 */
function updateGame(deltaTime) {
  if (!gameState.isActive || gameState.isPaused) {
    return;
  }
  
  // Update current moving block
  if (gameState.currentBlock && gameState.currentBlock.isMoving) {
    gameState.currentBlock.update(deltaTime);
  }
  
  // Check for tower stability (simple physics check)
  checkTowerStability();
}

/**
 * Checks if the tower is stable or if it should collapse
 */
function checkTowerStability() {
  if (gameState.tower.length < 3) return; // Need at least 3 blocks for stability check
  
  let totalOffset = 0;
  for (let i = 1; i < gameState.tower.length; i++) {
    const currentBlock = gameState.tower[i];
    const previousBlock = gameState.tower[i - 1];
    
    // Calculate center offset
    const currentCenter = currentBlock.position.x + currentBlock.width / 2;
    const previousCenter = previousBlock.position.x + previousBlock.width / 2;
    const offset = Math.abs(currentCenter - previousCenter);
    
    totalOffset += offset;
  }
  
  // If total offset is too large, tower collapses
  // Make it much more forgiving - players are getting frustrated
  const baseMaxOffset = gameState.config.canvasWidth * 0.6; // 60% of canvas width (much more forgiving)
  const levelMultiplier = Math.max(0.8, 1 - (gameState.level - 1) * 0.02); // Even more forgiving for higher levels
  const maxOffset = baseMaxOffset * levelMultiplier;
  
  if (totalOffset > maxOffset) {
    console.log(`Tower collapsed! Total offset: ${totalOffset}, Max allowed: ${maxOffset}, Tower length: ${gameState.tower.length}, Level: ${gameState.level}`);
    gameState.isActive = false;
    // Trigger collapse animation
    triggerTowerCollapse();
  }
}

/**
 * Triggers tower collapse animation and game over
 */
function triggerTowerCollapse() {
  // Add collapse animation to all blocks
  gameState.tower.forEach(block => {
    block.collapsing = true;
  });
  
  // Create explosion particles for each block
  gameState.tower.forEach(block => {
    createParticleExplosion(block.position.x + block.width / 2, block.position.y, 'collapse');
  });
  
  // Play collapse sound
  const audioManager = getAudioManager();
  if (audioManager) {
    audioManager.playSound('towerCollapse');
  }
  
  // Add screen flash animation
  addFailureAnimations(null, 'collapse');
  
  // Show game over after animation
  setTimeout(() => {
    showGameOver();
  }, 1000);
}

/**
 * Creates particle explosion effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} type - Type of explosion ('perfect', 'drop', 'collapse')
 */
function createParticleExplosion(x, y, type = 'drop') {
  const renderer = getRenderer();
  if (!renderer) return;
  
  const particleCount = type === 'perfect' ? 15 : type === 'collapse' ? 25 : 8;
  const colors = {
    perfect: ['#28a745', '#20c997', '#17a2b8', '#ffc107'],
    drop: ['#6c757d', '#495057', '#343a40'],
    collapse: ['#dc3545', '#fd7e14', '#6f42c1']
  };
  
  for (let i = 0; i < particleCount; i++) {
    const particle = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.02,
      size: 2 + Math.random() * 4,
      color: colors[type][Math.floor(Math.random() * colors[type].length)],
      type: type
    };
    
    renderer.addParticle(particle);
  }
}

/**
 * Adds failure animations for different failure types
 * @param {Block} block - Block that failed (if applicable)
 * @param {string} failureType - Type of failure ('miss', 'collapse', 'small')
 */
function addFailureAnimations(block, failureType) {
  const canvas = document.getElementById('gameCanvas');
  const gameContainer = document.querySelector('.game-canvas-wrapper');
  
  if (!canvas || !gameContainer) return;
  
  switch (failureType) {
    case 'miss':
      // Block miss animation
      if (block) {
        block.missing = true;
        block.missTime = Date.now();
      }
      // Screen flash
      gameContainer.classList.add('screen-flash-animation');
      setTimeout(() => {
        gameContainer.classList.remove('screen-flash-animation');
      }, 400);
      break;
      
    case 'collapse':
      // Tower shake animation
      gameContainer.classList.add('tower-shake-animation');
      // Screen flash
      gameContainer.classList.add('screen-flash-animation');
      setTimeout(() => {
        gameContainer.classList.remove('tower-shake-animation');
        gameContainer.classList.remove('screen-flash-animation');
      }, 900);
      break;
      
    case 'small':
      // Block shrink animation
      if (block) {
        block.shrinking = true;
        block.shrinkTime = Date.now();
      }
      // Screen flash
      gameContainer.classList.add('screen-flash-animation');
      setTimeout(() => {
        gameContainer.classList.remove('screen-flash-animation');
      }, 400);
      break;
  }
}

/**
 * Shows level completion message
 * @param {Object} newLevelConfig - Configuration for the new level
 */
function showLevelComplete(newLevelConfig) {
  // Pause the game during level transition
  gameState.isPaused = true;
  
  // Create level completion popup
  const popup = document.createElement('div');
  popup.className = 'level-complete-popup';
  popup.innerHTML = `
    <div class="level-complete-content">
      <div class="level-complete-header">
        <h2>🎉 Level ${gameState.level - 1} Complete! 🎉</h2>
        <div class="level-badge">Level ${gameState.level - 1} → ${gameState.level}</div>
      </div>
      <div class="level-info">
        <h3>${newLevelConfig.name}</h3>
        <p>${newLevelConfig.description}</p>
      </div>
      <div class="level-stats">
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value">${gameState.score}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Blocks</span>
          <span class="stat-value">${gameState.blocksPlaced}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Combo</span>
          <span class="stat-value">${gameState.comboStreak}</span>
        </div>
      </div>
      <div class="level-preview">
        <div class="difficulty-indicator">
          <span>Difficulty: </span>
          <div class="difficulty-stars">
            ${'★'.repeat(Math.min(5, Math.ceil(newLevelConfig.blockSpeed * 2)))}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Style the popup
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-primary-light) 100%);
    padding: var(--spacing-2xl);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    text-align: center;
    max-width: 350px;
    width: 80%;
    border: 2px solid var(--color-primary);
    animation: levelCompleteSlideIn 0.5s ease-out;
  `;
  
  document.body.appendChild(popup);
  
  // Auto-remove after 2 seconds and resume game
  setTimeout(() => {
    if (document.body.contains(popup)) {
      popup.style.animation = 'levelCompleteSlideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
        // Resume the game
        gameState.isPaused = false;
      }, 300);
    }
  }, 2000);
}

/**
 * Shows game completion popup when all levels are finished
 */
function showGameCompleted() {
  // Pause the game
  gameState.isPaused = true;
  gameState.isActive = false;
  
  // Create game completion popup
  const popup = document.createElement('div');
  popup.className = 'game-complete-popup';
  popup.innerHTML = `
    <div class="game-complete-content">
      <div class="game-complete-header">
        <h2>🎉 CONGRATULATIONS! 🎉</h2>
        <div class="completion-badge">GAME COMPLETED!</div>
      </div>
      <div class="completion-info">
        <h3>🏆 You've mastered Stack Hero!</h3>
        <p>You've successfully completed all 7 levels and conquered every challenge!</p>
      </div>
      <div class="final-stats">
        <div class="stat">
          <span class="stat-label">Final Score:</span>
          <span class="stat-value">${gameState.score.toLocaleString()}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Blocks:</span>
          <span class="stat-value">${gameState.blocksPlaced}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Levels Completed:</span>
          <span class="stat-value">7/7</span>
        </div>
        <div class="stat">
          <span class="stat-label">Best Combo:</span>
          <span class="stat-value">${gameState.comboStreak}</span>
        </div>
      </div>
      <div class="completion-actions">
        <button id="playAgainBtn" class="btn btn-primary">🎮 Play Again</button>
        <button id="mainMenuBtn" class="btn btn-secondary">🏠 Main Menu</button>
      </div>
    </div>
  `;
  
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: var(--spacing-2xl);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    z-index: 3000;
    text-align: center;
    max-width: 500px;
    width: 90%;
    border: 3px solid #ffd700;
    animation: gameCompleteSlideIn 0.8s ease-out;
    color: white;
  `;
  
  document.body.appendChild(popup);
  
  // Add event listeners for buttons
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.body.removeChild(popup);
    resetGame();
  });
  
  document.getElementById('mainMenuBtn').addEventListener('click', () => {
    window.location.href = '../../index.html';
  });
  
  // Play completion sound
  const audioManager = getAudioManager();
  if (audioManager) {
    audioManager.playSound('levelComplete');
  }
  
  // Save final score
  saveGameState();
}

/**
 * Shows the game over screen
 */
function showGameOver() {
  const overlay = document.getElementById('gameOverOverlay');
  const finalScore = document.getElementById('finalScore');
  const finalBlocks = document.getElementById('finalBlocks');
  const finalLevel = document.getElementById('finalLevel');
  
  finalScore.textContent = gameState.score;
  finalBlocks.textContent = gameState.blocksPlaced;
  finalLevel.textContent = gameState.level;
  
  overlay.style.display = 'flex';
  
  // Save high score
  saveHighScore(gameState.score);
}

/**
 * Updates the game UI elements
 */
function updateUI() {
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const blocksElement = document.getElementById('blocksPlaced');
  const comboElement = document.getElementById('combo');
  const levelNameElement = document.getElementById('levelName');
  const levelDescriptionElement = document.getElementById('levelDescription');
  
  if (scoreElement) scoreElement.textContent = gameState.score;
  if (levelElement) levelElement.textContent = gameState.level;
  if (blocksElement) blocksElement.textContent = gameState.blocksPlaced;
  if (comboElement) comboElement.textContent = gameState.comboStreak;
  
  // Update level information
  if (gameState.currentLevelConfig) {
    if (levelNameElement) levelNameElement.textContent = gameState.currentLevelConfig.name;
    if (levelDescriptionElement) {
      let description = gameState.currentLevelConfig.description;
      // Add special mechanics info
      if (gameState.currentLevelConfig.specialMechanics) {
        description += ` | ${gameState.currentLevelConfig.specialMechanics.description}`;
      }
      levelDescriptionElement.textContent = description;
    }
  }
  
  // Update accessibility announcements
  updateAccessibilityAnnouncements();
}

/**
 * Updates accessibility announcements for screen readers
 */
function updateAccessibilityAnnouncements() {
  const announcer = document.getElementById('gameStateAnnouncer');
  if (!announcer) return;
  
  let announcement = '';
  
  if (gameState.isPaused) {
    announcement = 'Game paused. Press spacebar to resume.';
  } else if (!gameState.isActive) {
    announcement = 'Game over. Final score: ' + gameState.score + '. Press R to restart.';
  } else {
    announcement = `Level ${gameState.level}, Score: ${gameState.score}, Blocks placed: ${gameState.blocksPlaced}. Use spacebar or click to drop blocks.`;
  }
  
  announcer.textContent = announcement;
}

/**
 * Saves the high score to localStorage
 * @param {number} score - Score to save
 */
function saveHighScore(score) {
  const highScores = JSON.parse(localStorage.getItem('physicsStackTower_highScores') || '[]');
  highScores.push({
    score: score,
    level: gameState.level,
    blocks: gameState.blocksPlaced,
    date: new Date().toISOString()
  });
  
  // Keep only top 10 scores
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(10);
  
  localStorage.setItem('physicsStackTower_highScores', JSON.stringify(highScores));
  
  // Track games played
  const gamesPlayed = parseInt(localStorage.getItem('physicsStackTower_gamesPlayed') || '0');
  localStorage.setItem('physicsStackTower_gamesPlayed', (gamesPlayed + 1).toString());
}

/**
 * Loads high scores from localStorage
 * @returns {Array} Array of high score objects
 */
function loadHighScores() {
  return JSON.parse(localStorage.getItem('physicsStackTower_highScores') || '[]');
}

/**
 * Pauses the game
 */
function pauseGame() {
  gameState.isPaused = true;
  const overlay = document.getElementById('pauseOverlay');
  overlay.style.display = 'flex';
}

/**
 * Resumes the game
 */
function resumeGame() {
  gameState.isPaused = false;
  const overlay = document.getElementById('pauseOverlay');
  overlay.style.display = 'none';
}

/**
 * Resets the game to initial state
 */
function resetGame() {
  // Hide all overlays first
  hideAllOverlays();
  
  // Initialize the game
  initGame(1);
  
  // Ensure the game is active and not paused
  gameState.isActive = true;
  gameState.isPaused = false;
  
  // Force a UI update
  updateUI();
  
  // Force a render to ensure the screen is updated
  const renderer = getRenderer();
  if (renderer) {
    renderer.render(performance.now());
  }
}

/**
 * Hides all game overlays
 */
function hideAllOverlays() {
  const overlays = document.querySelectorAll('.game-overlay');
  overlays.forEach(overlay => {
    overlay.style.display = 'none';
  });
}

// Game Interface Implementation
const PhysicsStackTowerGame = {
  /**
   * Initialize the game
   * @param {HTMLElement} container - Container element for the game
   * @param {Object} config - Configuration options
   */
  init: function(container, config = {}) {
    // Merge config with default config
    Object.assign(gameState.config, config);
    
    // Set up canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.width = gameState.config.canvasWidth;
      canvas.height = gameState.config.canvasHeight;
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game
    initGame(1);
    
    return true;
  },

  /**
   * Start or resume the game
   * @returns {boolean} Success status
   */
  start: function() {
    if (gameState.isPaused) {
      resumeGame();
    } else {
      initGame(gameState.level);
    }
    return true;
  },

  /**
   * Pause the game
   * @returns {boolean} Success status
   */
  pause: function() {
    pauseGame();
    return true;
  },

  /**
   * Reset the game to initial state
   * @returns {boolean} Success status
   */
  reset: function() {
    resetGame();
    return true;
  },

  /**
   * Clean up resources and event listeners
   * @returns {boolean} Success status
   */
  destroy: function() {
    // Remove event listeners
    cleanupEventListeners();
    return true;
  },

  /**
   * Get current game state
   * @returns {Object} Serializable game state
   */
  getState: function() {
    return {
      level: gameState.level,
      score: gameState.score,
      blocksPlaced: gameState.blocksPlaced,
      blocksInCurrentLevel: gameState.blocksInCurrentLevel,
      comboStreak: gameState.comboStreak,
      speedMultiplier: gameState.speedMultiplier,
      isActive: gameState.isActive,
      isPaused: gameState.isPaused,
      tower: gameState.tower.map(block => ({
        id: block.id,
        width: block.width,
        position: { ...block.position },
        color: block.color,
        isPlaced: block.isPlaced
      })),
      currentBlock: gameState.currentBlock ? {
        id: gameState.currentBlock.id,
        width: gameState.currentBlock.width,
        position: { ...gameState.currentBlock.position },
        speed: gameState.currentBlock.speed,
        isMoving: gameState.currentBlock.isMoving,
        color: gameState.currentBlock.color
      } : null
    };
  },

  /**
   * Restore game from saved state
   * @param {Object} state - Saved game state
   * @returns {boolean} Success status
   */
  setState: function(state) {
    gameState.level = state.level || 1;
    gameState.score = state.score || 0;
    gameState.blocksPlaced = state.blocksPlaced || 0;
    gameState.blocksInCurrentLevel = state.blocksInCurrentLevel || 0;
    gameState.comboStreak = state.comboStreak || 0;
    gameState.speedMultiplier = state.speedMultiplier || 1;
    gameState.isActive = state.isActive || false;
    gameState.isPaused = state.isPaused || false;
    
    // Restore tower
    gameState.tower = (state.tower || []).map(blockData => {
      const block = new Block(
        blockData.id,
        blockData.width,
        blockData.position.x,
        blockData.position.y,
        0,
        false
      );
      block.color = blockData.color;
      block.isPlaced = blockData.isPlaced;
      return block;
    });
    
    // Restore current block
    if (state.currentBlock) {
      gameState.currentBlock = new Block(
        state.currentBlock.id,
        state.currentBlock.width,
        state.currentBlock.position.x,
        state.currentBlock.position.y,
        state.currentBlock.speed,
        state.currentBlock.isMoving
      );
      gameState.currentBlock.color = state.currentBlock.color;
    }
    
    updateUI();
    return true;
  },

  /**
   * Get game metadata
   * @returns {Object} Game information
   */
  getMetadata: function() {
    return {
      name: "Physics Stack Tower",
      author: "Student Name",
      description: "Drop moving blocks to build the tallest tower. Perfect alignments grant bonuses!",
      thumbnail: "games/physics-stack-tower/assets/thumbnail.png",
      levels: 10, // Endless mode with 10 level milestones
      version: "1.0.0"
    };
  }
};

/**
 * Sets up event listeners for the game
 */
function setupEventListeners() {
  // Canvas click/touch events
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch);
    
    // Start audio on first user interaction
    let audioStarted = false;
    function startAudioOnInteraction() {
      if (!audioStarted) {
        const audioManager = getAudioManager();
        if (audioManager) {
          audioManager.startBackgroundMusic();
          audioStarted = true;
        }
      }
    }
    
    canvas.addEventListener('click', startAudioOnInteraction);
    canvas.addEventListener('touchstart', startAudioOnInteraction);
  }
  
  // Keyboard events
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  
  // UI button events
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const restartBtn = document.getElementById('restartBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
  const mainMenuFromPauseBtn = document.getElementById('mainMenuFromPauseBtn');
  const soundToggle = document.getElementById('soundToggle');
  
  if (pauseBtn) pauseBtn.addEventListener('click', () => PhysicsStackTowerGame.pause());
  if (resetBtn) resetBtn.addEventListener('click', () => PhysicsStackTowerGame.reset());
  if (restartBtn) restartBtn.addEventListener('click', () => PhysicsStackTowerGame.reset());
  if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => window.location.href = '../../index.html');
  if (resumeBtn) resumeBtn.addEventListener('click', () => PhysicsStackTowerGame.start());
  if (restartFromPauseBtn) restartFromPauseBtn.addEventListener('click', () => PhysicsStackTowerGame.reset());
  if (mainMenuFromPauseBtn) mainMenuFromPauseBtn.addEventListener('click', () => window.location.href = '../../index.html');
  
  // Sound toggle
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const audioManager = getAudioManager();
      if (audioManager) {
        const isMuted = audioManager.toggleMute();
        soundToggle.textContent = isMuted ? '🔇' : '🔊';
        soundToggle.classList.toggle('muted', isMuted);
        
        // Play button click sound
        if (!isMuted) {
          audioManager.playSound('buttonClick');
        }
      }
    });
  }
  
  
  // Window events
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Cleans up event listeners
 */
function cleanupEventListeners() {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.removeEventListener('touchstart', handleCanvasTouch);
  }
  
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Handles canvas click events
 * @param {Event} event - Click event
 */
function handleCanvasClick(event) {
  if (!gameState.isActive || gameState.isPaused) return;
  
  const result = dropBlock();
  if (result.success) {
    // Add visual feedback
    showScorePopup(result.points, result.isPerfect);
  } else if (result.gameOver) {
    // Handle game over
    setTimeout(() => {
      showGameOver();
    }, 500); // Small delay to allow animations to play
  }
}

/**
 * Handles canvas touch events
 * @param {Event} event - Touch event
 */
function handleCanvasTouch(event) {
  event.preventDefault();
  handleCanvasClick(event);
}

/**
 * Handles keyboard input
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  switch (event.code) {
    case 'Space':
      event.preventDefault();
      if (gameState.isActive && !gameState.isPaused) {
        const result = dropBlock();
        if (result.success) {
          showScorePopup(result.points, result.isPerfect);
        } else if (result.gameOver) {
          // Handle game over
          setTimeout(() => {
            showGameOver();
          }, 500); // Small delay to allow animations to play
        }
      }
      break;
      
    case 'KeyP':
      event.preventDefault();
      if (gameState.isActive) {
        PhysicsStackTowerGame.pause();
      }
      break;
      
    case 'KeyR':
      event.preventDefault();
      PhysicsStackTowerGame.reset();
      break;
      
    case 'Escape':
      event.preventDefault();
      if (gameState.isPaused) {
        PhysicsStackTowerGame.start();
      } else if (gameState.isActive) {
        PhysicsStackTowerGame.pause();
      }
      break;
  }
}

/**
 * Handles keyboard release events
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyUp(event) {
  // Handle any key release events if needed
}

/**
 * Handles window resize events
 */
function handleWindowResize() {
  const renderer = getRenderer();
  if (renderer) {
    renderer.handleResize();
  }
}

/**
 * Handles before unload events (save game state)
 */
function handleBeforeUnload() {
  if (gameState.isActive && !gameState.isPaused) {
    // Save current game state
    const saveManager = window.saveManager || StorageManager;
    saveManager.save('physicsStackTower_currentGame', PhysicsStackTowerGame.getState());
  }
}

/**
 * Shows score popup animation
 * @param {number} points - Points earned
 * @param {boolean} isPerfect - Whether it was a perfect drop
 */
function showScorePopup(points, isPerfect) {
  // Create score popup element
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${points}`;
  
  if (isPerfect) {
    popup.classList.add('perfect');
  }
  
  // Position popup
  const canvas = document.getElementById('gameCanvas');
  const rect = canvas.getBoundingClientRect();
  popup.style.position = 'absolute';
  popup.style.left = (rect.left + rect.width / 2) + 'px';
  popup.style.top = (rect.top + rect.height / 2) + 'px';
  popup.style.pointerEvents = 'none';
  popup.style.zIndex = '1000';
  
  document.body.appendChild(popup);
  
  // Play score popup sound
  const audioManager = getAudioManager();
  if (audioManager) {
    audioManager.playSound('scorePopup');
  }
  
  // Animate and remove
  setTimeout(() => {
    popup.classList.add('score-popup-animation');
  }, 10);
  
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 1000);
}


// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize audio manager
  initAudioManager({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5
  });
  
  // Initialize physics engine
  initPhysicsEngine({
    gravity: 0.5,
    friction: 0.8,
    bounce: 0.3,
    stabilityThreshold: 0.3
  });
  
  // Initialize renderer
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    initRenderer(canvas, {
      blockHeight: 30,
      shadowOffset: 3,
      animationSpeed: 0.1,
      particleCount: 20
    });
  }
  
  // Initialize game
  PhysicsStackTowerGame.init(document.body);
  
  // Start background music only after user interaction
  const audioManager = getAudioManager();
  if (audioManager) {
    // Don't auto-start music - wait for user interaction
  }
  
  // Start game loop
  let lastTime = 0;
  function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Cap deltaTime to prevent large jumps
    const cappedDeltaTime = Math.min(deltaTime, 1000 / 30); // Max 30 FPS
    
    // Update game
    updateGame(cappedDeltaTime);
    
    // Render game
    const renderer = getRenderer();
    if (renderer) {
      renderer.render(currentTime);
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
  }
  
  // Start the game loop
  requestAnimationFrame(gameLoop);
});

// Export for use by the platform
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhysicsStackTowerGame;
} else {
  window.PhysicsStackTowerGame = PhysicsStackTowerGame;
}
