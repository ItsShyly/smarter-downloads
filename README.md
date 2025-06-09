# Smarter Downloads ![plot](./dist/assets/icons/SD48.png)

## Overview

 *Customize download paths based on file types with an easy to understand Windows Explorer interface.*

>[!IMPORTANT]  
> This extension cannot create folders outside your browser's configured default download directory 
> e.g., C:\Users\[You]\Downloads
> All organizational folders must be subdirectories within this location



![banner](./dist/assets/readme/banner.png)

## What's New in v2.0
**Complete Windows Explorer UI redesign** 
- Looks and works like real Windows 11 File Explorer

**Visual folder navigation** 
- Browse folders like in Windows Explorer

**Improved path switching** 
- Faster and more reliable file sorting

**Simplified setup** 
- Right-click context menus and intuitive controls

**New code structure** 
- Easier maintenance and future updates

## Usage

<img src="./dist/assets/readme/tutorial1.png" width="400" height="auto">
<img src="./dist/assets/readme/tutorial2.png" width="400" height="auto">


**Getting Started:**
1. Click the extension icon in your browser toolbar
2. The Windows File Explorer-style interface will open

**Managing Download Paths:**
- **Right-click on folders** to rename, edit,or delete the
- **Double-click folders** to open and view their file types
- **Right-click in empty space** to add new file type if in a folder
- **Right-click in empty space** to add new folder if outside of a folder
- **Toggle subfolders** using the switch in folder views

**Key Features:**
- Address bar shows and edits current download path
- Visual feedback when paths change
- Context menus matching Windows Explorer
- Automatic saving on every change

**Saving & Data:**
- All settings auto-save locally after each change
- Persists across browser sessions
- Cleared when you uninstall the extension

## Development

### Building
```bash
npm install
npm run build
npm run dev
