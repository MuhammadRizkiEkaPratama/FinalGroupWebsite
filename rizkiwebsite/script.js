// script.js
// This file adds interactivity/animation to the portfolio page.
// Meaning: The HTML/CSS define structure + look; this JS adds behavior (animations, sliders, toggles).
// Constraint: We keep code defensive so removing sections doesn't crash the whole page.

// ===== BACKGROUND (CURSOR ORB) =====
// Meaning: A decorative "orb" element follows the cursor smoothly.
// UX goal: subtle motion / depth, not required for core navigation.

const orb = document.querySelector(".cursor-orb"); // Find the first element matching the CSS selector; returns Element or null.

// "if (orb)" is a guard.
// Meaning: if querySelector returned null (element not on page), we skip this whole feature.
if (orb) {
  // Cursor orb follow (smooth)
  // We keep two positions:
  // - orbX/orbY: current rendered position
  // - targetX/targetY: where we WANT it to go (mouse position)

  let orbX = window.innerWidth * 0.5; // window.innerWidth = viewport width; start at 50% so it appears centered.
  let orbY = window.innerHeight * 0.4; // window.innerHeight = viewport height; 40% is slightly above center.

  let targetX = orbX; // Start target at same point so animation begins stable (no sudden jump).
  let targetY = orbY; // Same idea for Y.

  // Add an event listener (callback) for mouse moves.
  // Meaning: every time the mouse moves, we update the target.
  window.addEventListener("mousemove", (e) => {
    // e is a MouseEvent.
    // clientX/clientY are the cursor coordinates in pixels relative to the viewport.
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Define the animation loop.
  // Meaning: requestAnimationFrame calls this before each repaint (~60fps).
  function animateOrb() {
    // This is a "lerp" style smoothing.
    // (target - current) is the remaining distance.
    // Multiplying by 0.08 moves 8% of the remaining distance per frame.
    orbX += (targetX - orbX) * 0.08;
    orbY += (targetY - orbY) * 0.08;

    // Update the element's inline CSS position.
    // Meaning: the orb element must be positioned (absolute/fixed) in CSS for left/top to work.
    orb.style.left = `${orbX}px`;
    orb.style.top = `${orbY}px`;

    // Schedule the next frame.
    requestAnimationFrame(animateOrb);
  }

  // Start the animation loop once.
  animateOrb();
}


// ===== HERO NAME TYPEWRITER (RIZKI → 李睿祺) =====
// Meaning: The hero name alternates between two strings using a type/delete animation.
// Accessibility: Respects prefers-reduced-motion.

const typeNameEl = document.getElementById("typeName"); // Get element by id; returns HTMLElement or null.

// matchMedia checks a CSS media query from JS.
// prefers-reduced-motion: reduce is set by OS/browser when user wants fewer animations.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const nameSequence = ["RIZKI EKA", "李睿祺"]; // The strings we rotate through.
let nameSeqIndex = 0; // Which string we are on right now (index into nameSequence).
let nameCharIndex = 0; // How many characters we show from the current string.
let nameIsDeleting = false; // State machine: false=typing forward, true=deleting backward.

const TYPE_SPEED = 90; // Delay between adding characters (ms).
const DELETE_SPEED = 95; // Delay between removing characters (ms).
const HOLD_TIME = 4000; // Pause when the full word is shown (ms).

function tickTypewriter() {
  // If the target element doesn't exist, do nothing.
  // Meaning: prevents "Cannot set properties of null" errors.
  if (!typeNameEl) return;

  // If reduced motion is requested, show static text and stop.
  if (prefersReducedMotion) {
    typeNameEl.textContent = nameSequence[0];
    return;
  }

  // Select the full text we are currently typing/deleting.
  const fullText = nameSequence[nameSeqIndex];

  // Update the character index depending on whether we are typing or deleting.
  if (!nameIsDeleting) {
    nameCharIndex += 1;
  } else {
    nameCharIndex -= 1;
  }

  // slice(0, N) gives the first N characters.
  const nextText = fullText.slice(0, nameCharIndex);
  // Write it into the DOM.
  typeNameEl.textContent = nextText;

  // Check boundary conditions.
  const isComplete = nextText === fullText; // We've typed the full string.
  const isEmpty = nextText.length === 0; // We've deleted everything.

  // When complete, switch to deleting and wait.
  if (isComplete) {
    nameIsDeleting = true;
    setTimeout(tickTypewriter, HOLD_TIME);
    return;
  }

  // When empty after deleting, switch to next word and start typing again.
  if (isEmpty && nameIsDeleting) {
    nameIsDeleting = false;
    nameSeqIndex = (nameSeqIndex + 1) % nameSequence.length; // Modulo loops back to 0.
    setTimeout(tickTypewriter, 250);
    return;
  }

  // Normal tick scheduling: pick the delay by state.
  const delay = nameIsDeleting ? DELETE_SPEED : TYPE_SPEED;
  setTimeout(tickTypewriter, delay);
}

// Start the typewriter loop.
tickTypewriter();


// ===== PROJECTS SLIDER (LOOPING + CENTERED) =====
// Meaning: A carousel that centers the active card.
// Technique: clones at both ends + snap after transition to fake infinite looping.

const viewport = document.getElementById("viewport"); // The visible window of the carousel.
const inner = document.getElementById("track"); // The moving track that is translated with CSS transform.
const prevBtn = document.getElementById("prevBtn"); // Prev navigation button.
const nextBtn = document.getElementById("nextBtn"); // Next navigation button.
const dotsEl = document.getElementById("dots"); // Dots container.

const CLONE_COUNT = 1; // Number of slides cloned on each side.
let isAnimating = false; // Lock to prevent rapid clicking during transitions.
let currentIndex = 0; // Index in slides array INCLUDING clones.
let originalCount = 0; // Number of real slides.
let slides = []; // Actual slide elements currently in the DOM.

function getGapPx() {
  // getComputedStyle returns the final computed CSS values.
  // inner must exist; in this project, HTML ensures it.
  const gap = getComputedStyle(inner).gap; // Usually a string like "18px".
  return parseFloat(gap || "0"); // Convert "18px" -> 18.
}

function setActiveClass() {
  // Remove active class from all slides.
  slides.forEach((s) => s.classList.remove("is-active"));
  // Add active class to current slide (if it exists).
  if (slides[currentIndex]) slides[currentIndex].classList.add("is-active");
}

function logicalIndex() {
  // Convert clone-inclusive index into real index.
  // We subtract CLONE_COUNT (because first real slide starts after clones).
  // We add originalCount before modulo to avoid negative values.
  return (currentIndex - CLONE_COUNT + originalCount) % originalCount;
}

function buildDots() {
  // Clear any existing dots first.
  dotsEl.innerHTML = "";

  // Make one dot per real slide.
  for (let i = 0; i < originalCount; i++) {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to project ${i + 1}`);
    dot.addEventListener("click", () => goToReal(i));
    dotsEl.appendChild(dot);
  }

  // After building, update which dot is active.
  updateDots();
}

function updateDots() {
  // Query dots and make an array to iterate.
  const dots = Array.from(dotsEl.querySelectorAll(".dot"));
  // Find which real slide is active.
  const active = logicalIndex();
  // Toggle the .active class.
  dots.forEach((d, i) => d.classList.toggle("active", i === active));
}

function centerToIndex(idx, animate = true) {
  // gap is not used directly in the centering formula right now,
  // but leaving it is helpful if you later adjust spacing logic.
  const gap = getGapPx();

  // Pick the slide element.
  const slide = slides[idx];
  if (!slide) return;

  // Read layout metrics from DOM.
  const viewportW = viewport.getBoundingClientRect().width;
  const slideW = slide.getBoundingClientRect().width;
  const slideLeft = slide.offsetLeft;

  // Compute transform so slide center aligns with viewport center.
  const targetX = (viewportW / 2) - (slideW / 2) - slideLeft;

  // Decide whether we animate.
  inner.style.transition = animate
    ? "transform 520ms cubic-bezier(.2,.8,.2,1)"
    : "none";

  // Apply the translateX to the track.
  inner.style.transform = `translateX(${targetX}px)`;

  // Update state.
  currentIndex = idx;

  // Sync UI.
  setActiveClass();
  updateDots();
}

function rebuildSlidesWithClones() {
  // Get the real slides currently present.
  const originals = Array.from(inner.querySelectorAll(".projectCard"));
  originalCount = originals.length;

  // Clone last N slides for the left side.
  const before = originals.slice(-CLONE_COUNT).map((s) => s.cloneNode(true));
  // Clone first N slides for the right side.
  const after = originals.slice(0, CLONE_COUNT).map((s) => s.cloneNode(true));

  // Clear track.
  inner.innerHTML = "";
  // Insert left clones.
  before.forEach((c) => inner.appendChild(c));
  // Insert real slides.
  originals.forEach((s) => inner.appendChild(s));
  // Insert right clones.
  after.forEach((c) => inner.appendChild(c));

  // Refresh slides array.
  slides = Array.from(inner.querySelectorAll(".projectCard"));
  // Start at first real slide.
  currentIndex = CLONE_COUNT;
}

function snapIfNeeded() {
  // If we moved beyond the last real slide, we're on the right clone.
  if (currentIndex >= CLONE_COUNT + originalCount) {
    centerToIndex(CLONE_COUNT, false);
  }

  // If we moved before the first real slide, we're on the left clone.
  if (currentIndex < CLONE_COUNT) {
    centerToIndex(CLONE_COUNT + originalCount - 1, false);
  }
}

function slideBy(dir) {
  // dir should be -1 or +1.
  if (isAnimating) return;
  isAnimating = true;
  centerToIndex(currentIndex + dir, true);
}

function goToReal(realIdx) {
  if (isAnimating) return;
  isAnimating = true;
  centerToIndex(CLONE_COUNT + realIdx, true);
}

// When the CSS transition ends, we can safely snap and unlock.
inner.addEventListener("transitionend", () => {
  snapIfNeeded();
  isAnimating = false;
});

// Hook up button clicks.
prevBtn.addEventListener("click", () => slideBy(-1));
nextBtn.addEventListener("click", () => slideBy(1));

// On resize, re-center the current slide (no animation).
window.addEventListener("resize", () => {
  centerToIndex(currentIndex, false);
});

// Init slider.
rebuildSlidesWithClones();
buildDots();
centerToIndex(currentIndex, false);


// ===== OFFER (COLLAPSE / EXPAND CARDS) =====
// Meaning: The arrow button toggles showing/hiding the card body.
// Mechanism: toggle CSS class "is-open" and let CSS transitions handle visuals.

document.querySelectorAll("[data-offer-toggle]").forEach((btn) => {
  // Find the offer card this button belongs to.
  const card = btn.closest(".offerCard");
  if (!card) return;

  function syncOfferButton() {
    // isOpen describes the current state.
    const isOpen = card.classList.contains("is-open");
    // Update arrow icon.
    btn.textContent = isOpen ? "↑" : "↓";
    // Update ARIA state for assistive technologies.
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.setAttribute("aria-label", isOpen ? "Collapse card" : "Expand card");
  }

  // Initial sync so UI matches default HTML state.
  syncOfferButton();

  // Toggle on click.
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    card.classList.toggle("is-open");
    syncOfferButton();
  });
});


// ===== CONTACT (COPY EMAIL) =====
// Meaning: Clicking a button copies the email text to clipboard.

const emailValueEl = document.getElementById("emailValue");
const copyBtn = document.getElementById("copyEmailBtn");
const copyText = document.getElementById("copyEmailText");

// Only attach click handler if all required elements exist.
if (copyBtn && emailValueEl && copyText) {
  copyBtn.addEventListener("click", async () => {
    const email = emailValueEl.textContent.trim();

    try {
      // Clipboard API typically requires HTTPS/localhost.
      await navigator.clipboard.writeText(email);
      copyText.textContent = "Email copied ✓";
      setTimeout(() => (copyText.textContent = "Copy Email"), 1300);
    } catch (e) {
      copyText.textContent = "Copy failed";
      setTimeout(() => (copyText.textContent = "Copy Email"), 1300);
    }
  });
}


// ===== FOOTER (YEAR) =====
// Meaning: Auto-updates the year in the footer so you don't need to edit it every year.

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
