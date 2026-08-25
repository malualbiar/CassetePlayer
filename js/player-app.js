/**
 * Main Player Page Application Orchestrator
 * Connects AudioDeck, RotaryKnob controllers, and TapeCarousel with DOM lifecycle.
 */
(function (global) {
  'use strict';

  function initPlayerPage() {
    const playBtn = document.getElementById('btn-play');
    if (!playBtn) return; // Not on PlayerPage

    // 1. Collect Hardware UI Elements
    const deckElements = {
      btnPlay: playBtn,
      btnStop: document.getElementById('btn-stop'),
      btnPause: document.getElementById('btn-pause'),
      btnRewind: document.getElementById('btn-rewind'),
      btnForward: document.getElementById('btn-forward'),
      btnEject: document.getElementById('btn-eject'),

      reelLeft: document.getElementById('reel-left'),
      reelRight: document.getElementById('reel-right'),
      needleLeft: document.getElementById('needle-left'),
      needleRight: document.getElementById('needle-right'),
      recLed: document.getElementById('rec-led'),
      pauseLed: document.getElementById('pause-led'),

      tapeTypeEl: document.getElementById('tape-type'),
      tapeBrandEl: document.getElementById('tape-brand'),
      tapePosEl: document.getElementById('tape-pos'),
      tapeSubEl: document.getElementById('tape-subtitle'),
      tapeShellEl: document.getElementById('tape-shell')
    };

    // 2. Initialize or Re-attach Audio Deck Hardware Engine
    let deck = global.AudioDeck.getInstance();
    if (!deck) {
      deck = global.AudioDeck.create(deckElements);
    } else {
      deck.attachElements(deckElements);
    }

    // 3. Initialize 3D Tape Carousel
    const userCollection = global.TapeData ? global.TapeData.getUserCollection() : [];
    const currentActiveId = deck.getCurrentTapeId();

    let initialOrder = [...userCollection];
    if (currentActiveId && !initialOrder.includes(currentActiveId)) {
      initialOrder = [currentActiveId, ...initialOrder];
    } else if (currentActiveId) {
      initialOrder = [currentActiveId, ...initialOrder.filter(t => t !== currentActiveId)];
    }

    const carousel = global.TapeCarousel.create({
      cardSelector: '.fanned-tape-card',
      initialOrder: initialOrder,
      hasActiveSelection: Boolean(currentActiveId),
      onTapeSelect: (tapeId, autoPlay) => {
        const tape = global.TapeData.get(tapeId);
        if (tape) {
          deck.loadTape(tape, autoPlay);
        }
      }
    });

    // 4. Setup Volume Rotary Knob (-135deg = MIN / 0%, +135deg = MAX / 100%)
    const volumeKnobEl = document.getElementById('volume-knob');
    if (volumeKnobEl) {
      const currentVol = deck.audio.volume !== undefined ? deck.audio.volume : 0.7;
      const initialVolAngle = (currentVol * 270) - 135;
      global.RotaryKnob(volumeKnobEl, {
        initialAngle: initialVolAngle,
        minAngle: -135,
        maxAngle: 135,
        step: 25,
        onChange: (deg) => {
          const vol = Math.max(0, Math.min(1, (deg + 135) / 270));
          deck.setVolume(vol);
        }
      });
    }

    // 5. Setup Tuning Rotary Knob (-135deg = 88 MHz, +135deg = 108 MHz)
    const tuningKnobEl = document.getElementById('tuning-knob');
    if (tuningKnobEl) {
      global.RotaryKnob(tuningKnobEl, {
        initialAngle: -30,
        minAngle: -135,
        maxAngle: 135,
        step: 25,
        onChange: (deg) => {
          if (deckElements.needleRight && !deck.isPlaying()) {
            deckElements.needleRight.style.transform = `rotate(${Math.sin(deg * 0.1) * 8 - 10}deg)`;
          }
        }
      });
    }

    // 6. Wire Optional External Nav Buttons (if present)
    const btnNext = document.getElementById('btn-next-tape');
    const btnPrev = document.getElementById('btn-prev-tape');
    const btnShuffle = document.getElementById('btn-shuffle-tapes');

    if (btnNext) btnNext.onclick = () => carousel.nextTape(true);
    if (btnPrev) btnPrev.onclick = () => carousel.prevTape(true);
    if (btnShuffle) btnShuffle.onclick = () => carousel.shuffleTapes(true);

    // 7. Handle URL Parameter Tape or Maintain Ongoing Playback State
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTapeId = urlParams.get('tape');

    if (requestedTapeId && global.TapeData.get(requestedTapeId)) {
      // Tape explicitly requested via URL
      let order = [...userCollection];
      if (!order.includes(requestedTapeId)) {
        order = [requestedTapeId, ...order];
      } else {
        order = [requestedTapeId, ...order.filter(t => t !== requestedTapeId)];
      }
      carousel.setOrder(order, true);
      deck.loadTape(global.TapeData.get(requestedTapeId), deck.isPlaying());
    } else if (currentActiveId && global.TapeData.get(currentActiveId)) {
      // Tape was already playing or loaded in session
      deck.syncVisuals();
    } else {
      // Cold launch: No tape in the radio at first
      deck.unloadTape();
      carousel.setOrder(userCollection, false);
    }

    // Play the one-by-one cascading entrance animation
    carousel.playEntranceAnimation();
  }

  global.initPlayerPage = initPlayerPage;
  document.addEventListener('DOMContentLoaded', initPlayerPage);
})(window);
