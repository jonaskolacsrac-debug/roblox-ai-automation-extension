// Roblox AI Automation - Content Script
console.log('🎮 Roblox AI Content Script Loaded');

// Inject the main automation script into the page
function injectAutomationScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAutomationScript);
} else {
  injectAutomationScript();
}

// Communication bridge between injected script and extension
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type.startsWith('ROBLOX_AI_')) {
    // Forward messages from injected script to background
    chrome.runtime.sendMessage({
      type: event.data.type.replace('ROBLOX_AI_', ''),
      ...event.data
    });
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Content script received:', message);
  
  // Forward to injected script
  window.postMessage({
    type: `ROBLOX_AI_${message.type}`,
    ...message
  }, '*');
  
  sendResponse({success: true});
});

// Monitor for Roblox game frames
function monitorGameFrames() {
  const gameFrame = document.querySelector('#game-iframe, iframe[src*="roblox"]');
  if (gameFrame) {
    console.log('🎯 Roblox game frame detected');
    
    // Notify background that game is ready
    chrome.runtime.sendMessage({
      type: 'GAME_READY',
      frameId: gameFrame.id
    });
  }
}

// Check for game frames periodically
setInterval(monitorGameFrames, 2000);
