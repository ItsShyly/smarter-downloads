// initial: Open options page
chrome.action.onClicked.addListener(function (tab) {
  chrome.runtime.openOptionsPage();
});

// initial: Store folder variables (folder names)
let folderVariables = {
  folder1: 'Audios',
  folder2: 'Videos',
  folder3: 'Images',
  folder4: 'Gifs',
  folderOthers: 'Others'
};

// initial: Bool for checkbox if file types should save in subfolders
let folderFileTypesInSubfolder = {
  folder1: true,
  folder2: true,
  folder3: true,
  folder4: false,
  folderOthers: false
};

// initial: Default file types for each folder
let whichFileTypes = {
  folder1: ["mp3", "wav"],
  folder2: ["mp4", "mkv", "avi"],
  folder3: ["jpg", "jpeg", "png"],
  folder4: ["gif"],
};

// initial: store the folderVariables names with filetypes from download path
let fileTypes = {
  [folderVariables.folder1]: {},
  [folderVariables.folder2]: {},
  [folderVariables.folder3]: {},
  [folderVariables.folder4]: {},
};

// initial: Populate fileTypes object with file extensions
for (const folder in whichFileTypes) {
  whichFileTypes[folder].forEach(extension => {
    fileTypes[folderVariables[folder]][extension] = extension;
  });
}

// storage update: Function to update fileTypes based on folderVariables
function updateFileTypes() {
  fileTypes = {
    [folderVariables.folder1]: {},
    [folderVariables.folder2]: {},
    [folderVariables.folder3]: {},
    [folderVariables.folder4]: {},
  };

  // Populate fileTypes object with file extensions
  for (const folder in whichFileTypes) {
    if (whichFileTypes.hasOwnProperty(folder)) {  // Check if the property exists
      whichFileTypes[folder].forEach(extension => {
        fileTypes[folderVariables[folder]][extension] = extension;
      });
    }
  }
  console.log("storage update: Updated fileTypes:", fileTypes);
}

// initial: Function to initialize or update folder names and file types
async function initializeOrRefreshData() {
  await updateWhichFileTypes();

  // initial: Call getFolderNames for initial setup
  for (const folderName in folderVariables) {
    await getFolderNamesPromise(folderName);
  }

  await updateFileTypes(); // storage update: Update fileTypes based on folderVariables
}

// storage update: Function to get folder names with a promise
function getFolderNamesPromise(folderName) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([folderName], function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        if (result[folderName] !== undefined) {
          console.log("storage update: Retrieved new value for " + folderName + ": " + result[folderName]);
          folderVariables[folderName] = result[folderName]; // Update the variable
          console.log(folderVariables);
          resolve();
        } else {
          console.log("storage update: Retrieved empty Storage for", folderName, "- use initial");
          resolve();
        }
      }
    });
  });
}

// storage update: Function to update whichFileTypes based on custom file types
function updateWhichFileTypes() {
  chrome.storage.local.get(["customFileTypes"], function (result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result.customFileTypes) {
        console.log("storage update: Updating whichFileTypes with custom file types");
        whichFileTypes = result.customFileTypes;
        console.log("storage update: Updated whichFileTypes:", whichFileTypes);
      } else {
        console.log("storage update: No custom file types found in storage");
      }
    }
  });
}

// storage update: Function to get folder names from storage
function getFolderNames(folderName) {
  chrome.storage.local.get([folderName], function (result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result[folderName] !== undefined) {
        console.log("storage update: Retrieved new value for " + folderName + ": " + result[folderName]);
        folderVariables[folderName] = result[folderName]; // Update the variable
      } else {
        console.log("storage update: Retrieved empty Storage for", folderName, "- use initial");
      }
    }
  });
}

// storage update: Listen for changes in the storage
chrome.storage.local.onChanged.addListener(async function (changes, namespace) {
  for (const key in changes) {
    if (key === "customFileTypes") {
      await updateWhichFileTypes();
      await updateFileTypes(); // storage update: Update fileTypes when customFileTypes change
    } else {
      await getFolderNamesPromise(key);
      await updateFileTypes(); // storage update: Update fileTypes when folder names change
    }
  }
});

// initial: Call updateWhichFileTypes for initial setup
updateWhichFileTypes();

// initial: Call getFolderNames for initial setup
for (const folderName in folderVariables) {
  getFolderNamesPromise(folderName);
}

// initial: Call initializeOrRefreshData for initial setup
initializeOrRefreshData();

// Function to handle download and suggest a filename
chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  // Get file extension
  const fileExtension = item.filename.split('.').pop().toLowerCase();

  // Determine download path based on file type and subfolders
  for (const folder in fileTypes) {
    if (fileTypes[folder][fileExtension]) {
      // Get the parent folder name
      console.log("download: Saving a ." + fileExtension + " file");
      const parentFolder = Object.keys(fileTypes).find(key => fileTypes[key] === fileTypes[folder]);

      // Get the variable name associated with the parent folder
      const variableName = Object.keys(folderVariables).find(key => folderVariables[key] === parentFolder);

      if (folderFileTypesInSubfolder[variableName]) {
        console.log("download: Own folder for", fileExtension, "= true");
        suggest({ filename: parentFolder + "/" + fileTypes[folder][fileExtension] + "/" + item.filename });
        console.log("download: Saving file in /" + parentFolder + "/" + fileExtension);
      } else {
        console.log("download: Own folder for", fileExtension, "= false");
        suggest({ filename: parentFolder + "/" + item.filename });
        console.log("download: Saving file in /" + parentFolder);
      }
      return;
    }
  }

  // Default path if no match is found
  suggest({ filename: folderVariables.folderOthers + item.filename });
});
