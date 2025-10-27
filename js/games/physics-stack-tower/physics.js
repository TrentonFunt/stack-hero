/**
 * @file physics.js
 * @game Stack Hero
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Physics engine for Stack Hero. Handles collision detection,
 * tower stability calculations, and block physics simulation.
 *
 * @dependencies
 * - game.js: Core game logic and block objects
 */

/**
 * Physics engine class for handling game physics
 * @class
 */
class PhysicsEngine {
  /**
   * Create a new physics engine
   * @param {Object} config - Physics configuration
   */
  constructor(config = {}) {
    this.config = {
      gravity: config.gravity || 0.5,
      friction: config.friction || 0.8,
      bounce: config.bounce || 0.3,
      stabilityThreshold: config.stabilityThreshold || 0.3,
      maxTilt: config.maxTilt || 0.2,
      ...config
    };
    
    this.collisionCache = new Map();
    this.stabilityCache = new Map();
  }

  /**
   * Updates physics simulation for all blocks
   * @param {Array} blocks - Array of block objects
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(blocks, deltaTime) {
    blocks.forEach(block => {
      if (block.isMoving) {
        this.updateBlockPhysics(block, deltaTime);
      }
    });
    
    this.checkCollisions(blocks);
    this.updateTowerStability(blocks);
  }

  /**
   * Updates physics for a single block
   * @param {Block} block - Block to update
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateBlockPhysics(block, deltaTime) {
    if (!block.isMoving) return;
    
    block.position.x += block.speed * deltaTime;
    
    // Apply boundary constraints
    this.applyBoundaryConstraints(block);
    
    // Apply friction to moving blocks
    if (block.speed !== 0) {
      block.speed *= this.config.friction;
      
      // Stop very slow blocks
      if (Math.abs(block.speed) < 0.1) {
        block.speed = 0;
      }
    }
  }

  /**
   * Applies boundary constraints to keep blocks within canvas
   * @param {Block} block - Block to constrain
   */
  applyBoundaryConstraints(block) {
    const canvasWidth = gameState.config.canvasWidth;
    
    // Bounce off left edge
    if (block.position.x <= 0) {
      block.position.x = 0;
      block.speed = Math.abs(block.speed);
    }
    
    // Bounce off right edge
    if (block.position.x + block.width >= canvasWidth) {
      block.position.x = canvasWidth - block.width;
      block.speed = -Math.abs(block.speed);
    }
  }

  /**
   * Checks for collisions between blocks
   * @param {Array} blocks - Array of all blocks
   */
  checkCollisions(blocks) {
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const block1 = blocks[i];
        const block2 = blocks[j];
        
        if (this.blocksColliding(block1, block2)) {
          this.resolveCollision(block1, block2);
        }
      }
    }
  }

  /**
   * Checks if two blocks are colliding
   * @param {Block} block1 - First block
   * @param {Block} block2 - Second block
   * @returns {boolean} Whether blocks are colliding
   */
  blocksColliding(block1, block2) {
    // Skip if both blocks are placed (no collision between static blocks)
    if (block1.isPlaced && block2.isPlaced) {
      return false;
    }
    
    // Check horizontal overlap
    const horizontalOverlap = this.calculateHorizontalOverlap(block1, block2);
    if (horizontalOverlap <= 0) return false;
    
    // Check vertical overlap
    const verticalOverlap = this.calculateVerticalOverlap(block1, block2);
    if (verticalOverlap <= 0) return false;
    
    return true;
  }

  /**
   * Calculates horizontal overlap between two blocks
   * @param {Block} block1 - First block
   * @param {Block} block2 - Second block
   * @returns {number} Overlap amount in pixels
   */
  calculateHorizontalOverlap(block1, block2) {
    const block1Left = block1.position.x;
    const block1Right = block1.position.x + block1.width;
    const block2Left = block2.position.x;
    const block2Right = block2.position.x + block2.width;
    
    return Math.max(0, Math.min(block1Right, block2Right) - Math.max(block1Left, block2Left));
  }

  /**
   * Calculates vertical overlap between two blocks
   * @param {Block} block1 - First block
   * @param {Block} block2 - Second block
   * @returns {number} Overlap amount in pixels
   */
  calculateVerticalOverlap(block1, block2) {
    const block1Top = block1.position.y;
    const block1Bottom = block1.position.y + gameState.config.blockHeight;
    const block2Top = block2.position.y;
    const block2Bottom = block2.position.y + gameState.config.blockHeight;
    
    return Math.max(0, Math.min(block1Bottom, block2Bottom) - Math.max(block1Top, block2Top));
  }

  /**
   * Resolves collision between two blocks
   * @param {Block} block1 - First block
   * @param {Block} block2 - Second block
   */
  resolveCollision(block1, block2) {
    // Determine which block is moving
    const movingBlock = block1.isMoving ? block1 : block2;
    const staticBlock = block1.isMoving ? block2 : block1;
    
    if (!movingBlock.isMoving) return;
    
    // Calculate collision normal
    const collisionNormal = this.calculateCollisionNormal(movingBlock, staticBlock);
    
    // Apply collision response
    this.applyCollisionResponse(movingBlock, staticBlock, collisionNormal);
  }

  /**
   * Calculates collision normal between two blocks
   * @param {Block} movingBlock - Moving block
   * @param {Block} staticBlock - Static block
   * @returns {Object} Collision normal vector
   */
  calculateCollisionNormal(movingBlock, staticBlock) {
    const dx = (staticBlock.position.x + staticBlock.width / 2) - 
               (movingBlock.position.x + movingBlock.width / 2);
    const dy = (staticBlock.position.y + gameState.config.blockHeight / 2) - 
               (movingBlock.position.y + gameState.config.blockHeight / 2);
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: 0, y: -1 }; // Default upward normal
    }
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }

  /**
   * Applies collision response to moving block
   * @param {Block} movingBlock - Moving block
   * @param {Block} staticBlock - Static block
   * @param {Object} normal - Collision normal
   */
  applyCollisionResponse(movingBlock, staticBlock, normal) {
    // Reflect velocity based on collision normal
    const dotProduct = movingBlock.speed * normal.x;
    movingBlock.speed = movingBlock.speed - 2 * dotProduct * normal.x;
    
    // Apply bounce damping
    movingBlock.speed *= this.config.bounce;
    
    // Separate blocks to prevent overlap
    this.separateBlocks(movingBlock, staticBlock, normal);
  }

  /**
   * Separates overlapping blocks
   * @param {Block} block1 - First block
   * @param {Block} block2 - Second block
   * @param {Object} normal - Separation normal
   */
  separateBlocks(block1, block2, normal) {
    const overlap = this.calculateHorizontalOverlap(block1, block2);
    
    if (overlap > 0) {
      const separation = overlap / 2;
      
      // Move blocks apart
      block1.position.x -= normal.x * separation;
      block2.position.x += normal.x * separation;
    }
  }

  /**
   * Updates tower stability calculations
   * @param {Array} blocks - Array of all blocks
   */
  updateTowerStability(blocks) {
    const towerBlocks = blocks.filter(block => block.isPlaced);
    
    if (towerBlocks.length < 2) return;
    
    // Calculate center of mass
    const centerOfMass = this.calculateCenterOfMass(towerBlocks);
    
    // Calculate support base
    const supportBase = this.calculateSupportBase(towerBlocks);
    
    // Check stability
    const stability = this.calculateStability(centerOfMass, supportBase);
    
    // Apply stability effects
    this.applyStabilityEffects(towerBlocks, stability);
  }

  /**
   * Calculates center of mass for tower blocks
   * @param {Array} blocks - Array of placed blocks
   * @returns {Object} Center of mass coordinates
   */
  calculateCenterOfMass(blocks) {
    let totalMass = 0;
    let weightedX = 0;
    let weightedY = 0;
    
    blocks.forEach(block => {
      const mass = block.width * gameState.config.blockHeight; // Mass proportional to area
      const centerX = block.position.x + block.width / 2;
      const centerY = block.position.y + gameState.config.blockHeight / 2;
      
      totalMass += mass;
      weightedX += centerX * mass;
      weightedY += centerY * mass;
    });
    
    return {
      x: weightedX / totalMass,
      y: weightedY / totalMass
    };
  }

  /**
   * Calculates the support base of the tower
   * @param {Array} blocks - Array of placed blocks
   * @returns {Object} Support base information
   */
  calculateSupportBase(blocks) {
    if (blocks.length === 0) {
      return { left: 0, right: 0, width: 0 };
    }
    
    // Find the bottom block (highest Y position)
    const bottomBlock = blocks.reduce((bottom, block) => 
      block.position.y > bottom.position.y ? block : bottom
    );
    
    return {
      left: bottomBlock.position.x,
      right: bottomBlock.position.x + bottomBlock.width,
      width: bottomBlock.width
    };
  }

  /**
   * Calculates tower stability based on center of mass and support base
   * @param {Object} centerOfMass - Center of mass coordinates
   * @param {Object} supportBase - Support base information
   * @returns {Object} Stability information
   */
  calculateStability(centerOfMass, supportBase) {
    const supportCenter = supportBase.left + supportBase.width / 2;
    const massOffset = Math.abs(centerOfMass.x - supportCenter);
    const maxOffset = supportBase.width * this.config.stabilityThreshold;
    
    const stability = Math.max(0, 1 - (massOffset / maxOffset));
    const isStable = massOffset <= maxOffset;
    
    return {
      stability,
      isStable,
      massOffset,
      maxOffset,
      tilt: massOffset / supportBase.width
    };
  }

  /**
   * Applies stability effects to tower blocks
   * @param {Array} blocks - Array of placed blocks
   * @param {Object} stability - Stability information
   */
  applyStabilityEffects(blocks, stability) {
    if (!stability.isStable) {
      // Tower is unstable - apply collapse effects
      this.applyCollapseEffects(blocks, stability);
    } else if (stability.stability < 0.5) {
      // Tower is wobbly - apply warning effects
      this.applyWarningEffects(blocks, stability);
    }
  }

  /**
   * Applies collapse effects to unstable tower
   * @param {Array} blocks - Array of placed blocks
   * @param {Object} stability - Stability information
   */
  applyCollapseEffects(blocks, stability) {
    blocks.forEach((block, index) => {
      // Add collapse animation
      block.collapsing = true;
      block.collapseTime = Date.now();
      
      // Apply random collapse forces
      block.collapseForce = {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 5
      };
    });
  }

  /**
   * Applies warning effects to wobbly tower
   * @param {Array} blocks - Array of placed blocks
   * @param {Object} stability - Stability information
   */
  applyWarningEffects(blocks, stability) {
    // Add subtle shake animation
    blocks.forEach(block => {
      block.wobbling = true;
      block.wobbleIntensity = (1 - stability.stability) * 2;
    });
  }

  /**
   * Calculates overlap between a moving block and the tower
   * @param {Block} movingBlock - Moving block
   * @param {Array} towerBlocks - Array of tower blocks
   * @returns {Object} Overlap information
   */
  calculateTowerOverlap(movingBlock, towerBlocks) {
    if (towerBlocks.length === 0) {
      return { overlap: 0, targetBlock: null };
    }
    
    // Find the top block in the tower
    const topBlock = towerBlocks.reduce((top, block) => 
      block.position.y < top.position.y ? block : top
    );
    
    const overlap = this.calculateHorizontalOverlap(movingBlock, topBlock);
    
    return {
      overlap,
      targetBlock: topBlock,
      overlapPercentage: overlap / Math.min(movingBlock.width, topBlock.width)
    };
  }

  /**
   * Simulates block drop physics
   * @param {Block} block - Block to drop
   * @param {Array} towerBlocks - Array of tower blocks
   * @returns {Object} Drop result information
   */
  simulateBlockDrop(block, towerBlocks) {
    const overlapInfo = this.calculateTowerOverlap(block, towerBlocks);
    
    if (overlapInfo.overlap <= 0) {
      return {
        success: false,
        reason: "missed",
        overlap: 0
      };
    }
    
    // Calculate final block properties
    const finalWidth = Math.max(
      gameState.config.minBlockWidth,
      overlapInfo.overlap
    );
    
    const isPerfect = overlapInfo.overlapPercentage >= gameState.perfectThreshold;
    
    return {
      success: true,
      finalWidth,
      overlap: overlapInfo.overlap,
      overlapPercentage: overlapInfo.overlapPercentage,
      isPerfect,
      targetBlock: overlapInfo.targetBlock
    };
  }

  /**
   * Clears physics caches
   */
  clearCaches() {
    this.collisionCache.clear();
    this.stabilityCache.clear();
  }

  /**
   * Gets physics engine configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Updates physics engine configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create global physics engine instance
let physicsEngine = null;

/**
 * Initializes the physics engine
 * @param {Object} config - Physics configuration
 * @returns {PhysicsEngine} Initialized physics engine
 */
function initPhysicsEngine(config = {}) {
  physicsEngine = new PhysicsEngine(config);
  return physicsEngine;
}

/**
 * Gets the current physics engine instance
 * @returns {PhysicsEngine} Current physics engine
 */
function getPhysicsEngine() {
  if (!physicsEngine) {
    physicsEngine = new PhysicsEngine();
  }
  return physicsEngine;
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PhysicsEngine,
    initPhysicsEngine,
    getPhysicsEngine
  };
} else {
  window.PhysicsEngine = PhysicsEngine;
  window.initPhysicsEngine = initPhysicsEngine;
  window.getPhysicsEngine = getPhysicsEngine;
}
