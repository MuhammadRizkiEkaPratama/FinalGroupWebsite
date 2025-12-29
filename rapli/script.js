// Animasi memantau elemen saat muncul di layar (Scroll Reveal)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element masuk viewport → tampil
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        } else {
            // Element keluar viewport → sembunyi lagi
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
        }
    });
}, { threshold: 0.1 });


// Terapkan ke kartu proyek dan item timeline
document.querySelectorAll('.project-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Making a transition to navbar when scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("shrink");
    } else {
        navbar.classList.remove("shrink");
    }
});

// Adding a hamburger icon in responsive
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
hamburger.addEventListener("click", () =>{
    navMenu.classList.toggle("active");
});

const yearEl = document.getElementById("year"); // Footer year span
function setYear() {
  // Set footer year
  yearEl.textContent = String(new Date().getFullYear()); // Insert current year text
} // End setYear

function init(){
      setYear(); // Set footer year
}

init();