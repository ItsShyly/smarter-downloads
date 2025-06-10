class StorageManager {
  static rootFolders = [
    "folder1",
    "folder2",
    "folder3",
    "folder4",
    "folderOthers",
  ];
  
  static folderVariables = {
    folder1: "Audios",
    folder2: "Videos",
    folder3: "Images",
    folder4: "Gifs",
    folderOthers: "Others",
  };

  static customFileTypes = {
    folder1: ["mp3", "wav"],
    folder2: ["mp4", "mkv", "avi"],
    folder3: ["jpg", "jpeg", "png"],
    folder4: ["gif"],
  };

  static subfolderCheckbox = {
    folder1: false,
    folder2: false,
    folder3: false,
    folder4: false,
    folderOthers: false,
  };

  static customFolders = {}; // Stores nested folder structure

  static async initialize() {
    await this.loadFromStorage();
    chrome.storage.local.onChanged.addListener(this.handleStorageChange.bind(this));
  }

    // Load all storage data
  static async loadFromStorage() {
    const storageData = await this.getFromStorage([
      "rootFolders",
      "folderVariables",
      "customFileTypes",
      "subfolderCheckbox",
      "customFolders"
    ]);

    if (storageData.rootFolders) this.rootFolders = storageData.rootFolders;
    if (storageData.folderVariables) {
      Object.assign(this.folderVariables, storageData.folderVariables);
    }
    if (storageData.customFileTypes) {
      Object.assign(this.customFileTypes, storageData.customFileTypes);
    }
    if (storageData.subfolderCheckbox) {
      Object.assign(this.subfolderCheckbox, storageData.subfolderCheckbox);
    }
    if (storageData.customFolders) {
      this.customFolders = storageData.customFolders;
    }
  }

  static handleStorageChange(changes) {
    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case "rootFolders":
          this.rootFolders = change.newValue;
          break;
        case "folderVariables":
          Object.assign(this.folderVariables, change.newValue);
          break;
        case "customFileTypes":
          Object.assign(this.customFileTypes, change.newValue);
          break;
        case "subfolderCheckbox":
          Object.assign(this.subfolderCheckbox, change.newValue);
          break;
        case "customFolders":
          this.customFolders = change.newValue;
          break;
      }
    }
  }

  static async saveToStorage(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  static async getFromStorage(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

  static async renameFolder(folderKey, newName) {
    this.folderVariables[folderKey] = newName;
    await this.saveToStorage("folderVariables", this.folderVariables);
  }

  static async addFileType(folderKey, fileType) {
    if (!this.customFileTypes[folderKey]) {
      this.customFileTypes[folderKey] = [];
    }
    if (!this.customFileTypes[folderKey].includes(fileType)) {
      this.customFileTypes[folderKey].push(fileType);
      await this.saveToStorage("customFileTypes", this.customFileTypes);
    }
  }

  static async removeFileType(folderKey, fileType) {
    if (this.customFileTypes[folderKey]) {
      const index = this.customFileTypes[folderKey].indexOf(fileType);
      if (index !== -1) {
        this.customFileTypes[folderKey].splice(index, 1);
        await this.saveToStorage("customFileTypes", this.customFileTypes);
      }
    }
  }

  static async setSubfolderOption(folderKey, enabled) {
    this.subfolderCheckbox[folderKey] = enabled;
    await this.saveToStorage("subfolderCheckbox", this.subfolderCheckbox);
  }

  static async createNewFolder(folderName, parentPath = []) {
    const newKey = `folder_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Initialize folder properties
    this.folderVariables[newKey] = folderName;
    await this.saveToStorage("folderVariables", this.folderVariables);

    // Add to parent folder or root
    const parentKey = parentPath.length > 0 ? parentPath[parentPath.length - 1] : null;
    
    if (parentKey) {
      if (!this.customFolders[parentKey]) {
        this.customFolders[parentKey] = [];
      }
      this.customFolders[parentKey].push(newKey);
      await this.saveToStorage("customFolders", this.customFolders);
    } else {
      this.rootFolders.push(newKey);
      await this.saveToStorage("rootFolders", this.rootFolders);
    }

    // Initialize empty file types and subfolder option
    this.customFileTypes[newKey] = [];
    await this.saveToStorage("customFileTypes", this.customFileTypes);

    this.subfolderCheckbox[newKey] = false;
    await this.saveToStorage("subfolderCheckbox", this.subfolderCheckbox);

    return newKey;
  }

  static async removeFolder(folderKey) {
    // Remove from parent folder or root
    let removedFromParent = false;
    
    // Check if it's in any custom folder
    for (const [parentKey, children] of Object.entries(this.customFolders)) {
      const index = children.indexOf(folderKey);
      if (index !== -1) {
        children.splice(index, 1);
        removedFromParent = true;
        await this.saveToStorage("customFolders", this.customFolders);
        break;
      }
    }
    
    // If not found in custom folders, check root
    if (!removedFromParent) {
      const rootIndex = this.rootFolders.indexOf(folderKey);
      if (rootIndex !== -1) {
        this.rootFolders.splice(rootIndex, 1);
        await this.saveToStorage("rootFolders", this.rootFolders);
      }
    }

    // Clean up properties
    const cleanupPromises = [];
    
    if (this.folderVariables[folderKey]) {
      delete this.folderVariables[folderKey];
      cleanupPromises.push(this.saveToStorage("folderVariables", this.folderVariables));
    }

    if (this.customFileTypes[folderKey]) {
      delete this.customFileTypes[folderKey];
      cleanupPromises.push(this.saveToStorage("customFileTypes", this.customFileTypes));
    }

    if (this.subfolderCheckbox[folderKey] !== undefined) {
      delete this.subfolderCheckbox[folderKey];
      cleanupPromises.push(this.saveToStorage("subfolderCheckbox", this.subfolderCheckbox));
    }

    // Remove any child folders (recursive)
    if (this.customFolders[folderKey]) {
      const childFolders = [...this.customFolders[folderKey]];
      delete this.customFolders[folderKey];
      cleanupPromises.push(this.saveToStorage("customFolders", this.customFolders));
      
      // Recursively remove children
      for (const childKey of childFolders) {
        cleanupPromises.push(this.removeFolder(childKey));
      }
    }

    await Promise.all(cleanupPromises);
  }

  static getFolderContent(path) {
    if (path.length === 0) {
      return {
        folders: this.rootFolders,
        fileTypes: []
      };
    }
    
    const currentFolderKey = path[path.length - 1];
    return {
      folders: this.customFolders[currentFolderKey] || [],
      fileTypes: this.customFileTypes[currentFolderKey] || []
    };
  }

  static getFolderPath(folderKey) {
    // Find the path to a folder by searching through the hierarchy
    for (const [parentKey, children] of Object.entries(this.customFolders)) {
      if (children.includes(folderKey)) {
        const parentPath = this.getFolderPath(parentKey);
        return [...parentPath, folderKey];
      }
    }
    
    // Check if it's a root folder
    if (this.rootFolders.includes(folderKey)) {
      return [folderKey];
    }
    
    return []; // Not found
  }
}

// Initialize the extension
function initBackground() {
  chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      chrome.runtime.openOptionsPage();
    }
  });

  // Update download listener to handle nested folders
  StorageManager.initialize().then(() => {
    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
      const fileExtension = item.filename.split(".").pop().toLowerCase();
      let folderPath = [];

      // Search through all folders to find matching file type
      const searchFolders = (currentPath) => {
        const content = StorageManager.getFolderContent(currentPath);
        
        // Check file types in current folder
        if (content.fileTypes.includes(fileExtension)) {
          folderPath = currentPath;
          return true;
        }
        
        // Recursively search subfolders
        for (const folderKey of content.folders) {
          if (searchFolders([...currentPath, folderKey])) {
            return true;
          }
        }
        
        return false;
      };

      // Start search from root
      searchFolders([]);

      // If found in a folder
      if (folderPath.length > 0) {
        const folderNames = folderPath.map(
          key => StorageManager.folderVariables[key] || key
        );
        
        const useSubfolder = StorageManager.subfolderCheckbox[folderPath[folderPath.length - 1]];
        const basePath = folderNames.join("/");
        
        suggest({
          filename: useSubfolder
            ? `${basePath}/${fileExtension}/${item.filename}`
            : `${basePath}/${item.filename}`,
        });
      } else if (StorageManager.rootFolders.includes("folderOthers")) {
        // Fallback to Others folder
        suggest({
          filename: `${StorageManager.folderVariables.folderOthers}/${item.filename}`
        });
      } else {
        suggest({ filename: item.filename });
      }
    });
  });
}

// Start initialization
initBackground();