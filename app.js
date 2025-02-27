const startBtn = document.getElementById('startBtn');
const introPage = document.getElementById('introPage');
const photoBooth = document.getElementById('photoBooth');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapBtn = document.getElementById('snapBtn');
const filterSelect = document.getElementById('filterSelect');
const photoStrip = document.getElementById('photoStrip');

// Start button click handler
startBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    photoBooth.style.display = 'block';
    startCamera();
});

// Start camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
}

// Take picture
snapBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0);

    // Apply selected filter
    applyFilter(context);

    // Create photo for the strip
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    photoStrip.insertBefore(img, photoStrip.firstChild);
});

// Apply selected filter
function applyFilter(context) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch(filterSelect.value) {
        case 'grayscale':
            for(let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
            }
            break;

        case 'sepia':
            for(let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);     // red
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
            }
            break;

        case 'invert':
            for(let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];         // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }
            break;
    }

    context.putImageData(imageData, 0, 0);
}