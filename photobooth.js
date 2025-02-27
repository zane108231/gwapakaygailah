const video = document.getElementById("video");
const captureButton = document.querySelector(".capture-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const photoStripContainer = document.getElementById("photoStrip");
const countdownElement = document.getElementById("countdown");

let isCooldown = false;
let currentFilter = "none";
let photoCount = 0; // Track number of photos taken
let capturedPhotos = [];

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

    isCooldown = true;
    captureButton.classList.add("cooldown");
    captureButton.textContent = "Please wait...";

    startCountdown(); // Start the countdown

    // Set cooldown timer (e.g., 5 seconds)
    setTimeout(() => {
        isCooldown = false;
        captureButton.classList.remove("cooldown");
        captureButton.textContent = "Start Capture :)";
        countdownElement.textContent = ""; // Hide the countdown
    }, 5000);
});

// Capture the photo
function capturePhoto() {
    if (photoCount >= 5) {
        // Store photos in localStorage and redirect to photo strip
        localStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));
        window.location.href = "strip.html";
        return;
    }

    // Create a canvas to capture the video frame
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas with applied filter
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply filter style to canvas if needed
    context.filter = getFilterStyle(currentFilter);

    // Create image element and add to photo strip
    const photo = new Image();
    photo.src = canvas.toDataURL("image/jpeg");
    photo.alt = "Captured Photo";
    photoStripContainer.appendChild(photo);

    // Increment the photo count
    capturedPhotos.push(photo.src); // Store the photo URL
    photoCount++;

    // If 5 photos are captured, redirect
    if (photoCount >= 5) {
        setTimeout(() => {
            localStorage.setItem(
                "capturedPhotos",
                JSON.stringify(capturedPhotos),
            ); // Save to localStorage
            window.location.href = "strip.html"; // Redirect to strip page
        }, 2000);
    }
}
