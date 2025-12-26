/**
 * File: js/style-switcher.js
 * Name: Style Switcher Logic
 * Purpose:
 * - Open/close the style switcher panel
 * - Switch theme skin colors (enable/disable <link class="alternate-style">)
 * - Toggle dark mode (adds/removes `dark` class on <body>)
 *
 * How it works:
 * - Skin switching:
 *   The HTML includes multiple skin files as <link class="alternate-style" title="color-x" disabled>.
 *   `setActiveStyle('color-x')` enables one skin by removing its `disabled` attribute and disables the rest.
 * - Dark mode:
 *   Toggling `body.dark` changes theme variables defined in css/style.css.
 */

// Section: Panel toggle (open/close)
const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
styleSwitcherToggle.addEventListener("click", () => {
    document.querySelector(".style-switcher").classList.toggle("open");
});

// Section: Auto-hide panel on scroll
window.addEventListener("scroll", () => {
    if (document.querySelector(".style-switcher").classList.contains("open")) {
        document.querySelector(".style-switcher").classList.remove("open");
    }
});

// Section: Switch theme skin by matching the `title` attribute
const alternateStyles = document.querySelectorAll(".alternate-style");
function setActiveStyle(color) {
    alternateStyles.forEach((style) => {
        if (color === style.getAttribute("title")) {
            style.removeAttribute("disabled");
        } else {
            style.setAttribute("disabled", "true");
        }
    });
}

// Section: Toggle dark mode (light <-> dark)
const dayNight = document.querySelector(".day-night");
dayNight.addEventListener("click", () => {
    dayNight.querySelector("i").classList.toggle("fa-sun");
    dayNight.querySelector("i").classList.toggle("fa-moon");
    document.body.classList.toggle("dark");
});

// Section: Initialize icon state on page load
window.addEventListener("load", () => {
    if (document.body.classList.contains("dark")) {
        dayNight.querySelector("i").classList.add("fa-sun");
    } else {
        dayNight.querySelector("i").classList.add("fa-moon");
    }
});