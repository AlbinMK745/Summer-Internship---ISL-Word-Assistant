# Sign on Demand

A Chrome extension that highlights Indian Sign Language (ISL) words on webpages and displays sign language videos from a GitHub dictionary.

## Features

- **Word Highlighting**: Automatically highlights ISL words across webpages
- **Video Dictionary**: Display sign language videos for highlighted words
- **Toggle Controls**: Enable or disable highlighting and video features via the popup menu
- **Persistent Settings**: Your preferences are saved locally

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select this folder

## Files

- `manifest.json` - Extension configuration and permissions
- `popup.html` / `popup.js` - Extension popup UI and controls
- `content.js` - Page content script that handles highlighting
- `background.js` - Background service worker

## Usage

Click the extension icon to open the popup and toggle:
- **Highlight Words** - Toggle ISL word highlighting on/off
- **Show Videos** - Toggle video display on/off

Changes apply immediately to the current tab.

## Version

2.0
