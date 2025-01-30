import * as core from "../src";
import captions from "../src/test/cap_tim.json";
import { setupControls } from "./controls";
import { setupTimeline } from "./timeline";

// Define target dimensions for 9:16 aspect ratio at 1920x1080
const TARGET_WIDTH = 1080; // For 9:16 ratio, width is smaller
const TARGET_HEIGHT = 1920; // For 9:16 ratio, height is larger

// Initialize the composition with target dimensions
const composition = new core.Composition({
  width: TARGET_WIDTH,
  height: TARGET_HEIGHT,
});

setupControls(composition);
setupTimeline(composition);

interface VideoMetadata {
  width: number;
  height: number;
}

// Function to get video dimensions
async function getVideoDimensions(videoPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const tempVideo = document.createElement("video");
    tempVideo.onloadedmetadata = () => {
      resolve({
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
      });
    };
    tempVideo.onerror = () =>
      reject(new Error("Failed to load video metadata"));
    tempVideo.src = videoPath;
  });
}

// Function to load the selected video
async function loadVideo(videoPath: string) {
  try {
    // Clear existing video clips
    composition
      .findClips(core.VideoClip)
      .forEach((clip) => composition.remove(clip));

    // Load video metadata first
    const dimensions = await getVideoDimensions(videoPath);
    console.log("Video dimensions: ", dimensions);

    // Load the video source
    const videoSource = await core.VideoSource.from(videoPath);

    // Calculate scaling factors for both dimensions
    const scaleWidth = TARGET_WIDTH / dimensions.width;
    const scaleHeight = TARGET_HEIGHT / dimensions.height;

    // Use the larger scale to ensure the video fills the frame
    // This might crop some content but ensures no black bars
    const scale = Math.max(scaleWidth, scaleHeight);

    console.log("Scale factor: ", scale);

    // Add video clip with proper scaling
    const video = await composition.add(
      new core.VideoClip(videoSource, {
        volume: 0.1,
        anchor: 0.5,
        position: "center",
        scale,
      })
    );

    // Add captions - adjusted Y position for new aspect ratio
    captions.forEach((segment) => {
      segment.forEach((caption) => {
        composition.add(
          new core.TextClip({
            text: caption.token,
            start: new core.Timestamp(caption.start),
            stop: new core.Timestamp(caption.stop),
            textAlign: "center",
            textBaseline: "middle",
            fontSize: 30, // Increased font size for larger resolution
            stroke: {
              width: 3, // Increased stroke width for larger resolution
              color: "#000000",
            },
            x: TARGET_WIDTH / 2,
            y: TARGET_HEIGHT * 0.85,
          })
        );
      });
    });
  } catch (error) {
    console.error("Error loading video:", error);
    throw error;
  }
}

// Set up video selection handling
const videoList = document.getElementById("video-list") as HTMLSelectElement;

videoList.addEventListener("change", async (event) => {
  const selectedVideoPath = (event.target as HTMLSelectElement).value;
  await loadVideo(selectedVideoPath);
});

// Initial video load
await loadVideo(videoList.value);

// Add audio
await composition.add(
  new core.AudioClip(await core.AudioSource.from("/speech.wav"), {
    transcript: core.Transcript.fromJSON(captions).optimize(),
  })
);
