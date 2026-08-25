/**
 * Seamless SPA Navigation & Persistent Audio Transitions for CASSETTE
 * Performs client-side view swapping so music never stops playing when navigating between pages.
 */
(function (global) {
  'use strict';

  function attachNavigationInterceptors() {
    document.querySelectorAll('a[href]').forEach(link => {
      // Avoid duplicate bindings
      if (link.__has_nav_interceptor) return;
      link.__has_nav_interceptor = true;

      const href = link.getAttribute('href');
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('javascript:') &&
        !link.hasAttribute('target') &&
        !href.startsWith('http://') &&
        !href.startsWith('https://')
      ) {
        link.addEventListener('click', (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

          e.preventDefault();
          navigateTo(href);
        });
      }
    });
  }

  function getNavKey(urlStr) {
    const lower = urlStr.toLowerCase();
    if (lower.includes('playerpage') || lower.endsWith('/') || lower.endsWith('/index.html') || lower.includes('?tape=')) {
      return 'player';
    }
    if (lower.includes('tapespage')) {
      return 'tapes';
    }
    if (lower.includes('librarypage')) {
      return 'library';
    }
    return 'player';
  }

  function updateHeaderNav(targetKey) {
    document.querySelectorAll('.nav-link').forEach(nav => {
      const navKey = nav.getAttribute('data-nav');
      if (navKey === targetKey) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });
  }

  function runPageController(targetKey) {
    if (targetKey === 'player') {
      if (typeof global.initPlayerPage === 'function') global.initPlayerPage();
    } else if (targetKey === 'tapes') {
      if (typeof global.initTapesPage === 'function') global.initTapesPage();
    } else if (targetKey === 'library') {
      if (typeof global.initLibraryPage === 'function') global.initLibraryPage();
    }
  }

  function navigateTo(url, pushState = true) {
    const mainContainer = document.querySelector('.main-view-container') || document.querySelector('main');
    const targetKey = getNavKey(url);

    // Update active tab highlight immediately
    updateHeaderNav(targetKey);

    if (mainContainer) {
      mainContainer.classList.add('view-fade-out');
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('.main-view-container') || doc.querySelector('main');

        if (!newMain) {
          throw new Error('No main content in fetched page');
        }

        // Update Document Title
        if (doc.title) {
          document.title = doc.title;
        }

        if (pushState && global.history && global.history.pushState) {
          global.history.pushState({}, '', url);
        }

        // Replace main view
        if (mainContainer && mainContainer.parentNode) {
          newMain.classList.add('view-fade-out');
          mainContainer.parentNode.replaceChild(newMain, mainContainer);

          // Trigger reflow then fade in
          void newMain.offsetWidth;
          newMain.classList.remove('view-fade-out');
        }

        // Attach listeners to new links
        attachNavigationInterceptors();

        // Run target page controller (audio continues playing uninterrupted)
        runPageController(targetKey);
      })
      .catch(() => {
        // Fallback for strict offline environments where fetch is blocked
        if (mainContainer) {
          mainContainer.classList.add('view-fade-out');
        }
        setTimeout(() => {
          global.location.href = url;
        }, 100);
      });
  }

  // Handle browser back/forward buttons seamlessly
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname + window.location.search;
    navigateTo(currentUrl, false);
  });

  // Reveal view on load and attach click interceptors
  document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-view-container') || document.querySelector('main');
    if (mainContainer) {
      mainContainer.classList.remove('view-fade-out');
    }
    attachNavigationInterceptors();
  });

  // Support BFCache
  window.addEventListener('pageshow', () => {
    const main = document.querySelector('.main-view-container') || document.querySelector('main');
    if (main) {
      main.classList.remove('view-fade-out');
    }
    attachNavigationInterceptors();
  });

  global.CassetteRouter = {
    navigateTo,
    attachNavigationInterceptors
  };
})(window);
