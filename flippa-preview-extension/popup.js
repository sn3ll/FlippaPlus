// Popup script for Flippa Preview Extension

document.addEventListener('DOMContentLoaded', async function() {
    const statusText = document.getElementById('status-text');
    const enableToggle = document.getElementById('enableExtension');
    
    // Check if we're on a Flippa page
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url && tab.url.includes('flippa.com')) {
            statusText.innerHTML = `
                <span class="status-indicator status-active"></span>
                Extension active on Flippa.com
            `;
            
            // Inject content script to check for attachments
            chrome.tabs.sendMessage(tab.id, { action: 'checkAttachments' }, (response) => {
                if (response && response.attachmentCount > 0) {
                    statusText.innerHTML = `
                        <span class="status-indicator status-active"></span>
                        Found ${response.attachmentCount} attachment(s) on this page
                    `;
                }
            });
        } else {
            statusText.innerHTML = `
                <span class="status-indicator status-inactive"></span>
                Not on Flippa.com - Extension inactive
            `;
            enableToggle.disabled = true;
        }
    } catch (error) {
        console.error('Error checking tab:', error);
        statusText.innerHTML = `
            <span class="status-indicator status-inactive"></span>
            Unable to check page status
        `;
    }
    
    // Load saved settings
    try {
        const result = await chrome.storage.sync.get(['extensionEnabled']);
        enableToggle.checked = result.extensionEnabled !== false; // Default to true
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    
    // Handle toggle change
    enableToggle.addEventListener('change', async function() {
        try {
            await chrome.storage.sync.set({ extensionEnabled: this.checked });
            
            // Send message to content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { 
                    action: 'toggleExtension', 
                    enabled: this.checked 
                });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    });
    
    // Handle link clicks
    document.getElementById('reportIssue').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://github.com/yourusername/flippa-preview-extension/issues'
        });
    });
    
    document.getElementById('viewSource').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://github.com/yourusername/flippa-preview-extension'
        });
    });
    
    document.getElementById('donate').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'https://ko-fi.com/yourusername'
        });
    });
});