
const video = document.getElementById("video");
const captureButton = document.querySelector(".capture-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const photoStripContainer = document.getElementById("photoStrip");
const countdownElement = document.getElementById("countdown");

let isCooldown = false;
let currentFilter = "none";
let photoCount = 0; // Track number of photos taken
let capturedPhotos = [];
let autoCaptureInterval = null;

// Request camera access
navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        alert("Camera access denied or unavailable.");
        console.error("Error accessing webcam:", err);
    });

// Filter functionality
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.getAttribute("data-filter");
        video.style.filter = getFilterStyle(currentFilter);
    });
});

// Function to return correct filter CSS
function getFilterStyle(filter) {
    switch (filter) {
        case "grayscale":
            return "grayscale(100%)";
        case "sepia":
            return "sepia(100%)";
        case "vintage":
            return "contrast(1.2) saturate(0.7)";
        case "soft":
            return "blur(2px)";
        default:
            return "none";
    }
}

// Countdown functionality
function startCountdown() {
    let countdown = 3;
    countdownElement.textContent = countdown;

    const timer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timer);
            capturePhoto(); // Capture the photo after countdown
        }
    }, 1000);
}

// Capture functionality
captureButton.addEventListener("click", () => {
    if (isCooldown) {
        return; // Prevent capture if in cooldown state
    }

    // Start automatic capture sequence
    captureButton.textContent = "Capturing...";
    captureButton.disabled = true;
    captureButton.classList.add("cooldown");
    
    startCountdown(); // Start initial countdown
});

// Capture the photo
function capturePhoto() {
    // Create a canvas to capture the video frame
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply filter style to canvas before drawing
    context.filter = getFilterStyle(currentFilter);
    
    // Draw the video frame to the canvas with filter applied
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create image element and add to photo strip
    const photo = new Image();
    photo.src = canvas.toDataURL("image/jpeg");
    photo.alt = "Captured Photo";
    photoStripContainer.appendChild(photo);

    // Increment the photo count
    capturedPhotos.push(photo.src); // Store the photo URL
    photoCount++;

    countdownElement.textContent = ""; // Clear countdown

    // If 5 photos captured, redirect to strip page
    if (photoCount >= 5) {
        localStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos)); // Save to localStorage
        setTimeout(() => {
            window.location.href = "strip.html"; // Redirect to strip page
        }, 1000); // Short delay before redirect
        return;
    }

    // Otherwise, set up the next photo capture after cooldown
    isCooldown = true;
    captureButton.textContent = "Please wait...";
    
    // Wait 2 seconds before starting the next countdown
    setTimeout(() => {
        isCooldown = false;
        startCountdown(); // Start countdown for next photo
    }, 2000);
}
