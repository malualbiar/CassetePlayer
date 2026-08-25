/**
 * Skeuomorphic Rotary Knob Controller Component
 * Handles mouse/touch drag, wheel scrolling, step clicking, and bounded angular limits.
 */
(function (global) {
  'use strict';

  function RotaryKnob(el, options = {}) {
    if (!el) return null;

    const minAngle = options.minAngle !== undefined ? options.minAngle : -135;
    const maxAngle = options.maxAngle !== undefined ? options.maxAngle : 135;
    let angle = options.initialAngle !== undefined ? options.initialAngle : 0;
    let isDragging = false;
    let clickDirection = 1;

    function clampAngle(deg) {
      return Math.max(minAngle, Math.min(maxAngle, deg));
    }

    function updateRotation(newAngle, animate = false) {
      angle = clampAngle(newAngle);
      el.style.transition = animate ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none';
      el.style.transform = `rotate(${angle}deg)`;
      if (typeof options.onChange === 'function') {
        options.onChange(angle);
      }
    }

    function getPointerAngleFromCenter(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // 0deg = 12 o'clock (top), +90deg = 3 o'clock (right), -90deg = 9 o'clock (left)
      return Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI);
    }

    function onStart(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rawAngle = getPointerAngleFromCenter(clientX, clientY);
      if (rawAngle >= minAngle && rawAngle <= maxAngle) {
        updateRotation(rawAngle, false);
      }

      function onMove(me) {
        if (!isDragging) return;
        const curX = me.touches ? me.touches[0].clientX : me.clientX;
        const curY = me.touches ? me.touches[0].clientY : me.clientY;
        const curAngle = getPointerAngleFromCenter(curX, curY);

        // Handle the bottom dead zone: clamp firmly to nearest stop
        if (curAngle > maxAngle || curAngle < minAngle) {
          if (curAngle > 0 || angle > 0) {
            updateRotation(maxAngle, false);
          } else {
            updateRotation(minAngle, false);
          }
        } else {
          updateRotation(curAngle, false);
        }
      }

      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      }

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    }

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });

    // Wheel to rotate: strictly bounded between MIN and MAX
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 12 : -12;
      updateRotation(angle + delta, true);
    }, { passive: false });

    // Click to step: strictly bounded and reverses at limits
    el.addEventListener('click', () => {
      const step = options.step || 25;
      if (angle >= maxAngle) clickDirection = -1;
      if (angle <= minAngle) clickDirection = 1;
      updateRotation(angle + (step * clickDirection), true);
    });

    // Initialize at calibrated angle
    updateRotation(angle, false);

    return {
      getAngle: () => angle,
      setAngle: (deg, animate = false) => updateRotation(deg, animate),
      destroy: () => {
        el.removeEventListener('mousedown', onStart);
        el.removeEventListener('touchstart', onStart);
      }
    };
  }

  global.RotaryKnob = RotaryKnob;
})(window);
