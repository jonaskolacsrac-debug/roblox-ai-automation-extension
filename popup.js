// Roblox AI Automation - Popup Script
console.log('🎮 Popup script loaded');

class PopupController {
  constructor() {
    this.isActive = false;
    this.currentStrategy = 'exploration';
    this.metrics = {
      actionsPerMinute: 0,
      successRate: 0,
      totalActions: 0,
      uptime: 0
    };
    
    this.initializeElements();
    this.setupEventListeners();
    this.loadState();
    this.startMetricsUpdate();
  }
  
  initializeElements() {
    this.elements = {
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      currentStrategy: document.getElementById('currentStrategy'),
      strategySelect: document.getElementById('strategySelect'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      actionsPerMin: document.getElementById('actionsPerMin'),
      successRate: document.getElementById('successRate'),
      totalActions: document.getElementById('totalActions'),
      uptime: document.getElementById('uptime')
    };
  }
  
  setupEventListeners() {
    this.elements.startBtn.addEventListener('click', () => this.startAutomation());
    this.elements.stopBtn.addEventListener('click', () => this.stopAutomation());
    this.elements.strategySelect.addEventListener('change', (e) => {
      this.currentStrategy = e.target.value;
    });
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'METRICS_UPDATE') {
        this.updateMetrics(message.metrics);
      }
    });
  }
  
  async loadState() {
    try {
      const response = await chrome.runtime.sendMessage({type: 'GET_STATE'});
      if (response) {
        this.isActive = response.isActive;
        this.currentStrategy = response.strategy;
        this.metrics = response.metrics;
        
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }
  
  async startAutomation() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'START_AUTOMATION',
        strategy: this.currentStrategy
      });
      
      if (response.success) {
        this.isActive = true;
        this.updateUI();
        this.showNotification('🚀 AI Automation Started!', 'success');
      }
    } catch (error) {
      console.error('Failed to start automation:', error);
      this.showNotification('❌ Failed to start automation', 'error');
    }
  }
  
  async stopAutomation() {
    try {
      const response = await chrome.runtime.sendMessage({type: 'STOP_AUTOMATION'});
      
      if (response.success) {
        this.isActive = false;
        this.updateUI();
        this.showNotification('🛑 AI Automation Stopped', 'info');
      }
    } catch (error) {
      console.error('Failed to stop automation:', error);
      this.showNotification('❌ Failed to stop automation', 'error');
    }
  }
  
  updateUI() {
    // Update status indicator
    if (this.isActive) {
      this.elements.statusDot.classList.add('active');
      this.elements.statusText.textContent = 'Active';
      this.elements.startBtn.disabled = true;
      this.elements.stopBtn.disabled = false;
      this.elements.strategySelect.disabled = true;
    } else {
      this.elements.statusDot.classList.remove('active');
      this.elements.statusText.textContent = 'Inactive';
      this.elements.startBtn.disabled = false;
      this.elements.stopBtn.disabled = true;
      this.elements.strategySelect.disabled = false;
    }
    
    // Update strategy display
    this.elements.currentStrategy.textContent = `Strategy: ${this.capitalizeFirst(this.currentStrategy)}`;
    this.elements.strategySelect.value = this.currentStrategy;
    
    // Update metrics
    this.updateMetricsDisplay();
  }
  
  updateMetrics(newMetrics) {
    this.metrics = {...this.metrics, ...newMetrics};
    this.updateMetricsDisplay();
  }
  
  updateMetricsDisplay() {
    this.elements.actionsPerMin.textContent = Math.round(this.metrics.actionsPerMinute || 0);
    this.elements.successRate.textContent = `${Math.round(this.metrics.successRate || 0)}%`;
    this.elements.totalActions.textContent = this.metrics.totalActions || 0;
    this.elements.uptime.textContent = `${this.metrics.uptime || 0}s`;
  }
  
  startMetricsUpdate() {
    setInterval(() => {
      if (this.isActive) {
        this.loadState();
      }
    }, 1000);
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px 15px;
      border-radius: 8px;
      color: white;
      font-size: 12px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#2ed573' : type === 'error' ? '#ff4757' : '#3742fa'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
