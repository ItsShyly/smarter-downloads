// Start: Open options page
chrome.action.onClicked.addListener(function (tab) {
  chrome.runtime.openOptionsPage();
});

// Folder name-variables
const folderVariables = {
  folder1: 'Audios',
  folder2: 'Videos',
  folder3: 'Images',
  folder4: 'Gifs',
  folderOthers: 'Others'
};

// File types for each folder
let whichFileTypes = {
  folder1: ["mp3", "wav"],
  folder2: ["mp4", "mkv", "avi"],
  folder3: ["jpg", "jpeg", "png"],
  folder4: ["gif"],
};

// Checkbox data for saving filetypes in subfolders
let folderFileTypesInSubfolder = {
  folder1: false,
  folder2: true,
  folder3: true,
  folder4: false,
  folderOthers: false
};

// Initial: Update file types and fetch folder names
initializeOrRefreshData();

// Initial: Call getFolderNames for initial setup
for (const folderName in folderVariables) {
  getFolderNamesPromise(folderName);
}

// Storage: Map folder names to file types
let fileTypes = {};

// Storage: Utility function to save data to storage
function saveToStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Storage: Utility function to get data from storage
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

// Storage: Function to update fileTypes based on folderVariables
async function updateFileTypes() {
  const data = Object.fromEntries(
    Object.entries(whichFileTypes).map(([folder, extensions]) => [
      folderVariables[folder],
      Object.fromEntries(extensions.map(extension => [extension, extension]))
    ])
  );

  await saveToStorage(data);
  fileTypes = data;
}

// Storage: Function to get folder names with a promise
async function getFolderNamesPromise(folderName) {
  try {
    const result = await getFromStorage([folderName]);

    if (result[folderName] !== undefined) {
      console.log(`storage-check: new value for ${folderName}: ${result[folderName]}`);
      folderVariables[folderName] = result[folderName];
      await updateFileTypes();
    } else {
      console.log(`storage-check: empty Storage for ${folderName} - use initial`);
    }
  } catch (error) {
    console.error(error);
  }
}

// Storage: Function to update whichFileTypes based on custom file types
async function updateWhichFileTypes() {
  try {
    const result = await getFromStorage(["customFileTypes"]);

    if (result.customFileTypes) {
      whichFileTypes = result.customFileTypes;
      await updateFileTypes();
      console.log("CFT: Updated whichFileTypes:", whichFileTypes);
    } else {
      console.log("CFT: No custom file types found in storage");
    }
  } catch (error) {
    console.error(error);
  }
}

// Storage: Listen for changes in the storage
chrome.storage.local.onChanged.addListener(async (changes) => {
  for (const key in changes) {
    key === "customFileTypes" ? await updateWhichFileTypes() : await getFolderNamesPromise(key);
  }
});


// Download: Handle download and suggest a filename
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  const fileExtension = item.filename.split('.').pop().toLowerCase();
  // Determine download path based on file type and if user want subfolders
  for (const [folder, extensions] of Object.entries(fileTypes)) {
    if (extensions[fileExtension]) {
      const parentFolder = Object.keys(fileTypes).find(key => fileTypes[key] === extensions);
      const variableName = Object.keys(folderVariables).find(key => folderVariables[key] === parentFolder);

      const subfolder = folderFileTypesInSubfolder[variableName] ? extensions[fileExtension] : '';
      const filePath = `${parentFolder}/${subfolder}/${item.filename}`;

      console.log(`download: Saving a .${fileExtension} file`);
      console.log(`download: Own folder for ${fileExtension} = ${subfolder !== ''}`);
      console.log(`download: Saving file in /${filePath}`);

      suggest({ filename: filePath });
      return;
    }
  }

  // Default path if no match is found (Folder others)
  const defaultPath = `${folderVariables.folderOthers}/${item.filename}`;
  console.log(`download: Saving file in /${defaultPath}`);
  suggest({ filename: defaultPath });
});

// Update file types and fetch folder names
async function initializeOrRefreshData() {
  await updateWhichFileTypes();

  // Call getFolderNames for initial setup
  for (const folderName in folderVariables) {
    await getFolderNamesPromise(folderName);
  }
  await updateFileTypes();
}