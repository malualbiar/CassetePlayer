/**
 * Cassette Deck Hardware & HTML5 Audio Engine
 * Synchronizes persistent audio playback with physical reel spin animations, VU meters, LEDs, and latched transport buttons.
 */
(function (global) {
  'use strict';

  // Global Audio Singleton — persists across seamless SPA page transitions
  if (!global.__CASSETTE_AUDIO__) {
    const a = new Audio();
    a.preload = 'auto';
    global.__CASSETTE_AUDIO__ = a;
    global.__CASSETTE_CURRENT_TAPE_ID__ = null;
  }

  const audio = global.__CASSETTE_AUDIO__;

  function createAudioDeck(elements = {}) {
    let btnPlay = elements.btnPlay;
    let btnStop = elements.btnStop;
    let btnPause = elements.btnPause;
    let btnRewind = elements.btnRewind;
    let btnForward = elements.btnForward;
    let btnEject = elements.btnEject;

    let reelLeft = elements.reelLeft;
    let reelRight = elements.reelRight;
    let needleLeft = elements.needleLeft;
    let needleRight = elements.needleRight;
    let recLed = elements.recLed;
    let pauseLed = elements.pauseLed;

    let tapeTypeEl = elements.tapeTypeEl;
    let tapeBrandEl = elements.tapeBrandEl;
    let tapePosEl = elements.tapePosEl;
    let tapeSubEl = elements.tapeSubEl;
    let tapeShellEl = elements.tapeShellEl;

    let transportButtons = [btnPlay, btnStop, btnPause, btnRewind, btnForward, btnEject].filter(Boolean);

    function attachElements(newElements) {
      btnPlay = newElements.btnPlay;
      btnStop = newElements.btnStop;
      btnPause = newElements.btnPause;
      btnRewind = newElements.btnRewind;
      btnForward = newElements.btnForward;
      btnEject = newElements.btnEject;

      reelLeft = newElements.reelLeft;
      reelRight = newElements.reelRight;
      needleLeft = newElements.needleLeft;
      needleRight = newElements.needleRight;
      recLed = newElements.recLed;
      pauseLed = newElements.pauseLed;

      tapeTypeEl = newElements.tapeTypeEl;
      tapeBrandEl = newElements.tapeBrandEl;
      tapePosEl = newElements.tapePosEl;
      tapeSubEl = newElements.tapeSubEl;
      tapeShellEl = newElements.tapeShellEl;

      transportButtons = [btnPlay, btnStop, btnPause, btnRewind, btnForward, btnEject].filter(Boolean);

      // Re-bind listeners
      if (btnPlay) btnPlay.onclick = play;
      if (btnStop) btnStop.onclick = stop;
      if (btnPause) btnPause.onclick = togglePause;
      if (btnForward) btnForward.onclick = () => fastForward(10);
      if (btnRewind) btnRewind.onclick = () => rewind(10);
      if (btnEject) btnEject.onclick = () => eject();

      syncVisuals();
    }

    function setReelState(state) {
      if (reelLeft) {
        reelLeft.className = "w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shadow-inner";
      }
      if (reelRight) {
        reelRight.className = "w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shadow-inner";
      }
      if (needleLeft) needleLeft.classList.remove('vu-dancing-l');
      if (needleRight) needleRight.classList.remove('vu-dancing-r');

      if (state === 'play') {
        if (reelLeft) reelLeft.classList.add('reel-spinning');
        if (reelRight) reelRight.classList.add('reel-spinning');
        if (needleLeft) needleLeft.classList.add('vu-dancing-l');
        if (needleRight) needleRight.classList.add('vu-dancing-r');
        if (recLed) {
          recLed.className = "w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.6)] border border-red-800 transition-all";
        }
      } else if (state === 'forward') {
        if (reelLeft) reelLeft.classList.add('reel-fast-forward');
        if (reelRight) reelRight.classList.add('reel-fast-forward');
        if (needleLeft) needleLeft.classList.add('vu-dancing-l');
        if (needleRight) needleRight.classList.add('vu-dancing-r');
        if (recLed) {
          recLed.className = "w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.6)] border border-red-800 transition-all";
        }
      } else if (state === 'rewind') {
        if (reelLeft) reelLeft.classList.add('reel-fast-rewind');
        if (reelRight) reelRight.classList.add('reel-fast-rewind');
        if (needleLeft) needleLeft.classList.add('vu-dancing-l');
        if (needleRight) needleRight.classList.add('vu-dancing-r');
        if (recLed) {
          recLed.className = "w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.6)] border border-red-800 transition-all";
        }
      } else {
        if (recLed) {
          recLed.className = "w-3.5 h-3.5 rounded-full bg-[#2a0805] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] border border-[#1a0503] transition-all";
        }
      }
    }

    function setPauseLed(isOn) {
      if (!pauseLed) return;
      if (isOn) {
        pauseLed.className = "w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-amber-600";
      } else {
        pauseLed.className = "w-3.5 h-3.5 rounded-full bg-[#111] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),inset_0_-1px_1px_rgba(255,255,255,0.3)] border border-[#000]";
      }
    }

    function setLatchedButton(activeBtn) {
      transportButtons.forEach(btn => {
        if (btn !== activeBtn) btn.classList.remove('latched');
      });
      if (activeBtn) activeBtn.classList.add('latched');
    }

    function isPlaying() {
      return !audio.paused && Boolean(global.__CASSETTE_CURRENT_TAPE_ID__);
    }

    function hasTape() {
      return Boolean(global.__CASSETTE_CURRENT_TAPE_ID__);
    }

    function syncVisuals() {
      const currentId = global.__CASSETTE_CURRENT_TAPE_ID__;
      if (!currentId) {
        if (tapeShellEl) {
          tapeShellEl.style.display = 'none';
          tapeShellEl.style.opacity = '0';
        }
        setReelState('stop');
        setPauseLed(false);
        setLatchedButton(null);
        return;
      }

      const tape = global.TapeData ? global.TapeData.get(currentId) : null;
      if (tape) {
        if (tapeShellEl) {
          tapeShellEl.style.display = '';
          tapeShellEl.style.opacity = '1';
          if (tape.shellBg) tapeShellEl.style.backgroundColor = tape.shellBg;
          if (tape.shellBorder) tapeShellEl.style.borderColor = tape.shellBorder;
        }

        if (tapeTypeEl) {
          tapeTypeEl.textContent = tape.type;
          tapeTypeEl.style.color = tape.color;
        }
        if (tapeBrandEl) tapeBrandEl.textContent = tape.brand;
        if (tapePosEl) tapePosEl.textContent = tape.pos;
        if (tapeSubEl) tapeSubEl.textContent = tape.subtitle;

        if (!audio.paused) {
          setLatchedButton(btnPlay);
          setReelState('play');
          setPauseLed(false);
        } else if (btnPause && btnPause.classList.contains('latched')) {
          setReelState('pause');
          setPauseLed(true);
        } else {
          setReelState('stop');
          setPauseLed(false);
          setLatchedButton(null);
        }
      }
    }

    function unloadTape() {
      global.__CASSETTE_CURRENT_TAPE_ID__ = null;
      audio.pause();
      audio.src = '';
      audio.currentTime = 0;

      if (tapeShellEl) {
        tapeShellEl.style.opacity = '0';
        setTimeout(() => {
          if (!global.__CASSETTE_CURRENT_TAPE_ID__) {
            tapeShellEl.style.display = 'none';
          }
        }, 200);
      }

      setReelState('stop');
      setPauseLed(false);
      setLatchedButton(null);

      if (global.history && global.history.replaceState) {
        global.history.replaceState({}, '', window.location.pathname);
      }

      global.dispatchEvent(new CustomEvent('tape-ejected'));
    }

    function loadTape(tape, autoPlay = false) {
      if (!tape) return;
      const isNewTape = global.__CASSETTE_CURRENT_TAPE_ID__ !== tape.id;
      global.__CASSETTE_CURRENT_TAPE_ID__ = tape.id;

      if (tapeShellEl) {
        tapeShellEl.style.display = '';
        void tapeShellEl.offsetWidth;
        tapeShellEl.style.opacity = '1';
        if (tape.shellBg) tapeShellEl.style.backgroundColor = tape.shellBg;
        if (tape.shellBorder) tapeShellEl.style.borderColor = tape.shellBorder;
      }

      if (tapeTypeEl) {
        tapeTypeEl.textContent = tape.type;
        tapeTypeEl.style.color = tape.color;
      }
      if (tapeBrandEl) tapeBrandEl.textContent = tape.brand;
      if (tapePosEl) tapePosEl.textContent = tape.pos;
      if (tapeSubEl) tapeSubEl.textContent = tape.subtitle;

      if (tape.audioSrc && (isNewTape || !audio.src)) {
        audio.src = tape.audioSrc;
      }

      if (autoPlay) {
        setLatchedButton(btnPlay);
        setReelState('play');
        setPauseLed(false);
        audio.play().catch(e => console.log("Audio play prevented:", e));
      } else {
        audio.pause();
        audio.currentTime = 0;
        setLatchedButton(null);
        setReelState('stop');
        setPauseLed(false);
      }

      if (global.history && global.history.replaceState) {
        global.history.replaceState({}, '', '?tape=' + tape.id);
      }
    }

    function isPowered() {
      return !global.AudioEffects || global.AudioEffects.isPoweredOn();
    }

    function play() {
      if (!isPowered()) return;
      if (!global.__CASSETTE_CURRENT_TAPE_ID__) {
        setLatchedButton(null);
        setReelState('stop');
        return;
      }

      setLatchedButton(btnPlay);
      setReelState('play');
      setPauseLed(false);
      if (audio.src) {
        audio.play().catch(e => console.log("Audio play prevented:", e));
      }
    }

    function stop() {
      setLatchedButton(btnStop);
      setReelState('stop');
      setPauseLed(false);
      if (audio.src) {
        audio.pause();
        audio.currentTime = 0;
      }
      if (btnStop) {
        setTimeout(() => btnStop.classList.remove('latched'), 200);
      }
    }

    function togglePause() {
      if (!isPowered()) return;
      const isPaused = btnPause && btnPause.classList.contains('latched');
      if (isPaused) {
        if (btnPause) btnPause.classList.remove('latched');
        setPauseLed(false);
        if (btnPlay && btnPlay.classList.contains('latched')) {
          setReelState('play');
          if (audio.src) audio.play().catch(() => {});
        }
      } else {
        if (btnPause) btnPause.classList.add('latched');
        setPauseLed(true);
        setReelState('pause');
        if (audio.src) audio.pause();
      }
    }

    function fastForward(seconds = 10) {
      if (!isPowered()) return;
      setLatchedButton(btnForward);
      setReelState('forward');
      if (audio.src) {
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + seconds);
      }
    }

    function rewind(seconds = 10) {
      if (!isPowered()) return;
      setLatchedButton(btnRewind);
      setReelState('rewind');
      if (audio.src) {
        audio.currentTime = Math.max(0, audio.currentTime - seconds);
      }
    }

    function eject(onComplete) {
      setLatchedButton(btnEject);
      unloadTape();
      setTimeout(() => {
        if (btnEject) btnEject.classList.remove('latched');
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 250);
    }

    function setVolume(vol) {
      audio.volume = Math.max(0, Math.min(1, vol));
    }

    // Auto-stop when audio finishes
    audio.onended = () => {
      setLatchedButton(null);
      setReelState('stop');
    };

    // Attach initial elements
    attachElements(elements);

    const deckInstance = {
      audio,
      getCurrentTapeId: () => global.__CASSETTE_CURRENT_TAPE_ID__,
      hasTape,
      loadTape,
      unloadTape,
      play,
      stop,
      togglePause,
      fastForward,
      rewind,
      eject,
      setVolume,
      setReelState,
      isPlaying,
      syncVisuals,
      attachElements
    };

    global.__CASSETTE_DECK_INSTANCE__ = deckInstance;
    return deckInstance;
  }

  global.AudioDeck = {
    create: createAudioDeck,
    getInstance: () => global.__CASSETTE_DECK_INSTANCE__ || null,
    getAudio: () => global.__CASSETTE_AUDIO__
  };
})(window);
