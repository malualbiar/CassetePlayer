/**
 * 3D Circular Tape Arch Carousel Component
 * Handles orbital trigonometry, card sorting, spring transitions, and interactive tape selection.
 */
(function (global) {
  'use strict';

  function createTapeCarousel(options = {}) {
    const cardSelector = options.cardSelector || '.fanned-tape-card';
    let tapeOrder = options.initialOrder ? [...options.initialOrder] : [];
    let hasActiveSelection = options.hasActiveSelection !== undefined ? options.hasActiveSelection : true;
    const onTapeSelect = options.onTapeSelect || function () {};

    const counterEl = document.getElementById('active-tape-counter');

    function buildPositions(total) {
      const positions = [];
      const startDeg = 290;   // right-bottom anchor
      const sweepDeg = -220;  // counter-clockwise sweep upward then right
      const Rx = 195;
      const Ry = 190;
      const xOffset = 380;    // shifted left slightly, right half bleeds off screen
      const yOffset = 0;      // vertically centered with deck and screen

      for (let i = 0; i < total; i++) {
        const deg = startDeg + (sweepDeg / (total - 1)) * i;
        const rad = deg * Math.PI / 180;
        const x = Math.round(Math.cos(rad) * Rx) + xOffset;
        const y = Math.round(Math.sin(rad) * Ry) + yOffset;

        // Tangential rotation — normalized to [-90°, +90°] so cards never flip upside-down
        let rot = Math.round(deg - 80);
        if (rot > 90) rot -= 180;
        if (rot < -90) rot += 180;

        const scale = i === 0 ? 1.0 : Math.max(0.76, 1.0 - i * 0.022);
        const opacity = i === 0 ? 1.0 : Math.max(0.72, 1.0 - i * 0.028);
        const zIndex = 30 - i;
        positions.push({ x, y, z: -i * 6, rot, scale, opacity, zIndex });
      }
      return positions;
    }

    function updateVisuals() {
      const positions = buildPositions(tapeOrder.length);
      const allCards = document.querySelectorAll(cardSelector);

      allCards.forEach(card => {
        const tapeId = card.getAttribute('data-tape-id');
        const index = tapeOrder.indexOf(tapeId);
        if (index === -1) {
          card.style.display = 'none';
        } else {
          card.style.display = '';
          const pos = positions[index] || positions[positions.length - 1];

          if (hasActiveSelection && index === 0) {
            card.classList.add('is-active');
          } else {
            card.classList.remove('is-active');
          }

          card.style.zIndex = pos.zIndex;
          card.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotate(${pos.rot}deg) scale(${pos.scale})`;
          card.style.opacity = pos.opacity;
        }
      });

      const activeId = tapeOrder[0];
      if (counterEl && global.TapeData) {
        const tape = global.TapeData.get(activeId);
        if (tape && hasActiveSelection) {
          counterEl.textContent = tape.subtitle;
        } else if (counterEl) {
          counterEl.textContent = 'SELECT A TAPE';
        }
      }
    }

    function animateTransition(incomingId, callback) {
      const allCards = document.querySelectorAll(cardSelector);

      // Fire the "pick up" glow on the card being selected
      const pickCard = document.querySelector(`${cardSelector}[data-tape-id="${incomingId}"]`);
      if (pickCard) {
        pickCard.classList.remove('is-picking-up');
        void pickCard.offsetWidth; // force reflow to restart animation
        pickCard.classList.add('is-picking-up');
        setTimeout(() => pickCard.classList.remove('is-picking-up'), 650);
      }

      // Fire the "shift" ripple on all other cards
      allCards.forEach(card => {
        if (card.dataset.tapeId !== incomingId) {
          card.classList.remove('is-shifting');
          void card.offsetWidth;
          card.classList.add('is-shifting');
          setTimeout(() => card.classList.remove('is-shifting'), 550);
        }
      });

      // Small delay so animation starts, then reorder + update positions
      setTimeout(() => {
        if (typeof callback === 'function') callback();
      }, 80);
    }

    function bringTapeToFront(id, autoPlay = false) {
      hasActiveSelection = true;
      animateTransition(id, () => {
        tapeOrder = [id, ...tapeOrder.filter(t => t !== id)];
        updateVisuals();
        onTapeSelect(id, autoPlay);
      });
    }

    function nextTape(autoPlay = false) {
      hasActiveSelection = true;
      const next = tapeOrder[1] || tapeOrder[0];
      animateTransition(next, () => {
        const first = tapeOrder.shift();
        tapeOrder.push(first);
        updateVisuals();
        onTapeSelect(tapeOrder[0], autoPlay);
      });
    }

    function prevTape(autoPlay = false) {
      hasActiveSelection = true;
      const prev = tapeOrder[tapeOrder.length - 1];
      animateTransition(prev, () => {
        const last = tapeOrder.pop();
        tapeOrder.unshift(last);
        updateVisuals();
        onTapeSelect(tapeOrder[0], autoPlay);
      });
    }

    function shuffleTapes(autoPlay = false) {
      hasActiveSelection = true;
      for (let i = tapeOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tapeOrder[i], tapeOrder[j]] = [tapeOrder[j], tapeOrder[i]];
      }
      updateVisuals();
      onTapeSelect(tapeOrder[0], autoPlay);
    }

    function clearActiveSelection() {
      hasActiveSelection = false;
      document.querySelectorAll(cardSelector).forEach(card => card.classList.remove('is-active'));
      if (counterEl) counterEl.textContent = 'SELECT A TAPE';
    }

    function setOrder(newOrder, withSelection = true) {
      if (Array.isArray(newOrder)) {
        tapeOrder = [...newOrder];
        hasActiveSelection = withSelection;
        updateVisuals();
      }
    }

    function playEntranceAnimation(onComplete) {
      const positions = buildPositions(tapeOrder.length);
      const cards = tapeOrder
        .map(tapeId => document.querySelector(`${cardSelector}[data-tape-id="${tapeId}"]`))
        .filter(Boolean);

      if (cards.length === 0) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      // Initial off-screen collapsed state
      cards.forEach((card, index) => {
        const pos = positions[index] || positions[positions.length - 1];
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.zIndex = pos.zIndex;
        // Start pushed right and tilted, creating a natural swooping arc entry
        card.style.transform = `translate3d(${pos.x + 220}px, ${pos.y + 30}px, -80px) rotate(${pos.rot + 25}deg) scale(0.65)`;
        card.classList.remove('is-active', 'is-picking-up', 'is-shifting');
      });

      // Force layout reflow
      void cards[0].offsetWidth;

      // Stagger each tape's entrance one by one
      const staggerInterval = 75; // ms between each tape appearance

      cards.forEach((card, index) => {
        const pos = positions[index] || positions[positions.length - 1];

        setTimeout(() => {
          card.style.transition = 'transform 0.75s cubic-bezier(0.34, 1.35, 0.64, 1), opacity 0.45s ease, box-shadow 0.4s ease';
          card.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotate(${pos.rot}deg) scale(${pos.scale})`;
          card.style.opacity = pos.opacity;

          if (hasActiveSelection && index === 0) {
            card.classList.add('is-active');
          }
        }, index * staggerInterval);
      });

      const totalDuration = (cards.length * staggerInterval) + 800;

      // Reset transition overrides once the entrance completes so subsequent clicks are responsive
      setTimeout(() => {
        cards.forEach((card) => {
          card.style.transition = '';
        });
        if (typeof onComplete === 'function') onComplete();
      }, totalDuration);
    }

    // Attach click listeners to all card elements in DOM (taping loads tape into deck and waits for user to press play)
    document.querySelectorAll(cardSelector).forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-tape-id');
        if (id) bringTapeToFront(id, false);
      });
    });

    global.addEventListener('tape-ejected', clearActiveSelection);

    return {
      getOrder: () => [...tapeOrder],
      getActiveId: () => tapeOrder[0],
      setOrder,
      bringTapeToFront,
      nextTape,
      prevTape,
      shuffleTapes,
      clearActiveSelection,
      updateVisuals,
      playEntranceAnimation
    };
  }

  global.TapeCarousel = {
    create: createTapeCarousel
  };
})(window);
