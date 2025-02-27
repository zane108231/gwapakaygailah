
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
        // Use html2canvas to capture the entire photoStripPreview
        html2canvas(photoStripPreview).then(canvas => {
            // Convert the canvas to a data URL
            const dataUrl = canvas.toDataURL('image/png');
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.download = 'photostrip-' + new Date().getTime() + '.png';
            link.href = dataUrl;
            link.click();
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
                '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🦁', '🐨'
            ]
        };
        
        const selectedStickers = stickers[stickerType] || [];
        
        // Get the dimensions of the photoStripPreview
        const containerWidth = photoStripPreview.offsetWidth;
        const containerHeight = photoStripPreview.offsetHeight;
        
        // Add 10-15 random stickers
        const numStickers = Math.floor(Math.random() * 6) + 10; // 10-15 stickers
        
        for (let i = 0; i < numStickers; i++) {
            const stickerIndex = Math.floor(Math.random() * selectedStickers.length);
            const stickerEmoji = selectedStickers[stickerIndex];
            
            // Create sticker element
            const sticker = document.createElement('div');
            sticker.className = 'sticker';
            sticker.textContent = stickerEmoji;
            sticker.style.position = 'absolute';
            sticker.style.fontSize = (Math.random() * 20 + 20) + 'px'; // Random size 20-40px
            
            // Random position
            const topPos = Math.random() * containerHeight;
            const leftPos = Math.random() * containerWidth;
            
            sticker.style.top = topPos + 'px';
            sticker.style.left = leftPos + 'px';
            
            // Random rotation
            const rotation = Math.random() * 60 - 30; // -30 to 30 degrees
            sticker.style.transform = `rotate(${rotation}deg)`;
            
            // Make stickers interactive and draggable
            sticker.style.cursor = 'move';
            sticker.style.userSelect = 'none';
            
            // Add draggable functionality
            makeDraggable(sticker);
            
            // Add to container
            stickersContainer.appendChild(sticker);
        }
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
