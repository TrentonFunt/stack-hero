/**
 * @file events.js
 * @description Event system utility functions
 * @author Student Name
 * @date 2025-01-27
 */

/**
 * Event system for managing custom events
 * @class
 */
class EventSystem {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Emits a custom event
   * @param {string} eventName - Name of the event
   * @param {*} data - Event data
   */
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  /**
   * Listens for a custom event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    const handler = (event) => callback(event.detail);
    document.addEventListener(eventName, handler);
    
    // Return unsubscribe function
    return () => {
      document.removeEventListener(eventName, handler);
    };
  }

  /**
   * Listens for a custom event once
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   */
  once(eventName, callback) {
    const handler = (event) => {
      callback(event.detail);
      document.removeEventListener(eventName, handler);
    };
    document.addEventListener(eventName, handler);
  }
}

// Global event system instance
const eventSystem = new EventSystem();

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventSystem, eventSystem };
} else {
  window.EventSystem = EventSystem;
  window.eventSystem = eventSystem;
}
