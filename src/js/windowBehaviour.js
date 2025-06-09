const explorerWindow = document.querySelector('.explorer-window');
const titleBar = explorerWindow.querySelector('.title-bar');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - explorerWindow.getBoundingClientRect().left;
    offsetY = e.clientY - explorerWindow.getBoundingClientRect().top;
    explorerWindow.style.position = 'absolute';
    explorerWindow.style.zIndex = 1000;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        explorerWindow.style.left = `${e.clientX - offsetX}px`;
        explorerWindow.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
