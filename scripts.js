// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navMenu.contains(event.target) || mobileMenuBtn.contains(event.target);
            if (!isClickInside && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
});

// Simple scroll reveal using IntersectionObserver
document.addEventListener('DOMContentLoaded', function () {
    // Add handler for the floating "What's New" button so users can re-open the modal manually
    try {
        const showBtn = document.getElementById('show-whats-new');
        if (showBtn) {
            showBtn.addEventListener('click', function () {
                const modal = document.getElementById('whats-new-modal');
                if (!modal) return;
                // Open the modal immediately regardless of stored 'seen' version
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                // focus first focusable element inside modal
                const first = modal.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
                if (first && first.focus) first.focus();
            });
        }
    } catch (e) { console.error('Whats New quick button init error', e); }
    const selectors = [
        '.content-section',
        '.hero-content > *',
        '.job-card',
        '.benefit-card',
        '.product-intro',
        '.product-name',
        '.product-card',
        '.product-title',
        '.no-jobs-card'
    ].join(', ');

    const items = Array.from(document.querySelectorAll(selectors));
    if (!items.length) return;

    // Add .reveal class for initial state
    items.forEach(el => {
        el.classList.add('reveal');
        // If an element wants a reveal delay, support data-reveal-delay like "0.15s"
        if (el.dataset && el.dataset.revealDelay) {
            el.style.transitionDelay = el.dataset.revealDelay;
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // stop observing once revealed
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.12
    });

    items.forEach(item => observer.observe(item));
});

// Subtle parallax for hero banner — respectful of reduced-motion
document.addEventListener('DOMContentLoaded', function () {
    try {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        const banner = hero.querySelector('.hero-banner');
        if (!banner) return;

        // Wrap the banner so we can translate the wrapper while keeping the image's scale animation
        let wrap = hero.querySelector('.hero-banner-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'hero-banner-wrap';
            banner.parentNode.insertBefore(wrap, banner);
            wrap.appendChild(banner);
        }

        let ticking = false;

        function update() {
            ticking = false;
            const rect = hero.getBoundingClientRect();
            // small parallax: move opposite to scroll a bit
            const y = Math.max(Math.min(-rect.top * 0.09, 40), -40); // clamp to [-40,40]
            wrap.style.transform = `translateY(${y}px)`;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        // initial position
        update();
    } catch (e) {
        // fail silently
        console.error('Parallax init error', e);
    }
});

/* Whats New modal: show on first visit unless dismissed */
document.addEventListener('DOMContentLoaded', function () {
    try {
        const modal = document.getElementById('whats-new-modal');
        if (!modal) return;

        const LAST_SEEN_KEY = 'suvratech_whats_new_seen_version';
        const listEl = modal.querySelector('.whats-new-list');
        const closeButtonsSelector = '.modal-close';
        const overlay = modal.querySelector('.modal-overlay');
        const dontShowCheckbox = modal.querySelector('#dont-show-again');

        // helper to escape HTML
        function escapeHtml(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        // attach handlers for opening/closing and focus trap
        function attachModalHandlers(modalVersion) {
            let lastFocused = null;
            const firstFocusable = modal.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');

            function openModal() {
                lastFocused = document.activeElement;
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                if (firstFocusable && firstFocusable.focus) firstFocusable.focus();
            }

            function closeModal() {
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (lastFocused && lastFocused.focus) lastFocused.focus();
                if (dontShowCheckbox && dontShowCheckbox.checked && modalVersion) {
                    try { localStorage.setItem(LAST_SEEN_KEY, modalVersion); } catch (e) {}
                }
            }

            // wire close buttons
            modal.querySelectorAll(closeButtonsSelector).forEach(btn => btn.addEventListener('click', closeModal));
            if (overlay) overlay.addEventListener('click', closeModal);

            // ESC to close
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
            });

            // focus trap
            modal.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab' || modal.getAttribute('aria-hidden') === 'true') return;
                const focusable = Array.from(modal.querySelectorAll('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            });

            // open modal automatically (unless the current version is already stored)
            setTimeout(() => {
                openModal();
            }, 600);
        }

        // Load updates.json to populate modal content and determine version
        (function loadUpdates() {
            fetch('updates.json?_=' + Date.now(), { cache: 'no-store' }).then(resp => {
                if (!resp.ok) throw new Error('Fetch failed');
                return resp.json();
            }).then(data => {
                const version = data && data.version ? String(data.version) : (modal.dataset && modal.dataset.updatesVersion ? modal.dataset.updatesVersion : null);
                const updates = Array.isArray(data && data.updates) ? data.updates : [];
                if (listEl && updates.length) {
                    listEl.innerHTML = updates.map(u => {
                        const icon = u.icon ? `<span class="update-icon">${escapeHtml(u.icon)}</span>` : '';
                        const date = u.date ? `<span class="update-date">${escapeHtml(u.date)}</span>` : '';
                        return `<li class="update-item">${icon}<div class="update-body"><div class="update-title">${escapeHtml(u.title)}</div><div class="update-desc">${escapeHtml(u.desc)}</div></div>${date}</li>`;
                    }).join('');
                }

                try { if (version && localStorage.getItem(LAST_SEEN_KEY) === version) return; } catch (e) {}
                attachModalHandlers(version);
            }).catch(() => {
                // fallback: use in-HTML content and data attribute
                const version = modal.dataset && modal.dataset.updatesVersion ? modal.dataset.updatesVersion : null;
                try { if (version && localStorage.getItem(LAST_SEEN_KEY) === version) return; } catch (e) {}
                attachModalHandlers(version);
            });
        })();

    } catch (err) {
        console.error('Whats New modal error', err);
    }
});

// Hide the floating "What's New" button when the user has opted out for the current version
document.addEventListener('DOMContentLoaded', function () {
    try {
        const showBtn = document.getElementById('show-whats-new');
        if (!showBtn) return;

        const LAST_SEEN_KEY = 'suvratech_whats_new_seen_version';

        function hideIfSeen(version) {
            try {
                if (version && localStorage.getItem(LAST_SEEN_KEY) === version) {
                    showBtn.style.display = 'none';
                } else {
                    showBtn.style.display = '';
                }
            } catch (e) {
                // ignore
            }
        }

        // Try fetching updates.json for authoritative version
        fetch('updates.json?_=' + Date.now(), { cache: 'no-store' }).then(r => {
            if (!r.ok) throw new Error('no updates');
            return r.json();
        }).then(data => {
            const version = data && data.version ? String(data.version) : null;
            hideIfSeen(version);
        }).catch(() => {
            // Fallback to modal data attribute
            const modal = document.getElementById('whats-new-modal');
            const version = modal && modal.dataset && modal.dataset.updatesVersion ? modal.dataset.updatesVersion : null;
            hideIfSeen(version);
        });
    } catch (e) { console.error('whats-new button visibility error', e); }
});
