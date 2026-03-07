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

        // Only show modal on the home page (index.html)
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) return;

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

// Contact form submission
document.addEventListener('DOMContentLoaded', function () {
    try {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };

            // Send to FormSubmit.co (free form backend service)
            fetch('https://formspree.io/f/mvzkwrqw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }).then(response => {
                if (response.ok) {
                    alert('Thank you! Your feedback has been sent successfully.');
                    contactForm.reset();
                } else {
                    alert('There was an issue sending your feedback. Please try again.');
                }
            }).catch(error => {
                console.error('Form submission error:', error);
                alert('There was an error sending your feedback. Please try again.');
            });
        });
    } catch (e) { console.error('Contact form init error', e); }
});

// Announcements notification system
document.addEventListener('DOMContentLoaded', function () {
    try {
        const ANNOUNCEMENTS_KEY = 'suvratech_read_announcements';
        
        // Initialize notification badge visibility on all pages
        function updateNotificationBadge() {
            const badge = document.getElementById('notification-badge');
            if (!badge) return;
            
            const readAnnouncements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
            
            // Check if there are any unread announcements based on known announcement IDs
            // This works across all pages, not just announcements.html
            const knownAnnouncements = ['alpha-update-2026-02-01']; // List of all announcement IDs
            const hasUnread = knownAnnouncements.some(id => !readAnnouncements.includes(id));
            
            badge.style.display = hasUnread ? 'inline-block' : 'none';
        }
        
        // Mark announcement as read
        function markAsRead(announcementId) {
            let readAnnouncements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
            if (!readAnnouncements.includes(announcementId)) {
                readAnnouncements.push(announcementId);
                localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(readAnnouncements));
            }
        }
        
        // Initialize announcements on announcements page
        const announcementItems = document.querySelectorAll('.announcement-item[data-announcement-id]');
        if (announcementItems.length > 0) {
            const readAnnouncements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY) || '[]');
            
            announcementItems.forEach(item => {
                const id = item.getAttribute('data-announcement-id');
                const markBtn = item.querySelector('.mark-read-btn');
                
                if (readAnnouncements.includes(id)) {
                    item.classList.add('read');
                    item.classList.remove('unread');
                } else {
                    item.classList.add('unread');
                }
                
                if (markBtn) {
                    markBtn.addEventListener('click', function() {
                        markAsRead(id);
                        item.classList.add('read');
                        item.classList.remove('unread');
                        updateNotificationBadge();
                    });
                }
            });
        }
        
        // Update badge on page load
        updateNotificationBadge();
        
    } catch (e) { console.error('Announcements notification error', e); }
});

// --- Admin / dynamic content support (client-side, stores data in localStorage) ---
(function () {
    // IMPORTANT: This is client-side-only protection. Keep the URL private.
    const ADMIN_USER = 'suvratechwebsite';
    const ADMIN_PASS = 'workingonTHheWebsite!1';
    const SESSION_KEY = 'suvratech_admin_session';
    const ANN_KEY = 'suvratech_announcements';
    const VID_KEY = 'suvratech_videos';
    const HOME_KEY = 'suvratech_home';
    const PROD_KEY = 'suvratech_products';
    const ABOUT_KEY = 'suvratech_about';
    // Draft/staging keys
    const ANN_DRAFT_KEY = 'suvratech_announcements_draft';
    const VID_DRAFT_KEY = 'suvratech_videos_draft';
    const HOME_DRAFT_KEY = 'suvratech_home_draft';
    const PROD_DRAFT_KEY = 'suvratech_products_draft';
    const ABOUT_DRAFT_KEY = 'suvratech_about_draft';

    function isAdmin() {
        try { return sessionStorage.getItem(SESSION_KEY) === ADMIN_USER; } catch (e) { return false; }
    }

    function requireAdminOrRedirect() {
        return isAdmin();
    }

    // Simple helpers for data (draft versions)
    function loadAnnouncements() {
        try { return JSON.parse(localStorage.getItem(ANN_DRAFT_KEY) || localStorage.getItem(ANN_KEY) || '[]'); } catch (e) { return []; }
    }
    function saveAnnouncements(list) { try { localStorage.setItem(ANN_DRAFT_KEY, JSON.stringify(list)); } catch (e) {} }
    function loadVideos() { try { return JSON.parse(localStorage.getItem(VID_DRAFT_KEY) || localStorage.getItem(VID_KEY) || '[]'); } catch (e) { return []; } }
    function saveVideos(list) { try { localStorage.setItem(VID_DRAFT_KEY, JSON.stringify(list)); } catch (e) {} }
    
    // Load from live or draft for home, products, about
    function loadHome() { try { return JSON.parse(localStorage.getItem(HOME_DRAFT_KEY) || localStorage.getItem(HOME_KEY) || 'null'); } catch (e) { return null; } }
    function saveHome(obj) { try { localStorage.setItem(HOME_DRAFT_KEY, JSON.stringify(obj)); } catch (e) {} }
    function loadProducts() { try { return JSON.parse(localStorage.getItem(PROD_DRAFT_KEY) || localStorage.getItem(PROD_KEY) || '[]'); } catch (e) { return []; } }
    function saveProducts(list) { try { localStorage.setItem(PROD_DRAFT_KEY, JSON.stringify(list)); } catch (e) {} }
    function loadAbout() { try { return JSON.parse(localStorage.getItem(ABOUT_DRAFT_KEY) || localStorage.getItem(ABOUT_KEY) || 'null'); } catch (e) { return null; } }
    function saveAbout(obj) { try { localStorage.setItem(ABOUT_DRAFT_KEY, JSON.stringify(obj)); } catch (e) {} }
    
    // Publish: move draft to live
    function publishAllChanges() {
        try {
            const ann = JSON.parse(localStorage.getItem(ANN_DRAFT_KEY) || 'null');
            const vid = JSON.parse(localStorage.getItem(VID_DRAFT_KEY) || 'null');
            const home = JSON.parse(localStorage.getItem(HOME_DRAFT_KEY) || 'null');
            const prod = JSON.parse(localStorage.getItem(PROD_DRAFT_KEY) || 'null');
            const about = JSON.parse(localStorage.getItem(ABOUT_DRAFT_KEY) || 'null');
            
            if (ann) localStorage.setItem(ANN_KEY, JSON.stringify(ann));
            if (vid) localStorage.setItem(VID_KEY, JSON.stringify(vid));
            if (home) localStorage.setItem(HOME_KEY, JSON.stringify(home));
            if (prod) localStorage.setItem(PROD_KEY, JSON.stringify(prod));
            if (about) localStorage.setItem(ABOUT_KEY, JSON.stringify(about));
        } catch (e) { console.error('Publish error', e); }
    }
    
    // Clear drafts
    function clearAllDrafts() {
        try {
            localStorage.removeItem(ANN_DRAFT_KEY);
            localStorage.removeItem(VID_DRAFT_KEY);
            localStorage.removeItem(HOME_DRAFT_KEY);
            localStorage.removeItem(PROD_DRAFT_KEY);
            localStorage.removeItem(ABOUT_DRAFT_KEY);
        } catch (e) { console.error('Clear draft error', e); }
    }

    // Render announcements into announcements list section if present
    function renderAnnouncementsPage() {
        const section = document.getElementById('announcements-list-section');
        if (!section) return;
        const data = loadAnnouncements();
        if (!data || !data.length) return; // keep static content if no admin data

        // Replace section content with admin-managed announcements
        section.innerHTML = '<h2>Recent Announcements</h2><hr class="section-divider"><div id="announcements-managed"></div>';
        const container = document.getElementById('announcements-managed');
        data.forEach(a => {
            const div = document.createElement('div');
            div.className = 'announcement-item' + (a.read ? ' read' : ' unread');
            div.setAttribute('data-announcement-id', a.id || ('ann-' + Math.random().toString(36).slice(2,9)));
            div.innerHTML = `<div class="announcement-header"><h3>${escapeHtml(a.title || '')}</h3><span class="announcement-badge">${escapeHtml(a.badge||'')}</span></div><p class="announcement-date">${escapeHtml(a.date||'')}</p><p>${escapeHtml(a.body||'')}</p>`;
            container.appendChild(div);
        });
    }

    function renderHomePage() {
        try {
            const home = JSON.parse(localStorage.getItem(HOME_KEY) || 'null');
            if (!home) return;
            // Target HOME page specifically using #home section
            const homeSection = document.getElementById('home');
            if (homeSection) {
                const hero = homeSection.querySelector('.hero-content');
                const banner = homeSection.querySelector('.hero-banner');
                if (hero) {
                    const title = hero.querySelector('.hero-title');
                    const subtitle = hero.querySelector('.hero-subtitle');
                    if (title && home.heroTitle) title.textContent = home.heroTitle;
                    if (subtitle && home.heroSubtitle) subtitle.textContent = home.heroSubtitle;
                }
                if (banner && home.heroBanner) banner.src = home.heroBanner;
            }
            // Render custom sections (admin-managed)
            if (home && Array.isArray(home.sections) && home.sections.length) {
                const sectionsContainer = document.getElementById('home-custom-sections');
                if (sectionsContainer) {
                    sectionsContainer.innerHTML = '';
                    home.sections.forEach(sec => {
                        const sectionEl = document.createElement('section');
                        sectionEl.className = 'content-section';
                        sectionEl.innerHTML = `<h2>${escapeHtml(sec.title||'')}</h2><hr class="section-divider"><p>${escapeHtml(sec.body||'').replace(/\n/g, '<br>')}</p>`;
                        sectionsContainer.appendChild(sectionEl);
                    });
                }
            }
        } catch (e) { console.error('Render home error', e); }
    }

    // Render videos page
    function renderVideosPage() {
        const newest = document.getElementById('newest-video-section');
        const top = document.getElementById('top-videos-section');
        const vids = loadVideos();
        if (!vids || !vids.length) return;

        if (newest) {
            const first = vids[0];
            newest.innerHTML = `<h2>Newest Video</h2><hr class="section-divider"><div class="video-container"><iframe width="100%" height="500" src="${escapeHtml(first.url)}" frameborder="0" allowfullscreen></iframe></div><h3>${escapeHtml(first.title||'')}</h3>`;
        }

        if (top) {
            top.innerHTML = '<h2>Top Videos</h2><hr class="section-divider"><div class="videos-grid" id="videos-grid"></div>';
            const grid = document.getElementById('videos-grid');
            vids.slice(0,6).forEach(v => {
                const card = document.createElement('div'); card.className = 'video-card';
                card.innerHTML = `<div class="video-wrapper"><iframe src="${escapeHtml(v.url)}" frameborder="0" allowfullscreen></iframe></div><h3>${escapeHtml(v.title||'')}</h3>`;
                grid.appendChild(card);
            });
        }
    }

    function renderProductsPage() {
        try {
            const products = JSON.parse(localStorage.getItem(PROD_KEY) || '[]');
            const prodSection = document.querySelector('.product-grid') || document.querySelector('.newest-products-section');
            if (!products || !products.length || !prodSection) return;
            // If a dedicated products grid exists, replace its content
            const grid = document.querySelector('.product-grid');
            if (grid) {
                grid.innerHTML = '';
                products.forEach(p => {
                    const card = document.createElement('div'); card.className = 'product-card';
                    card.innerHTML = `<div class="product-placeholder"><img src="${escapeHtml(p.image||'')}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div><div class="product-title">${escapeHtml(p.name||'')}</div><p>${escapeHtml(p.description||'')}</p><a href="${escapeHtml(p.link||'#')}">Learn more</a>`;
                    grid.appendChild(card);
                });
            } else {
                // Fallback rendering into the section if no grid
                prodSection.innerHTML = '<h2>Newest Products</h2><hr class="section-divider"><div class="products-list"></div>';
                const listEl = prodSection.querySelector('.products-list');
                products.slice(0,6).forEach(p => {
                    const el = document.createElement('div'); el.className = 'product-card';
                    el.innerHTML = `<div class="product-title">${escapeHtml(p.name||'')}</div><p>${escapeHtml(p.description||'')}</p>`;
                    listEl.appendChild(el);
                });
            }
        } catch (e) { console.error('Render products error', e); }
    }

    function renderAboutPage() {
        try {
            const about = JSON.parse(localStorage.getItem(ABOUT_KEY) || 'null');
            if (!about) return;
            // Target ABOUT page hero section
            const aboutHeroSection = document.querySelector('.about-hero-section');
            if (aboutHeroSection) {
                const hero = aboutHeroSection.querySelector('.hero-content');
                const banner = aboutHeroSection.querySelector('.hero-banner');
                if (hero && about.title) {
                    const title = hero.querySelector('.hero-title');
                    if (title) title.textContent = about.title;
                }
                if (banner && about.heroBanner) banner.src = about.heroBanner;
            }
            // Render about intro content (separate from Mission/Values grid)
            const aboutIntro = document.querySelector('.about-intro');
            if (aboutIntro && about.body) {
                aboutIntro.innerHTML = '<div class="container"><p>' + escapeHtml(about.body) + '</p></div>';
            }
        } catch (e) { console.error('Render about error', e); }
    }

    // Basic escaping to avoid accidental HTML injection in this simple admin UI
    function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    // Admin panel wiring (runs only on pages that include admin UI)
    document.addEventListener('DOMContentLoaded', function () {
        try {
            // Load data from admin-data.json into localStorage on startup
            fetch('admin-data.json?_=' + Date.now(), { cache: 'no-store' })
                .then(r => r.json())
                .then(data => {
                    // Initialize localStorage from JSON if not already set (or override with JSON)
                    if (data.announcements && Array.isArray(data.announcements)) {
                        if (!localStorage.getItem(ANN_KEY) && !localStorage.getItem(ANN_DRAFT_KEY)) {
                            localStorage.setItem(ANN_KEY, JSON.stringify(data.announcements));
                        }
                    }
                    if (data.videos && Array.isArray(data.videos)) {
                        if (!localStorage.getItem(VID_KEY) && !localStorage.getItem(VID_DRAFT_KEY)) {
                            localStorage.setItem(VID_KEY, JSON.stringify(data.videos));
                        }
                    }
                    if (data.home && typeof data.home === 'object') {
                        if (!localStorage.getItem(HOME_KEY) && !localStorage.getItem(HOME_DRAFT_KEY)) {
                            localStorage.setItem(HOME_KEY, JSON.stringify(data.home));
                        }
                    }
                    if (data.products && Array.isArray(data.products)) {
                        if (!localStorage.getItem(PROD_KEY) && !localStorage.getItem(PROD_DRAFT_KEY)) {
                            localStorage.setItem(PROD_KEY, JSON.stringify(data.products));
                        }
                    }
                    if (data.about && typeof data.about === 'object') {
                        if (!localStorage.getItem(ABOUT_KEY) && !localStorage.getItem(ABOUT_DRAFT_KEY)) {
                            localStorage.setItem(ABOUT_KEY, JSON.stringify(data.about));
                        }
                    }
                    // Render pages with loaded data
                    renderAnnouncementsPage();
                    renderVideosPage();
                    renderHomePage();
                    renderProductsPage();
                    renderAboutPage();
                })
                .catch(err => console.warn('admin-data.json not found or error loading:', err));
            
            // Render dynamic content if admin-managed data exists
            renderAnnouncementsPage();
            renderVideosPage();

            const app = document.getElementById('admin-app');
            if (!app) return;

            // Login UI
            const loginEl = document.getElementById('admin-login');
            const panelEl = document.getElementById('admin-panel');
            const loginBtn = document.getElementById('admin-login-btn');
            const clearBtn = document.getElementById('admin-clear-btn');
            const msg = document.getElementById('admin-login-msg');
            const userField = document.getElementById('admin-username');
            const passField = document.getElementById('admin-password');
            const currentUser = document.getElementById('admin-current-user');

            function showPanelFor(user) {
                loginEl.style.display = 'none';
                panelEl.style.display = '';
                currentUser.textContent = user;
                sessionStorage.setItem(SESSION_KEY, user);
                try { localStorage.setItem('suvratech_admin_user', user); } catch (e) {}
                initAdminTabs();
            }

            function logout() {
                sessionStorage.removeItem(SESSION_KEY);
                panelEl.style.display = 'none';
                loginEl.style.display = '';
                msg.textContent = 'Logged out.';
            }

            // Pre-fill from existing session
            if (isAdmin()) showPanelFor(sessionStorage.getItem(SESSION_KEY));

            // Attach login handler only if the button exists (avoid runtime errors)
            if (loginBtn) {
                loginBtn.addEventListener('click', function () {
                    const u = (userField && userField.value || '').trim();
                    const p = (passField && passField.value || '');
                    if (u === ADMIN_USER && p === ADMIN_PASS) {
                        if (msg) msg.textContent = 'Welcome, admin.';
                        showPanelFor(u);
                    } else {
                        if (msg) msg.textContent = 'Invalid credentials.';
                    }
                });
            } else {
                console.warn('Admin login button not found: #admin-login-btn');
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', function () { if (userField) userField.value = ''; if (passField) passField.value = ''; if (msg) msg.textContent = ''; });
            }

            const logoutEl = document.getElementById('admin-logout');
            if (logoutEl) logoutEl.addEventListener('click', logout);

            // Tabs
            function initAdminTabs() {
                const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
                const tabs = Array.from(document.querySelectorAll('.admin-tab'));
                
                // Hide all tabs initially
                tabs.forEach(t => t.style.display = 'none');
                
                tabBtns.forEach(b => b.addEventListener('click', function () {
                    const t = this.dataset.tab;
                    tabBtns.forEach(x => x.classList.remove('active'));
                    tabs.forEach(x => x.style.display = 'none');
                    this.classList.add('active');
                    const sel = document.getElementById('tab-' + t);
                    if (sel) sel.style.display = 'block';
                    if (t === 'announcements') refreshAnnList();
                    if (t === 'videos') refreshVidList();
                    if (t === 'products') refreshProdList();
                }));

                // default open announcements
                const first = tabBtns[0]; if (first) first.click();
            }

            // Announcements management
            const annAddBtn = document.getElementById('ann-add-btn');
            const annClearForm = document.getElementById('ann-clear-form');
            function refreshAnnList() {
                const list = loadAnnouncements();
                const container = document.getElementById('ann-list');
                container.innerHTML = '';
                const query = (document.getElementById('ann-search') && document.getElementById('ann-search').value || '').toLowerCase().trim();
                list.forEach((a, idx) => {
                    if (query && !(String(a.title||'').toLowerCase().includes(query) || String(a.id||'').toLowerCase().includes(query))) return;
                    const el = document.createElement('div'); el.className = 'draggable-item'; el.setAttribute('draggable', 'true'); el.dataset.index = idx; el.dataset.id = a.id || '';
                    const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems='flex-start';
                    const handle = document.createElement('span'); handle.className='drag-handle'; handle.textContent='☰'; left.appendChild(handle);
                    const main = document.createElement('div'); main.innerHTML = `<strong>${escapeHtml(a.title||'')}</strong> <div class="muted">${escapeHtml(a.date||'')}</div><div>${escapeHtml(a.body||'')}</div>`;
                    left.appendChild(main);
                    const controls = document.createElement('div'); controls.className = 'controls'; controls.style.flexDirection='column';
                    const edit = document.createElement('button'); edit.textContent = 'Edit';
                    const preview = document.createElement('button'); preview.textContent = 'Preview';
                    const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'danger';
                    const pub = document.createElement('button'); pub.textContent = a.published ? 'Unpublish' : 'Publish';
                    edit.addEventListener('click', function () { document.getElementById('ann-id').value = a.id; document.getElementById('ann-title').value = a.title; document.getElementById('ann-date').value = a.date; document.getElementById('ann-body').value = a.body; });
                    preview.addEventListener('click', function () { showPreview('announcement', a); });
                    del.addEventListener('click', function () { if (!confirm('Delete announcement?')) return; const updated = loadAnnouncements().filter(x=>x.id!==a.id); saveAnnouncements(updated); refreshAnnList(); renderAnnouncementsPage(); });
                    pub.addEventListener('click', function () { a.published = !a.published; const list2 = loadAnnouncements(); const idx2 = list2.findIndex(x=>x.id===a.id); if(idx2!==-1) { list2[idx2]=a; saveAnnouncements(list2); refreshAnnList(); renderAnnouncementsPage(); } });
                    controls.appendChild(edit); controls.appendChild(preview); controls.appendChild(pub); controls.appendChild(del);
                    el.appendChild(left); el.appendChild(controls); container.appendChild(el);
                });
                attachDragHandlers(container, 'announcements');
            }

            annAddBtn.addEventListener('click', function () {
                const id = (document.getElementById('ann-id').value || '').trim();
                if (!id) return alert('Please provide an ID for the announcement');
                const title = document.getElementById('ann-title').value || '';
                const date = document.getElementById('ann-date').value || '';
                const body = document.getElementById('ann-body').value || '';
                const list = loadAnnouncements();
                const existing = list.find(x=>x.id===id);
                const item = { id, title, date, body };
                if (existing) {
                    const idx = list.findIndex(x=>x.id===id); list[idx]=item;
                } else { list.unshift(item); }
                saveAnnouncements(list); refreshAnnList(); alert('Saved to draft.');
            });
            annClearForm.addEventListener('click', function () { document.getElementById('ann-id').value=''; document.getElementById('ann-title').value=''; document.getElementById('ann-date').value=''; document.getElementById('ann-body').value=''; });
            // search for announcements
            const annSearch = document.getElementById('ann-search');
            if (annSearch) annSearch.addEventListener('input', refreshAnnList);

            // Videos management
            const vidAddBtn = document.getElementById('vid-add-btn');
            const vidClearForm = document.getElementById('vid-clear-form');
            function refreshVidList() {
                const list = loadVideos();
                const container = document.getElementById('vid-list');
                container.innerHTML = '';
                const query = (document.getElementById('vid-search') && document.getElementById('vid-search').value || '').toLowerCase().trim();
                list.forEach((v, idx) => {
                    if (query && !(String(v.title||'').toLowerCase().includes(query) || String(v.id||'').toLowerCase().includes(query))) return;
                    const el = document.createElement('div'); el.className = 'draggable-item'; el.setAttribute('draggable', 'true'); el.dataset.index = idx; el.dataset.id = v.id || '';
                    const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems='flex-start';
                    const handle = document.createElement('span'); handle.className='drag-handle'; handle.textContent='☰'; left.appendChild(handle);
                    const main = document.createElement('div'); main.innerHTML = `<strong>${escapeHtml(v.title||'')}</strong> <div class="muted">${escapeHtml(v.url||'')}</div>`;
                    left.appendChild(main);
                    const controls = document.createElement('div'); controls.className = 'controls'; controls.style.flexDirection='column';
                    const edit = document.createElement('button'); edit.textContent = 'Edit';
                    const preview = document.createElement('button'); preview.textContent = 'Preview';
                    const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'danger';
                    const pub = document.createElement('button'); pub.textContent = v.published ? 'Unpublish' : 'Publish';
                    edit.addEventListener('click', function () { document.getElementById('vid-id').value = v.id; document.getElementById('vid-title').value = v.title; document.getElementById('vid-url').value = v.url; });
                    preview.addEventListener('click', function () { showPreview('video', v); });
                    del.addEventListener('click', function () { if (!confirm('Delete video?')) return; const updated = loadVideos().filter(x=>x.id!==v.id); saveVideos(updated); refreshVidList(); renderVideosPage(); });
                    pub.addEventListener('click', function () { v.published = !v.published; const list2 = loadVideos(); const idx2 = list2.findIndex(x=>x.id===v.id); if(idx2!==-1) { list2[idx2]=v; saveVideos(list2); refreshVidList(); renderVideosPage(); } });
                    controls.appendChild(edit); controls.appendChild(preview); controls.appendChild(pub); controls.appendChild(del);
                    el.appendChild(left); el.appendChild(controls); container.appendChild(el);
                });
                attachDragHandlers(container, 'videos');
            }

            vidAddBtn.addEventListener('click', function () {
                const id = (document.getElementById('vid-id').value || '').trim();
                if (!id) return alert('Please provide an ID for the video');
                const title = document.getElementById('vid-title').value || '';
                const url = document.getElementById('vid-url').value || '';
                const list = loadVideos();
                const existing = list.find(x=>x.id===id);
                const item = { id, title, url };
                if (existing) {
                    const idx = list.findIndex(x=>x.id===id); list[idx]=item;
                } else { list.unshift(item); }
                saveVideos(list); refreshVidList(); alert('Saved to draft.');
            });
            vidClearForm.addEventListener('click', function () { document.getElementById('vid-id').value=''; document.getElementById('vid-title').value=''; document.getElementById('vid-url').value=''; });
            // search for videos
            const vidSearch = document.getElementById('vid-search');
            if (vidSearch) vidSearch.addEventListener('input', refreshVidList);

            // Tools
            document.getElementById('export-all').addEventListener('click', function () {
                const payload = { 
                    announcements: loadAnnouncements() || JSON.parse(localStorage.getItem(ANN_KEY) || '[]'),
                    videos: loadVideos() || JSON.parse(localStorage.getItem(VID_KEY) || '[]'),
                    home: loadHome() || JSON.parse(localStorage.getItem(HOME_KEY) || 'null'),
                    products: loadProducts() || JSON.parse(localStorage.getItem(PROD_KEY) || '[]'),
                    about: loadAbout() || JSON.parse(localStorage.getItem(ABOUT_KEY) || 'null')
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'admin-data.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                alert('📥 admin-data.json downloaded. Replace the one in your website folder to sync.');
                    if (t === 'products') refreshProdList();
                    if (t === 'home') {
                        const home = loadHome() || {};
                        document.getElementById('home-hero-title').value = home.heroTitle||'';
                        document.getElementById('home-hero-subtitle').value = home.heroSubtitle||'';
                        document.getElementById('home-hero-banner').value = home.heroBanner||'';
                        refreshHomeSectionsList();
                    }
            // Home save/load
            document.getElementById('home-save-btn').addEventListener('click', function () {
                const obj = { heroTitle: document.getElementById('home-hero-title').value||'', heroSubtitle: document.getElementById('home-hero-subtitle').value||'', heroBanner: document.getElementById('home-hero-banner').value||'' };
                try { saveHome(obj); alert('Home saved to draft.'); } catch (e) { alert('Save failed'); }
            });
            document.getElementById('home-clear').addEventListener('click', function () { document.getElementById('home-hero-title').value=''; document.getElementById('home-hero-subtitle').value=''; document.getElementById('home-hero-banner').value=''; });

            // Products admin wiring
            const prodAddBtn = document.getElementById('prod-add-btn');
            const prodClearBtn = document.getElementById('prod-clear-form');
            function refreshProdList() {
                const list = JSON.parse(localStorage.getItem(PROD_KEY) || '[]');
                const container = document.getElementById('prod-list'); container.innerHTML='';
                const query = (document.getElementById('prod-search') && document.getElementById('prod-search').value || '').toLowerCase().trim();
                list.forEach((p, idx) => {
                    if (query && !(String(p.name||'').toLowerCase().includes(query) || String(p.id||'').toLowerCase().includes(query))) return;
                    const el = document.createElement('div'); el.className='draggable-item'; el.setAttribute('draggable','true'); el.dataset.index=idx; el.dataset.id=p.id||'';
                    const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='flex-start';
                    const handle = document.createElement('span'); handle.className='drag-handle'; handle.textContent='☰'; left.appendChild(handle);
                    const main = document.createElement('div'); main.innerHTML=`<strong>${escapeHtml(p.name||'')}</strong> <div class="muted">${escapeHtml(p.description||'')}</div>`;
                    left.appendChild(main);
                    const controls = document.createElement('div'); controls.className='controls'; controls.style.flexDirection='column';
                    const edit=document.createElement('button'); edit.textContent='Edit';
                    const preview=document.createElement('button'); preview.textContent='Preview';
                    const del=document.createElement('button'); del.textContent='Delete'; del.className='danger';
                    edit.addEventListener('click', ()=>{ document.getElementById('prod-id').value=p.id; document.getElementById('prod-name').value=p.name; document.getElementById('prod-desc').value=p.description; document.getElementById('prod-img').value=p.image; document.getElementById('prod-link').value=p.link; });
                    preview.addEventListener('click', function(){ showPreview('product', p); });
                    del.addEventListener('click', ()=>{ if(!confirm('Delete product?')) return; const updated = JSON.parse(localStorage.getItem(PROD_KEY)||'[]').filter(x=>x.id!==p.id); localStorage.setItem(PROD_KEY, JSON.stringify(updated)); refreshProdList(); renderProductsPage(); });
                    controls.appendChild(edit); controls.appendChild(preview); controls.appendChild(del); el.appendChild(left); el.appendChild(controls); container.appendChild(el);
                });
                attachDragHandlers(container, 'products');
            }
            prodAddBtn.addEventListener('click', function(){ const id=(document.getElementById('prod-id').value||'').trim(); if(!id) return alert('Provide id'); const item={ id, name: document.getElementById('prod-name').value||'', description: document.getElementById('prod-desc').value||'', image: document.getElementById('prod-img').value||'', link: document.getElementById('prod-link').value||'' }; const list = loadProducts(); const existing = list.find(x=>x.id===id); if(existing){ const idx=list.findIndex(x=>x.id===id); list[idx]=item; } else list.unshift(item); saveProducts(list); refreshProdList(); alert('Saved to draft.'); });
            prodClearBtn.addEventListener('click', function(){ document.getElementById('prod-id').value=''; document.getElementById('prod-name').value=''; document.getElementById('prod-desc').value=''; document.getElementById('prod-img').value=''; document.getElementById('prod-link').value=''; });
            // search for products
            const prodSearch = document.getElementById('prod-search');
            if (prodSearch) prodSearch.addEventListener('input', refreshProdList);

            // About admin wiring
            document.getElementById('about-save').addEventListener('click', function(){ const obj={ title: document.getElementById('about-title').value||'', body: document.getElementById('about-body').value||'' }; saveAbout(obj); alert('About saved to draft.'); });
            document.getElementById('about-clear').addEventListener('click', function(){ document.getElementById('about-title').value=''; document.getElementById('about-body').value=''; });

            // init lists
            refreshProdList();
            document.getElementById('import-all').addEventListener('click', function () { document.getElementById('import-file').click(); });
            document.getElementById('import-file').addEventListener('change', function (e) {
                const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = function () { try { const j = JSON.parse(r.result); 
                    if (Array.isArray(j.announcements)) { saveAnnouncements(j.announcements); localStorage.setItem(ANN_KEY, JSON.stringify(j.announcements)); }
                    if (Array.isArray(j.videos)) { saveVideos(j.videos); localStorage.setItem(VID_KEY, JSON.stringify(j.videos)); }
                    if (j.home && typeof j.home === 'object') { saveHome(j.home); localStorage.setItem(HOME_KEY, JSON.stringify(j.home)); }
                    if (Array.isArray(j.products)) { saveProducts(j.products); localStorage.setItem(PROD_KEY, JSON.stringify(j.products)); }
                    if (j.about && typeof j.about === 'object') { saveAbout(j.about); localStorage.setItem(ABOUT_KEY, JSON.stringify(j.about)); }
                    alert('✅ Imported all data from JSON!'); refreshAnnList(); refreshVidList(); refreshProdList(); renderAnnouncementsPage(); renderVideosPage(); renderHomePage(); renderProductsPage(); renderAboutPage(); 
                } catch (err) { alert('Invalid JSON'); } }; r.readAsText(f);
            });

            document.getElementById('clear-all').addEventListener('click', function () { if (!confirm('Clear all admin data? This cannot be undone.')) return; 
                localStorage.removeItem(ANN_KEY); localStorage.removeItem(VID_KEY); localStorage.removeItem(HOME_KEY); localStorage.removeItem(PROD_KEY); localStorage.removeItem(ABOUT_KEY);
                clearAllDrafts(); 
                refreshAnnList(); refreshVidList(); refreshProdList(); 
                renderAnnouncementsPage(); renderVideosPage(); renderHomePage(); renderProductsPage(); renderAboutPage(); 
                alert('Cleared.'); 
            });

            // initial populate lists
            refreshAnnList(); refreshVidList();
            // session & activity handling
            let lastActivity = Date.now();
            const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
            function updateActivity() { lastActivity = Date.now(); }
            ['click','keydown','mousemove','scroll','touchstart'].forEach(ev => document.addEventListener(ev, updateActivity, { passive:true }));
            setInterval(function(){ if (!isAdmin()) return; if (Date.now() - lastActivity > TIMEOUT_MS) { alert('Session expired due to inactivity'); logout(); } const remaining = Math.max(0, TIMEOUT_MS - (Date.now()-lastActivity)); const mins = Math.floor(remaining/60000); const secs = Math.floor((remaining%60000)/1000); const mm = String(mins).padStart(2,'0'); const ss = String(secs).padStart(2,'0'); const el = document.getElementById('admin-session-timer'); if (el) el.textContent = mm+':'+ss; }, 1000);

            // Preview modal handlers
            const previewModal = document.getElementById('admin-preview-modal');
            const previewOverlay = document.getElementById('admin-preview-overlay');
            const previewPanel = document.getElementById('admin-preview-panel');
            const previewContent = document.getElementById('admin-preview-content');
            const previewClose = document.getElementById('admin-preview-close');
            function showPreview(type, obj) {
                if (!previewModal) return alert('Preview unavailable');
                previewContent.innerHTML = '';
                if (type === 'announcement') {
                    previewContent.innerHTML = `<h2>${escapeHtml(obj.title||'')}</h2><p class="muted">${escapeHtml(obj.date||'')}</p><div>${escapeHtml(obj.body||'')}</div>`;
                } else if (type === 'video') {
                    previewContent.innerHTML = `<h2>${escapeHtml(obj.title||'')}</h2><div style="padding-top:12px"><iframe width="100%" height="360" src="${escapeHtml(obj.url||'')}" frameborder="0" allowfullscreen></iframe></div>`;
                } else if (type === 'product') {
                    previewContent.innerHTML = `<h2>${escapeHtml(obj.name||'')}</h2><p>${escapeHtml(obj.description||'')}</p><div><img src="${escapeHtml(obj.image||'')}" style="max-width:100%;height:auto;border-radius:8px"/></div>`;
                }
                previewModal.style.display = 'flex'; previewModal.setAttribute('aria-hidden','false');
            }
            function closePreview() { if (!previewModal) return; previewModal.style.display='none'; previewModal.setAttribute('aria-hidden','true'); previewContent.innerHTML=''; }
            if (previewOverlay) previewOverlay.addEventListener('click', closePreview);
            if (previewClose) previewClose.addEventListener('click', closePreview);

            // Staging/Preview all changes modal
            const stagingModal = document.getElementById('admin-staging-modal');
            const stagingOverlay = document.getElementById('admin-staging-overlay');
            const stagingContent = document.getElementById('admin-staging-content');
            const stagingClose = document.getElementById('admin-staging-close');
            const publishBtn = document.getElementById('admin-publish-btn');
            const clearChangesBtn = document.getElementById('admin-clear-changes-btn');
            
            function showStagingPreview() {
                if (!stagingModal) return alert('Preview unavailable');
                stagingContent.innerHTML = '';
                
                const ann = loadAnnouncements();
                const vid = loadVideos();
                const home = loadHome();
                const prod = loadProducts();
                const about = loadAbout();
                
                let html = '<div style="display:grid;gap:20px">';
                
                // Announcements preview
                if (ann && ann.length) {
                    html += '<div><h3>📢 Announcements (' + ann.length + ')</h3>';
                    ann.forEach(a => {
                        html += `<div style="background:#f5f5f5;padding:12px;border-radius:8px"><strong>${escapeHtml(a.title||'')}</strong><p style="font-size:0.9rem;color:#666;margin:4px 0">${escapeHtml(a.date||'')}</p><p>${escapeHtml((a.body||'').substring(0,100))}${a.body && a.body.length>100 ? '...' : ''}</p></div>`;
                    });
                    html += '</div>';
                }
                
                // Videos preview
                if (vid && vid.length) {
                    html += '<div><h3>🎥 Videos (' + vid.length + ')</h3>';
                    vid.forEach(v => {
                        html += `<div style="background:#f5f5f5;padding:12px;border-radius:8px"><strong>${escapeHtml(v.title||'')}</strong><p style="font-size:0.9rem;color:#666;margin:4px 0">${escapeHtml(v.url||'').substring(0,60)}...</p></div>`;
                    });
                    html += '</div>';
                }
                
                // Home preview
                if (home) {
                    html += `<div><h3>🏠 Home Page</h3><div style="background:#f5f5f5;padding:12px;border-radius:8px"><p><strong>Title:</strong> ${escapeHtml(home.heroTitle||'')}</p><p><strong>Subtitle:</strong> ${escapeHtml(home.heroSubtitle||'')}</p><p><strong>Banner:</strong> ${escapeHtml(home.heroBanner||'')}</p></div></div>`;
                }
                
                // Products preview
                if (prod && prod.length) {
                    html += '<div><h3>🛍️ Products (' + prod.length + ')</h3>';
                    prod.forEach(p => {
                        html += `<div style="background:#f5f5f5;padding:12px;border-radius:8px"><strong>${escapeHtml(p.name||'')}</strong><p style="font-size:0.9rem;color:#666;margin:4px 0">${escapeHtml(p.description||'').substring(0,80)}...</p></div>`;
                    });
                    html += '</div>';
                }
                
                // About preview
                if (about) {
                    html += `<div><h3>ℹ️ About Page</h3><div style="background:#f5f5f5;padding:12px;border-radius:8px"><p><strong>${escapeHtml(about.title||'')}</strong></p><p>${escapeHtml((about.body||'').substring(0,150))}${about.body && about.body.length>150 ? '...' : ''}</p></div></div>`;
                }
                
                html += '</div>';
                
                if (!ann?.length && !vid?.length && !home && !prod?.length && !about) {
                    html = '<p style="color:#999;text-align:center;padding:40px">No pending changes. All your content is up to date.</p>';
                }
                
                stagingContent.innerHTML = html;
                stagingModal.style.display = 'flex'; stagingModal.setAttribute('aria-hidden','false');
            }
            
            function closeStagingPreview() { if (!stagingModal) return; stagingModal.style.display='none'; stagingModal.setAttribute('aria-hidden','true'); }
            
            document.getElementById('admin-preview-work-btn').addEventListener('click', showStagingPreview);
            if (stagingOverlay) stagingOverlay.addEventListener('click', closeStagingPreview);
            if (stagingClose) stagingClose.addEventListener('click', closeStagingPreview);
            
            if (publishBtn) publishBtn.addEventListener('click', function() {
                if (!confirm('Publish all changes to SuvraTech?')) return;
                publishAllChanges();
                clearAllDrafts();
                alert('✅ All changes published successfully!');
                // Download updated JSON file
                const payload = { 
                    announcements: JSON.parse(localStorage.getItem(ANN_KEY) || '[]'),
                    videos: JSON.parse(localStorage.getItem(VID_KEY) || '[]'),
                    home: JSON.parse(localStorage.getItem(HOME_KEY) || 'null'),
                    products: JSON.parse(localStorage.getItem(PROD_KEY) || '[]'),
                    about: JSON.parse(localStorage.getItem(ABOUT_KEY) || 'null')
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'admin-data.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                            document.getElementById('home-clear').addEventListener('click', function () { document.getElementById('home-hero-title').value=''; document.getElementById('home-hero-subtitle').value=''; document.getElementById('home-hero-banner').value=''; });

                            // Home sections management
                            function refreshHomeSectionsList() {
                                const home = loadHome() || {};
                                const sections = home.sections || [];
                                const container = document.getElementById('home-sections-list'); 
                                if(!container) return;
                                container.innerHTML='';
                                sections.forEach((sec, idx) => {
                                    const el = document.createElement('div'); el.className='draggable-item'; el.setAttribute('draggable','true'); el.dataset.index=idx;
                                    const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='flex-start';
                                    const handle = document.createElement('span'); handle.className='drag-handle'; handle.textContent='☰'; left.appendChild(handle);
                                    const main = document.createElement('div'); main.innerHTML=`<strong>${escapeHtml(sec.title||'')}</strong> <div class="muted">${escapeHtml((sec.body||'').substring(0,60))}...</div>`;
                                    left.appendChild(main);
                                    const controls = document.createElement('div'); controls.className='controls';
                                    const editBtn = document.createElement('button'); editBtn.textContent='Edit'; editBtn.onclick = () => { document.getElementById('home-section-title').value = sec.title||''; document.getElementById('home-section-body').value = sec.body||''; };
                                    const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='danger'; delBtn.onclick = () => { home.sections.splice(idx, 1); saveHome(home); refreshHomeSectionsList(); renderHomePage(); };
                                    controls.appendChild(editBtn); controls.appendChild(delBtn);
                                    el.appendChild(left); el.appendChild(controls);
                                    container.appendChild(el);
                                });
                            }
                            const homeSectionAddBtn = document.getElementById('home-section-add-btn');
                            if(homeSectionAddBtn) homeSectionAddBtn.addEventListener('click', function () {
                                const home = loadHome() || { heroTitle: '', heroSubtitle: '', heroBanner: '', sections: [] };
                                if (!home.sections) home.sections = [];
                                const title = document.getElementById('home-section-title').value.trim();
                                const body = document.getElementById('home-section-body').value.trim();
                                if (!title || !body) { alert('Please fill in title and body'); return; }
                                const newSec = { id: 'sec-' + Date.now(), title, body };
                                home.sections.push(newSec);
                                saveHome(home);
                                document.getElementById('home-section-title').value = '';
                                document.getElementById('home-section-body').value = '';
                                refreshHomeSectionsList();
                                renderHomePage();
                                alert('Section added!');
                            });
                            const homeSectionClearBtn = document.getElementById('home-section-clear-form');
                            if(homeSectionClearBtn) homeSectionClearBtn.addEventListener('click', function () {
                                document.getElementById('home-section-title').value = '';
                                document.getElementById('home-section-body').value = '';
                            });
                closeStagingPreview();
                // Re-render public pages
                renderAnnouncementsPage(); renderVideosPage(); renderHomePage(); renderProductsPage(); renderAboutPage();
            });
            
            if (clearChangesBtn) clearChangesBtn.addEventListener('click', function() {
                if (!confirm('Discard all pending changes? This cannot be undone.')) return;
                clearAllDrafts();
                // Reload from live storage
                refreshAnnList(); refreshVidList(); refreshProdList();
                alert('✅ Changes cleared. Reverted to published version.');
                closeStagingPreview();
            });

            // Drag and drop reordering
            function attachDragHandlers(container, key) {
                if (!container) return;
                let dragSrc = null;
                container.querySelectorAll('.draggable-item').forEach(item => {
                    item.addEventListener('dragstart', function (e) { dragSrc = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
                    item.addEventListener('dragend', function () { this.classList.remove('dragging'); dragSrc = null; });
                    item.addEventListener('dragover', function (e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const after = getDragAfterElement(container, e.clientY); if (after == null) container.appendChild(dragSrc); else container.insertBefore(dragSrc, after); });
                });
                container.addEventListener('drop', function () {
                    // persist order
                    const ids = Array.from(container.querySelectorAll('.draggable-item')).map(el=>el.dataset.id);
                    if (!ids.length) return;
                    if (key === 'announcements') {
                        const src = loadAnnouncements(); const ordered = ids.map(id=>src.find(s=>s.id===id)).filter(Boolean); saveAnnouncements(ordered);
                    } else if (key === 'videos') {
                        const src = loadVideos(); const ordered = ids.map(id=>src.find(s=>s.id===id)).filter(Boolean); saveVideos(ordered);
                    } else if (key === 'products') {
                        const src = JSON.parse(localStorage.getItem(PROD_KEY)||'[]'); const ordered = ids.map(id=>src.find(s=>s.id===id)).filter(Boolean); localStorage.setItem(PROD_KEY, JSON.stringify(ordered));
                    }
                    // refresh displays
                    refreshAnnList(); refreshVidList(); refreshProdList(); renderAnnouncementsPage(); renderVideosPage(); renderProductsPage();
                });
            }
            function getDragAfterElement(container, y) {
                const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect(); const offset = y - box.top - box.height/2;
                    if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }; else return closest;
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
        } catch (err) { console.error('Admin UI error', err); }
    });
})();
