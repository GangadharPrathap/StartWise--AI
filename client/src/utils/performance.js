/**
 * Performance utilities for production-grade React apps
 */

export const performanceUtils = {
  /**
   * Simple benchmark for measuring execution time in development
   */
  measure: (label, fn) => {
    if (import.meta.env.MODE !== 'production') {
      console.time(label);
      const result = fn();
      console.timeEnd(label);
      return result;
    }
    return fn();
  },

  /**
   * Throttle function to limit execution rate
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
};
