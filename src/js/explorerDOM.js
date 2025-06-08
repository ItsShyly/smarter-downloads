const folders = [
  {
    id: "folder1",
    name: "Audios",
    icon: "fa-music",
    fileTypes: ["mp3", "wav", "flac"],
  },
  {
    id: "folder2",
    name: "Videos",
    icon: "fa-film",
    fileTypes: ["mp4", "mkv", "avi"],
  },
  {
    id: "folder3",
    name: "Images",
    icon: "fa-image",
    fileTypes: ["jpg", "jpeg", "png", "webp"],
  },
  { id: "folder4", name: "GIFs", icon: "fa-play-circle", fileTypes: ["gif"] },
  { id: "folderOthers", name: "Others", icon: "fa-folder-open", fileTypes: [] },
];

// Initialize the explorer
function initializeExplorer() {
  renderFolders();
  setupEventListeners();
}

// Render folders in the grid
function renderFolders() {
  const folderGrid = document.getElementById("folder-grid");
  folderGrid.innerHTML = "";

  folders.forEach((folder) => {
    const folderElement = document.createElement("div");
    folderElement.className = "folder-item";
    folderElement.dataset.folderId = folder.id;

    folderElement.innerHTML = `
                    <i class="fas ${folder.icon} folder-icon"></i>
                    <div class="folder-name">${folder.name}</div>
                    <i class="fas fa-edit edit-icon" data-folder-id="${folder.id}"></i>
                `;

    folderGrid.appendChild(folderElement);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Folder click
  document.querySelectorAll(".folder-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (e.target.classList.contains("edit-icon")) return;

      const folderId = this.dataset.folderId;
      const folder = folders.find((f) => f.id === folderId);
      openFolder(folder);
    });
  });

  // Edit icon click
  document.querySelectorAll(".edit-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const folderId = this.dataset.folderId;
      renameFolder(folderId);
    });
  });

  // Add file type button
  document.querySelector(".add-btn").addEventListener("click", addFileType);

  // Enter key in file type input
  document
    .querySelector(".filetype-input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        addFileType();
      }
    });

  // Path input enter key
  document
    .getElementById("path-input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        navigateToPath(this.value);
      }
    });
}

// Open a folder
function openFolder(folder) {
  // Update address bar
  document.getElementById("path-input").value = `Downloads\\${folder.name}`;

  // Render file types
  renderFileTypes(folder);

  // Show file types section
  document.getElementById("file-types-section").style.display = "block";
}

// Render file types for a folder
function renderFileTypes(folder) {
  const container = document.getElementById("file-types-container");
  container.innerHTML = "";

  folder.fileTypes.forEach((fileType) => {
    const fileTypeElement = document.createElement("div");
    fileTypeElement.className = "file-type-item";
    fileTypeElement.innerHTML = `
                    <span>.${fileType}</span>
                    <i class="fas fa-times remove-btn" data-filetype="${fileType}"></i>
                `;
    container.appendChild(fileTypeElement);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const fileType = this.dataset.filetype;
      removeFileType(folder.id, fileType);
    });
  });
}

// Add a new file type
function addFileType() {
  const input = document.querySelector(".filetype-input");
  const fileType = input.value.trim().toLowerCase();

  if (fileType && /^[a-z0-9]+$/.test(fileType)) {
    // In a real implementation, this would be added to the current folder
    const container = document.getElementById("file-types-container");

    const fileTypeElement = document.createElement("div");
    fileTypeElement.className = "file-type-item";
    fileTypeElement.innerHTML = `
                    <span>.${fileType}</span>
                    <i class="fas fa-times remove-btn" data-filetype="${fileType}"></i>
                `;

    container.appendChild(fileTypeElement);

    // Add event listener to the new remove button
    fileTypeElement
      .querySelector(".remove-btn")
      .addEventListener("click", function () {
        // This would normally remove from the current folder
        fileTypeElement.remove();
      });

    input.value = "";
  } else {
    alert("Please enter a valid file type (letters and numbers only)");
  }
}

// Remove a file type
function removeFileType(folderId, fileType) {
  document.querySelectorAll(".file-type-item").forEach((item) => {
    if (item.querySelector("span").textContent === `.${fileType}`) {
      item.remove();
    }
  });
}

// Rename a folder
function renameFolder(folderId) {
  const folder = folders.find((f) => f.id === folderId);
  const newName = prompt("Enter new folder name:", folder.name);

  if (newName && newName.trim() !== "") {
    folder.name = newName.trim();
    renderFolders();
    setupEventListeners(); // Reattach event listeners
  }
}

// Navigate to a path
function navigateToPath(path) {
  alert(`Navigating to: ${path}`);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initializeExplorer);
