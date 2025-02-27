document.addEventListener('DOMContentLoaded', function() {
    const photoStripPreview = document.getElementById('photoStripPreview');
    const colorButtons = document.querySelectorAll('.color-btn');
    const stickerButtons = document.querySelectorAll('.sticker-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const newPhotosBtn = document.querySelector('.new-photos-btn');
    const emailBtn = document.querySelector('.email-btn');
    const emailInput = document.getElementById('emailInput');
    
    let selectedColor = 'white';
    let selectedSticker = 'none';
    let stickersContainer = null;
    
    // Load photos from localStorage
    function loadPhotos() {
        const capturedPhotos = JSON.parse(localStorage.getItem('capturedPhotos')) || [];
        
        if (capturedPhotos.length === 0) {
            photoStripPreview.innerHTML = '<p>No photos found. Please take some photos first.</p>';
            return;
        }
        
        // Clear any existing photos
        photoStripPreview.innerHTML = '';
        
        // Add each photo to the preview
        capturedPhotos.forEach(photoSrc => {
            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = 'Photo Strip Image';
            photoStripPreview.appendChild(img);
        });
        
        // Create a container for stickers
        stickersContainer = document.createElement('div');
        stickersContainer.className = 'stickers-container';
        stickersContainer.style.position = 'absolute';
        stickersContainer.style.top = '0';
        stickersContainer.style.left = '0';
        stickersContainer.style.width = '100%';
        stickersContainer.style.height = '100%';
        stickersContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
        photoStripPreview.style.position = 'relative'; // Ensure stickers are positioned correctly
        photoStripPreview.appendChild(stickersContainer);
    }
    
    // Initialize the preview
    loadPhotos();
    
    // Handle color selection
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the selected color
            selectedColor = this.getAttribute('data-color');
            
            // Apply the color to the photo strip preview
            photoStripPreview.style.backgroundColor = getColorValue(selectedColor);
        });
    });
    
    // Handle sticker selection
    stickerButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            stickerButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the selected sticker
            selectedSticker = this.getAttribute('data-sticker');
            
            // Apply stickers
            applyStickers(selectedSticker);
        });
    });
    
    // Take new photos button
    newPhotosBtn.addEventListener('click', function() {
        window.location.href = 'photobooth.html';
    });
    
    // Add loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-text">Processing your photo strip...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Download photo strip button
    downloadBtn.addEventListener('click', async function() {
        try {
            // Show loading overlay
            loadingOverlay.style.display = 'flex';
            downloadBtn.disabled = true;

            // Get the actual dimensions of the preview
            const previewRect = photoStripPreview.getBoundingClientRect();
            
            // Quality options adjusted for better Safari compatibility
            const quality = {
                low: { scale: 2, quality: 0.8 },
                medium: { scale: 3, quality: 0.9 },
                high: { scale: 4, quality: 1.0 }
            };

            // Use high quality by default
            const selectedQuality = quality.high;
            
            // Enhanced options for better quality
            const options = {
                scale: selectedQuality.scale,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                scrollX: 0,
                scrollY: 0,
                width: previewRect.width,
                height: previewRect.height,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
                logging: false,
                backgroundColor: photoStripPreview.style.backgroundColor || '#ffffff',
                imageTimeout: 0,
                removeContainer: true
            };

            // Create canvas with enhanced settings
            const canvas = await html2canvas(photoStripPreview, options);
            
            // Scale the canvas to ensure good quality
            const scaledCanvas = document.createElement('canvas');
            const ctx = scaledCanvas.getContext('2d');
            scaledCanvas.width = canvas.width;
            scaledCanvas.height = canvas.height;
            
            // Apply smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

            // Check if running on Safari
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (isSafari) {
                // For Safari: Open image in new window with enhanced presentation
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                        <head>
                            <title>Your Photo Strip</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body {
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                    min-height: 100vh;
                                    background: #f0f0f0;
                                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                }
                                .container {
                                    text-align: center;
                                    max-width: 100%;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                    margin-bottom: 20px;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                    border-radius: 8px;
                                }
                                .instructions {
                                    color: #333;
                                    background: white;
                                    padding: 15px 25px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <img src="${scaledCanvas.toDataURL('image/png', selectedQuality.quality)}" alt="Photo Strip">
                                <div class="instructions">
                                    <p>To save your photo strip:</p>
                                    <p>1. Press and hold (or right-click) the image</p>
                                    <p>2. Select "Save Image"</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
                    // If popup was blocked, show in current window
                    const image = scaledCanvas.toDataURL('image/png', selectedQuality.quality);
                    window.location.href = image;
                }
            } else {
                // For other browsers: Use Blob download with enhanced quality
                scaledCanvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `photostrip-${new Date().getTime()}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 'image/png', selectedQuality.quality);
            }

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = isSafari ? 
                'Image ready! Press and hold to save your photo strip' :
                'Download successful!';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 5000);

        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <p>There was an error preparing your photo strip.</p>
                <p style="font-size: 14px; color: #666;">${error.message}</p>
                <button onclick="this.parentElement.remove()">Try Again</button>
            `;
            document.body.appendChild(errorMessage);
        } finally {
            loadingOverlay.style.display = 'none';
            downloadBtn.disabled = false;
        }
    });
    
    // Send to email button
    emailBtn.addEventListener('click', function() {
        const email = emailInput.value.trim();
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // In a real app, you'd send this to your server
        alert(`Photo strip would be sent to: ${email}`);
    });
    
    // Helper functions
    function getColorValue(color) {
        switch(color) {
            case 'white': return 'white';
            case 'black': return 'black';
            case 'pink': return '#ffddee';
            case 'green': return '#d1f7c4';
            case 'blue': return '#d4f1f9';
            case 'yellow': return '#fff8d6';
            case 'purple': return '#e6e6fa';
            default: return 'white';
        }
    }
    
    function applyStickers(stickerType) {
        // Clear existing stickers
        if (stickersContainer) {
            stickersContainer.innerHTML = '';
            stickersContainer.style.pointerEvents = 'auto'; // Make stickers interactive
        }
        
        if (stickerType === 'none') {
            return; // No stickers to apply
        }
        
        // Define sticker images for each type
        const stickers = {
            'girlypop': [
                '💖', '✨', '💅', '👑', '🌸', '🦄', '💫', '💎'
            ],
            'cute': [
                '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐨', '💙', '⭐', '✨'
            ]
        };
        
        const selectedStickers = stickers[stickerType] || [];
        
        // Get all photos in the strip
        const photos = photoStripPreview.querySelectorAll('img');
        
        // Define fixed positions for stickers (cleaner look)
        const fixedPositions = [
            // Top left, top, top right
            {x: -5, y: -5},
            {x: 0.5, y: -5},
            {x: 1.05, y: -5},
            
            // Middle left, Middle right
            {x: -5, y: 0.25},
            {x: -5, y: 0.75},
            {x: 1.05, y: 0.25},
            {x: 1.05, y: 0.75},
            
            // Bottom left, bottom, bottom right
            {x: -5, y: 1.05},
            {x: 0.5, y: 1.05},
            {x: 1.05, y: 1.05}
        ];
        
        // For each photo, add stickers at fixed positions
        photos.forEach((photo) => {
            // Get photo position and dimensions
            const photoRect = photo.getBoundingClientRect();
            const stripRect = photoStripPreview.getBoundingClientRect();
            
            // Calculate relative position to the photoStripPreview
            const photoTop = photoRect.top - stripRect.top;
            const photoLeft = photoRect.left - stripRect.left;
            const photoWidth = photoRect.width;
            const photoHeight = photoRect.height;
            
            // Apply stickers at fixed positions
            fixedPositions.forEach((pos, index) => {
                // Skip some positions randomly for variation but maintain consistency
                if (Math.random() < 0.3) return;
                
                // Pick a random sticker for each position
                const stickerIndex = Math.floor(Math.random() * selectedStickers.length);
                const stickerEmoji = selectedStickers[stickerIndex];
                
                const sticker = document.createElement('span');
                sticker.className = 'sticker';
                sticker.textContent = stickerEmoji;
                sticker.style.position = 'absolute';
                sticker.style.left = photoLeft + pos.x * photoWidth + '%';
                sticker.style.top = photoTop + pos.y * photoHeight + '%';
                sticker.style.transform = `scale(${pos.scale || 1})`;
                sticker.style.color = getColorValue(selectedColor);
                stickersContainer.appendChild(sticker);
            });
        });
    }
});
