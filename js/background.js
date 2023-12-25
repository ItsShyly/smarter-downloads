// Open the options page when the extension icon is clicked
chrome.action.onClicked.addListener(function(tab) {
  chrome.runtime.openOptionsPage();
});

// store folder variables (folder names)
let folderVariables = {
  folder1: 'Audios',
  folder2: 'Videos',
  folder3: 'Images',
  folder4: 'Gifs',
  folderOthers: 'Others'
};

// bool for checkbox if filetypes should save in subfolders
let folderFileTypesInSubfolder = {
  folder1: true,
  folder2: true,
  folder3: true,
  folder4: false,
  folderOthers: false
};

let whichFileTypes = {
  folder1: ["mp3", "wav"],
  folder2: ["mp4", "mkv", "avi"],
  folder3: ["jpg", "jpeg", "png"],
  folder4: ["gif"],
};

const fileTypes = {
  [folderVariables.folder1]: {},
  [folderVariables.folder2]: {},
  [folderVariables.folder3]: {},
  [folderVariables.folder4]: {},
};

// Populate fileTypes object with file extensions
for (const folder in whichFileTypes) {
  whichFileTypes[folder].forEach(extension => {
    fileTypes[folderVariables[folder]][extension] = extension;
  });
}

function updateWhichFileTypes() {
  chrome.storage.local.get(["customFileTypes"], function(result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result.customFileTypes) {
        console.log("Updating whichFileTypes with custom file types");
        whichFileTypes = result.customFileTypes;
        console.log("Updated whichFileTypes:", whichFileTypes);
      } else {
        console.log("No custom file types found in storage");
      }
    }
  });
}

function getFolderNames(folderName) {
  chrome.storage.local.get([folderName], function(result) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      if (result[folderName] !== undefined) {
        console.log("Retrieved new value for " + folderName + ": " + result[folderName]);
        folderVariables[folderName] = result[folderName]; // Update the variable
      } else {
        console.log("Retrieved empty Storage for", folderName, "- use initial");
      }
    }
  });
}

// Listen for changes in the storage
chrome.storage.local.onChanged.addListener(function(changes, namespace) {
  for (const key in changes) {
    if (key === "customFileTypes") {
      updateWhichFileTypes();
    } else {
      getFolderNames(key);
    }
  }
});

// Call updateWhichFileTypes for initial setup
updateWhichFileTypes();

// Call getFolderNames for initial setup
for (const folderName in folderVariables) {
  getFolderNames(folderName);
}

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
  // Get file extension
  const fileExtension = item.filename.split('.').pop().toLowerCase();

  // Determine download path based on file type and Subfolders
  for (const folder in fileTypes) {
    if (fileTypes[folder][fileExtension]) {
      // Get the parent folder name
      console.log("..saving a ." + fileExtension + " file");
      const parentFolder = Object.keys(fileTypes).find(key => fileTypes[key] === fileTypes[folder]);

      // Get the variable name associated with the parent folder
      const variableName = Object.keys(folderVariables).find(key => folderVariables[key] === parentFolder);

      if (folderFileTypesInSubfolder[variableName]) {
        console.log("own folder for", fileExtension, "= true");
        suggest({ filename: parentFolder + "/" + fileTypes[folder][fileExtension] + "/" + item.filename });
        console.log("Saving file in /" + parentFolder + "/" + fileExtension);
      } else {
        console.log("own folder for", fileExtension, "= false");
        suggest({ filename: parentFolder + "/" + item.filename });
        console.log("saving file in /" + parentFolder);
      }
      return;
    }
  }

  // Default path if no match is found
  suggest({ filename: folderVariables.folderOthers + item.filename });
});
