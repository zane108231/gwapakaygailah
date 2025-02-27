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

    // Download photo strip button
    downloadBtn.addEventListener('click', function() {
        // Set options for better quality and scaling
        const options = {
            scale: 2, // Increase quality
            useCORS: true, // Enable cross-origin images
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        };

        // Use html2canvas with improved options
        html2canvas(photoStripPreview, options).then(canvas => {
            try {
                // For iOS devices
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    // Open image in new tab for iOS
                    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    window.open(image, '_blank');
                    return;
                }

                // For other mobile devices
                if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = 'photostrip-' + new Date().getTime() + '.png';
                        link.href = url;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 'image/png');
                    return;
                }

                // For desktop
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'photostrip-' + new Date().getTime() + '.png';
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Download error:', error);
                alert('There was an error downloading your photo strip. Please try again or use a different device.');
            }
        }).catch(error => {
            console.error('Canvas error:', error);
            alert('There was an error creating your photo strip. Please try again.');
        });
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

                const sticker = document.createElement('div');
                sticker.className = 'sticker';
                sticker.textContent = stickerEmoji;
                sticker.style.position = 'absolute';

                // Adjust size based on sticker type
                if (stickerType === 'girlypop') {
                    sticker.style.fontSize = '20px';
                } else {
                    sticker.style.fontSize = '22px';
                }

                // Calculate position
                const posX = photoLeft + (pos.x < 0 ? pos.x * 4 : (pos.x > 1 ? photoWidth + 5 : pos.x * photoWidth));
                const posY = photoTop + (pos.y < 0 ? pos.y * 4 : (pos.y > 1 ? photoHeight + 5 : pos.y * photoHeight));

                // Apply minimal random rotation for natural look
                const rotation = Math.random() * 20 - 10;

                sticker.style.top = posY + 'px';
                sticker.style.left = posX + 'px';
                sticker.style.transform = `rotate(${rotation}deg)`;

                // Make stickers interactive and draggable
                sticker.style.cursor = 'move';
                sticker.style.userSelect = 'none';
                sticker.style.zIndex = '20';

                // Add draggable functionality
                makeDraggable(sticker);

                // Add to container
                stickersContainer.appendChild(sticker);
            });
        });
    }

    // Make elements draggable
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function isValidEmail(email) {
        // Simple email validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Set the first options as default selected
    if (colorButtons.length > 0) {
        colorButtons[0].click();
    }

    if (stickerButtons.length > 0) {
        stickerButtons[0].click();
    }
});
