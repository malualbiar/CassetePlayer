/**
 * Seamless SPA Navigation & Persistent Audio Transitions for CASSETTE (Root Mirror)
 */
(function (global) {
  'use strict';
  if (!global.CassetteRouter) {
    // If not already loaded by js/transitions.js
    const s = document.createElement('script');
    s.src = 'js/transitions.js';
    document.head.appendChild(s);
  }
})(window);
