
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
            
            // Apply stickers logic would go here
            applyStickers(selectedSticker);
        });
    });
    
    // Take new photos button
    newPhotosBtn.addEventListener('click', function() {
        window.location.href = 'photobooth.html';
    });
    
    // Download photo strip button
    downloadBtn.addEventListener('click', function() {
        // This is a simplified version. In a real app, you'd want to use html2canvas
        // or another method to capture the entire strip with applied styles
        alert('Download feature would save the customized photo strip');
        
        // For a simple implementation:
        const link = document.createElement('a');
        link.download = 'photo-strip.png';
        // This is just a placeholder. You'd need to create a composite image
        // of all photos with the selected frame and stickers
        link.href = document.querySelector('#photoStripPreview img').src;
        link.click();
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
        // This would implement the sticker application logic
        console.log(`Applying ${stickerType} stickers`);
        // This is just a placeholder. In a real app, you would add sticker elements
        // to the photoStripPreview container
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
