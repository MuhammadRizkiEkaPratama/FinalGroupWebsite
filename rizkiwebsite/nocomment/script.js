

// ===== BACKGROUND (CURSOR ORB) =====

const orb = document.querySelector(".cursor-orb"); 

if (orb) { 
  
  let orbX = window.innerWidth * 0.5; 
  let orbY = window.innerHeight * 0.4; 
  let targetX = orbX; 
  let targetY = orbY; 

  window.addEventListener("mousemove", (e) => { 
    targetX = e.clientX; 
    targetY = e.clientY; 
  }); 

  function animateOrb() { 
    orbX += (targetX - orbX) * 0.08; 
    orbY += (targetY - orbY) * 0.08; 
    orb.style.left = `${orbX}px`; 
    orb.style.top = `${orbY}px`; 
    requestAnimationFrame(animateOrb); 
  } 
  animateOrb(); 
} 


// ===== HEADER / NAV =====


// ===== HERO NAME TYPEWRITER (RIZKI → 李睿祺) =====

const typeNameEl = document.getElementById("typeName"); 

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; 

const nameSequence = ["RIZKI EKA", "李睿祺"]; 
let nameSeqIndex = 0; 
let nameCharIndex = 0; 
let nameIsDeleting = false; 

const TYPE_SPEED = 90; 
const DELETE_SPEED = 95; 
const HOLD_TIME = 4000; 

function tickTypewriter() { 
  if (!typeNameEl) return; 
  if (prefersReducedMotion) { 
    typeNameEl.textContent = nameSequence[0]; 
    return; 
  } 

  const fullText = nameSequence[nameSeqIndex]; 

  if (!nameIsDeleting) { 
    nameCharIndex += 1; 
  } else { 
    nameCharIndex -= 1; 
  } 

  const nextText = fullText.slice(0, nameCharIndex); 
  typeNameEl.textContent = nextText; 

  const isComplete = nextText === fullText; 
  const isEmpty = nextText.length === 0; 

  if (isComplete) { 
    nameIsDeleting = true; 
    setTimeout(tickTypewriter, HOLD_TIME); 
    return; 
  } 

  if (isEmpty && nameIsDeleting) { 
    nameIsDeleting = false; 
    nameSeqIndex = (nameSeqIndex + 1) % nameSequence.length; 
    setTimeout(tickTypewriter, 250); 
    return; 
  } 

  const delay = nameIsDeleting ? DELETE_SPEED : TYPE_SPEED; 
  setTimeout(tickTypewriter, delay); 
} 

tickTypewriter(); 


// ===== PROJECTS SLIDER (LOOPING + CENTERED) =====

const viewport = document.getElementById("viewport"); 
const inner = document.getElementById("track"); 
const prevBtn = document.getElementById("prevBtn"); 
const nextBtn = document.getElementById("nextBtn"); 
const dotsEl = document.getElementById("dots"); 

const CLONE_COUNT = 1; 
let isAnimating = false; 
let currentIndex = 0; 
let originalCount = 0; 
let slides = []; 

function getGapPx() { 
  const gap = getComputedStyle(inner).gap; 
  return parseFloat(gap || "0"); 
} 

function setActiveClass() { 
  slides.forEach((s) => s.classList.remove("is-active")); 
  if (slides[currentIndex]) slides[currentIndex].classList.add("is-active"); 
} 

function logicalIndex() { 
  return (currentIndex - CLONE_COUNT + originalCount) % originalCount; 
} 

function buildDots() { 
  dotsEl.innerHTML = ""; 
  for (let i = 0; i < originalCount; i++) { 
    const dot = document.createElement("button"); 
    dot.className = "dot"; 
    dot.type = "button"; 
    dot.setAttribute("aria-label", `Go to project ${i + 1}`); 
    dot.addEventListener("click", () => goToReal(i)); 
    dotsEl.appendChild(dot); 
  } 
  updateDots(); 
} 

function updateDots() { 
  const dots = Array.from(dotsEl.querySelectorAll(".dot")); 
  const active = logicalIndex(); 
  dots.forEach((d, i) => d.classList.toggle("active", i === active)); 
} 

function centerToIndex(idx, animate = true) { 
  const gap = getGapPx(); 
  const slide = slides[idx]; 
  if (!slide) return; 

  const viewportW = viewport.getBoundingClientRect().width; 
  const slideW = slide.getBoundingClientRect().width; 
  const slideLeft = slide.offsetLeft; 

  const targetX = (viewportW / 2) - (slideW / 2) - slideLeft; 

  inner.style.transition = animate
    ? "transform 520ms cubic-bezier(.2,.8,.2,1)" 
    : "none"; 

  inner.style.transform = `translateX(${targetX}px)`; 
  currentIndex = idx; 
  setActiveClass(); 
  updateDots(); 
} 

function rebuildSlidesWithClones() { 
  const originals = Array.from(inner.querySelectorAll(".projectCard")); 
  originalCount = originals.length; 

  const before = originals.slice(-CLONE_COUNT).map((s) => s.cloneNode(true)); 
  const after = originals.slice(0, CLONE_COUNT).map((s) => s.cloneNode(true)); 

  inner.innerHTML = ""; 
  before.forEach((c) => inner.appendChild(c)); 
  originals.forEach((s) => inner.appendChild(s)); 
  after.forEach((c) => inner.appendChild(c)); 

  slides = Array.from(inner.querySelectorAll(".projectCard")); 
  currentIndex = CLONE_COUNT; 
} 

function snapIfNeeded() { 
  if (currentIndex >= CLONE_COUNT + originalCount) { 
    centerToIndex(CLONE_COUNT, false); 
  } 

  if (currentIndex < CLONE_COUNT) { 
    centerToIndex(CLONE_COUNT + originalCount - 1, false); 
  } 
} 

function slideBy(dir) { 
  if (isAnimating) return; 
  isAnimating = true; 
  centerToIndex(currentIndex + dir, true); 
} 

function goToReal(realIdx) { 
  if (isAnimating) return; 
  isAnimating = true; 
  centerToIndex(CLONE_COUNT + realIdx, true); 
} 

inner.addEventListener("transitionend", () => { 
  snapIfNeeded(); 
  isAnimating = false; 
}); 

prevBtn.addEventListener("click", () => slideBy(-1)); 
nextBtn.addEventListener("click", () => slideBy(1)); 

window.addEventListener("resize", () => { 
  centerToIndex(currentIndex, false); 
}); 


rebuildSlidesWithClones(); 
buildDots(); 
centerToIndex(currentIndex, false); 


// ===== OFFER (COLLAPSE / EXPAND CARDS) =====

document.querySelectorAll("[data-offer-toggle]").forEach((btn) => { 
  const card = btn.closest(".offerCard"); 
  if (!card) return; 

  function syncOfferButton() { 
    const isOpen = card.classList.contains("is-open"); 
    btn.textContent = isOpen ? "↑" : "↓"; 
    btn.setAttribute("aria-expanded", String(isOpen)); 
    btn.setAttribute("aria-label", isOpen ? "Collapse card" : "Expand card"); 
  } 

  syncOfferButton(); 

  btn.addEventListener("click", (e) => { 
    e.preventDefault(); 
    card.classList.toggle("is-open"); 
    syncOfferButton(); 
  }); 
}); 


// ===== CONTACT (COPY EMAIL) =====

const emailValueEl = document.getElementById("emailValue"); 
const copyBtn = document.getElementById("copyEmailBtn"); 
const copyText = document.getElementById("copyEmailText"); 

if (copyBtn && emailValueEl && copyText) copyBtn.addEventListener("click", async () => { 
  const email = emailValueEl.textContent.trim(); 
  try { 
    await navigator.clipboard.writeText(email); 
    copyText.textContent = "Email copied ✓"; 
    setTimeout(() => (copyText.textContent = "Copy Email"), 1300); 
  } catch (e) { 
    copyText.textContent = "Copy failed"; 
    setTimeout(() => (copyText.textContent = "Copy Email"), 1300); 
  } 
}); 


// ===== FOOTER (YEAR) =====

const yearEl = document.getElementById("year"); 
if (yearEl) yearEl.textContent = new Date().getFullYear(); 
