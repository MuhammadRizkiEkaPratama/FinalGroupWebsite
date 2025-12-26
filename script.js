"use strict"; // Enforce safer JS rules

const slidesEl = document.getElementById("slides"); // Slider track element
const prevBtn = document.getElementById("prevBtn"); // Previous button
const nextBtn = document.getElementById("nextBtn"); // Next button
const dots = Array.from(document.querySelectorAll(".dot")); // Dot buttons list
const slideButtons = Array.from(document.querySelectorAll(".slide-hit")); // Clickable slide buttons
const yearEl = document.getElementById("year"); // Footer year span
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; // Check motion preference

let index = 0; // Current slide index
let autoplayTimer = null; // Autoplay timer holder

function getSlideWidth() { // Get the viewport width for one slide
  const viewport = slidesEl && slidesEl.parentElement; // .slider-viewport
  const w = viewport ? viewport.clientWidth : 0; // Read width
  return w > 0 ? w : 1; // Avoid 0-width math
} // End getSlideWidth

function setYear() { // Set footer year
  yearEl.textContent = String(new Date().getFullYear()); // Insert current year text
} // End setYear

function clampIndex(i) { // Keep index within bounds
  const max = dots.length - 1; // Last index
  if (i < 0) return max; // Wrap to end
  if (i > max) return 0; // Wrap to start
  return i; // Valid index
} // End clampIndex

function updateDots() { // Update dot active state
  dots.forEach((d, i) => { // Loop dots
    const active = i === index; // Determine active dot
    d.classList.toggle("is-active", active); // Toggle active class
    d.setAttribute("aria-selected", active ? "true" : "false"); // Update aria state
  }); // End loop
} // End updateDots

function goTo(i) { // Go to slide by index
  index = clampIndex(i); // Wrap index
  const w = getSlideWidth(); // Slide width in px
  slidesEl.style.transform = `translateX(-${index * w}px)`; // Move track
  updateDots(); // Sync dots
} // End goTo

function openCurrentPortfolio() { // Open portfolio for the current slide
  const slide = slidesEl.children[index]; // Get current slide element
  const url = slide.getAttribute("data-link"); // Read portfolio URL
  if (!url) return; // Guard if missing
  window.open(url, "_blank", "noopener"); // Open safely in new tab
} // End openCurrentPortfolio

function hookSlideClicks() { // Attach click handlers to slide buttons
  slideButtons.forEach((btn) => { // Loop slide buttons
    btn.addEventListener("click", () => { // On click
      const slide = btn.closest(".slide"); // Find parent slide
      const url = slide.getAttribute("data-link"); // Read link
      if (!url) return; // Guard
      window.open(url, "_blank", "noopener"); // Open in new tab
    }); // End click handler
  }); // End loop
} // End hookSlideClicks

function hookDotClicks() { // Attach dot click handlers
  dots.forEach((dot) => { // Loop dots
    dot.addEventListener("click", () => { // On click
      const i = Number(dot.getAttribute("data-index")); // Read index
      goTo(i); // Jump to slide
      restartAutoplay(); // Keep autoplay feeling consistent
    }); // End handler
  }); // End loop
} // End hookDotClicks

function hookArrowButtons() { // Attach arrow button handlers
  prevBtn.addEventListener("click", () => { // Prev click
    goTo(index - 1); // Move back
    restartAutoplay(); // Restart autoplay
  }); // End prev click
  nextBtn.addEventListener("click", () => { // Next click
    goTo(index + 1); // Move forward
    restartAutoplay(); // Restart autoplay
  }); // End next click
} // End hookArrowButtons

function hookKeyboard() { // Keyboard support for slider
  window.addEventListener("keydown", (e) => { // Listen on window
    if (e.key === "ArrowLeft") { // Left arrow
      goTo(index - 1); // Previous slide
      restartAutoplay(); // Restart autoplay
    } else if (e.key === "ArrowRight") { // Right arrow
      goTo(index + 1); // Next slide
      restartAutoplay(); // Restart autoplay
    } else if (e.key === "Enter") { // Enter key
      const activeEl = document.activeElement; // Current focused element
      const inSlider = activeEl && activeEl.closest && activeEl.closest(".slider"); // Check if focus is within slider
      if (inSlider) openCurrentPortfolio(); // Open current portfolio when inside slider
    } // End enter case
  }); // End keydown listener
} // End hookKeyboard

function startAutoplay() { // Start autoplay rotation
  if (prefersReducedMotion) return; // Respect reduced motion
  stopAutoplay(); // Ensure no duplicate timers
  autoplayTimer = window.setInterval(() => { // Create interval
    goTo(index + 1); // Move to next
  }, 4500); // Every 4.5 seconds
} // End startAutoplay

function stopAutoplay() { // Stop autoplay rotation
  if (!autoplayTimer) return; // Guard
  window.clearInterval(autoplayTimer); // Clear interval
  autoplayTimer = null; // Reset
} // End stopAutoplay

function restartAutoplay() { // Restart autoplay after manual action
  stopAutoplay(); // Stop current timer
  startAutoplay(); // Start again
} // End restartAutoplay

function hookResize() { // Keep slide alignment on resize
  window.addEventListener("resize", () => { // On viewport resize
    goTo(index); // Re-apply current index with new width
  }); // End resize listener
} // End hookResize

function hookContactForm() { // Basic front-end form validation
  const form = document.getElementById("contactForm"); // Form element
  const nameEl = document.getElementById("name"); // Name input
  const emailEl = document.getElementById("email"); // Email input
  const msgEl = document.getElementById("message"); // Message textarea
  const errName = document.getElementById("errName"); // Name error
  const errEmail = document.getElementById("errEmail"); // Email error
  const errMsg = document.getElementById("errMsg"); // Message error
  const note = document.getElementById("formNote"); // Form note

  function setError(el, errEl, message) { // Helper to show/hide errors
    errEl.textContent = message; // Set error text
    el.setAttribute("aria-invalid", message ? "true" : "false"); // Set aria invalid
  } // End setError

  function isEmailValid(v) { // Email validator
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Simple email regex
  } // End isEmailValid

  form.addEventListener("submit", (e) => { // Handle submit
    e.preventDefault(); // Prevent real submit (demo)
    note.textContent = ""; // Clear note

    const name = nameEl.value.trim(); // Read name
    const email = emailEl.value.trim(); // Read email
    const msg = msgEl.value.trim(); // Read message

    let ok = true; // Validation flag

    if (name.length < 2) { // Validate name length
      setError(nameEl, errName, "Please enter your name (min 2 chars)."); // Show error
      ok = false; // Mark invalid
    } else { // Valid name
      setError(nameEl, errName, ""); // Clear error
    } // End name check

    if (!isEmailValid(email)) { // Validate email format
      setError(emailEl, errEmail, "Please enter a valid email address."); // Show error
      ok = false; // Mark invalid
    } else { // Valid email
      setError(emailEl, errEmail, ""); // Clear error
    } // End email check

    if (msg.length < 10) { // Validate message length
      setError(msgEl, errMsg, "Please write a longer message (min 10 chars)."); // Show error
      ok = false; // Mark invalid
    } else { // Valid message
      setError(msgEl, errMsg, ""); // Clear error
    } // End message check

    if (!ok) return; // Stop if invalid

    note.textContent = "Message validated ✅ (Demo). Connect this to a backend to actually send."; // Success note
    form.reset(); // Clear form fields
  }); // End submit handler
} // End hookContactForm

function init() { // Initialize everything
  setYear(); // Set footer year
  hookSlideClicks(); // Make slides clickable
  hookDotClicks(); // Enable dot navigation
  hookArrowButtons(); // Enable arrow navigation
  hookKeyboard(); // Enable keyboard controls
  hookResize(); // Keep slider aligned on resize
  hookContactForm(); // Enable form validation
  goTo(0); // Start at first slide
  startAutoplay(); // Start autoplay (if allowed)
} // End init

init(); // Run initialization
