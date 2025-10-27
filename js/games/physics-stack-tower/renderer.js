/**
 * @file renderer.js
 * @game Stack Hero
 * @author Tiwalade Adegoke
 * @date May 16th - October 14th, 2025
 *
 * @description
 * Rendering system for Stack Hero. Handles canvas drawing,
 * animations, and visual effects for blocks, tower, and UI elements.
 *
 * @dependencies
 * - game.js: Core game logic and block objects
 * - physics.js: Physics engine for animations
 */

/**
 * Renderer class for handling all game rendering
 * @class
 */
class GameRenderer {
  /**
   * Create a new game renderer
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {Object} config - Renderer configuration
   */
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = {
      blockHeight: config.blockHeight || 30,
      shadowOffset: config.shadowOffset || 3,
      animationSpeed: config.animationSpeed || 0.1,
      particleCount: config.particleCount || 20,
      ...config
    };
    
    this.animations = [];
    this.particles = [];
    this.lastFrameTime = 0;
    
    // Set up canvas properties
    this.setupCanvas();
  }

  /**
   * Sets up canvas properties and context
   */
  setupCanvas() {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set up high DPI support
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  /**
   * Main render function called every frame
   * @param {number} currentTime - Current timestamp
   */
  render(currentTime) {
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // Clear canvas
    this.clearCanvas();
    
    // Draw background
    this.drawBackground();
    
    // Draw tower blocks
    this.drawTower();
    
    // Draw current moving block
    this.drawCurrentBlock();
    
    // Draw particles
    this.drawParticles(deltaTime);
    
    this.drawUIOverlays();
    this.updateAnimations(deltaTime);
  }

  /**
   * Clears the canvas
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the game background
   */
  drawBackground() {
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.5, '#98FB98'); // Pale green
    gradient.addColorStop(1, '#F0E68C'); // Khaki
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid lines for reference
    this.drawGridLines();
  }

  /**
   * Draws subtle grid lines for visual reference
   */
  drawGridLines() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draws all tower blocks
   */
  drawTower() {
    if (!gameState.tower || gameState.tower.length === 0) return;
    
    gameState.tower.forEach((block, index) => {
      this.drawBlock(block, index);
    });
  }

  /**
   * Draws the current moving block
   */
  drawCurrentBlock() {
    if (!gameState.currentBlock || !gameState.currentBlock.isMoving) return;
    
    this.drawBlock(gameState.currentBlock, -1, true);
  }

  /**
   * Draws a single block with effects
   * @param {Block} block - Block to draw
   * @param {number} index - Block index in tower (-1 for moving block)
   * @param {boolean} isMoving - Whether block is currently moving
   */
  drawBlock(block, index, isMoving = false) {
    if (!block) return;
    
    const x = block.position.x;
    const y = block.position.y;
    const width = block.width;
    const height = this.config.blockHeight;
    
    // Apply animations
    const animatedX = this.applyBlockAnimations(block, x, 'x');
    const animatedY = this.applyBlockAnimations(block, y, 'y');
    const animatedWidth = this.applyBlockAnimations(block, width, 'width');
    
    // Draw shadow
    this.drawBlockShadow(animatedX, animatedY, animatedWidth, height);
    
    // Draw block body
    this.drawBlockBody(block, animatedX, animatedY, animatedWidth, height, isMoving);
    
    // Draw block border
    this.drawBlockBorder(animatedX, animatedY, animatedWidth, height, isMoving);
    
    // Draw special effects
    this.drawBlockEffects(block, animatedX, animatedY, animatedWidth, height);
  }

  /**
   * Applies animations to block properties
   * @param {Block} block - Block to animate
   * @param {number} value - Original value
   * @param {string} property - Property being animated
   * @returns {number} Animated value
   */
  applyBlockAnimations(block, value, property) {
    if (block.collapsing) {
      // Collapse animation
      const collapseTime = (Date.now() - block.collapseTime) / 1000;
      const collapseForce = block.collapseForce || { x: 0, y: 0 };
      
      if (property === 'x') {
        return value + collapseForce.x * collapseTime;
      } else if (property === 'y') {
        return value + collapseForce.y * collapseTime + 0.5 * 9.8 * collapseTime * collapseTime;
      } else if (property === 'width') {
        return value * (1 - collapseTime * 0.1);
      }
    }
    
    if (block.wobbling) {
      // Wobble animation
      const wobbleIntensity = block.wobbleIntensity || 1;
      const wobbleOffset = Math.sin(Date.now() * 0.01) * wobbleIntensity;
      
      if (property === 'x') {
        return value + wobbleOffset;
      }
    }
    
    if (block.perfectDrop) {
      // Perfect drop animation
      const perfectTime = (Date.now() - block.perfectTime) / 1000;
      if (perfectTime < 0.4) {
        const scale = 1 + Math.sin(perfectTime * Math.PI * 5) * 0.05;
        if (property === 'width') {
          return value * scale;
        }
      }
    }
    
    return value;
  }

  /**
   * Draws block shadow
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Block width
   * @param {number} height - Block height
   */
  drawBlockShadow(x, y, width, height) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(
      x + this.config.shadowOffset,
      y + this.config.shadowOffset,
      width,
      height
    );
  }

  /**
   * Draws block body with gradient
   * @param {Block} block - Block object
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Block width
   * @param {number} height - Block height
   * @param {boolean} isMoving - Whether block is moving
   */
  drawBlockBody(block, x, y, width, height, isMoving) {
    if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
      return;
    }
    
    // Create gradient for block
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    
    if (isMoving) {
      // Moving block gradient
      gradient.addColorStop(0, this.lightenColor(block.color, 0.3));
      gradient.addColorStop(1, this.darkenColor(block.color, 0.2));
    } else {
      // Static block gradient
      gradient.addColorStop(0, this.lightenColor(block.color, 0.2));
      gradient.addColorStop(1, this.darkenColor(block.color, 0.3));
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draws block border
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Block width
   * @param {number} height - Block height
   * @param {boolean} isMoving - Whether block is moving
   */
  drawBlockBorder(x, y, width, height, isMoving) {
    this.ctx.strokeStyle = isMoving ? '#FFFFFF' : '#CCCCCC';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
  }

  /**
   * Draws special effects for blocks
   * @param {Block} block - Block object
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Block width
   * @param {number} height - Block height
   */
  drawBlockEffects(block, x, y, width, height) {
    if (block.perfectDrop) {
      // Perfect drop sparkle effect
      this.drawSparkleEffect(x + width / 2, y + height / 2);
    }
    
    if (block.collapsing) {
      // Collapse particle effect
      this.createCollapseParticles(x + width / 2, y + height / 2, block.color);
    }
  }

  /**
   * Draws sparkle effect for perfect drops
   * @param {number} centerX - Center X position
   * @param {number} centerY - Center Y position
   */
  drawSparkleEffect(centerX, centerY) {
    const sparkleTime = (Date.now() % 1000) / 1000;
    const sparkleCount = 8;
    
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 20 + Math.sin(sparkleTime * Math.PI * 2) * 10;
      
      const startX = centerX + Math.cos(angle) * (radius - 5);
      const startY = centerY + Math.sin(angle) * (radius - 5);
      const endX = centerX + Math.cos(angle) * (radius + 5);
      const endY = centerY + Math.sin(angle) * (radius + 5);
      
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
  }

  /**
   * Creates collapse particle effect
   * @param {number} centerX - Center X position
   * @param {number} centerY - Center Y position
   * @param {string} color - Particle color
   */
  createCollapseParticles(centerX, centerY, color) {
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 1.0,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
  }

  /**
   * Draws all particles
   * @param {number} deltaTime - Time elapsed since last frame
   */
  drawParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      // Update particle
      particle.x += particle.vx * deltaTime * 0.1;
      particle.y += particle.vy * deltaTime * 0.1;
      particle.vy += 0.5 * deltaTime * 0.1; // Gravity
      particle.life -= deltaTime * 0.002;
      
      // Draw particle
      if (particle.life > 0) {
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        return true; // Keep particle
      }
      
      return false;
    });
  }

  /**
   * Draws UI overlays (score popups, etc.)
   */
  drawUIOverlays() {
    // Draw score popups
    this.drawScorePopups();
    
    // Draw tower height indicator
    this.drawTowerHeightIndicator();
  }

  /**
   * Draws floating score popups
   */
  drawScorePopups() {
    // This would be implemented to show score popups when blocks are placed
    // For now, it's a placeholder
  }

  /**
   * Draws tower height indicator
   */
  drawTowerHeightIndicator() {
    if (gameState.tower.length < 2) return;
    
    const towerHeight = gameState.tower.length * this.config.blockHeight;
    const maxHeight = this.canvas.height * 0.8;
    const heightPercentage = Math.min(towerHeight / maxHeight, 1);
    
    // Draw height bar
    const barWidth = 20;
    const barHeight = 200;
    const barX = this.canvas.width - barWidth - 20;
    const barY = 50;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Fill
    this.ctx.fillStyle = `hsl(${heightPercentage * 120}, 70%, 50%)`;
    this.ctx.fillRect(barX, barY + barHeight * (1 - heightPercentage), barWidth, barHeight * heightPercentage);
    
    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  /**
   * Updates all animations
   * @param {number} deltaTime - Time elapsed since last frame
   */
  updateAnimations(deltaTime) {
    this.animations = this.animations.filter(animation => {
      animation.update(deltaTime);
      return !animation.isComplete();
    });
  }

  /**
   * Lightens a color by a specified amount
   * @param {string} color - Hex color string
   * @param {number} amount - Amount to lighten (0-1)
   * @returns {string} Lightened color
   */
  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount * 255);
    
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  /**
   * Darkens a color by a specified amount
   * @param {string} color - Hex color string
   * @param {number} amount - Amount to darken (0-1)
   * @returns {string} Darkened color
   */
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
    
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }

  /**
   * Handles canvas resize
   */
  handleResize() {
    this.setupCanvas();
  }

  /**
   * Adds a particle to the particle system
   * @param {Object} particle - Particle object with x, y, vx, vy, life, decay, size, color, type
   */
  addParticle(particle) {
    this.particles.push(particle);
  }

  /**
   * Clears all particles and animations
   */
  clearEffects() {
    this.particles = [];
    this.animations = [];
  }
}

// Global renderer instance
let gameRenderer = null;

/**
 * Initializes the game renderer
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} config - Renderer configuration
 * @returns {GameRenderer} Initialized renderer
 */
function initRenderer(canvas, config = {}) {
  gameRenderer = new GameRenderer(canvas, config);
  return gameRenderer;
}

/**
 * Gets the current renderer instance
 * @returns {GameRenderer} Current renderer
 */
function getRenderer() {
  return gameRenderer;
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GameRenderer,
    initRenderer,
    getRenderer
  };
} else {
  window.GameRenderer = GameRenderer;
  window.initRenderer = initRenderer;
  window.getRenderer = getRenderer;
}
