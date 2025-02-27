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
let isMirrored = false; // Track mirror state

// Check if running on iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// Initialize camera with iOS-specific handling
async function initializeCamera() {
  try {
    // iOS-specific constraints
    const constraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: isIOS ? 640 : 1280 },
        height: { ideal: isIOS ? 480 : 720 },
      },
    };

    // For iOS, we need to add the playsinline attribute
    if (isIOS) {
      video.setAttribute("playsinline", "true");
      video.setAttribute("autoplay", "true");
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    // Special handling for iOS Safari
    if (isIOS) {
      // Wait for loadedmetadata before playing
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });

      // Explicitly call play() after metadata is loaded
      try {
        await video.play();
        // Add success indicator
        const successIndicator = document.createElement("div");
        successIndicator.className = "camera-status active";
        video.parentElement.appendChild(successIndicator);
      } catch (playError) {
        console.error("Playback failed:", playError);
        alert("Please tap the camera area to start the video stream");

        // Add tap-to-start overlay for iOS
        const tapOverlay = document.createElement("div");
        tapOverlay.className = "tap-to-start";
        tapOverlay.innerHTML = `
                    <div class="tap-message">
                        <span>📱</span>
                        <p>Tap to start camera</p>
                    </div>
                `;
        video.parentElement.appendChild(tapOverlay);

        // Handle tap to start
        tapOverlay.addEventListener("click", async () => {
          try {
            await video.play();
            tapOverlay.remove();
          } catch (e) {
            console.error("Play failed after tap:", e);
            alert(
              "Camera access failed. Please check your permissions and try again.",
            );
          }
        });
      }
    } else {
      // Non-iOS devices can just play
      video.play();
    }

    // Enable the capture button once video is playing
    video.onplaying = () => {
      captureButton.disabled = false;
      captureButton.textContent = "Start Capture";
    };
  } catch (err) {
    console.error("Camera access error:", err);
    const errorMessage = isIOS
      ? "Camera access failed on iOS. Please check your camera permissions in Settings → Safari → Camera"
      : "Camera access denied or unavailable.";
    alert(errorMessage);
  }
}

// Start camera initialization when page loads
document.addEventListener("DOMContentLoaded", initializeCamera);

// Filter functionality
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.getAttribute("data-filter");
    if (currentFilter === "mirror") {
      isMirrored = !isMirrored; // Toggle mirror state
      video.style.transform = isMirrored ? "scaleX(-1)" : "none";
    } else {
      video.style.filter = getFilterStyle(currentFilter);
    }
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

  // Handle mirroring effect during capture
  if (isMirrored) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }

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
