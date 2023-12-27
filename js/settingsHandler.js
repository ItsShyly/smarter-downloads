// HTML: settings change visualizer
function blinkBorder(color, folder) {
  const folderId = document.getElementById(folder);
  console.log("blink");

  // Remove existing border color classes
  folderId.classList.remove('blink-green', 'blink-red', 'transition');

  if (color === "green") {
    // Add green border
    folderId.classList.add('blink-green');
  } else {
    // Add red border
    folderId.classList.add('blink-red');
  }

  // Add transition for back-to-normal border
  setTimeout(function () {
    folderId.classList.add('transition');
  }, 250);

  // remove border color classes
  setTimeout(function () {
    folderId.classList.remove('blink-green', 'blink-red');
  }, 250);
}

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

// checkbox if file types should save in subfolders
let folderFileTypesInSubfolder = {
  folder1: false,
  folder2: false,
  folder3: false,
  folder4: false,
  folderOthers: false,
};

// Initial: Load customFileTypes into tag elements on DOM load
document.addEventListener('DOMContentLoaded', async function () {
  await getCustomFileTypes();
});
// Storage: save data to storage
function saveToStorage(key, value) {
  const storageData = {};
  storageData[key] = value;

  chrome.storage.local.set(storageData, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log(`${key} saved`);
    }
  });
}

// Storage: get data from storage
function getFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

// Event Listener for Click
document.addEventListener("click", async (event) => {
  const clickedElement = event.target;

  //Input field
  if (clickedElement.classList.contains("folder-input")) {
    handleFolderInput(clickedElement);
    await saveInputIfEditMode(clickedElement);
  }

  //Edit input btn
  if (clickedElement.classList.contains("edit-label")) {
    handleEditLabel(clickedElement);
  }

  //Clicked outside of input field
  if (!clickedElement.classList.contains("folder-input") && !clickedElement.classList.contains("edit-label")) {
    await saveInputIfEditMode(clickedElement);
  }
});

document.addEventListener("keydown", async (event) => {

  if (event.key === "Enter") {
    // Save the input value
    await saveInputIfEditMode();
  }
});

function storeCustomFileTypes() {
  compareCustomFileTypesContent();
  saveToStorage("customFileTypes", customFileTypes);
}

// Function to compare content of customFileTypes and chrome.storage "customFileTypes"
async function compareCustomFileTypesContent() {
  // Retrieve customFileTypes from chrome.storage.local
  try {
    const result = await getFromStorage("customFileTypes");
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
  } catch (error) {
    console.error(error);
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
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



async function saveInputIfEditMode(clicked) {
  const editInputs = document.querySelectorAll(".folder-input:not([readonly])");

  for (const input of editInputs) {
    const folderId = input.id.replace("-name", "");

    if (clicked && clicked === input && clicked.classList.contains("folder-input")) {
      // Save the input value when clicking the same input field
      folderVariables[folderId] = input.value;
      const newFolderName = input.value.replace(/[^a-zA-Z0-9]/g, '');
      input.value = "/" + newFolderName;
      await saveToStorage(folderId, newFolderName);
    } else {
      // Save the input value and reset the input field when clicking outside or another input field
      input.readOnly = true;
      input.classList.remove("input-selected");
      input.nextElementSibling.classList.remove("invisible");
      folderVariables[folderId] = input.value;
      const newFolderName = input.value.replace(/[^a-zA-Z0-9]/g, '');
      input.value = "/" + newFolderName;
      await saveToStorage(folderId, newFolderName);
    }
  }
}

// Load Input Values on DOM Load
document.addEventListener('DOMContentLoaded', async function () {
  loadInputs();
});

async function loadInputs() {
  const folderInputs = document.querySelectorAll('.folder-input');
  for (const input of folderInputs) {
    const folderId = input.id.replace("-name", "");
    input.value = "/" + folderVariables[folderId];
  }
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

// Get Folder Names from Storage
async function getFolderNames(folderName) {
  try {
    const result = await getFromStorage([folderName]);
    if (result[folderName] !== undefined) {
      console.log("Storage-got: Folder Name");
      folderVariables[folderName] = result[folderName];
      loadInputs();
    } else {
      console.log("No custom name for:", folderName, "- use initial");
    }
  } catch (error) {
    console.error(error);
  }
}

// Dom load html tag creation for each filetype
document.addEventListener("DOMContentLoaded", async function () {
  const inputElements = document.querySelectorAll('.tags-input');

  for (const inputElement of inputElements) {
    const tagsContainer = inputElement.nextElementSibling;

    inputElement.addEventListener("keydown", async function (event) {
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
          await updateCustomFileTypes(folderName, tagNamePure, true);

          inputElement.value = "";
        }
      }
    });
  }
});

// load store filetypes and store them in customFileTypes
async function getCustomFileTypes() {
  try {
    const result = await getFromStorage(["customFileTypes"]);
    if (result.customFileTypes) {
      customFileTypes = result.customFileTypes;
      console.log("Storage-got: Tag Names");
    } else {
      console.log("Using Initial Tags");
    }
    console.log("Updating Tags..");
    await loadCustomFileTypes();
  } catch (error) {
    console.error(error);
  }
}

// load var filetypes and update them into storage
async function updateCustomFileTypes(folderId, tagName, isAdd) {
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

// Load customFileTypes into tag elements
async function loadCustomFileTypes() {
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
