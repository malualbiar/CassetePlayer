/**
 * Web Audio API Effects Engine & Master Power Management for CASSETTE
 * Handles analog tape hiss, Dolby noise reduction, speed/pitch adjust, 3-band EQ, and master power.
 */
(function (global) {
  'use strict';

  let audioCtx = null;
  let sourceNode = null;
  let bassNode = null;
  let midNode = null;
  let trebleNode = null;
  let dolbyNode = null;
  let masterGainNode = null;

  let hissBufferSource = null;
  let hissGainNode = null;
  let hissFilterNode = null;

  let isInitialized = false;
  let isPoweredOn = true;

  const STORAGE_KEY_POWER = 'cassette_power_state';
  const STORAGE_KEY_EFFECTS = 'cassette_audio_effects';
  const STORAGE_KEY_THEME = 'cassette_deck_theme';

  const defaultEffects = {
    hissLevel: 'subtle', // 'off' | 'subtle' | 'vintage'
    dolbyNR: false,
    tapeSpeed: 1.0, // 0.85 to 1.15
    bassGain: 0, // -10 to +10 dB
    midGain: 0,
    trebleGain: 0
  };

  let currentEffects = { ...defaultEffects };

  // Load saved settings
  try {
    const savedPower = localStorage.getItem(STORAGE_KEY_POWER);
    if (savedPower !== null) isPoweredOn = savedPower === '1';

    const savedEffects = localStorage.getItem(STORAGE_KEY_EFFECTS);
    if (savedEffects) currentEffects = { ...defaultEffects, ...JSON.parse(savedEffects) };
  } catch (e) {}

  function initAudioContext() {
    if (isInitialized) return;
    const audio = global.AudioDeck ? global.AudioDeck.getAudio() : null;
    if (!audio) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioCtx = new AudioContextClass();

      // Create filter nodes
      bassNode = audioCtx.createBiquadFilter();
      bassNode.type = 'lowshelf';
      bassNode.frequency.value = 120;
      bassNode.gain.value = currentEffects.bassGain;

      midNode = audioCtx.createBiquadFilter();
      midNode.type = 'peaking';
      midNode.frequency.value = 1000;
      midNode.Q.value = 0.8;
      midNode.gain.value = currentEffects.midGain;

      trebleNode = audioCtx.createBiquadFilter();
      trebleNode.type = 'highshelf';
      trebleNode.frequency.value = 5000;
      trebleNode.gain.value = currentEffects.trebleGain;

      dolbyNode = audioCtx.createBiquadFilter();
      dolbyNode.type = 'highshelf';
      dolbyNode.frequency.value = 7000;
      dolbyNode.gain.value = currentEffects.dolbyNR ? -6 : 0;

      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.value = 1.0;

      // Connect MediaElementSource
      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(bassNode);
      bassNode.connect(midNode);
      midNode.connect(trebleNode);
      trebleNode.connect(dolbyNode);
      dolbyNode.connect(masterGainNode);
      masterGainNode.connect(audioCtx.destination);

      // Create Analog Tape Hiss Generator
      createTapeHissGenerator();

      isInitialized = true;
      applyTapeSpeed(currentEffects.tapeSpeed);
    } catch (err) {
      console.warn("Web Audio API init skipped/deferred:", err);
    }
  }

  function createTapeHissGenerator() {
    if (!audioCtx) return;

    // Generate 5 seconds of authentic analog tape hiss (brownian / pink noise)
    const bufferSize = audioCtx.sampleRate * 5;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    hissBufferSource = audioCtx.createBufferSource();
    hissBufferSource.buffer = noiseBuffer;
    hissBufferSource.loop = true;

    hissFilterNode = audioCtx.createBiquadFilter();
    hissFilterNode.type = 'lowpass';
    hissFilterNode.frequency.value = 6500;

    hissGainNode = audioCtx.createGain();
    setHissGainLevel(currentEffects.hissLevel);

    hissBufferSource.connect(hissFilterNode);
    hissFilterNode.connect(hissGainNode);
    hissGainNode.connect(audioCtx.destination);

    hissBufferSource.start(0);
  }

  function setHissGainLevel(level) {
    if (!hissGainNode) return;
    if (!isPoweredOn || level === 'off') {
      hissGainNode.gain.setTargetAtTime(0, audioCtx ? audioCtx.currentTime : 0, 0.05);
    } else if (level === 'subtle') {
      hissGainNode.gain.setTargetAtTime(0.018, audioCtx ? audioCtx.currentTime : 0, 0.05);
    } else if (level === 'vintage') {
      hissGainNode.gain.setTargetAtTime(0.045, audioCtx ? audioCtx.currentTime : 0, 0.05);
    }
  }

  function saveEffects() {
    try {
      localStorage.setItem(STORAGE_KEY_EFFECTS, JSON.stringify(currentEffects));
    } catch (e) {}
  }

  function setHissLevel(level) {
    currentEffects.hissLevel = level;
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    setHissGainLevel(level);
    saveEffects();
  }

  function setDolbyNR(enabled) {
    currentEffects.dolbyNR = Boolean(enabled);
    if (dolbyNode && audioCtx) {
      dolbyNode.gain.setTargetAtTime(currentEffects.dolbyNR ? -6 : 0, audioCtx.currentTime, 0.05);
    }
    saveEffects();
  }

  function setTapeSpeed(speed) {
    const s = Math.max(0.85, Math.min(1.15, speed));
    currentEffects.tapeSpeed = s;
    applyTapeSpeed(s);
    saveEffects();
  }

  function applyTapeSpeed(s) {
    const audio = global.AudioDeck ? global.AudioDeck.getAudio() : null;
    if (audio) {
      audio.playbackRate = s;
      audio.preservesPitch = false; // Authentic analog tape speed pitch change
    }
  }

  function setEQ(band, gain) {
    const val = Math.max(-12, Math.min(12, gain));
    if (band === 'bass') {
      currentEffects.bassGain = val;
      if (bassNode && audioCtx) bassNode.gain.setTargetAtTime(val, audioCtx.currentTime, 0.05);
    } else if (band === 'mid') {
      currentEffects.midGain = val;
      if (midNode && audioCtx) midNode.gain.setTargetAtTime(val, audioCtx.currentTime, 0.05);
    } else if (band === 'treble') {
      currentEffects.trebleGain = val;
      if (trebleNode && audioCtx) trebleNode.gain.setTargetAtTime(val, audioCtx.currentTime, 0.05);
    }
    saveEffects();
  }

  // Master Power Management
  function setPower(powerState) {
    isPoweredOn = Boolean(powerState);
    try {
      localStorage.setItem(STORAGE_KEY_POWER, isPoweredOn ? '1' : '0');
    } catch (e) {}

    const deck = global.AudioDeck ? global.AudioDeck.getInstance() : null;

    if (!isPoweredOn) {
      // Powering OFF: stop playback, mute hiss, dim lights
      if (deck) {
        deck.stop();
      }
      setHissGainLevel('off');
      document.body.classList.add('power-standby');
      const chassis = document.querySelector('.chassis-texture');
      if (chassis) chassis.classList.add('deck-power-off');
    } else {
      // Powering ON: warm up lights, restore hiss
      document.body.classList.remove('power-standby');
      const chassis = document.querySelector('.chassis-texture');
      if (chassis) chassis.classList.remove('deck-power-off');
      setHissGainLevel(currentEffects.hissLevel);
    }

    updatePowerButtonUI();
    global.dispatchEvent(new CustomEvent('deck-power-changed', { detail: { isPoweredOn } }));
  }

  function togglePower() {
    setPower(!isPoweredOn);
  }

  function updatePowerButtonUI() {
    const btnPower = document.getElementById('btn-header-power');
    if (!btnPower) return;

    if (isPoweredOn) {
      btnPower.classList.remove('text-stone-500', 'opacity-40');
      btnPower.classList.add('text-retro-orange', 'opacity-100');
      btnPower.title = 'Power: ON (Click to enter Standby)';
    } else {
      btnPower.classList.remove('text-retro-orange', 'opacity-100');
      btnPower.classList.add('text-stone-500', 'opacity-40');
      btnPower.title = 'Power: STANDBY (Click to turn ON)';
    }
  }

  // Resume Web Audio Context on first user interaction
  function unlockAudio() {
    if (!isInitialized) {
      initAudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  document.addEventListener('click', unlockAudio, { once: false });
  document.addEventListener('DOMContentLoaded', () => {
    updatePowerButtonUI();
    if (!isPoweredOn) {
      setPower(false);
    }
  });

  global.AudioEffects = {
    init: initAudioContext,
    isPoweredOn: () => isPoweredOn,
    setPower,
    togglePower,
    getEffects: () => ({ ...currentEffects }),
    setHissLevel,
    setDolbyNR,
    setTapeSpeed,
    setEQ
  };
})(window);
