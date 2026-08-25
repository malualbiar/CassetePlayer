/**
 * Seamless & Stationary Navigation Transitions for CASSETTE
 */
document.addEventListener('DOMContentLoaded', () => {
    // Reveal view on load
    const mainContainer = document.querySelector('.main-view-container') || document.querySelector('main');
    if (mainContainer) {
        mainContainer.classList.remove('view-fade-out');
    }

    // Intercept navigation links for smooth view transition
    document.querySelectorAll('a[href]').forEach(link => {
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
                
                // Immediately switch active highlight tab in header for instant visual response
                const targetNav = link.getAttribute('data-nav');
                if (targetNav) {
                    document.querySelectorAll('.nav-link').forEach(nav => {
                        if (nav.getAttribute('data-nav') === targetNav) {
                            nav.classList.add('active');
                        } else {
                            nav.classList.remove('active');
                        }
                    });
                }

                e.preventDefault();
                const main = document.querySelector('.main-view-container') || document.querySelector('main');
                if (main) {
                    main.classList.add('view-fade-out');
                }
                
                setTimeout(() => {
                    window.location.href = href;
                }, 120);
            });
        }
    });
});

// Support BFCache (back/forward browser navigation)
window.addEventListener('pageshow', () => {
    const main = document.querySelector('.main-view-container') || document.querySelector('main');
    if (main) {
        main.classList.remove('view-fade-out');
    }
});
