# Flippa Preview Extension

A Chrome extension that enhances the attachment viewing experience on Flippa.com by allowing you to preview files and open them in new tabs without forcing downloads.

## Features

🔍 **Preview Files**: View images and PDFs directly in a modal without downloading  
🔗 **Open in New Tab**: Open files in new tabs instead of automatic downloads  
⬇️ **Smart Download**: Download files only when you actually need them  
🎨 **Seamless Integration**: Matches Flippa's design and user experience  
📱 **Responsive Design**: Works on desktop and mobile devices  

## Supported File Types

### Preview Support
- **Images**: JPG, JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, TXT

### Open in New Tab
- All file types including XLSX, DOC, DOCX, and more

## Installation

### Option 1: Install from Chrome Web Store (Recommended)
*Coming soon - extension will be published to Chrome Web Store*

### Option 2: Install from Source (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/flippa-preview-extension.git
   cd flippa-preview-extension
   ```

2. **Open Chrome Extensions Page**
   - Open Chrome and go to `chrome://extensions/`
   - Or click the three dots menu → More tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `flippa-preview-extension` folder
   - The extension should now appear in your extensions list

5. **Verify Installation**
   - You should see the "F+" icon in your Chrome toolbar
   - Navigate to any Flippa auction page with attachments to test

## Usage

### Basic Usage

1. **Navigate to Flippa**: Go to any auction page on Flippa.com that has attachments
2. **Find Attachments**: Scroll down to the "Attachments" section
3. **Enhanced Options**: You'll see new buttons for each attachment:
   - 👁 **Preview**: View images and PDFs in a modal
   - 🔗 **Open**: Open file in a new tab
   - ⬇️ **Download**: Traditional download (original behavior)

### Preview Modal

When you click "Preview":
- **Images**: Display at full size with zoom capabilities
- **PDFs**: Embedded PDF viewer
- **Other files**: Message with option to open in new tab

The modal includes:
- **Open in New Tab**: Button to open the file in a new tab
- **Download**: Button to download the file
- **Close**: Click the X, press Escape, or click outside to close

### Extension Settings

Click the "F+" icon in your toolbar to:
- **Enable/Disable**: Toggle the extension on/off
- **View Status**: See if the extension is active on the current page
- **Check Attachments**: See how many attachments were found

## How It Works

The extension:
1. **Scans Pages**: Automatically detects Flippa attachment sections
2. **Enhances Links**: Adds preview and new tab buttons to each attachment
3. **Intercepts Clicks**: Prevents automatic downloads and provides options
4. **Respects Privacy**: Only works on Flippa.com, no data collection

## Technical Details

### File Structure
```
flippa-preview-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main script that modifies Flippa pages
├── styles.css            # Styling for buttons and modal
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
└── icons/                # Extension icons
    ├── icon16.svg
    ├── icon32.svg
    ├── icon48.svg
    └── icon128.svg
```

### Permissions Used
- `activeTab`: Access to the current Flippa tab
- `storage`: Save extension settings
- `flippa.com/*`: Only works on Flippa.com domains

### Browser Compatibility
- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Troubleshooting

### Extension Not Working?

1. **Check URL**: Make sure you're on flippa.com
2. **Refresh Page**: Try refreshing the Flippa page
3. **Check Extensions**: Ensure the extension is enabled in `chrome://extensions/`
4. **Look for Attachments**: The extension only works on pages with attachments

### Buttons Not Appearing?

1. **Wait for Load**: Give the page time to fully load
2. **Check Console**: Open Developer Tools (F12) and check for errors
3. **Disable Other Extensions**: Temporarily disable other extensions that might interfere

### Preview Not Working?

1. **File Type**: Check if the file type is supported for preview
2. **Network**: Ensure you have a stable internet connection
3. **Permissions**: Some files might require authentication

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Local Operation**: All processing happens locally in your browser
- **Flippa Only**: Only activates on Flippa.com domains
- **No External Requests**: Doesn't make requests to external servers

## Contributing

We welcome contributions! Please feel free to:

1. **Report Issues**: Use the GitHub Issues tab
2. **Suggest Features**: Open an issue with your idea
3. **Submit Pull Requests**: Fork the repo and submit PRs

### Development Setup

1. Clone the repository
2. Make your changes
3. Test by loading the extension in Chrome Developer Mode
4. Submit a pull request

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/flippa-preview-extension/issues)
- **Email**: support@yourextension.com
- **Documentation**: [Visit our wiki](https://github.com/yourusername/flippa-preview-extension/wiki)

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.0.0
- Initial release
- Preview support for images and PDFs
- Open in new tab functionality
- Download management
- Responsive design
- Extension popup interface

---

**Made with ❤️ for the Flippa community**

*This extension is not officially affiliated with Flippa.com*