// - Cursor Glow:
const cursorGlowContainer = document.querySelector(".cg-container");
const cursorGlowElement = document.querySelectorAll(".cg-element");

cursorGlowContainer.addEventListener("pointermove", (ev) => {
  cursorGlowElement.forEach((cgElement) => {
    const rect = cgElement.getBoundingClientRect();

    cgElement.style.setProperty("--x", ev.clientX - rect.left);
    cgElement.style.setProperty("--y", ev.clientY - rect.top);
  });
});

// - Scrolling:

// variables
let isMouseOverContainer = false;
let isCtrlPressed = false;
let isScrolling = false;
let scrollTimeout;

// Array of section switch links
const links = document.querySelectorAll('a[href^="#"]');

// document event listeners
document.addEventListener("DOMContentLoaded", initialActiveCheck);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("wheel", (event) => {
  if (!isMouseOverContainer) {
    handleScroll(event.deltaY);
  }
});

// window event listeners
window.addEventListener("focus", handleWindowFocus);
window.addEventListener("blur", handleWindowBlur);
window.addEventListener('scroll', function() {
  isSelected(window.scrollY);
});

// cursorGlowContainer (settings container) event listeners
cursorGlowContainer.addEventListener("mouseover", () => {
  isMouseOverContainer = true;
});

cursorGlowContainer.addEventListener("mouseout", () => {
  isMouseOverContainer = false;
});

// Link click listener
links.forEach(function(link) {
  link.addEventListener('click', handleLinkClick);
});

// Using onmousewheel as a fallback for older browsers
document.onmousewheel = (event) => {
  if (!isMouseOverContainer) {
    handleScroll(event.wheelDelta);
  }
};


// ctrl press check on keyDown
function handleKeyDown(event) {
  if (event.key === "Control") {
    isCtrlPressed = true;
  }
}
function handleKeyUp(event) {
  if (event.key === "Control") {
    isCtrlPressed = false;
  }
}

// ctrl press reset in case someone let go ctrl in another tab
function handleWindowFocus() {
  isCtrlPressed = false;
}
function handleWindowBlur() {
  isCtrlPressed = false;
}


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

// check if an element is in the viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to handle scroll and navigate to #main or #connect
function handleScroll(delta) {
  if (!isCtrlPressed) {
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
}

// Function to scroll to the target element with smooth behavior
function scrollToTarget(targetId) {
  const targetElement = document.querySelector(targetId);
  window.scrollTo({
    top: targetElement.offsetTop,
    behavior: 'smooth'
  });
}

// handle click on links
function handleLinkClick(event) {
  const id = event.target.getAttribute("href");
  scrollToTarget(id);
  event.preventDefault();
}


// get the top position of the target element
function getTargetTop(elem) {
  const id = elem.getAttribute("href");
  const offset = 60;
  const targetElement = document.querySelector(id);
  return targetElement.offsetTop - offset;
}

// check if a section is in view
function isSelected(scrolledTo) {
  const threshold = 100;

  links.forEach(function(section) {
    const target = getTargetTop(section);

    if (scrolledTo > target - threshold && scrolledTo < target + threshold) {
      links.forEach(function(link) {
        link.classList.remove("active");
      });
      section.classList.add("active");
    }
  });
}
