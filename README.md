# Multi Window Plugin for Blockbench

## Overview
Multi Window is a powerful plugin for Blockbench that enables seamless synchronization between multiple Blockbench windows. This plugin allows you to open the same project in multiple windows and have all changes synchronized in real-time across all instances.

This is mainly used in multi-screen workstation scenarios where the overall effect can be previewed independently in one screen.

[中文版本README](README_zh.md)

## Features
- **Multi-window support**: Open the same project in multiple windows
- **Real-time synchronization**: All changes made in one window are immediately reflected in others
- **Animation synchronization**: Timeline position, play/pause states, and keyframe edits are synchronized
- **Texture synchronization**: Updates to textures are reflected across all windows
- **Selection synchronization**: Selected objects are highlighted in all windows

## How It Works
This plugin uses some advanced "black magic" techniques to achieve seamless synchronization:
- Utilizes Electron's IPC (Inter-Process Communication) mechanisms
- Maintains UUID consistency across window instances
- Implements a sophisticated state diffing and patching system
- Uses event-driven architecture to capture and propagate changes
- Employs custom serialization to efficiently transfer model data

## Installation
1. Download the `multi-window.js` file from Release
2. Open Blockbench
3. Go to `File > Plugins`
4. Click on "Load Plugin from File"
5. Select the downloaded multi-window.js file
6. Restart Blockbench

## Build
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. The built file will be in the `dist` directory

## Usage Guide

### Opening a Project in Another Window
1. Open a project in Blockbench
2. Go to `File > Open in New Window`
3. A new window will open with the same project

### Working with Multiple Windows
- You can position windows side by side to view different parts of the model simultaneously
- Make changes in any window (add elements, edit textures, change animations, etc.)
- All changes will be synchronized across all open windows
- You can have different views in each window (e.g., Edit view in one, UV editor in another)

### Animation Workflow
- Play or pause an animation in one window, and the state will synchronize to other windows
- Scrub through the timeline in one window to update the position in all windows
- Edit keyframes in any window to see changes reflected everywhere

### Best Practices
- While the plugin is robust, it's recommended not to make simultaneous complex changes in multiple windows
- For large projects, limit the number of synchronized windows to maintain performance
- Save your work regularly as with any workflow

## Limitations
- Some complex operations may cause temporary desynchronization
- Performance may decrease with very large projects and multiple windows
- Some third-party plugins may not be fully compatible with multi-window functionality

## For Developers
The plugin uses a magic identifier system to distinguish between different types of synchronization data:
- `sync-shared-data`: For model structure changes
- `sync-animation-frame`: For timeline scrubbing
- `sync-animation-timeline`: For animation playback states

## License
MIT License

## Author
boybook