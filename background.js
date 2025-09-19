// Roblox AI Automation - Background Service Worker
console.log('🤖 Roblox AI Automation Extension Loaded');

// Extension state management
let automationState = {
  isActive: false,
  strategy: 'exploration',
  metrics: {
    actionsPerMinute: 0,
    successRate: 0,
    totalActions: 0,
    uptime: 0
  }
};

// Message handling between popup, content script, and injected script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);
  
  switch (message.type) {
    case 'GET_STATE':
      sendResponse(automationState);
      break;
      
    case 'START_AUTOMATION':
      automationState.isActive = true;
      automationState.strategy = message.strategy || 'exploration';
      console.log('🚀 Starting AI automation with strategy:', automationState.strategy);
      
      // Forward to content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'START_AUTOMATION',
            strategy: automationState.strategy
          });
        }
      });
      
      sendResponse({success: true});
      break;
      
    case 'STOP_AUTOMATION':
      automationState.isActive = false;
      console.log('🛑 Stopping AI automation');
      
      // Forward to content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {type: 'STOP_AUTOMATION'});
        }
      });
      
      sendResponse({success: true});
      break;
      
    case 'UPDATE_METRICS':
      automationState.metrics = {...automationState.metrics, ...message.metrics};
      sendResponse({success: true});
      break;
      
    case 'EXECUTE_ACTION':
      // Forward action to content script for execution
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'EXECUTE_ACTION',
            action: message.action
          });
        }
      });
      sendResponse({success: true});
      break;
      
    default:
      console.log('❓ Unknown message type:', message.type);
      sendResponse({error: 'Unknown message type'});
  }
  
  return true; // Keep message channel open for async responses
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🎉 Roblox AI Automation Extension Installed');
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      strategy: 'exploration',
      confidenceThreshold: 75,
      actionDelay: 200,
      safetyMode: true
    });
  }
});

// Periodic metrics updates
setInterval(() => {
  if (automationState.isActive) {
    automationState.metrics.uptime += 1;
    
    // Broadcast updated metrics to popup if open
    chrome.runtime.sendMessage({
      type: 'METRICS_UPDATE',
      metrics: automationState.metrics
    }).catch(() => {
      // Popup might not be open, ignore error
    });
  }
}, 1000);
