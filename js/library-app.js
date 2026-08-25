/**
 * Cassette Library Page Application Controller
 * Manages the cassette rack shelf view, track archive index, preview playback, and filtering.
 */
(function (global) {
  'use strict';

  function initLibraryPage() {
    const rackContainer = document.getElementById('tape-rack-container');
    const tableBody = document.getElementById('archive-table-body');
    if (!rackContainer && !tableBody) return; // Not on LibraryPage

    // Mini Preview Audio Engine
    const previewAudio = new Audio();
    previewAudio.preload = 'none';
    let activePreviewId = null;

    const searchInput = document.getElementById('library-search');
    const filterPills = document.querySelectorAll('.filter-pill');
    const previewBar = document.getElementById('preview-player-bar');
    const previewTitle = document.getElementById('preview-track-title');
    const previewSubtitle = document.getElementById('preview-track-subtitle');
    const btnPreviewToggle = document.getElementById('btn-preview-toggle');
    const btnPreviewClose = document.getElementById('btn-preview-close');

    let currentCategory = 'all';
    let currentSearchQuery = '';

    const tapes = global.TapeData ? global.TapeData.getAll() : {};
    const tapeList = Object.values(tapes);

    // 1. Render Tape Rack Spines
    function renderTapeRack(filteredTapes) {
      if (!rackContainer) return;
      rackContainer.innerHTML = '';

      if (filteredTapes.length === 0) {
        rackContainer.innerHTML = `
          <div class="col-span-full py-8 text-center text-on-surface-variant font-label-mono text-xs">
            No cassettes found matching your search.
          </div>
        `;
        return;
      }

      filteredTapes.forEach((tape) => {
        const inCollection = global.TapeData ? global.TapeData.isInCollection(tape.id) : true;
        const spine = document.createElement('a');
        spine.href = `PlayerPage.html?tape=${encodeURIComponent(tape.id)}`;
        spine.className = 'tape-spine block flex items-center justify-between px-3 no-underline text-inherit overflow-hidden group';
        spine.title = `Insert "${tape.title.replace(/"/g, '')}" into Player`;
        spine.style.backgroundColor = tape.shellBg || '#222';
        spine.style.borderColor = tape.shellBorder || 'rgba(255,255,255,0.2)';

        spine.innerHTML = `
          <div class="tape-spine-ribs w-6 h-full absolute left-0 top-0 opacity-40 pointer-events-none"></div>
          <div class="flex items-center gap-2 pl-4 z-10 truncate">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${tape.color || '#c24930'}"></span>
            <span class="font-label-mono text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-black/40 text-white flex-shrink-0">
              ${tape.type}
            </span>
            <span class="font-headline-lg text-xs font-bold text-white tracking-tight truncate group-hover:text-retro-orange transition-colors">
              ${tape.title}
            </span>
            <span class="font-body-md text-[11px] text-stone-400 truncate hidden sm:inline">
              — ${tape.artist}
            </span>
          </div>
          <div class="flex items-center gap-2 z-10 pl-2">
            ${inCollection ? '<span class="font-label-mono text-[8.5px] text-retro-orange font-bold bg-retro-orange/20 border border-retro-orange/40 px-1.5 py-0.5 rounded">COLLECTION</span>' : ''}
            <span class="font-label-mono text-[9px] text-stone-400 font-bold bg-white/10 px-1.5 py-0.5 rounded">
              ${tape.pos || 'STEREO'}
            </span>
            <span class="material-symbols-outlined text-stone-300 text-sm group-hover:text-retro-orange group-hover:translate-x-0.5 transition-all">
              play_arrow
            </span>
          </div>
        `;

        rackContainer.appendChild(spine);
      });
    }

    // 2. Render Master Archive Table
    function renderArchiveTable(filteredTapes) {
      if (!tableBody) return;
      tableBody.innerHTML = '';

      if (filteredTapes.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="py-8 text-center text-on-surface-variant font-label-mono text-xs">
              No matching tape archives located.
            </td>
          </tr>
        `;
        return;
      }

      filteredTapes.forEach((tape, index) => {
        const inCollection = global.TapeData ? global.TapeData.isInCollection(tape.id) : true;
        const row = document.createElement('tr');
        row.className = 'archive-row border-b border-outline-variant/30 text-on-surface text-xs font-body-md';
        row.setAttribute('data-tape-id', tape.id);

        const isThisPlaying = activePreviewId === tape.id && !previewAudio.paused;
        if (isThisPlaying) {
          row.classList.add('is-playing');
        }

        row.innerHTML = `
          <td class="py-3.5 px-4 font-label-mono text-[11px] font-bold text-on-surface-variant/70 text-center w-12">
            ${String(index + 1).padStart(2, '0')}
          </td>
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <button class="btn-quick-play w-7 h-7 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant text-retro-orange hover:bg-retro-orange hover:text-white transition-all shadow-sm flex-shrink-0 cursor-pointer" title="Preview Audio" data-tape-id="${tape.id}">
                <span class="material-symbols-outlined text-sm">
                  ${isThisPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div>
                <a href="PlayerPage.html?tape=${encodeURIComponent(tape.id)}" class="font-headline-lg font-bold text-xs text-on-surface hover:text-retro-orange transition-colors block">
                  ${tape.title}
                </a>
                <span class="font-label-mono text-[10px] text-on-surface-variant">
                  ${tape.brand || tape.artist}
                </span>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4 font-body-md text-xs text-on-surface-variant">
            ${tape.artist}
          </td>
          <td class="py-3.5 px-4">
            <span class="font-label-mono text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border" style="background-color: ${tape.shellBg || '#222'}; color: #fff; border-color: ${tape.color || '#c24930'}">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${tape.color || '#c24930'}"></span>
              ${tape.type}
            </span>
          </td>
          <td class="py-3.5 px-4 font-label-mono text-[11px] text-on-surface-variant font-bold">
            ${tape.pos || 'NORMAL'}
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="inline-flex items-center gap-2 justify-end">
              <button class="btn-toggle-collection inline-flex items-center gap-1 px-2.5 py-1.5 rounded font-label-mono text-[10.5px] font-bold transition-all cursor-pointer shadow-sm ${
                inCollection
                  ? 'bg-retro-orange/15 text-retro-orange border border-retro-orange/50 hover:bg-red-500/20'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline hover:border-retro-orange hover:text-retro-orange'
              }" data-tape-id="${tape.id}" title="${inCollection ? 'Remove from Tapes Screen' : 'Add to Tapes Screen'}">
                <span class="material-symbols-outlined text-xs">${inCollection ? 'check' : 'add'}</span>
                <span>${inCollection ? 'In Collection' : 'Add to Collection'}</span>
              </button>
              <a href="PlayerPage.html?tape=${encodeURIComponent(tape.id)}" class="hardware-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-label-mono font-bold text-on-surface hover:text-retro-orange transition-all no-underline shadow-sm">
                <span>Load Deck</span>
                <span class="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Attach quick preview click handlers
      tableBody.querySelectorAll('.btn-quick-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-tape-id');
          togglePreview(id);
        });
      });

      // Attach Add/Remove collection toggle handlers
      tableBody.querySelectorAll('.btn-toggle-collection').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = btn.getAttribute('data-tape-id');
          if (id && global.TapeData) {
            global.TapeData.toggleCollection(id);
            applyFilters();
          }
        });
      });
    }

    // 3. Filter and Search Logic
    function getFilteredTapes() {
      return tapeList.filter((tape) => {
        let matchesCategory = true;
        if (currentCategory === 'type_1') matchesCategory = tape.type.includes('TYPE I');
        else if (currentCategory === 'type_2') matchesCategory = tape.type.includes('TYPE II');
        else if (currentCategory === 'type_4') matchesCategory = tape.type.includes('TYPE IV');
        else if (currentCategory === 'mixtape') matchesCategory = tape.type.includes('MIXTAPE');

        let matchesSearch = true;
        if (currentSearchQuery) {
          const text = `${tape.title} ${tape.artist} ${tape.brand} ${tape.subtitle} ${tape.type} ${tape.pos}`.toLowerCase();
          matchesSearch = text.includes(currentSearchQuery);
        }

        return matchesCategory && matchesSearch;
      });
    }

    function applyFilters() {
      const filtered = getFilteredTapes();
      renderTapeRack(filtered);
      renderArchiveTable(filtered);
    }

    // 4. Quick Audio Preview Controls
    function togglePreview(tapeId) {
      const tape = tapes[tapeId];
      if (!tape || !tape.audioSrc) return;

      if (activePreviewId === tapeId && !previewAudio.paused) {
        previewAudio.pause();
        if (btnPreviewToggle) {
          btnPreviewToggle.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        }
      } else {
        activePreviewId = tapeId;
        previewAudio.src = tape.audioSrc;
        previewAudio.play().catch(e => console.log("Preview audio prevented:", e));

        if (previewBar) previewBar.classList.remove('hidden');
        if (previewTitle) previewTitle.textContent = tape.title;
        if (previewSubtitle) previewSubtitle.textContent = tape.artist;
        if (btnPreviewToggle) {
          btnPreviewToggle.innerHTML = '<span class="material-symbols-outlined">pause</span>';
        }
      }
      applyFilters();
    }

    if (btnPreviewToggle) {
      btnPreviewToggle.onclick = () => {
        if (activePreviewId) {
          togglePreview(activePreviewId);
        }
      };
    }

    if (btnPreviewClose) {
      btnPreviewClose.onclick = () => {
        previewAudio.pause();
        previewAudio.src = '';
        activePreviewId = null;
        if (previewBar) previewBar.classList.add('hidden');
        applyFilters();
      };
    }

    previewAudio.onended = () => {
      activePreviewId = null;
      if (previewBar) previewBar.classList.add('hidden');
      applyFilters();
    };

    // 5. Search & Category UI Listeners
    if (searchInput) {
      searchInput.oninput = (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
      };
    }

    filterPills.forEach(pill => {
      pill.onclick = () => {
        filterPills.forEach(p => {
          p.classList.remove('bg-retro-orange', 'text-white', 'border-retro-orange');
          p.classList.add('bg-surface-container', 'text-on-surface-variant', 'border-outline-variant');
        });
        pill.classList.remove('bg-surface-container', 'text-on-surface-variant', 'border-outline-variant');
        pill.classList.add('bg-retro-orange', 'text-white', 'border-retro-orange');

        currentCategory = pill.getAttribute('data-category') || 'all';
        applyFilters();
      };
    });

    // Listen for collection updates across views
    global.addEventListener('collection-updated', applyFilters);

    // Initial render
    applyFilters();
  }

  global.initLibraryPage = initLibraryPage;
  document.addEventListener('DOMContentLoaded', initLibraryPage);
})(window);
