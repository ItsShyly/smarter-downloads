// Cursor Glow
const cursorGlowContainer = document.querySelector(".cg-container");
const cursorGlowElement = document.querySelectorAll(".cg-element");

cursorGlowContainer.addEventListener("pointermove", (ev) => {
  cursorGlowElement.forEach((cgElement) => {
    const rect = cgElement.getBoundingClientRect();

    cgElement.style.setProperty("--x", ev.clientX - rect.left);
    cgElement.style.setProperty("--y", ev.clientY - rect.top);
  });
});

document.addEventListener("DOMContentLoaded", (event) => {
  initialActiveCheck()
});

// give active class based on isInViewport
function initialActiveCheck() {
  const connectSection = document.getElementById("connect");
  const mainLink = document.querySelector('a[href="#main"]');
  const connectLink = document.querySelector('a[href="#connect"]');

  if (isInViewport(connectSection)) {
    mainLink.classList.remove("active");
    connectLink.classList.add("active");
  } else {
    mainLink.classList.add("active");
    connectLink.classList.remove("active");
  }
}

// Function to check if an element is in the viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Flag to check if the mouse is over cg-container
let isMouseOverContainer = false;

// Add mouseover and mouseout events to cg-container
cursorGlowContainer.addEventListener("mouseover", () => {
  isMouseOverContainer = true;
});

cursorGlowContainer.addEventListener("mouseout", () => {
  isMouseOverContainer = false;
});

// Using addEventListener with the wheel event
document.addEventListener("wheel", (event) => {
  // Modern browsers
  if (!isMouseOverContainer) {
    handleScroll(event.deltaY);
  }
});

// Using onmousewheel as a fallback for older browsers
document.onmousewheel = (event) => {
  // Legacy browsers
  if (!isMouseOverContainer) {
    handleScroll(event.wheelDelta);
  }
};

let isScrolling = false;

// Function to handle scroll and navigate to #main or #connect
function handleScroll(delta) {
  if (delta > 0 && !isScrolling) {
    isScrolling = true;
    // Scrolled down
    scrollToTarget("#connect");
    //todo: give connect wrapper margin class, for animation when scrolling down
  } else if (delta < 0 && !isScrolling) {
    isScrolling = true;
    // Scrolled up
    scrollToTarget("#main");
    //todo: remove connect wrapper margin class, for animation when scrolling up
  } else {
    isScrolling = true;
    // delta is 0, no vertical scroll
    console.log("No vertical scroll");
  }
  // Debounce: Reset isScrolling flag
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function () {
    isScrolling = false;
  }, 200);
}

// Variable to store the timeout ID
let scrollTimeout;

// Function to scroll to the target element with smooth behavior
function scrollToTarget(targetId) {
  const targetElement = document.querySelector(targetId);
  window.scrollTo({
    top: targetElement.offsetTop,
    behavior: 'smooth'
  });
}

// Function to handle click on links
function handleLinkClick(event) {
  const id = event.target.getAttribute("href");
  scrollToTarget(id);
  event.preventDefault();
}

// Add click event listener to all links with href starting with "#"
const links = document.querySelectorAll('a[href^="#"]');
links.forEach(function(link) {
  link.addEventListener('click', handleLinkClick);
});

// Function to get the top position of the target element
function getTargetTop(elem) {
  const id = elem.getAttribute("href");
  const offset = 60;
  const targetElement = document.querySelector(id);
  return targetElement.offsetTop - offset;
}

// Add scroll event listener
window.addEventListener('scroll', function() {
  isSelected(window.scrollY);
});

// Array of section links
const sections = document.querySelectorAll('a[href^="#"]');

// Function to check if a section is in view
function isSelected(scrolledTo) {
  const threshold = 100;

  sections.forEach(function(section) {
    const target = getTargetTop(section);

    if (scrolledTo > target - threshold && scrolledTo < target + threshold) {
      sections.forEach(function(link) {
        link.classList.remove("active");
      });
      section.classList.add("active");
    }
  });
}
