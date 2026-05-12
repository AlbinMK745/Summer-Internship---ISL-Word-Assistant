const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/AlbinMK745/asl-dictionary/main/words.json';

let wordsMap = {};
let popup = null;
let highlightEnabled = true;
let videoEnabled = true;

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "enableHighlight") {
        highlightEnabled = true;
        highlightWords();
    } 
    else if (msg.action === "disableHighlight") {
        highlightEnabled = false;
        removeHighlights();
    } 
    else if (msg.action === "enableVideo") {
        videoEnabled = true;
    } 
    else if (msg.action === "disableVideo") {
        videoEnabled = false;
        removePopup();
    }
});

// Load settings on start
chrome.storage.local.get(["highlightEnabled", "videoEnabled"], (res) => {
    highlightEnabled = res.highlightEnabled ?? true;
    videoEnabled = res.videoEnabled ?? true;
    initASL();
});

// Load JSON from GitHub
async function fetchWordsJSON() {
    try {
        const response = await fetch(GITHUB_JSON_URL);
        if (!response.ok) throw new Error("Failed to fetch words.json");
        wordsMap = await response.json();
        console.log(`✅ Loaded ${Object.keys(wordsMap).length} ASL words`);
    } catch (err) {
        console.error("❌ Error loading words.json:", err);
    }
}

// Highlight words
function highlightWords() {
    removeHighlights();
    if (!highlightEnabled) return;

    const regex = new RegExp(`\\b(${Object.keys(wordsMap).map(escapeRegExp).join("|")})\\b`, "gi");

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
            const parent = node.parentNode;
            if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (!regex.test(node.textContent)) return;
        const span = document.createElement("span");
        span.innerHTML = node.textContent.replace(regex, (match) => {
            const key = match.toLowerCase();
            return `<span class="asl-highlight" data-word="${key}">${match}</span>`;
        });
        node.replaceWith(span);
    });

    addStyles();
    console.log("✨ Highlighted ASL-supported words");
}

// Remove highlights
function removeHighlights() {
    document.querySelectorAll(".asl-highlight").forEach(el => {
        const txt = document.createTextNode(el.textContent);
        el.replaceWith(txt);
    });
    console.log("🧹 Removed highlights");
}

// Show popup when a word is selected
document.addEventListener("mouseup", (e) => {
    // Ignore if click is on close button or inside popup
    if (e.target.classList.contains("asl-close-btn") || e.target.closest("#asl-popup")) return;

    if (!videoEnabled) return;

    const selection = window.getSelection();
    const selectedText = selection.toString().trim().toLowerCase();

    if (selectedText && wordsMap[selectedText]) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showPopup({ target: { getBoundingClientRect: () => rect } }, wordsMap[selectedText]);
    } else {
        removePopup();
    }
});


// Show video popup
function showPopup(event, videoId) {
    removePopup();

    popup = document.createElement("div");
    popup.id = "asl-popup";
    popup.innerHTML = `
        <div class="asl-popup-inner">
            <button class="asl-close-btn">&times;</button>
            <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" 
                    frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(popup);

    const rect = event.target.getBoundingClientRect();
    popup.style.position = "absolute";
    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.zIndex = "9999";
    popup.style.background = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
    popup.style.padding = "10px";
    popup.style.width = "360px";

    popup.querySelector('.asl-close-btn').addEventListener('click', removePopup);
}

// Remove popup
function removePopup() {
    if (popup) {
        popup.remove();
        popup = null;
        // Clear text selection to prevent auto-reopen
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }
}


// Add styles for highlights
function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .asl-highlight {
            background-color: #2f78ffff;
            border-bottom: 1px dashed #000a55ff;
            cursor: pointer;
        }
        
        #asl-popup iframe {
            width: 100%;
            height: 200px;
            border: none;
        }
        .asl-close-btn {
            position: absolute;
            top: -10px;
            right: -10px;
            background: #f91100ff;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            font-size: 18px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

// Escape regex special chars
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Init function
async function initASL() {
    await fetchWordsJSON();
    if (highlightEnabled) highlightWords();
}
