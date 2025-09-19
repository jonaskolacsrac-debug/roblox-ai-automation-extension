// Roblox AI Automation - Options Script
console.log('⚙️ Options script loaded');

class OptionsController {
  constructor() {
    this.defaultSettings = {
      strategy: 'exploration',
      actionDelay: 200,
      confidenceThreshold: 75,
      safetyMode: true,
      humanLikeMovement: true,
      antiDetection: true,
      maxSessionTime: 60,
      enableVision: true,
      visionFPS: 10,
      showOverlay: true,
      enableMetrics: true,
      enableLogging: true,
      memoryLimit: 500
    };
    
    this.initializeElements();
    this.setupEventListeners();
    this.loadSettings();
  }
  
  initializeElements() {
    this.elements = {
      defaultStrategy: document.getElementById('defaultStrategy'),
      actionDelay: document.getElementById('actionDelay'),
      actionDelayValue: document.getElementById('actionDelayValue'),
      confidenceThreshold: document.getElementById('confidenceThreshold'),
      confidenceValue: document.getElementById('confidenceValue'),
      safetyMode: document.getElementById('safetyMode'),
      humanLikeMovement: document.getElementById('humanLikeMovement'),
      antiDetection: document.getElementById('antiDetection'),
      maxSessionTime: document.getElementById('maxSessionTime'),
      enableVision: document.getElementById('enableVision'),
      visionFPS: document.getElementById('visionFPS'),
      visionFPSValue: document.getElementById('visionFPSValue'),
      showOverlay: document.getElementById('showOverlay'),
      enableMetrics: document.getElementById('enableMetrics'),
      enableLogging: document.getElementById('enableLogging'),
      memoryLimit: document.getElementById('memoryLimit'),
      saveBtn: document.getElementById('saveBtn'),
      resetBtn: document.getElementById('resetBtn'),
      successMessage: document.getElementById('successMessage')
    };
  }
  
  setupEventListeners() {
    // Range input updates
    this.elements.actionDelay.addEventListener('input', (e) => {
      this.elements.actionDelayValue.textContent = e.target.value;
    });
    
    this.elements.confidenceThreshold.addEventListener('input', (e) => {
      this.elements.confidenceValue.textContent = e.target.value;
    });
    
    this.elements.visionFPS.addEventListener('input', (e) => {
      this.elements.visionFPSValue.textContent = e.target.value;
    });
    
    // Auto-save on change
    Object.values(this.elements).forEach(element => {
      if (element && element.addEventListener) {
        element.addEventListener('change', () => this.autoSave());
      }
    });
    
    // Button events
    this.elements.saveBtn.addEventListener('click', () => this.saveSettings());
    this.elements.resetBtn.addEventListener('click', () => this.resetSettings());
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(this.defaultSettings);
      this.applySettings(result);
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.applySettings(this.defaultSettings);
    }
  }
  
  applySettings(settings) {
    // Apply values to form elements
    this.elements.defaultStrategy.value = settings.strategy;
    this.elements.actionDelay.value = settings.actionDelay;
    this.elements.actionDelayValue.textContent = settings.actionDelay;
    this.elements.confidenceThreshold.value = settings.confidenceThreshold;
    this.elements.confidenceValue.textContent = settings.confidenceThreshold;
    this.elements.safetyMode.checked = settings.safetyMode;
    this.elements.humanLikeMovement.checked = settings.humanLikeMovement;
    this.elements.antiDetection.checked = settings.antiDetection;
    this.elements.maxSessionTime.value = settings.maxSessionTime;
    this.elements.enableVision.checked = settings.enableVision;
    this.elements.visionFPS.value = settings.visionFPS;
    this.elements.visionFPSValue.textContent = settings.visionFPS;
    this.elements.showOverlay.checked = settings.showOverlay;
    this.elements.enableMetrics.checked = settings.enableMetrics;
    this.elements.enableLogging.checked = settings.enableLogging;
    this.elements.memoryLimit.value = settings.memoryLimit;
  }
  
  getCurrentSettings() {
    return {
      strategy: this.elements.defaultStrategy.value,
      actionDelay: parseInt(this.elements.actionDelay.value),
      confidenceThreshold: parseInt(this.elements.confidenceThreshold.value),
      safetyMode: this.elements.safetyMode.checked,
      humanLikeMovement: this.elements.humanLikeMovement.checked,
      antiDetection: this.elements.antiDetection.checked,
      maxSessionTime: parseInt(this.elements.maxSessionTime.value),
      enableVision: this.elements.enableVision.checked,
      visionFPS: parseInt(this.elements.visionFPS.value),
      showOverlay: this.elements.showOverlay.checked,
      enableMetrics: this.elements.enableMetrics.checked,
      enableLogging: this.elements.enableLogging.checked,
      memoryLimit: parseInt(this.elements.memoryLimit.value)
    };
  }
  
  async saveSettings() {
    try {
      const settings = this.getCurrentSettings();
      await chrome.storage.sync.set(settings);
      this.showSuccessMessage();
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showErrorMessage('Failed to save settings');
    }
  }
  
  async autoSave() {
    // Debounced auto-save
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveSettings();
    }, 1000);
  }
  
  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        await chrome.storage.sync.set(this.defaultSettings);
        this.applySettings(this.defaultSettings);
        this.showSuccessMessage('Settings reset to defaults');
      } catch (error) {
        console.error('Failed to reset settings:', error);
        this.showErrorMessage('Failed to reset settings');
      }
    }
  }
  
  showSuccessMessage(message = 'Settings saved successfully!') {
    this.elements.successMessage.textContent = `✅ ${message}`;
    this.elements.successMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.successMessage.style.display = 'none';
    }, 3000);
  }
  
  showErrorMessage(message) {
    this.elements.successMessage.textContent = `❌ ${message}`;
    this.elements.successMessage.style.background = '#f8d7da';
    this.elements.successMessage.style.color = '#721c24';
    this.elements.successMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.successMessage.style.display = 'none';
      this.elements.successMessage.style.background = '#d4edda';
      this.elements.successMessage.style.color = '#155724';
    }, 3000);
  }
}

// Initialize options when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
