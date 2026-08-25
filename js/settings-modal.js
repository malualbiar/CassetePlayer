/**
 * Settings & Hi-Fi Calibration Drawer for CASSETTE
 * Controls analog effects, boombox aesthetics, custom mixtape creation, and keyboard shortcuts.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY_THEME = 'cassette_deck_theme';
  const STORAGE_KEY_VU_GLOW = 'cassette_vu_glow';

  let currentTheme = 'orange'; // 'orange' | 'gunmetal' | 'silver' | 'ivory'
  let currentVUGlow = 'amber'; // 'amber' | 'green' | 'blue'

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) currentTheme = savedTheme;

    const savedVU = localStorage.getItem(STORAGE_KEY_VU_GLOW);
    if (savedVU) currentVUGlow = savedVU;
  } catch (e) {}

  function applyTheme(themeName) {
    currentTheme = themeName;
    try { localStorage.setItem(STORAGE_KEY_THEME, themeName); } catch (e) {}

    document.body.classList.remove('theme-gunmetal', 'theme-silver', 'theme-ivory');
    if (themeName === 'gunmetal') document.body.classList.add('theme-gunmetal');
    else if (themeName === 'silver') document.body.classList.add('theme-silver');
    else if (themeName === 'ivory') document.body.classList.add('theme-ivory');
  }

  function applyVUGlow(glowColor) {
    currentVUGlow = glowColor;
    try { localStorage.setItem(STORAGE_KEY_VU_GLOW, glowColor); } catch (e) {}

    document.body.classList.remove('vu-glow-green', 'vu-glow-blue');
    if (glowColor === 'green') document.body.classList.add('vu-glow-green');
    else if (glowColor === 'blue') document.body.classList.add('vu-glow-blue');
  }

  function createSettingsModal() {
    let modal = document.getElementById('settings-drawer-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'settings-drawer-modal';
    modal.className = 'fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300';
    modal.innerHTML = `
      <div id="settings-drawer-panel" class="w-full max-w-lg h-full bg-surface-container border-l border-outline-variant shadow-2xl flex flex-col translate-x-full transition-transform duration-300 ease-out text-on-surface">
        
        <!-- Drawer Header -->
        <div class="p-5 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-high">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-retro-orange text-xl">tune</span>
            <h2 class="font-headline-lg text-lg font-bold uppercase tracking-wider text-on-surface">Hi-Fi Deck Calibration</h2>
          </div>
          <button id="btn-close-settings" class="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer" title="Close Settings">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Navigation Tabs (Clean 4-column fit with zero scroll) -->
        <div class="grid grid-cols-4 border-b border-outline-variant/40 bg-surface-container-low px-3 pt-2 font-label-mono text-[11px] text-center">
          <button class="settings-tab-btn active py-2 border-b-2 border-retro-orange text-retro-orange font-bold cursor-pointer truncate" data-tab="calibration">Audio FX</button>
          <button class="settings-tab-btn py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-bold cursor-pointer truncate" data-tab="themes">Themes</button>
          <button class="settings-tab-btn py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-bold cursor-pointer truncate" data-tab="mixtape">Mixtape</button>
          <button class="settings-tab-btn py-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-bold cursor-pointer truncate" data-tab="hotkeys">Hotkeys</button>
        </div>

        <!-- Tab Content Body -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          
          <!-- TAB 1: Audio FX & Tone Calibration -->
          <div id="tab-calibration" class="settings-tab-content space-y-6">
            
            <!-- Tape Hiss Simulation -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div class="flex justify-between items-center mb-3">
                <span class="font-label-mono text-xs font-bold text-on-surface uppercase">Tape Hiss / Background Warmth</span>
                <span id="label-hiss-val" class="font-label-mono text-[10px] text-retro-orange font-bold uppercase">Subtle</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button class="btn-hiss-level px-3 py-1.5 rounded font-label-mono text-xs font-bold border border-outline-variant hover:border-retro-orange cursor-pointer" data-val="off">OFF</button>
                <button class="btn-hiss-level active px-3 py-1.5 rounded font-label-mono text-xs font-bold bg-retro-orange text-white border border-retro-orange cursor-pointer" data-val="subtle">SUBTLE</button>
                <button class="btn-hiss-level px-3 py-1.5 rounded font-label-mono text-xs font-bold border border-outline-variant hover:border-retro-orange cursor-pointer" data-val="vintage">VINTAGE</button>
              </div>
            </div>

            <!-- Dolby B Noise Reduction -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <span class="font-label-mono text-xs font-bold text-on-surface uppercase block">Dolby B Noise Reduction</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input id="toggle-dolby-nr" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-surface-container-high border border-outline peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-retro-orange"></div>
              </label>
            </div>

            <!-- Tape Speed / Motor Pitch -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div class="flex justify-between items-center mb-3">
                <span class="font-label-mono text-xs font-bold text-on-surface uppercase">Tape Speed / Motor Pitch</span>
                <span id="label-speed-val" class="font-label-mono text-xs font-bold text-retro-orange">1.00x (Normal)</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-label-mono text-[10px] text-on-surface-variant font-bold">0.85x</span>
                <input id="slider-tape-speed" type="range" min="0.85" max="1.15" step="0.01" value="1.0" class="flex-1 accent-retro-orange cursor-pointer">
                <span class="font-label-mono text-[10px] text-on-surface-variant font-bold">1.15x</span>
              </div>
              <div class="mt-2 text-right">
                <button id="btn-reset-speed" class="font-label-mono text-[10px] text-retro-orange hover:underline cursor-pointer">Reset to 1.00x</button>
              </div>
            </div>

            <!-- 3-Band Equalizer -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-3">
              <span class="font-label-mono text-xs font-bold text-on-surface uppercase block">3-Band Tone Equalizer</span>
              
              <!-- Bass -->
              <div>
                <div class="flex justify-between text-[11px] font-label-mono text-on-surface-variant mb-1">
                  <span>BASS (120 Hz)</span>
                  <span id="label-bass-val">0 dB</span>
                </div>
                <input id="slider-eq-bass" type="range" min="-10" max="10" step="1" value="0" class="w-full accent-retro-orange cursor-pointer">
              </div>

              <!-- Mid -->
              <div>
                <div class="flex justify-between text-[11px] font-label-mono text-on-surface-variant mb-1">
                  <span>MID (1 kHz)</span>
                  <span id="label-mid-val">0 dB</span>
                </div>
                <input id="slider-eq-mid" type="range" min="-10" max="10" step="1" value="0" class="w-full accent-retro-orange cursor-pointer">
              </div>

              <!-- Treble -->
              <div>
                <div class="flex justify-between text-[11px] font-label-mono text-on-surface-variant mb-1">
                  <span>TREBLE (5 kHz)</span>
                  <span id="label-treble-val">0 dB</span>
                </div>
                <input id="slider-eq-treble" type="range" min="-10" max="10" step="1" value="0" class="w-full accent-retro-orange cursor-pointer">
              </div>
            </div>

          </div>

          <!-- TAB 2: Boombox Aesthetics & Finish -->
          <div id="tab-themes" class="settings-tab-content hidden space-y-6">
            
            <!-- Chassis Finish -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <span class="font-label-mono text-xs font-bold text-on-surface uppercase block mb-2">Boombox Chassis Finish</span>
              <div class="grid grid-cols-2 gap-3">
                <button class="btn-theme-select p-3 rounded-lg border-2 text-left cursor-pointer transition-all flex items-center gap-2.5" data-theme="orange">
                  <span class="w-4 h-4 rounded-full bg-[#c24930] border border-black/20"></span>
                  <span class="font-headline-lg text-xs font-bold">Retro Orange</span>
                </button>
                <button class="btn-theme-select p-3 rounded-lg border-2 text-left cursor-pointer transition-all flex items-center gap-2.5" data-theme="gunmetal">
                  <span class="w-4 h-4 rounded-full bg-[#1c1c1c] border border-black/40"></span>
                  <span class="font-headline-lg text-xs font-bold">Stealth Gunmetal</span>
                </button>
                <button class="btn-theme-select p-3 rounded-lg border-2 text-left cursor-pointer transition-all flex items-center gap-2.5" data-theme="silver">
                  <span class="w-4 h-4 rounded-full bg-[#cbd5e1] border border-black/20"></span>
                  <span class="font-headline-lg text-xs font-bold">Brushed Silver</span>
                </button>
                <button class="btn-theme-select p-3 rounded-lg border-2 text-left cursor-pointer transition-all flex items-center gap-2.5" data-theme="ivory">
                  <span class="w-4 h-4 rounded-full bg-[#f5f0e6] border border-black/20"></span>
                  <span class="font-headline-lg text-xs font-bold">Studio Ivory</span>
                </button>
              </div>
            </div>

            <!-- VU Meter Backlight Glow -->
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <span class="font-label-mono text-xs font-bold text-on-surface uppercase block mb-2">VU Meter Lighting</span>
              <div class="grid grid-cols-3 gap-2">
                <button class="btn-vu-select px-3 py-2 rounded-lg border-2 text-center cursor-pointer transition-all font-label-mono text-xs font-bold flex flex-col items-center gap-1" data-vu="amber">
                  <span class="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                  <span>Amber</span>
                </button>
                <button class="btn-vu-select px-3 py-2 rounded-lg border-2 text-center cursor-pointer transition-all font-label-mono text-xs font-bold flex flex-col items-center gap-1" data-vu="green">
                  <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  <span>Green</span>
                </button>
                <button class="btn-vu-select px-3 py-2 rounded-lg border-2 text-center cursor-pointer transition-all font-label-mono text-xs font-bold flex flex-col items-center gap-1" data-vu="blue">
                  <span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                  <span>Ice Blue</span>
                </button>
              </div>
            </div>

          </div>

          <!-- TAB 3: Record Custom Mixtape -->
          <div id="tab-mixtape" class="settings-tab-content hidden space-y-4">
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <span class="font-label-mono text-xs font-bold text-on-surface uppercase block mb-1">Create Custom Cassette</span>
              <p class="font-body-md text-[11px] text-on-surface-variant mb-4">Upload an audio track from your device and design a personalized cassette to load into your radio deck.</p>

              <form id="form-custom-tape" class="space-y-3">
                <div>
                  <label class="font-label-mono text-[10.5px] font-bold text-on-surface-variant block mb-1">TRACK TITLE</label>
                  <input id="custom-tape-title" required type="text" placeholder="e.g. My Summer Dub" class="w-full px-3 py-1.5 bg-surface-container border border-outline rounded font-body-md text-xs text-on-surface focus:border-retro-orange outline-none">
                </div>

                <div>
                  <label class="font-label-mono text-[10.5px] font-bold text-on-surface-variant block mb-1">ARTIST / LABEL</label>
                  <input id="custom-tape-artist" required type="text" placeholder="e.g. Studio Session 2026" class="w-full px-3 py-1.5 bg-surface-container border border-outline rounded font-body-md text-xs text-on-surface focus:border-retro-orange outline-none">
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="font-label-mono text-[10.5px] font-bold text-on-surface-variant block mb-1">FORMULA</label>
                    <select id="custom-tape-formula" class="w-full px-2 py-1.5 bg-surface-container border border-outline rounded font-label-mono text-xs text-on-surface focus:border-retro-orange outline-none">
                      <option value="MIXTAPE">MIXTAPE DUB</option>
                      <option value="TYPE I">TYPE I FERRO</option>
                      <option value="TYPE II">TYPE II CHROME</option>
                      <option value="TYPE IV">TYPE IV METAL</option>
                    </select>
                  </div>
                  <div>
                    <label class="font-label-mono text-[10.5px] font-bold text-on-surface-variant block mb-1">SHELL COLOR</label>
                    <input id="custom-tape-color" type="color" value="#c24930" class="w-full h-8 bg-surface-container border border-outline rounded cursor-pointer p-0.5">
                  </div>
                </div>

                <div>
                  <label class="font-label-mono text-[10.5px] font-bold text-on-surface-variant block mb-1">AUDIO FILE (.MP3 / .WAV / .M4A)</label>
                  <input id="custom-tape-file" required type="file" accept="audio/*" class="w-full text-xs font-label-mono text-on-surface-variant file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-retro-orange file:text-white hover:file:opacity-90 cursor-pointer">
                </div>

                <button type="submit" class="w-full py-2 mt-2 bg-retro-orange text-white font-label-mono text-xs font-bold rounded shadow-md hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">fiber_manual_record</span>
                  <span>Record & Add to Collection</span>
                </button>
              </form>
            </div>
          </div>

          <!-- TAB 4: Keyboard Shortcuts Cheatsheet -->
          <div id="tab-hotkeys" class="settings-tab-content hidden space-y-3">
            <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <span class="font-label-mono text-xs font-bold text-on-surface uppercase block mb-3">Keyboard Hardware Controls</span>
              <div class="space-y-2 font-label-mono text-xs">
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Play / Pause</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">Space</kbd>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Eject Tape</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">E</kbd>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Rewind 10s</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">[ or ←</kbd>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Fast Forward 10s</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">] or →</kbd>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Volume Up / Down</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">↑ / ↓</kbd>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-outline-variant/30">
                  <span class="text-on-surface-variant">Mute Audio</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">M</kbd>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-on-surface-variant">Master Power On/Off</span>
                  <kbd class="px-2 py-0.5 bg-surface-container border border-outline rounded text-[11px] font-bold">O</kbd>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(modal);
    wireModalEvents(modal);
    return modal;
  }

  function wireModalEvents(modal) {
    const panel = modal.querySelector('#settings-drawer-panel');
    const btnClose = modal.querySelector('#btn-close-settings');

    function closeModal() {
      modal.classList.add('opacity-0', 'pointer-events-none');
      panel.classList.add('translate-x-full');
    }

    btnClose.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Tab switching
    const tabBtns = modal.querySelectorAll('.settings-tab-btn');
    const tabContents = modal.querySelectorAll('.settings-tab-content');

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => {
          b.classList.remove('active', 'border-retro-orange', 'text-retro-orange');
          b.classList.add('border-transparent', 'text-on-surface-variant');
        });
        btn.classList.add('active', 'border-retro-orange', 'text-retro-orange');
        btn.classList.remove('border-transparent', 'text-on-surface-variant');

        tabContents.forEach(c => c.classList.add('hidden'));
        const target = modal.querySelector(`#tab-${tabId}`);
        if (target) target.classList.remove('hidden');
      };
    });

    // Tape Hiss buttons
    modal.querySelectorAll('.btn-hiss-level').forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-val');
        modal.querySelectorAll('.btn-hiss-level').forEach(b => {
          b.classList.remove('active', 'bg-retro-orange', 'text-white', 'border-retro-orange');
          b.classList.add('border-outline-variant');
        });
        btn.classList.add('active', 'bg-retro-orange', 'text-white', 'border-retro-orange');
        btn.classList.remove('border-outline-variant');

        const label = modal.querySelector('#label-hiss-val');
        if (label) label.textContent = val.toUpperCase();

        if (global.AudioEffects) global.AudioEffects.setHissLevel(val);
      };
    });

    // Dolby NR toggle
    const toggleDolby = modal.querySelector('#toggle-dolby-nr');
    if (toggleDolby) {
      toggleDolby.onchange = () => {
        if (global.AudioEffects) global.AudioEffects.setDolbyNR(toggleDolby.checked);
      };
    }

    // Tape Speed slider
    const speedSlider = modal.querySelector('#slider-tape-speed');
    const speedLabel = modal.querySelector('#label-speed-val');
    const btnResetSpeed = modal.querySelector('#btn-reset-speed');

    if (speedSlider) {
      speedSlider.oninput = () => {
        const val = parseFloat(speedSlider.value);
        if (speedLabel) speedLabel.textContent = `${val.toFixed(2)}x ${val === 1.0 ? '(Normal)' : val < 1.0 ? '(Lo-Fi / Slow)' : '(High Pitch)'}`;
        if (global.AudioEffects) global.AudioEffects.setTapeSpeed(val);
      };
    }

    if (btnResetSpeed && speedSlider) {
      btnResetSpeed.onclick = () => {
        speedSlider.value = 1.0;
        if (speedLabel) speedLabel.textContent = '1.00x (Normal)';
        if (global.AudioEffects) global.AudioEffects.setTapeSpeed(1.0);
      };
    }

    // EQ Sliders
    const bassSlider = modal.querySelector('#slider-eq-bass');
    const midSlider = modal.querySelector('#slider-eq-mid');
    const trebleSlider = modal.querySelector('#slider-eq-treble');

    if (bassSlider) {
      bassSlider.oninput = () => {
        modal.querySelector('#label-bass-val').textContent = `${bassSlider.value > 0 ? '+' : ''}${bassSlider.value} dB`;
        if (global.AudioEffects) global.AudioEffects.setEQ('bass', parseFloat(bassSlider.value));
      };
    }
    if (midSlider) {
      midSlider.oninput = () => {
        modal.querySelector('#label-mid-val').textContent = `${midSlider.value > 0 ? '+' : ''}${midSlider.value} dB`;
        if (global.AudioEffects) global.AudioEffects.setEQ('mid', parseFloat(midSlider.value));
      };
    }
    if (trebleSlider) {
      trebleSlider.oninput = () => {
        modal.querySelector('#label-treble-val').textContent = `${trebleSlider.value > 0 ? '+' : ''}${trebleSlider.value} dB`;
        if (global.AudioEffects) global.AudioEffects.setEQ('treble', parseFloat(trebleSlider.value));
      };
    }

    // Theme selector
    modal.querySelectorAll('.btn-theme-select').forEach(btn => {
      btn.onclick = () => {
        const theme = btn.getAttribute('data-theme');
        applyTheme(theme);
        updateThemeButtons(modal);
      };
    });

    // VU Glow selector
    modal.querySelectorAll('.btn-vu-select').forEach(btn => {
      btn.onclick = () => {
        const vu = btn.getAttribute('data-vu');
        applyVUGlow(vu);
        updateVUGlowButtons(modal);
      };
    });

    // Custom Mixtape Form
    const mixtapeForm = modal.querySelector('#form-custom-tape');
    if (mixtapeForm) {
      mixtapeForm.onsubmit = (e) => {
        e.preventDefault();
        const title = modal.querySelector('#custom-tape-title').value.trim();
        const artist = modal.querySelector('#custom-tape-artist').value.trim();
        const formula = modal.querySelector('#custom-tape-formula').value;
        const color = modal.querySelector('#custom-tape-color').value;
        const fileInput = modal.querySelector('#custom-tape-file');

        if (!fileInput.files || !fileInput.files[0]) {
          alert('Please select an audio file for your cassette mixtape.');
          return;
        }

        const file = fileInput.files[0];
        const audioUrl = URL.createObjectURL(file);
        const tapeId = 'custom_' + Date.now();

        // Register custom tape into TapeData
        if (global.TapeData) {
          const all = global.TapeData.getAll();
          all[tapeId] = {
            id: tapeId,
            type: formula,
            brand: artist.toUpperCase(),
            pos: 'CUSTOM MASTER',
            title: `“${title}”`,
            artist: artist,
            subtitle: `“${title}” - ${artist}`,
            color: color,
            shellBg: color + '22',
            shellBorder: color,
            audioSrc: audioUrl
          };

          // Add to user collection
          global.TapeData.addToCollection(tapeId);
          alert(`Cassette “${title}” has been recorded and added to your collection!`);
          closeModal();
        }
      };
    }

    updateThemeButtons(modal);
    updateVUGlowButtons(modal);
  }

  function updateThemeButtons(modal) {
    modal.querySelectorAll('.btn-theme-select').forEach(btn => {
      const theme = btn.getAttribute('data-theme');
      if (theme === currentTheme) {
        btn.classList.add('border-retro-orange', 'bg-retro-orange/10');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('border-retro-orange', 'bg-retro-orange/10');
        btn.classList.add('border-outline-variant');
      }
    });
  }

  function updateVUGlowButtons(modal) {
    modal.querySelectorAll('.btn-vu-select').forEach(btn => {
      const vu = btn.getAttribute('data-vu');
      if (vu === currentVUGlow) {
        btn.classList.add('border-retro-orange', 'bg-retro-orange/10');
        btn.classList.remove('border-outline-variant');
      } else {
        btn.classList.remove('border-retro-orange', 'bg-retro-orange/10');
        btn.classList.add('border-outline-variant');
      }
    });
  }

  function openSettingsModal() {
    const modal = createSettingsModal();
    const panel = modal.querySelector('#settings-drawer-panel');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    panel.classList.remove('translate-x-full');
  }

  // Keyboard Shortcuts Listener
  document.addEventListener('keydown', (e) => {
    // Ignore keystrokes when user is typing in form inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const deck = global.AudioDeck ? global.AudioDeck.getInstance() : null;

    if (e.code === 'Space') {
      e.preventDefault();
      if (deck) {
        if (deck.isPlaying()) deck.stop();
        else deck.play();
      }
    } else if (e.key === 'p' || e.key === 'P') {
      if (deck) deck.togglePause();
    } else if (e.key === 'e' || e.key === 'E') {
      if (deck) deck.eject();
    } else if (e.key === '[' || e.key === 'ArrowLeft') {
      if (deck) deck.rewind(10);
    } else if (e.key === ']' || e.key === 'ArrowRight') {
      if (deck) deck.fastForward(10);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (deck) deck.setVolume(Math.min(1, (deck.audio.volume || 0.7) + 0.05));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (deck) deck.setVolume(Math.max(0, (deck.audio.volume || 0.7) - 0.05));
    } else if (e.key === 'm' || e.key === 'M') {
      if (deck) deck.setVolume(deck.audio.volume > 0 ? 0 : 0.7);
    } else if (e.key === 'o' || e.key === 'O') {
      if (global.AudioEffects) global.AudioEffects.togglePower();
    } else if (e.key === 's' || e.key === 'S') {
      openSettingsModal();
    }
  });

  // Attach to Header buttons
  function wireHeaderButtons() {
    const btnSettings = document.getElementById('btn-header-settings');
    const btnPower = document.getElementById('btn-header-power');

    if (btnSettings) {
      btnSettings.onclick = openSettingsModal;
    }

    if (btnPower) {
      btnPower.onclick = () => {
        if (global.AudioEffects) global.AudioEffects.togglePower();
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    applyVUGlow(currentVUGlow);
    wireHeaderButtons();
  });

  global.addEventListener('pageshow', wireHeaderButtons);

  global.SettingsDrawer = {
    open: openSettingsModal,
    applyTheme,
    applyVUGlow,
    wireHeaderButtons
  };
})(window);
