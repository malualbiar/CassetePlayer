/**
 * Tapes Collection Page Application Controller
 * Manages user's personal tape collection view and search filtering.
 */
(function (global) {
  'use strict';

  function initTapesPage() {
    const gridContainer = document.getElementById('tapes-grid-container');
    const searchInput = document.getElementById('tape-search');
    if (!gridContainer && !searchInput) return;

    let emptyMessageEl = document.getElementById('empty-collection-message');
    if (!emptyMessageEl && gridContainer) {
      emptyMessageEl = document.createElement('div');
      emptyMessageEl.id = 'empty-collection-message';
      emptyMessageEl.className = 'col-span-full py-16 text-center flex flex-col items-center justify-center';
      emptyMessageEl.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-retro-orange mb-4 shadow-inner">
          <span class="material-symbols-outlined text-3xl">library_music</span>
        </div>
        <h3 class="font-headline-lg text-lg font-bold text-on-background mb-1">Your Tape Collection is Empty</h3>
        <p class="font-body-md text-xs text-on-surface-variant max-w-sm mb-6">You haven't added any cassette tapes to your deck collection yet.</p>
        <a href="LibraryPage.html" class="hardware-btn px-4 py-2 rounded font-label-mono text-xs font-bold text-retro-orange hover:text-white hover:bg-retro-orange transition-all no-underline shadow-sm flex items-center gap-2">
          <span>Explore Cassette Library</span>
          <span class="material-symbols-outlined text-xs">arrow_forward</span>
        </a>
      `;
      gridContainer.appendChild(emptyMessageEl);
    }

    function syncCollection() {
      const collection = global.TapeData ? global.TapeData.getUserCollection() : [];
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const cards = document.querySelectorAll('.tape-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const tapeId = card.getAttribute('data-tape-id');
        const inCollection = collection.includes(tapeId);
        const text = card.textContent.toLowerCase();
        const matchesQuery = !query || text.includes(query);

        if (inCollection && matchesQuery) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyMessageEl) {
        if (visibleCount === 0) {
          emptyMessageEl.style.display = '';
        } else {
          emptyMessageEl.style.display = 'none';
        }
      }
    }

    if (searchInput) {
      searchInput.oninput = syncCollection;
    }

    // Listen for real-time additions/removals from Library
    global.addEventListener('collection-updated', syncCollection);

    // Initial render
    syncCollection();
  }

  global.initTapesPage = initTapesPage;
  document.addEventListener('DOMContentLoaded', initTapesPage);
})(window);
