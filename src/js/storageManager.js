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

  static async initialize() {
    await this.loadFromStorage();
    chrome.storage.local.onChanged.addListener(
      this.handleStorageChange.bind(this)
    );
  }

  static async loadFromStorage() {
    // Load all storage data at once
    const storageData = await this.getFromStorage([
      "rootFolders",
      "folderVariables",
      "customFileTypes",
      "subfolderCheckbox",
    ]);

    // Update properties from storage
    if (storageData.rootFolders) this.rootFolders = storageData.rootFolders;
    if (storageData.folderVariables)
      Object.assign(this.folderVariables, storageData.folderVariables);
    if (storageData.customFileTypes)
      Object.assign(this.customFileTypes, storageData.customFileTypes);
    if (storageData.subfolderCheckbox)
      Object.assign(this.subfolderCheckbox, storageData.subfolderCheckbox);
  }

  static handleStorageChange(changes) {
    for (const [key, change] of Object.entries(changes)) {
      if (key === "rootFolders") {
        this.rootFolders = change.newValue;
      } else if (key === "folderVariables") {
        Object.assign(this.folderVariables, change.newValue);
      } else if (key === "customFileTypes") {
        Object.assign(this.customFileTypes, change.newValue);
      } else if (key === "subfolderCheckbox") {
        Object.assign(this.subfolderCheckbox, change.newValue);
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

    // Update UI without full re-render
    document
      .querySelectorAll(`[data-folder-key="${folderKey}"] .folder-name`)
      .forEach((el) => (el.textContent = newName));
  }

  static async addFileType(folderKey, fileType) {
    if (!this.customFileTypes[folderKey]) this.customFileTypes[folderKey] = [];
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

  static async createNewFolder(folderName) {
    // Generate unique folder key
    let newKey;
    let counter = 1;
    do {
      newKey = `folder${counter}`;
      counter++;
    } while (this.rootFolders.includes(newKey));

    // Add to root folders
    this.rootFolders.push(newKey);
    await this.saveToStorage("rootFolders", this.rootFolders);

    // Initialize folder properties
    this.folderVariables[newKey] = folderName;
    await this.saveToStorage("folderVariables", this.folderVariables);

    this.customFileTypes[newKey] = [];
    await this.saveToStorage("customFileTypes", this.customFileTypes);

    this.subfolderCheckbox[newKey] = false;
    await this.saveToStorage("subfolderCheckbox", this.subfolderCheckbox);

    return newKey;
  }

  static async removeFolder(folderKey) {
    // Remove from root folders
    const index = this.rootFolders.indexOf(folderKey);
    if (index !== -1) {
      this.rootFolders.splice(index, 1);
      await this.saveToStorage("rootFolders", this.rootFolders);
    }

    // Clean up properties
    if (this.folderVariables[folderKey]) {
      delete this.folderVariables[folderKey];
      await this.saveToStorage("folderVariables", this.folderVariables);
    }

    if (this.customFileTypes[folderKey]) {
      delete this.customFileTypes[folderKey];
      await this.saveToStorage("customFileTypes", this.customFileTypes);
    }

    if (this.subfolderCheckbox[folderKey] !== undefined) {
      delete this.subfolderCheckbox[folderKey];
      await this.saveToStorage("subfolderCheckbox", this.subfolderCheckbox);
    }
  }
}

export default StorageManager;
