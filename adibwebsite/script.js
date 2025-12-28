let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");
let navLinks = document.querySelectorAll(".navbar a");

// Toggle mobile menu
menuIcon.onclick = () => {
  if (menuIcon.classList.contains("ri-menu-line")) {
    menuIcon.classList.remove("ri-menu-line");
    menuIcon.classList.add("ri-close-line");
  } else {
    menuIcon.classList.remove("ri-close-line");
    menuIcon.classList.add("ri-menu-line");
  }
  navbar.classList.toggle("active");
};

// Close navbar when clicking a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuIcon.classList.remove("ri-close-line");
    menuIcon.classList.add("ri-menu-line");
    navbar.classList.remove("active");
  });
});

// Close navbar when clicking outside
document.addEventListener("click", (e) => {
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    menuIcon.classList.remove("ri-close-line");
    menuIcon.classList.add("ri-menu-line");
    navbar.classList.remove("active");
  }
});

// Highlight active nav link on scroll
window.addEventListener("scroll", () => {
  let sections = document.querySelectorAll("section");
  let scrollPosition = window.scrollY + 200;

  sections.forEach((section) => {
    let sectionTop = section.offsetTop;
    let sectionHeight = section.offsetHeight;
    let sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
});

// Tab Switching Function
function opentab(tabname) {
  const tablinks = document.querySelectorAll(".tab-links");
  const tabcontents = document.querySelectorAll(".tab-contents");

  // Remove active classes
  tablinks.forEach((link) => link.classList.remove("active-link"));
  tabcontents.forEach((content) => content.classList.remove("active-tab"));

  // Add active class to clicked tab
  event.currentTarget.classList.add("active-link");
  document.getElementById(tabname).classList.add("active-tab");

  // Trigger skill bar animations when skills tab is opened
  if (tabname === "skills-tab" && !skillsAnimated) {
    setTimeout(() => {
      document.querySelectorAll(".skill-item").forEach((item) => {
        item.classList.add("animate");
      });
      skillsAnimated = true;
    }, 100);
  }
}

// // Scroll Reveal Animation
// function revealOnScroll() {
//   const aboutImg = document.querySelector(".about-img");
//   const aboutContent = document.querySelector(".about-content");
//   const windowHeight = window.innerHeight;

//   const imgTop = aboutImg.getBoundingClientRect().top;
//   const contentTop = aboutContent.getBoundingClientRect().top;
//   const revealPoint = 150;

//   if (imgTop < windowHeight - revealPoint) {
//     aboutImg.classList.add("show");
//   }

//   if (contentTop < windowHeight - revealPoint) {
//     aboutContent.classList.add("show");
//   }
// }

// Universal Scroll Reveal Function for ALL sections
function revealOnScroll() {
  const reveals = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right"
  );
  const windowHeight = window.innerHeight;
  const revealPoint = 150;

  reveals.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < windowHeight - revealPoint) {
      element.classList.add("active");
    }
  });
}

// Counter Animation
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  const speed = 200; // Lower is faster

  counters.forEach((counter) => {
    const target = +counter.getAttribute("data-target");
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(() => animateCounters(), 10);
    } else {
      counter.innerText = target + "+";
    }
  });
}
// Intersection Observer for better performance
const observerOptions = {
  threshold: 0.3,
  rootMargin: "0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");

      // Trigger counter animation when about section is visible
      if (entry.target.classList.contains("about")) {
        animateCounters();
        // Trigger skill animations on initial load
        document.querySelectorAll(".skill-item").forEach((item) => {
          item.classList.add("show");
        });
      }
    }
  });
}, observerOptions);

// Observe elements
document
  .querySelectorAll(".about-img, .about-content, .about")
  .forEach((el) => {
    observer.observe(el);
  });

// Fallback for scroll event
window.addEventListener("scroll", revealOnScroll);

// Initial check on page load
revealOnScroll();
