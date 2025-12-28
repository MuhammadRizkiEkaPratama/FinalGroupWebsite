// script.js

const yearEl = document.getElementById("year"); // Gets the year element
yearEl.textContent = new Date().getFullYear(); // Sets current year dynamically

const emailValueEl = document.getElementById("emailValue"); // Gets the email text element
const copyBtn = document.getElementById("copyEmailBtn"); // Gets copy button
const copyText = document.getElementById("copyEmailText"); // Gets copy label text

const resumeBtn = document.getElementById("resumeBtn"); // Gets navbar resume button
const aboutResumeBtn = document.getElementById("aboutResumeBtn"); // Gets about resume button

const orb = document.querySelector(".cursor-orb"); // Gets cursor orb element


// ===== PROJECTS SLIDER (LOOPING + CENTERED) =====

const viewport = document.getElementById("viewport"); // Gets the viewport element
const inner = document.getElementById("track"); // Gets the inner track element
const prevBtn = document.getElementById("prevBtn"); // Gets previous button
const nextBtn = document.getElementById("nextBtn"); // Gets next button
const dotsEl = document.getElementById("dots"); // Gets dots container

const CLONE_COUNT = 2; // Number of clones on each side for smooth looping
let isAnimating = false; // Locks clicks while sliding
let currentIndex = 0; // Current index in the "all slides" array (includes clones)
let originalCount = 0; // Number of real slides
let slides = []; // All slides including clones

function getGapPx() { // Reads the flex gap value in pixels
  const gap = getComputedStyle(inner).gap; // Gets gap (like "18px")
  return parseFloat(gap || "0"); // Converts to number
} // End getGapPx

function setActiveClass() { // Adds .is-active to the center slide
  slides.forEach((s) => s.classList.remove("is-active")); // Removes active class from all slides
  if (slides[currentIndex]) slides[currentIndex].classList.add("is-active"); // Adds active to current
} // End setActiveClass

function logicalIndex() { // Converts currentIndex (with clones) to real index (0..originalCount-1)
  return (currentIndex - CLONE_COUNT + originalCount) % originalCount; // Wraps using modulo
} // End logicalIndex

function buildDots() { // Creates dots based on real slides only
  dotsEl.innerHTML = ""; // Clears dots
  for (let i = 0; i < originalCount; i++) { // Loops through real slides count
    const dot = document.createElement("button"); // Creates dot button
    dot.className = "dot"; // Adds dot class
    dot.type = "button"; // Sets type
    dot.setAttribute("aria-label", `Go to project ${i + 1}`); // Accessibility label
    dot.addEventListener("click", () => goToReal(i)); // Clicking dot goes to slide
    dotsEl.appendChild(dot); // Adds dot to dots container
  } // Ends loop
  updateDots(); // Updates active dot state
} // End buildDots

function updateDots() { // Updates active dot
  const dots = Array.from(dotsEl.querySelectorAll(".dot")); // Gets dot list
  const active = logicalIndex(); // Gets active real index
  dots.forEach((d, i) => d.classList.toggle("active", i === active)); // Toggles active
} // End updateDots

function centerToIndex(idx, animate = true) { // Centers a given slide index in viewport
  const gap = getGapPx(); // Gets gap size
  const slide = slides[idx]; // Gets slide
  if (!slide) return; // Stops if not found

  const viewportW = viewport.getBoundingClientRect().width; // Gets viewport width
  const slideW = slide.getBoundingClientRect().width; // Gets slide width
  const slideLeft = slide.offsetLeft; // Gets slide position inside inner

  const targetX = (viewportW / 2) - (slideW / 2) - slideLeft; // Compute translateX so slide centers

  inner.style.transition = animate
    ? "transform 520ms cubic-bezier(.2,.8,.2,1)" // Smooth slide
    : "none"; // No animation (for snap resets)

  inner.style.transform = `translateX(${targetX}px)`; // Applies transform
  currentIndex = idx; // Updates currentIndex
  setActiveClass(); // Updates active card class
  updateDots(); // Updates dots
} // End centerToIndex

function rebuildSlidesWithClones() { // Creates clones for infinite loop
  const originals = Array.from(inner.querySelectorAll(".projectCard")); // Gets real slides
  originalCount = originals.length; // Saves real slide count

  const before = originals.slice(-CLONE_COUNT).map((s) => s.cloneNode(true)); // Clones last slides
  const after = originals.slice(0, CLONE_COUNT).map((s) => s.cloneNode(true)); // Clones first slides

  inner.innerHTML = ""; // Clears inner track
  before.forEach((c) => inner.appendChild(c)); // Adds clones at start
  originals.forEach((s) => inner.appendChild(s)); // Adds real slides
  after.forEach((c) => inner.appendChild(c)); // Adds clones at end

  slides = Array.from(inner.querySelectorAll(".projectCard")); // Updates slides list
  currentIndex = CLONE_COUNT; // Starts at first real slide (after clones)
} // End rebuildSlidesWithClones

function snapIfNeeded() { // Snaps index when reaching clone edges
  if (currentIndex >= CLONE_COUNT + originalCount) { // If moved past last real into clones
    centerToIndex(CLONE_COUNT, false); // Snap back to first real (no animation)
  } // End if

  if (currentIndex < CLONE_COUNT) { // If moved before first real into clones
    centerToIndex(CLONE_COUNT + originalCount - 1, false); // Snap to last real (no animation)
  } // End if
} // End snapIfNeeded

function slideBy(dir) { // Slides left/right by 1
  if (isAnimating) return; // Prevent spam clicks
  isAnimating = true; // Locks animation
  centerToIndex(currentIndex + dir, true); // Moves to next/prev slide with animation
} // End slideBy

function goToReal(realIdx) { // Goes to a real slide index (0..originalCount-1)
  if (isAnimating) return; // Prevent spam clicks
  isAnimating = true; // Locks animation
  centerToIndex(CLONE_COUNT + realIdx, true); // Maps to internal index
} // End goToReal

inner.addEventListener("transitionend", () => { // Fires when sliding animation ends
  snapIfNeeded(); // Snaps if we're in clone region
  isAnimating = false; // Unlocks sliding
}); // End transitionend

prevBtn.addEventListener("click", () => slideBy(-1)); // Prev button
nextBtn.addEventListener("click", () => slideBy(1)); // Next button

window.addEventListener("resize", () => { // Re-centers on resize
  centerToIndex(currentIndex, false); // Re-center without animation
}); // End resize

// Init slider
rebuildSlidesWithClones(); // Builds clones + updates slides
buildDots(); // Builds dots
centerToIndex(currentIndex, false); // Centers first real slide (no animation)

copyBtn.addEventListener("click", async () => { // Copy email click handler
  const email = emailValueEl.textContent.trim(); // Reads email text
  try { // Starts try block
    await navigator.clipboard.writeText(email); // Copies email to clipboard
    copyText.textContent = "Email copied ✓"; // Updates button text
    setTimeout(() => (copyText.textContent = "Copy Email"), 1300); // Resets text later
  } catch (e) { // If clipboard fails
    copyText.textContent = "Copy failed"; // Shows failure
    setTimeout(() => (copyText.textContent = "Copy Email"), 1300); // Resets text later
  } // Ends catch
}); // Ends copy handler

function openResume() { // Function to open resume
  // Replace this with your real resume link:
  window.open("assets/resume.pdf", "_blank", "noopener,noreferrer"); // Opens resume in new tab
} // Ends openResume

resumeBtn.addEventListener("click", openResume); // Opens resume from navbar
aboutResumeBtn.addEventListener("click", openResume); // Opens resume from about section

document.querySelectorAll("[data-scroll]").forEach((btn) => { // Finds all scroll-to buttons
  btn.addEventListener("click", () => { // Adds click handler
    const target = btn.getAttribute("data-scroll"); // Reads target selector
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }); // Scrolls smoothly
  }); // Ends click handler
}); // Ends loop

// Cursor orb follow (smooth)
let orbX = window.innerWidth * 0.5; // Starting x
let orbY = window.innerHeight * 0.4; // Starting y
let targetX = orbX; // Target x
let targetY = orbY; // Target y

window.addEventListener("mousemove", (e) => { // Tracks mouse movement
  targetX = e.clientX; // Sets target x
  targetY = e.clientY; // Sets target y
}); // Ends mousemove

function animateOrb() { // Animation loop
  orbX += (targetX - orbX) * 0.08; // Smoothly interpolate x
  orbY += (targetY - orbY) * 0.08; // Smoothly interpolate y
  orb.style.left = `${orbX}px`; // Applies x position
  orb.style.top = `${orbY}px`; // Applies y position
  requestAnimationFrame(animateOrb); // Loops animation
} // Ends animateOrb
animateOrb(); // Starts orb animation
