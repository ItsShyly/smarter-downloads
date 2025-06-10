import StorageManager from "./storageManager.js";

// Navigation history
let history = [[]]; // Start with root path
let currentIndex = 0;
let currentPath = history[currentIndex];
let contextMenu = null;
let currentContextFolderKey = null;
let currentContextFileType = null;

document.addEventListener("DOMContentLoaded", async function () {
  await StorageManager.initialize();
  await renderExplorer();

  document
    .getElementById("back-button")
    .addEventListener("click", navigateBack);
  document
    .getElementById("forward-button")
    .addEventListener("click", navigateForward);
  document
    .getElementById("path-input")
    .addEventListener("keydown", handlePathNavigation);
  document
    .getElementById("new-folder-btn")
    .addEventListener("click", createNewFolder);
  document
    .getElementById("sidebar-item")
    .addEventListener("click", navigateBack);

  createContextMenu();
  hideContextMenu();

  // Add global click listener to hide context menu and select items
  document.addEventListener("click", (e) => {
    const isFolderOrFile = e.target.closest(".folder-item, .file-type-item");

    removeSelectedClass();
    if (isFolderOrFile) {
      isFolderOrFile.classList.add("selected");
    }

    if (contextMenu && !contextMenu.contains(e.target)) {
      hideContextMenu();
    }
  });

  // Add contextmenu listener to the main content area
  const contentArea = document.getElementById("content-area");
  contentArea.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    // Reset context variables
    currentContextFolderKey = null;
    currentContextFileType = null;

    const folderItem = e.target.closest(".folder-item");
    const fileTypeItem = e.target.closest(".file-type-item");
    removeSelectedClass();

    if (folderItem) {
      // Folder context menu
      currentContextFolderKey = folderItem.dataset.folderKey;
      folderItem.classList.add("selected");
      showContextMenu(e.clientX, e.clientY, "folder");
    } else if (fileTypeItem) {
      // File type context menu
      currentContextFolderKey = fileTypeItem.dataset.folderKey;
      currentContextFileType = fileTypeItem.dataset.fileType;
      fileTypeItem.classList.add("selected");
      showContextMenu(e.clientX, e.clientY, "filetype");
    } else {
      // Main view context menu
      showContextMenu(e.clientX, e.clientY, "main");
    }
  });
});

function removeSelectedClass() {
  const selectedElements = document.querySelectorAll(".selected");
  selectedElements.forEach((element) => {
    element.classList.remove("selected");
  });
}

function createContextMenu() {
  contextMenu = document.createElement("div");
  contextMenu.id = "context-menu";
  document.body.appendChild(contextMenu);
}

function showContextMenu(x, y, targetType) {
  contextMenu.innerHTML = "";

  if (targetType === "folder") {
    // Folder context menu items
    const renameOption = document.createElement("div");
    renameOption.className = "context-menu-item";
    renameOption.textContent = "Rename";
    renameOption.addEventListener("click", () => {
      if (currentContextFolderKey) {
        renameFolder(currentContextFolderKey);
        hideContextMenu();
      }
    });

    const editOption = document.createElement("div");
    editOption.className = "context-menu-item";
    editOption.textContent = "Edit";
    editOption.addEventListener("click", () => {
      if (currentContextFolderKey) {
        navigateTo([...currentPath, currentContextFolderKey]);
        hideContextMenu();
      }
    });

    const deleteOption = document.createElement("div");
    deleteOption.className = "context-menu-item";
    deleteOption.textContent = "Delete";
    deleteOption.addEventListener("click", () => {
      if (
        currentContextFolderKey &&
        confirm(
          `Delete folder "${StorageManager.folderVariables[currentContextFolderKey]}" and all its contents?`
        )
      ) {
        StorageManager.removeFolder(currentContextFolderKey).then(() => {
          if (currentPath.includes(currentContextFolderKey)) {
            navigateTo([]);
          } else {
            renderExplorer();
          }
        });
        hideContextMenu();
      }
    });

    contextMenu.appendChild(renameOption);
    contextMenu.appendChild(editOption);
    contextMenu.appendChild(deleteOption);
  } else if (targetType === "filetype") {
    // File type context menu items
    const deleteOption = document.createElement("div");
    deleteOption.className = "context-menu-item";
    deleteOption.textContent = "Delete";
    deleteOption.addEventListener("click", () => {
      if (currentContextFolderKey && currentContextFileType) {
        StorageManager.removeFileType(
          currentContextFolderKey,
          currentContextFileType
        );
        renderExplorer();
        hideContextMenu();
      }
    });
    contextMenu.appendChild(deleteOption);
  } else {
    // Main view context menu
    const addFolderOption = document.createElement("div");
    addFolderOption.className = "context-menu-item";
    addFolderOption.textContent = "Add Folder";
    addFolderOption.addEventListener("click", () => {
      createNewFolder();
      hideContextMenu();
    });
    contextMenu.appendChild(addFolderOption);

    if (currentPath.length > 0) {
      const addFileTypeOption = document.createElement("div");
      addFileTypeOption.className = "context-menu-item";
      addFileTypeOption.textContent = "Add File Type";
      addFileTypeOption.addEventListener("click", () => {
        addNewFileType();
        hideContextMenu();
      });
      contextMenu.appendChild(addFileTypeOption);
    }
  }

  // Position and show the menu
  contextMenu.style.display = "block";
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
}

function addNewFileType() {
  if (currentPath.length === 0) return;

  const fileType = prompt("Enter file type:", "png");
  if (fileType && fileType.trim() !== "") {
    // Remove invalid characters and existing dots
    const cleanFileType = fileType.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanFileType) {
      StorageManager.addFileType(currentPath[currentPath.length-1], cleanFileType);
      renderExplorer();
    } else {
      alert("Please enter a valid file type (letters and numbers only)");
    }
  }
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.style.display = "none";
    currentContextFolderKey = null;
    currentContextFileType = null;
  }
}

function navigateTo(newPath) {
  // Add new path to history
  if (currentIndex < history.length - 1) {
    // If we're not at the end, remove future history
    history = history.slice(0, currentIndex + 1);
  }

  history.push(newPath);
  currentIndex = history.length - 1;
  currentPath = newPath;
  renderExplorer();
}

async function renderExplorer() {
  const folderGrid = document.getElementById("folder-grid");
  const fileTypesSection = document.getElementById("file-types-section");
  const pathInput = document.getElementById("path-input");
  const statusInfo = document.getElementById("status-info");
  const activeRenameInputs = document.querySelectorAll(".folder-rename-input");
  const newFolderBtn = document.getElementById("new-folder-btn");
  const backButton = document.getElementById("back-button");
  const forwardButton = document.getElementById("forward-button");

  if (activeRenameInputs.length > 0) return;

  // Get content for current path
  const content = StorageManager.getFolderContent(currentPath);
  const folders = content.folders || [];
  const fileTypes = content.fileTypes || [];

  // Update path display to show names
  let displayPath = "Downloads";
  if (currentPath.length > 0) {
    const pathNames = currentPath.map(
      (key) => StorageManager.folderVariables[key] || key
    );
    displayPath += "\\" + pathNames.join("\\");
  }
  pathInput.value = displayPath;

  // Toggle new folder button visibility
  newFolderBtn.style.display = "block";

  // Update navigation button states
  backButton.disabled = currentIndex === 0;
  forwardButton.disabled = currentIndex === history.length - 1;

  // Clear existing content
  folderGrid.innerHTML = "";
  fileTypesSection.style.display = "none";

  // Render folders
  folders.forEach(folderKey => {
    const folderName = StorageManager.folderVariables[folderKey];
    if (folderName) {
      const folderEl = createFolderElement(folderName, folderKey);
      folderGrid.appendChild(folderEl);
    }
  });

  // Render file types
  fileTypes.forEach(fileType => {
    const fileTypeEl = createFileTypeElement(fileType, currentPath.length > 0 ? currentPath[currentPath.length-1] : null);
    folderGrid.appendChild(fileTypeEl);
  });

  // Show file types section only in folders (not root)
  if (currentPath.length > 0) {
    fileTypesSection.style.display = "block";
    
    const checkbox = fileTypesSection.querySelector(".toggle-input");
    const currentFolderKey = currentPath[currentPath.length-1];
    const isChecked = StorageManager.subfolderCheckbox[currentFolderKey] || false;
    checkbox.checked = isChecked;
    
    checkbox.onchange = () => {
      const isNowChecked = checkbox.checked;
      StorageManager.setSubfolderOption(currentFolderKey, isNowChecked);
      updateIconsBasedOnCheckboxState(isNowChecked);
    };
  }

  statusInfo.textContent = `${folders.length} folders, ${fileTypes.length} file types`;
}

function updateIconsBasedOnCheckboxState(isChecked) {
  const icons = document.querySelectorAll(".filetype-icon, .folder-icon");
  const names = document.querySelectorAll(".filetype-name, .folder-name");

  icons.forEach(icon => {
    if (isChecked) {
      if (icon.classList.contains("filetype-icon")) {
        icon.classList.remove("fas", "fa-file", "filetype-icon");
        icon.classList.add("fas", "fa-folder", "folder-icon");
      }
    } else {
      if (icon.classList.contains("folder-icon")) {
        icon.classList.remove("fas", "fa-folder", "folder-icon");
        icon.classList.add("fas", "fa-file", "filetype-icon");
      }
    }
  });

  names.forEach(nameEl => {
    const originalText = nameEl.textContent;
    if (isChecked) {
      nameEl.textContent = originalText.replace(/^\*\./, "");
    } else {
      if (!originalText.startsWith("*.")) {
        nameEl.textContent = `*.${originalText}`;
      }
    }
  });
}

function createFolderElement(folderName, folderKey) {
  const folderEl = document.createElement("div");
  folderEl.className = "folder-item";
  folderEl.dataset.folderKey = folderKey;

  folderEl.innerHTML = `
    <i class="fas fa-folder folder-icon"></i>
    <span class="folder-name">${folderName}</span>
  `;

  // Double click navigates
  folderEl.addEventListener("dblclick", () => {
    navigateTo([...currentPath, folderKey]);
  });

  return folderEl;
}

function createFileTypeElement(fileType, folderKey) {
  const fileTypeEl = document.createElement("div");
  fileTypeEl.className = "file-type-item";
  fileTypeEl.dataset.fileType = fileType;
  fileTypeEl.dataset.folderKey = folderKey;

  fileTypeEl.innerHTML = `
    <i class="fas fa-file filetype-icon"></i>
    <span class="filetype-name">*.${fileType}</span>
  `;

  return fileTypeEl;
}

function renameFolder(folderKey) {
  const currentName = StorageManager.folderVariables[folderKey];

  // Find the folder element
  const folderEl = document.querySelector(
    `.folder-item[data-folder-key="${folderKey}"]`
  );
  if (!folderEl) return;

  const nameSpan = folderEl.querySelector(".folder-name");
  if (!nameSpan) return;

  // Create input element
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "folder-rename-input";

  // Replace name with input
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  // Flag to track if rename operation is completed
  let completed = false;

  // Save handler
  const saveRename = () => {
    const rawName = input.value.trim();
    const newName = rawName.replace(/[^a-zA-Z0-9 ]/g, '');

    if (newName) {
      StorageManager.renameFolder(folderKey, newName);
      nameSpan.textContent = newName;
    } else {
      alert("Invalid folder name. Please use only letters and numbers.");
      nameSpan.textContent = currentName;
    }
    input.replaceWith(nameSpan);
  };

  // Cancel handler
  const cancelRename = () => {
    if (completed) return;
    completed = true;
    input.replaceWith(nameSpan);
  };

  // Event listeners
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      saveRename();
    } else if (e.key === "Escape") {
      cancelRename();
    }
  });

  input.addEventListener("blur", saveRename);
}

function navigateBack() {
  if (currentIndex > 0) {
    currentIndex--;
    currentPath = history[currentIndex];
    renderExplorer();
  }
}

function navigateForward() {
  if (currentIndex < history.length - 1) {
    currentIndex++;
    currentPath = history[currentIndex];
    renderExplorer();
  }
}

function handlePathNavigation(e) {
  if (e.key === "Enter") {
    navigateToPath(e.target.value);
  }
}

function navigateToPath(path) {
  const normalizedPath = path
    .replace("Downloads\\", "")
    .replace("Downloads/", "");
  const pathSegments = normalizedPath
    .split(/[\\/]/)
    .filter((segment) => segment.trim() !== "");

  if (pathSegments.length === 0) {
    navigateTo([]);
  } else {
    // Convert path segments to folder keys
    const newPath = [];
    let currentContent = StorageManager.getFolderContent([]);
    
    for (const segment of pathSegments) {
      const folderKey = Object.keys(StorageManager.folderVariables).find(
        (key) => StorageManager.folderVariables[key] === segment
      );
      
      if (folderKey && currentContent.folders.includes(folderKey)) {
        newPath.push(folderKey);
        currentContent = StorageManager.getFolderContent(newPath);
      } else {
        // Invalid path segment
        navigateTo([]);
        return;
      }
    }
    
    navigateTo(newPath);
  }
}

function createNewFolder() {
  const folderName = prompt("Enter folder name:", "New Folder");
  if (folderName && folderName.trim() !== "") {
    // Remove invalid characters
    const cleanName = folderName.trim().replace(/[^a-zA-Z0-9 ]/g, '');
    if (cleanName) {
      StorageManager.createNewFolder(cleanName, currentPath).then(() => {
        renderExplorer();
      });
    } else {
      alert("Invalid folder name. Please use only letters and numbers.");
    }
  }
}

function handleFolderClick(e) {
  const folderItem = e.target.closest(".folder-item");
  if (folderItem) {
    const folderKey = folderItem.dataset.folderKey;
    navigateTo([...currentPath, folderKey]);
  }
} 