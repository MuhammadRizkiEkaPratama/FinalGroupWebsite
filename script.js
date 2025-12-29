"use strict"; // Enforce stricter JS rules (catches some silent errors and disallows some unsafe patterns).

// Core DOM element references used by this script:
// - `slidesEl`: the long horizontal track that contains all slide items.
// - `prevBtn` / `nextBtn`: arrow buttons to move between slides.
// - `dots`: small navigation dots under the slider.
// - `slideButtons`: clickable overlay areas on each slide that open the portfolio.
// - `yearEl`: span in the footer that displays the current year.
// - `prefersReducedMotion`: user OS/browser setting asking for fewer animations.
const slidesEl = document.getElementById("slides"); // Slider track element (contains all slides horizontally).
const prevBtn = document.getElementById("prevBtn"); // Left arrow button for previous slide.
const nextBtn = document.getElementById("nextBtn"); // Right arrow button for next slide.
const dots = Array.from(document.querySelectorAll(".dot")); // All dot buttons below the slider.
const slideButtons = Array.from(document.querySelectorAll(".slide-hit")); // Overlay buttons on top of each slide.
const yearEl = document.getElementById("year"); // Footer element where the year number will be injected.
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches; // true if the user has enabled "reduce motion" in system settings.

// Runtime slider state:
// - `index`: which slide is currently focused/visible (0-based).
// - `autoplayTimer`: holds the ID returned by setInterval so we can stop/restart autoplay.
let index = 0; // Current slide index being shown.
let autoplayTimer = null; // ID of the autoplay interval (or null if not running).

// Compute how wide a single slide should be based on the viewport container.
// This value is used to calculate how far to translate the slides track.
function getSlideWidth() {
  // The parent of `slidesEl` is the element that behaves as the viewport (only one slide visible).
  const viewport = slidesEl && slidesEl.parentElement; // Usually an element like `.slider-viewport`.
  // If viewport exists, read its current inner width in pixels; otherwise, treat width as 0.
  const w = viewport ? viewport.clientWidth : 0;
  // Always return at least 1 to avoid multiplying by 0, which would break the transform math.
  return w > 0 ? w : 1;
} // End getSlideWidth

// Insert the current year into the footer so it updates automatically.
function setYear() {
  // Create a Date object and read `.getFullYear()` (e.g., 2025), then convert to string for textContent.
  yearEl.textContent = String(new Date().getFullYear());
} // End setYear

// Clamp/wrap a requested slide index so it always stays within [0, dots.length - 1].
// If we go below 0 we wrap to the last slide; if we go beyond last we wrap to first.
function clampIndex(i) {
  const max = dots.length - 1; // Index of the last slide/dot.
  if (i < 0) return max; // Going left from the first slide loops to the last.
  if (i > max) return 0; // Going right from the last slide loops back to the first.
  return i; // If in range already, just return it.
} // End clampIndex

// Visually update which navigation dot is marked as active/current.
function updateDots() {
  dots.forEach((d, i) => {
    // For each dot, check whether its index matches the current slide index.
    const active = i === index;
    // Toggle the CSS class so the active dot can be styled differently (e.g., filled vs hollow).
    d.classList.toggle("is-active", active);
    // ARIA: communicate to assistive tech which dot/slide is currently selected.
    d.setAttribute("aria-selected", active ? "true" : "false");
  });
} // End updateDots

// Main function to move the slider to a specific slide index.
// Handles wrapping, calculates the correct translateX, and updates the dots.
function goTo(i) {
  // Normalize the requested index so we stay within bounds or loop correctly.
  index = clampIndex(i);
  // How many pixels wide one slide currently is.
  const w = getSlideWidth();
  // Move the entire track left by `index * w` so that the requested slide comes into view.
  slidesEl.style.transform = `translateX(-${index * w}px)`;
  // Keep the UI indicators in sync with the new index.
  updateDots();
} // End goTo

// Helper used from keyboard navigation: open the portfolio page represented by the current slide.
function openCurrentPortfolio() {
  // Grab the slide element at the current index in the track.
  const slide = slidesEl.children[index];
  // Look for the custom `data-link` attribute which stores the portfolio URL.
  const url = slide.getAttribute("data-link");
  if (!url) return; // If no URL is set for this slide, do nothing.
  // Navigate the current browser tab to that URL.
  window.location.href = url;
} // End openCurrentPortfolio

// Attach click handlers to elements that sit on top of slides (e.g., buttons or overlays).
// When clicked, they open the portfolio URL for that specific slide.
function hookSlideClicks() {
  slideButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Find the nearest `.slide` ancestor; this is the slide the button belongs to.
      const slide = btn.closest(".slide");
      if (!slide) return; // Defensive check.
      // Read its associated link from `data-link`.
      const url = slide.getAttribute("data-link");
      if (!url) return; // If there is no link configured, do nothing.
      // Navigate to the portfolio in the same tab.
      window.location.href = url;
    });
  });
} // End hookSlideClicks

// Attach click handlers to the dot navigation buttons so users can jump directly to a slide.
function hookDotClicks() {
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      // Each dot stores its target slide index in a `data-index` attribute.
      const i = Number(dot.getAttribute("data-index"));
      goTo(i); // Jump the slider to that index.
      restartAutoplay(); // After a manual action, restart autoplay so timing feels fresh.
    });
  });
} // End hookDotClicks

// Wire up the previous/next arrow buttons to move one slide at a time.
function hookArrowButtons() {
  // Left arrow: go to previous slide.
  prevBtn.addEventListener("click", () => {
    goTo(index - 1);
    restartAutoplay();
  });
  // Right arrow: go to next slide.
  nextBtn.addEventListener("click", () => {
    goTo(index + 1);
    restartAutoplay();
  });
} // End hookArrowButtons

// Add keyboard support so users can control the slider without a mouse.
// - Left/Right arrows move between slides.
// - Enter opens the current portfolio if focus is inside the slider.
function hookKeyboard() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      goTo(index - 1); // Go to previous slide.
      restartAutoplay();
    } else if (e.key === "ArrowRight") {
      goTo(index + 1); // Go to next slide.
      restartAutoplay();
    } else if (e.key === "Enter") {
      // Only trigger when focus is currently somewhere inside the `.slider` component.
      const activeEl = document.activeElement;
      const inSlider =
        activeEl && activeEl.closest && activeEl.closest(".slider");
      if (inSlider) openCurrentPortfolio();
    }
  });
} // End hookKeyboard

// Start automatic slide rotation using `setInterval`, unless the user requests reduced motion.
function startAutoplay() {
  if (prefersReducedMotion) return; // Respect OS/browser preference: no heavy animations.
  stopAutoplay(); // Clear any existing timer before starting a new one.
  autoplayTimer = window.setInterval(() => {
    goTo(index + 1); // Advance to the next slide at each tick.
  }, 4500); // Run every 4.5 seconds.
} // End startAutoplay

// Stop the automatic rotation if it is running.
function stopAutoplay() {
  if (!autoplayTimer) return; // If there is no active timer, nothing to do.
  window.clearInterval(autoplayTimer); // Cancel the interval.
  autoplayTimer = null; // Reset our reference so we know autoplay is off.
} // End stopAutoplay

// Convenience helper to restart autoplay after a user interacts (click/keyboard).
function restartAutoplay() {
  stopAutoplay();
  startAutoplay();
} // End restartAutoplay

// Keep the slider visually aligned when the window is resized (e.g., user rotates phone).
function hookResize() {
  window.addEventListener("resize", () => {
    // Re-run `goTo` for the current index so `translateX` is recalculated
    // using the new viewport width from `getSlideWidth`.
    goTo(index);
  });
} // End hookResize

// Attach basic front-end validation behavior to the contact form:
// - Check name length
// - Check email format
// - Check message length
// and display inline error messages.
function hookContactForm() {
  const form = document.getElementById("contactForm"); // The <form> element.
  const nameEl = document.getElementById("name"); // Text input: visitor name.
  const emailEl = document.getElementById("email"); // Text input: visitor email.
  const msgEl = document.getElementById("message"); // Textarea: visitor message.
  const errName = document.getElementById("errName"); // Span/div to show name errors.
  const errEmail = document.getElementById("errEmail"); // Span/div to show email errors.
  const errMsg = document.getElementById("errMsg"); // Span/div to show message errors.
  const note = document.getElementById("formNote"); // General note area below the form.

  // Small helper that shows/hides an error message and marks the field as valid/invalid.
  function setError(el, errEl, message) {
    errEl.textContent = message; // Place the error text in the UI (or clear it if empty string).
    // ARIA: let assistive tech know whether this field is currently invalid.
    el.setAttribute("aria-invalid", message ? "true" : "false");
  } // End setError

  // Very simple email pattern check: "something@something.something" (not perfect but good enough for demo).
  function isEmailValid(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  } // End isEmailValid

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // For this demo, prevent actual form submission/refresh.
    note.textContent = ""; // Clear any previous note.

    // Read and trim user input values from the fields.
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const msg = msgEl.value.trim();

    let ok = true; // Assume valid until a rule fails.

    // Rule 1: name must be at least 2 characters.
    if (name.length < 2) {
      setError(nameEl, errName, "Please enter your name (min 2 chars).");
      ok = false;
    } else {
      setError(nameEl, errName, "");
    }

    // Rule 2: email must match our simple email pattern.
    if (!isEmailValid(email)) {
      setError(emailEl, errEmail, "Please enter a valid email address.");
      ok = false;
    } else {
      setError(emailEl, errEmail, "");
    }

    // Rule 3: message must be at least 10 characters long.
    if (msg.length < 10) {
      setError(msgEl, errMsg, "Please write a longer message (min 10 chars).");
      ok = false;
    } else {
      setError(msgEl, errMsg, "");
    }

    if (!ok) return; // If any rule failed, do not show success.

    // At this point all checks passed. In a real app, you would send the data to a server.
    note.textContent = "Message validated ✅ (Demo).";
    form.reset(); // Clear all fields so the form feels fresh.
  }); // End submit handler
} // End hookContactForm

// Central initialization function that wires up all behavior for this page.
function init() {
  setYear(); // Keep footer year current.
  hookSlideClicks(); // Make whole slides clickable via overlay buttons.
  hookDotClicks(); // Enable dot navigation.
  hookArrowButtons(); // Enable arrow navigation.
  hookKeyboard(); // Enable keyboard (arrows + Enter).
  hookResize(); // Re-align slider on window resize.
  hookContactForm(); // Enable basic contact form validation.
  goTo(0); // Snap to the first slide on load.
  startAutoplay(); // Begin automatic rotation (unless reduced motion is requested).
} // End init

// Kick off the whole script once this file is loaded.
init();
