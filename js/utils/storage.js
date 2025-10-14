/**
 * @file storage.js
 * @description Utility functions for localStorage management
 * @author Student Name
 * @date 2025-01-27
 */

/**
 * Storage utility class for managing localStorage operations
 * @class
 */
class StorageManager {
  /**
   * Saves data to localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} data - Data to save
   * @returns {boolean} Success status
   */
  static save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Loads data from localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Loaded data or default value
   */
  static load(key, defaultValue = null) {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Removes data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  /**
   * Clears all localStorage data
   * @returns {boolean} Success status
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Checks if a key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Whether key exists
   */
  static exists(key) {
    return localStorage.getItem(key) !== null;
  }
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
} else {
  window.StorageManager = StorageManager;
}
