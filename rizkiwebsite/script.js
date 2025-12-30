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
  let orbY = window.innerHeight * -1; // window.innerHeight = viewport height; 40% is slightly above center.

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
    orbX += (targetX - orbX) * 1;
    orbY += (targetY - orbY) * 1;

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

const CLONE_COUNT = 1; // How many slides we duplicate on each side (for fake infinite loop).
let isAnimating = false; // True while a slide transition is running (prevents double clicks).
let currentIndex = 0; // The index of the "currently centered" slide (including clones).
let originalCount = 0; // How many real (non-cloned) slides exist in the carousel.
let slides = []; // Live array of all slide elements currently inside `inner` (real + clones).

// Helper: read the `gap` between slides (defined in CSS) and return it as a number of pixels.
function getGapPx() {
  // `getComputedStyle` asks the browser: "after all CSS is applied, what are the final styles?".
  // Here we only care about the `gap` property on the flex/inline grid container `inner`.
  const gap = getComputedStyle(inner).gap; // Example output string: "18px".
  // `parseFloat` pulls out the numeric part ("18px" -> 18). If gap is empty/null, fall back to 0.
  return parseFloat(gap || "0");
}

// Visually mark the active (centered) slide using the `.is-active` CSS class.
function setActiveClass() {
  // First remove `.is-active` from every slide so we start clean.
  slides.forEach((s) => s.classList.remove("is-active"));
  // Then add `.is-active` only to the slide at `currentIndex` (if it exists).
  if (slides[currentIndex]) slides[currentIndex].classList.add("is-active");
}

// Convert the current clone-aware index into a logical index in the range [0, originalCount).
function logicalIndex() {
  // Explanation: the `slides` array looks like [cloneLast, real0, real1, ..., cloneFirst].
  // - `CLONE_COUNT` real slides are shifted to the right because of leading clones.
  // - We add `originalCount` before `% originalCount` so the result is never negative.
  return (currentIndex - CLONE_COUNT + originalCount) % originalCount;
}

// Build the dot navigation UI under the carousel (one dot for each real project).
function buildDots() {
  // Remove any dots that may already exist (e.g., after rebuilding slides).
  dotsEl.innerHTML = "";

  // For every real slide, create one <button> that lets the user jump directly to it.
  for (let i = 0; i < originalCount; i++) {
    const dot = document.createElement("button"); // Create a new button element in memory.
    dot.className = "dot"; // Give it the styling hook class.
    dot.type = "button"; // Explicit type so it doesn't act as a form submitter.
    // ARIA label: tells screen readers which project this dot will go to.
    dot.setAttribute("aria-label", `Go to project ${i + 1}`);
    // When the user clicks a dot, jump to the corresponding real slide index.
    dot.addEventListener("click", () => goToReal(i));
    // Finally, add the dot to the visual dots container in the DOM.
    dotsEl.appendChild(dot);
  }

  // Once all dots exist, set the correct one as `.active` based on the current slide.
  updateDots();
}

// Update which dot is visually highlighted as "current".
function updateDots() {
  // Collect all existing dot buttons into an array so we can loop over them easily.
  const dots = Array.from(dotsEl.querySelectorAll(".dot"));
  // Determine which real slide index is currently centered (0..originalCount-1).
  const active = logicalIndex();
  // For each dot, toggle the `.active` class depending on whether it's the active one.
  dots.forEach((d, i) => d.classList.toggle("active", i === active));
}

// Core positioning function: center the slide at `idx` inside the viewport.
function centerToIndex(idx, animate = true) {
  // Right now `gap` is not used in the math, but we keep it so
  // we can later adjust spacing/centering logic without rewriting the function.
  const gap = getGapPx();

  // Find the slide element we want to center.
  const slide = slides[idx];
  if (!slide) return; // Defensive: if index is invalid, exit silently.

  // Measure the width of the viewport area that shows slides.
  const viewportW = viewport.getBoundingClientRect().width;
  // Measure the width of the target slide itself.
  const slideW = slide.getBoundingClientRect().width;
  // `offsetLeft` is the distance (in px) from the left edge of `inner` to this slide.
  const slideLeft = slide.offsetLeft;

  // Compute how much we need to shift the track (inner) so this slide is exactly centered.
  // Formula: center of viewport (viewportW/2) minus center of slide (slideLeft + slideW/2).
  const targetX = (viewportW / 2) - (slideW / 2) - slideLeft;

  // Decide whether the movement should be animated or jump instantly.
  inner.style.transition = animate
    ? "transform 520ms cubic-bezier(.2,.8,.2,1)" // Smooth animation curve.
    : "none"; // No transition = instant reposition (used on resize/snap).

  // Apply the translation to the whole track so that the chosen slide moves to center.
  inner.style.transform = `translateX(${targetX}px)`;

  // Remember which slide index is now considered the current one.
  currentIndex = idx;

  // Keep visual state in sync: highlight correct slide and correct dot.
  setActiveClass();
  updateDots();
}

// Rebuild the slides inside the track, adding clones to both ends for the looping effect.
function rebuildSlidesWithClones() {
  // Grab all current real project cards inside the track.
  const originals = Array.from(inner.querySelectorAll(".projectCard"));
  originalCount = originals.length; // Store how many genuine slides we have.

  // Create clones of the last N real slides and use them as leading slides on the left.
  const before = originals.slice(-CLONE_COUNT).map((s) => s.cloneNode(true));
  // Create clones of the first N real slides and append them on the right.
  const after = originals.slice(0, CLONE_COUNT).map((s) => s.cloneNode(true));

  // Wipe the track clean before we rebuild it in the desired order.
  inner.innerHTML = "";
  // First append the left-side clones (simulate slides that came before the first real slide).
  before.forEach((c) => inner.appendChild(c));
  // Then append all real slides in natural order.
  originals.forEach((s) => inner.appendChild(s));
  // Finally append the right-side clones (simulate slides coming after the last real slide).
  after.forEach((c) => inner.appendChild(c));

  // Refresh our `slides` array so it reflects the new DOM structure (clones + reals).
  slides = Array.from(inner.querySelectorAll(".projectCard"));
  // Set the current index to the first real slide (right after the left clones).
  currentIndex = CLONE_COUNT;
}

// After every animated move we may have landed on a clone; this snaps us back to the real slide.
function snapIfNeeded() {
  // Case 1: we went past the last real slide and landed in the right-side clone area.
  if (currentIndex >= CLONE_COUNT + originalCount) {
    // Jump back (without animation) to the first real slide that visually matches.
    centerToIndex(CLONE_COUNT, false);
  }

  // Case 2: we went before the first real slide and landed in the left-side clone area.
  if (currentIndex < CLONE_COUNT) {
    // Jump (without animation) to the last real slide that visually matches.
    centerToIndex(CLONE_COUNT + originalCount - 1, false);
  }
}

// Move the carousel by one step left or right (dir = -1 for prev, +1 for next).
function slideBy(dir) {
  // If an animation is already in progress, ignore this request to avoid glitches.
  if (isAnimating) return;
  isAnimating = true; // Lock until the CSS transition finishes.
  centerToIndex(currentIndex + dir, true); // Move to the neighbor slide with animation.
}

// Jump directly to a real slide by its logical index (0..originalCount-1).
function goToReal(realIdx) {
  if (isAnimating) return; // Again, ignore while locked.
  isAnimating = true;
  // Convert logical index to the actual index in the `slides` array (accounting for clones).
  centerToIndex(CLONE_COUNT + realIdx, true);
}

// When the CSS `transform` transition on the track finishes, clean up and snap if needed.
inner.addEventListener("transitionend", () => {
  snapIfNeeded(); // If we ended up on a clone, jump to the equivalent real slide.
  isAnimating = false; // Unlock navigation buttons and dot clicks.
});

// Wire up the previous/next buttons so they slide the carousel when clicked.
prevBtn.addEventListener("click", () => slideBy(-1)); // Move one slide to the left.
nextBtn.addEventListener("click", () => slideBy(1)); // Move one slide to the right.

// If the window size changes, re-center the current slide without animation
// so the carousel still looks properly aligned on the new width.
window.addEventListener("resize", () => {
  centerToIndex(currentIndex, false);
});

// Initial setup sequence for the slider:
rebuildSlidesWithClones(); // 1) Build DOM structure: clones + real slides in correct order.
buildDots(); // 2) Build dot navigation based on the real slide count.
centerToIndex(currentIndex, false); // 3) Center on the initial slide without animation.


// ===== OFFER (COLLAPSE / EXPAND CARDS) =====
// What this section is for:
// - Each "offer" card has a header and a body.
// - A small arrow button (with attribute `data-offer-toggle`) lets the user
//   show or hide the body content.
// - We don't do the animation manually in JS; instead we just toggle
//   the `.is-open` CSS class and let CSS transitions handle the visual effect.

document.querySelectorAll("[data-offer-toggle]").forEach((btn) => {
  // For each toggle button, find the nearest parent element with class `.offerCard`.
  // This is the card whose visibility will be controlled by this button.
  const card = btn.closest(".offerCard");
  if (!card) return; // Defensive: if structure is unexpected, skip this button.

  // Keep the visual state of the button (arrow + ARIA attributes) in sync with the card state.
  function syncOfferButton() {
    // `isOpen` is true when the card is currently expanded (has class `.is-open`).
    const isOpen = card.classList.contains("is-open");
    // Change the arrow direction: up arrow when open, down arrow when closed.
    btn.textContent = isOpen ? "↑" : "↓";
    // `aria-expanded` tells screen readers whether the extra content is currently visible.
    btn.setAttribute("aria-expanded", String(isOpen));
    // `aria-label` gives an accessible text description of what the button will do on press.
    btn.setAttribute("aria-label", isOpen ? "Collapse card" : "Expand card");
  }

  // Run once on load so that the arrow + ARIA state matches the initial HTML class state.
  syncOfferButton();

  // When the user clicks the arrow button, toggle open/closed state of this card.
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default button behavior (e.g., if inside a link/form).
    // Toggle the `.is-open` class: if it was present, remove it; otherwise add it.
    card.classList.toggle("is-open");
    // After toggling, make sure the arrow icon and ARIA attributes match the new state.
    syncOfferButton();
  });
});


// ===== CONTACT (COPY EMAIL) =====
// What this section is for:
// - Provide a "Copy Email" button that copies the visible email text to the clipboard.
// - Show short feedback text so the user knows whether copying succeeded or failed.

// Reference to the element that contains the actual email address text.
const emailValueEl = document.getElementById("emailValue");
// Reference to the button that the user clicks to start the copy action.
const copyBtn = document.getElementById("copyEmailBtn");
// Reference to the small status text ("Copy Email", "Email copied", etc.).
const copyText = document.getElementById("copyEmailText");

// Only attach the handler if *all* three elements exist in the DOM.
// This makes the script safe to reuse on pages that might not have the contact section.
if (copyBtn && emailValueEl && copyText) {
  copyBtn.addEventListener("click", async () => {
    // Get the email string from the DOM and trim whitespace (just in case).
    const email = emailValueEl.textContent.trim();

    try {
      // Use the modern Clipboard API to write the email string.
      // Note: most browsers only allow this on HTTPS sites or localhost for security.
      await navigator.clipboard.writeText(email);
      // If no error was thrown, show a short success message to the user.
      copyText.textContent = "Email copied ✓";
      // After a short delay, restore the original helper text.
      setTimeout(() => (copyText.textContent = "Copy Email"), 1300);
    } catch (e) {
      // If something goes wrong (API unsupported, permission denied, etc.),
      // show a failure message instead so the user is not confused.
      copyText.textContent = "Copy failed";
      // And again, restore the original helper text after a short delay.
      setTimeout(() => (copyText.textContent = "Copy Email"), 1300);
    }
  });
}


// ===== FOOTER (YEAR) =====
// What this section is for:
// - Automatically keep the copyright year in the footer
//   up to date, without needing to edit HTML every year.

// Grab the span or element that should display the year.
const yearEl = document.getElementById("year");
// If present, replace its text with the numeric year from the user's current date.
if (yearEl) yearEl.textContent = new Date().getFullYear();
