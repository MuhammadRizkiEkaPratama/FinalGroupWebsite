/**
 * File: js/script.js
 * Name: Main UI Script (Simple)
 * Purpose:
 * - Smooth-scroll for in-page navigation links (#home, #about, ...)
 * - Keep the active state on the Aside navigation (adds/removes `.active`)
 * - Lightweight: avoids heavy effects (cursor, preloader, particles, counters)
 *
 * How it works (flow):
 * 1) On click of any <a href="#...">, check if the target section exists.
 * 2) Prevent the browser default jump.
 * 3) Scroll to the section using `scrollIntoView()`.
 * 4) Highlight the corresponding Aside link by setting `.active`.
 * 5) Update the URL hash using `history.replaceState()` (no extra history entry).
 */

(() => {
    // Section: Motion preference
    // Respect accessibility: if the user prefers reduced motion, avoid smooth scrolling.
    const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Section: Scroll behavior configuration
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    // Section: Helper - set `.active` on Aside navigation
    // This is a UI concern only (no functional dependency).
    const setActiveNavLink = (hash) => {
        if (!hash || hash === '#') return;

        const navLinks = document.querySelectorAll('.aside .nav a');
        navLinks.forEach((link) => link.classList.remove('active'));

        const activeLink = document.querySelector(`.aside .nav a[href="${hash}"]`);
        if (activeLink) activeLink.classList.add('active');
    };

    // Section: Helper - scroll to a section by hash
    // Accepts "#about" or "about" and normalizes to the element id.
    const scrollToHash = (hash) => {
        if (!hash || hash === '#') return;
        const id = hash.startsWith('#') ? hash.slice(1) : hash;
        if (!id) return;

        const target = document.getElementById(id);
        if (!target) return;

        target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
        setActiveNavLink('#' + id);
    };

    // Section: Event delegation for all in-page anchor links
    // Why: a single listener is simpler and faster than attaching many listeners.
    document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const id = href.slice(1);
        if (!id || !document.getElementById(id)) return;

        event.preventDefault();
        scrollToHash(href);
        // Keep the URL hash in sync without creating a new history entry.
        history.replaceState(null, '', href);
    });

    // Section: Initialization on page load
    // Supports deep links: if opened with a hash, scroll to that section after layout.
    window.addEventListener('load', () => {
        if (location.hash) {
            // If the page is opened with a hash, scroll to it after layout.
            setTimeout(() => scrollToHash(location.hash), 0);
        } else {
            // Default active menu is Home.
            setActiveNavLink('#home');
        }
    });
})();