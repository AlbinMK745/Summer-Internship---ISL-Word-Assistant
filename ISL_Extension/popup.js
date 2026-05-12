const highlightToggle = document.getElementById('highlightToggle');
const videoToggle = document.getElementById('videoToggle');

// Load saved states
chrome.storage.local.get(['highlightEnabled', 'videoEnabled'], (result) => {
  highlightToggle.checked = result.highlightEnabled ?? true;
  videoToggle.checked = result.videoEnabled ?? true;
});

// Save highlight toggle changes
highlightToggle.addEventListener('change', () => {
  const enabled = highlightToggle.checked;
  chrome.storage.local.set({ highlightEnabled: enabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: enabled ? "enableHighlight" : "disableHighlight" });
    });
  });
});

// Save video toggle changes
videoToggle.addEventListener('change', () => {
  const enabled = videoToggle.checked;
  chrome.storage.local.set({ videoEnabled: enabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: enabled ? "enableVideo" : "disableVideo" });
    });
  });
});
