// Flippa Preview Extension - Content Script
// This script modifies Flippa attachment links to add preview and new tab functionality

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        selectors: {
            attachmentContainer: '.OnboardingAttachments__attachment__container',
            attachmentLink: 'a[href*="/attachments/"], div[href*="/attachments/"]',
            attachmentTitle: '.OnboardingAttachments__attachment__title span',
            attachmentTab: '.OnboardingAttachments__attachment__tab'
        },
        fileTypes: {
            images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            documents: ['pdf', 'doc', 'docx', 'txt'],
            spreadsheets: ['xlsx', 'xls', 'csv'],
            previewable: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt']
        }
    };

    // Extension state
    let extensionEnabled = true;

    // Initialize the extension
    function init() {
        console.log('Flippa Preview Extension: Initializing...');
        
        // Load extension settings
        loadSettings();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', enhanceAttachments);
        } else {
            enhanceAttachments();
        }

        // Watch for dynamic content changes
        observePageChanges();
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggleExtension') {
                extensionEnabled = request.enabled;
                if (extensionEnabled) {
                    enhanceAttachments();
                } else {
                    removeEnhancements();
                }
                sendResponse({ success: true });
            } else if (request.action === 'checkAttachments') {
                const attachments = document.querySelectorAll(CONFIG.selectors.attachmentContainer);
                sendResponse({ attachmentCount: attachments.length });
            }
        });
    }

    // Load extension settings
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            extensionEnabled = result.extensionEnabled !== false; // Default to true
        } catch (error) {
            console.error('Error loading settings:', error);
            extensionEnabled = true;
        }
    }

    // Main function to enhance attachment links
    function enhanceAttachments() {
        if (!extensionEnabled) {
            return;
        }

        const attachmentContainers = document.querySelectorAll(CONFIG.selectors.attachmentContainer);
        
        if (attachmentContainers.length === 0) {
            console.log('Flippa Preview Extension: No attachments found on this page');
            return;
        }

        console.log(`Flippa Preview Extension: Found ${attachmentContainers.length} attachments`);

        attachmentContainers.forEach(container => {
            enhanceAttachmentContainer(container);
        });
    }

    // Remove enhancements when extension is disabled
    function removeEnhancements() {
        const enhancedContainers = document.querySelectorAll('.flippa-preview-enhanced');
        enhancedContainers.forEach(container => {
            const buttonsContainer = container.querySelector('.flippa-preview-buttons');
            if (buttonsContainer) {
                buttonsContainer.remove();
            }
            container.classList.remove('flippa-preview-enhanced');
            
            // Restore original link behavior
            const link = container.querySelector(CONFIG.selectors.attachmentLink);
            if (link) {
                // Clone the link to remove all event listeners
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
            }
        });
        
        // Remove any open modals
        const modals = document.querySelectorAll('.flippa-preview-modal');
        modals.forEach(modal => modal.remove());
    }

    // Replace stretched-link anchor with div to prevent button interference
    function replaceStretchedLink(link, url, title) {
        // Create a new div to replace the anchor
        const newDiv = document.createElement('div');
        
        // Copy all classes except 'stretched-link'
        const originalClasses = link.className.split(' ').filter(cls => cls !== 'stretched-link');
        newDiv.className = originalClasses.join(' ');
        
        // Copy the inner HTML
        newDiv.innerHTML = link.innerHTML;
        
        // Remove the download SVG icon since we have our own buttons
        const downloadIconContainer = newDiv.querySelector('div:last-child');
        if (downloadIconContainer && downloadIconContainer.querySelector('svg')) {
            downloadIconContainer.remove();
        }
        
        // Replace the anchor with the div
        link.parentNode.replaceChild(newDiv, link);
        
        // Make only the title area clickable
        const titleElement = newDiv.querySelector(CONFIG.selectors.attachmentTitle);
        if (titleElement) {
            titleElement.style.cursor = 'pointer';
            titleElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Title clicked, opening in new tab:', title);
                openInNewTab(url, title);
            });
        }
        
        return newDiv;
    }

    // Enhance individual attachment container
    function enhanceAttachmentContainer(container) {
        const link = container.querySelector('a[href*="/attachments/"]');
        const titleElement = container.querySelector(CONFIG.selectors.attachmentTitle);
        const tabElement = container.querySelector(CONFIG.selectors.attachmentTab);

        if (!link || !titleElement || !tabElement) {
            console.log('Flippa Preview Extension: Missing required elements in container');
            return;
        }

        const url = link.href;
        const title = titleElement.textContent.trim();
        const fileType = tabElement.textContent.trim().toLowerCase();

        // Skip if already enhanced
        if (container.classList.contains('flippa-preview-enhanced')) {
            return;
        }

        // Mark as enhanced
        container.classList.add('flippa-preview-enhanced');

        // Replace the stretched-link <a> tag with a div to prevent button interference
        replaceStretchedLink(link, url, title);

        // Create button container
        const buttonContainer = createButtonContainer(url, title, fileType);
        
        // Insert button container after the attachment container itself
        // This ensures buttons are outside the clickable link area
        container.appendChild(buttonContainer);

        console.log(`Flippa Preview Extension: Enhanced attachment "${title}" (${fileType})`);
    }

    // Create button container with preview and new tab options
    function createButtonContainer(url, title, fileType) {
        const container = document.createElement('div');
        container.className = 'flippa-preview-buttons';
        
        const isPreviewable = CONFIG.fileTypes.previewable.includes(fileType);

        // Preview button (if file is previewable) - opens modal
        if (isPreviewable) {
            const previewBtn = document.createElement('button');
            previewBtn.className = 'flippa-preview-btn flippa-preview-btn-preview';
            previewBtn.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                Preview
            `;
            previewBtn.title = `Preview ${title}`;
            previewBtn.addEventListener('click', (e) => {
                console.log('Preview button clicked!', title);
                e.preventDefault();
                e.stopPropagation();
                previewFile(url, title, fileType);
            });
            container.appendChild(previewBtn);
        }

        // New tab button - opens in new tab with custom viewer
        const newTabBtn = document.createElement('button');
        newTabBtn.className = 'flippa-preview-btn flippa-preview-btn-newtab';
        newTabBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
            Open
        `;
        newTabBtn.title = `Open ${title} in new tab`;
        newTabBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openInNewTab(url, title);
        });
        container.appendChild(newTabBtn);

        // Download button (original functionality)
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'flippa-preview-btn flippa-preview-btn-download';
        downloadBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Download
        `;
        downloadBtn.title = `Download ${title}`;
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            downloadFile(url, title);
        });
        container.appendChild(downloadBtn);

        return container;
    }

    // Preview file in modal
    async function previewFile(url, title, fileType) {
        console.log(`Flippa Preview Extension: Previewing ${title} (${fileType}) in MODAL`);
        
        const modal = createPreviewModal(url, title, fileType);
        document.body.appendChild(modal);
        
        console.log('Modal created and added to DOM');
        
        // Show modal with animation
        requestAnimationFrame(() => {
            modal.classList.add('show');
            console.log('Modal show class added');
        });
        
        // Load content using fetch
        try {
            console.log('Fetching file for preview...');
            const fileData = await fetchFileAsBlob(url, title, false);
            loadPreviewContentFromBlob(fileData, title, modal);
        } catch (error) {
            console.error('Error loading preview:', error);
            const loadingElement = modal.querySelector('.flippa-preview-loading');
            loadingElement.textContent = `Failed to load preview. Click "Open in New Tab" to try viewing the file.`;
        }
    }

    // Create preview modal
    function createPreviewModal(url, title, fileType) {
        const modal = document.createElement('div');
        modal.className = 'flippa-preview-modal';
        modal.innerHTML = `
            <div class="flippa-preview-modal-backdrop"></div>
            <div class="flippa-preview-modal-content">
                <div class="flippa-preview-modal-header">
                    <h3>${title}</h3>
                    <div class="flippa-preview-modal-actions">
                        <button class="flippa-preview-modal-btn" id="openNewTab">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                            </svg>
                            Open in New Tab
                        </button>
                        <button class="flippa-preview-modal-btn" id="download">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                            Download
                        </button>
                        <button class="flippa-preview-modal-close">&times;</button>
                    </div>
                </div>
                <div class="flippa-preview-modal-body">
                    <div class="flippa-preview-loading">Loading preview...</div>
                    <div class="flippa-preview-content"></div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.flippa-preview-modal-close');
        const backdrop = modal.querySelector('.flippa-preview-modal-backdrop');
        const openNewTabBtn = modal.querySelector('#openNewTab');
        const downloadBtn = modal.querySelector('#download');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        openNewTabBtn.addEventListener('click', () => {
            openInNewTab(url, title);
            closeModal();
        });
        downloadBtn.addEventListener('click', () => {
            downloadFile(url, title);
            closeModal();
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Load preview content
        // Note: loadPreviewContent function call removed since we now handle it in previewFile

        return modal;
    }

    // Load preview content from blob data
    function loadPreviewContentFromBlob(fileData, title, modal) {
        const loadingElement = modal.querySelector('.flippa-preview-loading');
        const contentElement = modal.querySelector('.flippa-preview-content');
        const { blobUrl, contentType } = fileData;

        if (contentType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = blobUrl;
            img.alt = title;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.onload = () => {
                loadingElement.style.display = 'none';
                contentElement.appendChild(img);
            };
            img.onerror = () => {
                loadingElement.textContent = 'Failed to load image. Click "Open in New Tab" to view.';
            };
        } else if (contentType === 'application/pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = blobUrl;
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            loadingElement.style.display = 'none';
            contentElement.appendChild(iframe);
        } else if (contentType.startsWith('text/')) {
            const iframe = document.createElement('iframe');
            iframe.src = blobUrl;
            iframe.style.width = '100%';
            iframe.style.height = '400px';
            iframe.style.border = '1px solid #e5e7eb';
            iframe.style.borderRadius = '4px';
            loadingElement.style.display = 'none';
            contentElement.appendChild(iframe);
        } else {
            loadingElement.textContent = `Preview not available for ${contentType}. Use "Open in New Tab" to view.`;
        }
    }

    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Toast notification functions
    function showLoadingToast(message) {
        hideExistingToasts();
        const toast = createToast(message, 'loading');
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
    }

    function showErrorToast(message) {
        hideExistingToasts();
        const toast = createToast(message, 'error');
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => hideToast(toast), 4000);
    }

    function hideLoadingToast() {
        const loadingToasts = document.querySelectorAll('.flippa-toast.loading');
        loadingToasts.forEach(hideToast);
    }

    function hideExistingToasts() {
        const toasts = document.querySelectorAll('.flippa-toast');
        toasts.forEach(hideToast);
    }

    function hideToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    function createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `flippa-toast ${type}`;
        
        const iconMap = {
            loading: '⏳',
            error: '⚠️',
            success: '✅',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="flippa-toast-content">
                <span class="flippa-toast-icon">${iconMap[type] || iconMap.info}</span>
                <span class="flippa-toast-message">${escapeHtml(message)}</span>
            </div>
        `;
        
        return toast;
    }

    // Fetch file and create blob URL
    async function fetchFileAsBlob(url, title, showLoading = true) {
        if (showLoading) {
            console.log(`Flippa Preview Extension: Fetching ${title}...`);
        }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            // Determine content type
            const contentType = response.headers.get('content-type') || blob.type;
            
            return {
                blobUrl,
                blob,
                contentType,
                size: blob.size,
                originalUrl: url
            };
        } catch (error) {
            console.error(`Flippa Preview Extension: Error fetching ${title}:`, error);
            throw error;
        }
    }

    // Open file in new tab using blob URL
    async function openInNewTab(url, title) {
        console.log(`Flippa Preview Extension: Opening ${title} in NEW TAB`);
        
        try {
            // Show loading indicator
            showLoadingToast(`Loading ${title}...`);
            
            const fileData = await fetchFileAsBlob(url, title);
            
            // Create a new tab with the blob URL
            const newWindow = window.open('', '_blank');
            
            if (newWindow) {
                // Write HTML structure for the new tab
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${escapeHtml(title)} - Flippa Preview</title>
                        <meta charset="UTF-8">
                        <style>
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                font-family: Arial, sans-serif; 
                                background: #f5f5f5; 
                            }
                            .header {
                                background: white;
                                padding: 15px 20px;
                                border-radius: 8px;
                                margin-bottom: 20px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            .title { 
                                font-size: 18px; 
                                font-weight: bold; 
                                color: #333; 
                                margin: 0;
                            }
                            .info { 
                                font-size: 12px; 
                                color: #666; 
                            }
                            .content {
                                background: white;
                                border-radius: 8px;
                                overflow: hidden;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                            .download-btn {
                                background: #3b82f6;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            }
                            .download-btn:hover {
                                background: #2563eb;
                            }
                            iframe, img, embed, object {
                                width: 100%;
                                height: calc(100vh - 160px);
                                border: none;
                                display: block;
                            }
                            img {
                                max-width: 100%;
                                height: auto;
                                object-fit: contain;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <h1 class="title">${escapeHtml(title)}</h1>
                                <div class="info">
                                    Size: ${formatFileSize(fileData.size)} | 
                                    Type: ${escapeHtml(fileData.contentType)}
                                </div>
                            </div>
                            <a class="download-btn" href="${fileData.blobUrl}" download="${escapeHtml(title)}">Download</a>
                        </div>
                        <div class="content">
                            ${generateFileContent(fileData, title)}
                        </div>
                    </body>
                    </html>
                `);
                newWindow.document.close();
                
                hideLoadingToast();
            } else {
                throw new Error('Popup blocked or failed to open new window');
            }
            
        } catch (error) {
            hideLoadingToast();
            console.error('Error opening file in new tab:', error);
            
            // Fallback: try opening original URL
            showErrorToast(`Failed to load ${title}. Opening original link...`);
            setTimeout(() => {
                window.open(url, '_blank', 'noopener,noreferrer');
            }, 1000);
        }
    }

    // Generate content HTML based on file type
    function generateFileContent(fileData, title) {
        const { blobUrl, contentType } = fileData;
        
        if (contentType.startsWith('image/')) {
            return `<img src="${blobUrl}" alt="${escapeHtml(title)}" />`;
        } else if (contentType === 'application/pdf') {
            return `<iframe src="${blobUrl}" type="application/pdf"></iframe>`;
        } else if (contentType.startsWith('text/')) {
            return `<iframe src="${blobUrl}"></iframe>`;
        } else {
            return `
                <div style="padding: 40px; text-align: center; color: #666;">
                    <h2>File Preview Not Available</h2>
                    <p>Cannot preview ${escapeHtml(contentType)} files.</p>
                    <p>Use the Download button above to save the file.</p>
                    <a href="${blobUrl}" download="${escapeHtml(title)}" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block;">
                        Download ${escapeHtml(title)}
                    </a>
                </div>
            `;
        }
    }

    // Download file (original functionality)
    async function downloadFile(url, title) {
        console.log(`Flippa Preview Extension: Downloading ${title}`);
        
        try {
            showLoadingToast(`Preparing download for ${title}...`);
            
            const fileData = await fetchFileAsBlob(url, title);
            
            // Create download link with blob URL
            const link = document.createElement('a');
            link.href = fileData.blobUrl;
            link.download = title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up blob URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(fileData.blobUrl);
            }, 1000);
            
            hideLoadingToast();
        } catch (error) {
            hideLoadingToast();
            console.error('Error downloading file:', error);
            showErrorToast(`Failed to download ${title}. Trying fallback method...`);
            
            // Fallback to original method
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = title;
                link.target = '_self';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 1000);
        }
    }

    // Observe page changes for dynamic content
    function observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const attachments = node.querySelectorAll(CONFIG.selectors.attachmentContainer);
                            if (attachments.length > 0) {
                                setTimeout(enhanceAttachments, 100);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when script loads
    init();

})();