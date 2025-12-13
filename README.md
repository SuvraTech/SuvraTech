**Project Overview**

- **Description:**: Static marketing site for SuvraTech with pages for Home, Jobs, Products, Socials and About. The site includes an enhanced hero/banner, subtle animations, and a "What's New" modal that surfaces recent updates.

**Quick Start**

- **Preview locally:**: Serve the folder and open your browser:
	- `cd 'C:\Users\Malini\Desktop\SuvraTech Website'`
	- `python -m http.server 8000`
	- Open `http://localhost:8000` in your browser.

**Important Files**

- **`index.html`**: Home page with hero/banner and the What's New modal markup.
- **`style.css`**: All site styles, hero animations, modal and floating button styles.
- **`scripts.js`**: Client behavior: mobile menu, reveal animations, hero parallax, and What's New modal logic.
- **`updates.json`**: Central source for the What's New content and `version` used for per-version suppression.

**Recent Feature Summary**

- **Hero / Banner:**: Gentle slow-zoom plus a subtle parallax translate (JS) and a moving overlay gradient for added depth. The hero is now consistent across pages.
- **Animations:**: Smooth fade-up for hero text and a soft pulse for the accent bar. All motion respects `prefers-reduced-motion` and will be disabled for users who prefer reduced motion.
- **What's New Modal:**: A modal that shows recent updates. Content and the current `version` are loaded from `updates.json`. Users can check "Don't show this again" to suppress the modal for the current `version`.
- **Per-version Suppression:**: The modal uses `localStorage` key `suvratech_whats_new_seen_version` to remember which `version` a user has dismissed. Bump the `version` in `updates.json` to show the modal again for everyone.
- **Quick Reopen:**: A floating `What's New` button (bottom-right) opens the modal immediately. The button hides automatically if the current version is already dismissed.

**How to Update "What's New"**

- **Edit content:**: Update `updates.json` — change the `version` string and add/remove items in the `updates` array. Each item supports `title`, `desc`, `date`, and `icon`.
- **Publish new update:**: Bump `version` in `updates.json` (example: `"version": "2025-12-13"`). Users who previously dismissed the modal will see it again once the new version is published.

**Developer Notes**

- **Force modal to reappear (testing):**: In the browser Console run:
	- `localStorage.removeItem('suvratech_whats_new_seen_version'); location.reload();`
- **Open modal manually:**: Click the floating `What's New` button or run this in Console:
	- `document.getElementById('whats-new-modal').setAttribute('aria-hidden','false');`
- **Change hero animation:**: Edit the hero rules in `style.css` (`@keyframes hero-slow-zoom`, `.hero-title`, `.hero-subtitle`, `.hero-accent-bar`) and adjust durations/scale there.
- **Accessibility:**: Animations are disabled under `@media (prefers-reduced-motion: reduce)` and the modal includes focus trapping, ESC-to-close, and aria attributes.

**Troubleshooting**

- **Modal not appearing:**: Confirm `updates.json` is reachable (browser Network tab) and that `localStorage.suvratech_whats_new_seen_version` is not set to the current `version`.
- **Buttons not working:**: Check the browser Console for errors. The modal close buttons are wired in `scripts.js`.

If you'd like, I can also add a small admin workflow (an editable `updates.json` UI) or move `updates.json` to a remote CDN.
