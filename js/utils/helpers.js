/**
 * @file helpers.js
 * @description General utility helper functions
 * @author Student Name
 * @date 2025-01-27
 */

/**
 * Utility helper functions
 * @namespace
 */
const Helpers = {
  /**
   * Generates a random number between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  random: function(min, max) {
    return Math.random() * (max - min) + min;
  },

  /**
   * Generates a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Clamps a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  lerp: function(start, end, factor) {
    return start + (end - start) * factor;
  },

  /**
   * Calculates distance between two points
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Second point {x, y}
   * @returns {number} Distance
   */
  distance: function(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Formats a number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber: function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Debounces a function call
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttles a function call
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Helpers;
} else {
  window.Helpers = Helpers;
}
