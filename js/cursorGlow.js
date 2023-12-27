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