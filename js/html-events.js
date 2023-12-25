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

// Folder Variables (folder Names)
let folderVariables = {
  folder1: 'Audios',
  folder2: 'Videos',
  folder3: 'Images',
  folder4: 'Gifs',
  folderOthers: 'Others'
};

// Filetype Variables (folder filetypes)
let customFileTypes = {
  folder1: ["mp3", "wav"],
  folder2: ["mp4", "mkv", "avi"],
  folder3: ["jpg", "jpeg", "png"],
  folder4: ["gif"],
};

// Event Listener for Click
document.addEventListener("click", (event) => {
  const clickedElement = event.target;

  //input
  if (clickedElement.classList.contains("folder-input")) {
    handleFolderInput(clickedElement);
  }

  //edit input btn
  if (clickedElement.classList.contains("edit-label")) {
    handleEditLabel(clickedElement);
  }
});

// Load Input Values on DOM Load
document.addEventListener('DOMContentLoaded', function() {
  loadInputs();
});


// Load Inputs from variables
function loadInputs() {
  document.querySelectorAll('.folder-input').forEach((input) => {
    const folderId = input.id.replace("-name", "");
    input.value = folderVariables[folderId];
  });
}

// Iterate through Folder Variables
for (const folderName in folderVariables) {
  getFolderNames(folderName);
}

// Handle Folder Input
function handleFolderInput(inputElement) {
  if (inputElement.readOnly && inputElement.classList.contains('border-blue')) {
    inputElement.classList.remove('border-blue');
  } else if (!inputElement.readOnly && !inputElement.classList.contains('border-blue')) {
    inputElement.classList.add('border-blue');
  }
}

// Handle Edit Label
function handleEditLabel(labelButton) {
  const inputField = labelButton.previousElementSibling;

  if (inputField.readOnly) {
    inputField.readOnly = false;
    labelButton.textContent = 'Save';
  } else {
    const folderId = inputField.id.replace("-name", "");
    folderVariables[folderId] = inputField.value;

    saveToStorage(folderId, inputField.value);

    inputField.readOnly = true;
    labelButton.textContent = 'Edit';
  }
}

// Save to Storage
function saveToStorage(folderId, value) {
  const storageData = {};
  storageData[folderId] = value;

  chrome.storage.local.set(storageData, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log("Changes saved to storage for " + folderId + ": " + value);
    }
  });
}

// Get Folder Names from Storage
function getFolderNames(folderName) {
  chrome.storage.local.get([folderName], function(result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result[folderName] !== undefined) {
        console.log("Retrieved new value for " + folderName + ": " + result[folderName]);
        folderVariables[folderName] = result[folderName];
        loadInputs();
      } else {
        console.log("Retrieved empty Storage for", folderName, "- use initial");
      }
    }
  });
}
