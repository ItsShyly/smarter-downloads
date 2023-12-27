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

// initial: Bool for checkbox if file types should save in subfolders
let folderFileTypesInSubfolder = {
  folder1: true,
  folder2: true,
  folder3: true,
  folder4: false,
  folderOthers: false
};


// Event Listener for Click
document.addEventListener("click", (event) => {
  const clickedElement = event.target;

  //input
  if (clickedElement.classList.contains("folder-input")) {
    handleFolderInput(clickedElement);
    saveInputIfEditMode(clickedElement);
  }

  //edit input btn
  if (clickedElement.classList.contains("edit-label")) {
    handleEditLabel(clickedElement);
  }

  // clicked outside of input field
  if (!clickedElement.classList.contains("folder-input") && !clickedElement.classList.contains("edit-label")) {
    saveInputIfEditMode(clickedElement);
  }
});

document.addEventListener("keydown", (event) => {
  // Check if the Enter key is pressed
  if (event.key === "Enter") {
    // Save the input value when the Enter key is pressed
    saveInputIfEditMode();
  }
});

function storeCustomFileTypes() {
  compareCustomFileTypesContent()
  chrome.storage.local.set({ "customFileTypes": customFileTypes }, function () {
    console.log("Storage-set: CustomFileTypes");

  });
}

// Function to compare content of customFileTypes and chrome.storage "customFileTypes"
function compareCustomFileTypesContent() {
  // Retrieve customFileTypes from chrome.storage.local
  chrome.storage.local.get("customFileTypes", function (result) {
    const storedCustomFileTypes = result.customFileTypes;

    if (storedCustomFileTypes) {
      for (const folder in customFileTypes) {
        const customFileTypesArray = customFileTypes[folder];
        const storedCustomFileTypesArray = storedCustomFileTypes[folder];

        if (!storedCustomFileTypesArray) {
        } else {
          if (customFileTypesArray.length > storedCustomFileTypesArray.length) {
            blinkBorder("green", folder)
          } else if (customFileTypesArray.length < storedCustomFileTypesArray.length) {
            blinkBorder("red", folder)
          } else {
          }
        }
      }
    } else {
      console.log("No customFileTypes found in storage.");
    }
  });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === "local") {
    for (const folder in changes) {
      if (changes.hasOwnProperty(folder)) {

        // Check if folder name changed
        if (folder !== Object.keys(changes)[0]) {
          blinkBorder("green");
        }

      }
    }
  }
});

function blinkBorder(color, folder) {
  const folderId = document.getElementById(folder);
  console.log("blink");

  // Remove existing animation classes
  folderId.classList.remove('blink-green', 'blink-red', 'transition');

  if (color === "green") {
    // Add green border and circling animation
    folderId.classList.add('blink-green');
  } else {
    // Add red border and circling animation
    folderId.classList.add('blink-red');
  }

  // Remove the animation class after the animation duration
  setTimeout(function () {
    folderId.classList.add('transition');
  }, 250);

  setTimeout(function () {
    folderId.classList.remove('blink-green', 'blink-red');
  }, 250);
}


// Function to save the input value if in edit mode
function saveInputIfEditMode(clicked) {
  const editInputs = document.querySelectorAll(".folder-input:not([readonly])");

  editInputs.forEach((input) => {
    const folderId = input.id.replace("-name", "");

    if (clicked && clicked === input && clicked.classList.contains("folder-input")) {
      // Save the input value when clicking the same input field
      folderVariables[folderId] = input.value;
      const newFolderName = input.value.replace(/[^a-zA-Z0-9]/g, '');
      input.value = "/" + newFolderName ;
      saveToStorage(folderId, newFolderName);
    } else {
      // Save the input value and reset the input field when clicking outside or another input field
      input.readOnly = true;
      input.classList.remove("input-selected");
      input.nextElementSibling.classList.remove("invisible");
      folderVariables[folderId] = input.value;
      const newFolderName = input.value.replace(/[^a-zA-Z0-9]/g, '');
      input.value = "/" + newFolderName ;
      saveToStorage(folderId, newFolderName);
    }
  });
}

// Load Input Values on DOM Load
document.addEventListener('DOMContentLoaded', function() {
  loadInputs();
});

// Load Inputs from variables
function loadInputs() {
  document.querySelectorAll('.folder-input').forEach((input) => {
    const folderId = input.id.replace("-name", "");
    input.value = "/" + folderVariables[folderId];
  });
}

// Iterate through Folder Variables
for (const folderName in folderVariables) {
  getFolderNames(folderName);
}

// Handle Folder Input
function handleFolderInput(inputElement) {
  if (inputElement.readOnly && inputElement.classList.contains('input-selected')) {
    inputElement.classList.remove('input-selected');
  } else if (!inputElement.readOnly && !inputElement.classList.contains('input-selected')) {
    inputElement.classList.add('input-selected');
  }
}

// Handle Edit Label
function handleEditLabel(labelButton) {
  const inputField = labelButton.previousElementSibling;
  if (inputField.readOnly) {
    inputField.readOnly = false;
    labelButton.classList.add('invisible')
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
        console.log("Storage-got: Folder Name");
        folderVariables[folderName] = result[folderName];
        loadInputs();
      } else {
        console.log("No custom name for:", folderName, "- use initial");
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const inputElements = document.querySelectorAll('.tags-input');

  inputElements.forEach(function (inputElement) {
    const tagsContainer = inputElement.nextElementSibling;

    inputElement.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === "," || event.key === ";") {
        event.preventDefault();

        const tagName = inputElement.value.trim();
        const folderName = tagsContainer.id.replace("-tags", "");

        if (tagName !== "") {
          const tagElement = document.createElement("div");
          tagElement.className = "tag-box";
          let tagNamePure = tagName.replace(/[^a-zA-Z0-9]/g, '');
          tagElement.innerHTML = '<p class="tag-title">' + "." + tagNamePure + '<button class="btn-x">X</button></p>';
          const removeButton = tagElement.querySelector('.btn-x');
          removeButton.addEventListener('click', function () {
            tagsContainer.removeChild(tagElement);
            updateCustomFileTypes(folderName, tagNamePure, false);
          });

          tagsContainer.appendChild(tagElement);
          updateCustomFileTypes(folderName, tagNamePure, true);

          inputElement.value = "";
        }
      }
    });
  });
});



function getCustomFileTypes() {
  chrome.storage.local.get(["customFileTypes"], function (result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result.customFileTypes) {
        customFileTypes = result.customFileTypes;
        console.log("Storage-got: Tag Names");
      } else {
        console.log("Using Initial Tags");
      }
      console.log("Updating Tags..");
      loadCustomFileTypes();
    }
  });

}

function updateCustomFileTypes(folderId, tagName, isAdd) {

  if (isAdd) {
    if (!customFileTypes[folderId]) {
      customFileTypes[folderId] = [];
    }
    customFileTypes[folderId].push(tagName);
  } else {
    const index = customFileTypes[folderId].indexOf(tagName);
    if (index !== -1) {
      customFileTypes[folderId].splice(index, 1);
    }
  }
  storeCustomFileTypes()
  console.log("File Types update..");
}

// Function to load customFileTypes into tag elements on DOM load
function loadCustomFileTypes() {
  for (const folderId in customFileTypes) {
    const tagsContainer = document.getElementById(folderId + '-tags');
    if (tagsContainer) {
      customFileTypes[folderId].forEach(tagName => {
        const tagElement = document.createElement("div");
        tagElement.className = "tag-box";
        tagElement.innerHTML = '<p class="tag-title">' + "." + tagName + '<button class="btn-x">X</button></p>';

        const removeButton = tagElement.querySelector('.btn-x');
        removeButton.addEventListener('click', function () {
          tagsContainer.removeChild(tagElement);
          updateCustomFileTypes(folderId, tagName, false);
        });
        tagsContainer.appendChild(tagElement);
      });
    }
  }
}



// Load customFileTypes into tag elements on DOM load
document.addEventListener('DOMContentLoaded', function () {
  getCustomFileTypes ();
});
