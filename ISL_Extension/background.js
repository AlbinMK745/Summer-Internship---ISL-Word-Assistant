chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['aslEnabled'], (result) => {
    if (result.aslEnabled === undefined) {
      chrome.storage.local.set({ aslEnabled: true });
    }
  });
});

// 🔁 Listen for popup toggle switch changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleASLExtension") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      if (message.enabled) {
        // 🟢 Inject content script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
      } else {
        // 🔴 Tell content script to clean up
        chrome.tabs.sendMessage(tabId, { action: "disableASL" });
      }
    });
  }
});
