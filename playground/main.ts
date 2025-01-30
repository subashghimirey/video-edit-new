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

// Add interface to define how tokens should be grouped
interface CaptionGrouping {
  wordsPerFrame: number;
  style: Partial<core.TextClipProps>;
}

// Define caption styles using TextClip properties with grouping information
const captionStyles: Record<string, CaptionGrouping> = {
  default: {
    wordsPerFrame: 1,
    style: {
      fontSize: 30,
      fillStyle: "#FFFFFF",
      stroke: {
        color: "#000000",
        width: 3,
        alpha: 1,
      },
      textAlign: "center",
      textBaseline: "middle",
    },
  },
  dramatic: {
    wordsPerFrame: 2,
    style: {
      fontSize: 42,
      fillStyle: "#FFD700",
      stroke: {
        color: "#000000",
        width: 5,
        alpha: 1,
      },
      shadow: {
        color: "#000000",
        blur: 6,
        distance: 3,
        alpha: 0.6,
      },
      textAlign: "center",
      textBaseline: "middle",
    },
  },
  modern: {
    wordsPerFrame: 3,
    style: {
      fontSize: 34,
      fillStyle: "#FFFFFF",
      stroke: {
        color: "#000000",
        width: 2,
        alpha: 0.5,
      },
      shadow: {
        color: "#000000",
        blur: 12,
        distance: 4,
        alpha: 0.8,
      },
      textCase: "upper",
      textAlign: "center",
      textBaseline: "middle",
    },
  },
  subtitle: {
    wordsPerFrame: 4,
    style: {
      fontSize: 32,
      fillStyle: "#FFFFFF",
      stroke: {
        color: "#000000",
        width: 2,
        alpha: 0.8,
      },
      shadow: {
        color: "#000000",
        blur: 3,
        distance: 2,
        alpha: 0.5,
      },
      textAlign: "center",
      textBaseline: "middle",
    },
  },
  minimal: {
    wordsPerFrame: 5,
    style: {
      fontSize: 28,
      fillStyle: "#FFFFFF",
      stroke: {
        color: "#000000",
        width: 2,
        alpha: 0.3,
      },
      textAlign: "center",
      textBaseline: "middle",
    },
  },
};

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

// Function to group captions based on style
function groupCaptions(
  captions: typeof import("../src/test/cap_tim.json"),
  wordsPerFrame: number
) {
  const groupedCaptions: Array<{
    tokens: string[];
    start: number;
    stop: number;
  }> = [];

  let currentGroup: string[] = [];
  let currentStart: number | null = null;
  let lastStop: number | null = null;

  captions.forEach((segment) => {
    segment.forEach((caption) => {
      if (currentGroup.length === 0) {
        currentStart = caption.start;
      }

      currentGroup.push(caption.token);
      lastStop = caption.stop;

      if (currentGroup.length >= wordsPerFrame) {
        groupedCaptions.push({
          tokens: [...currentGroup],
          start: currentStart!,
          stop: lastStop,
        });
        currentGroup = [];
        currentStart = null;
      }
    });
  });

  // Add any remaining tokens
  if (currentGroup.length > 0 && currentStart !== null && lastStop !== null) {
    groupedCaptions.push({
      tokens: currentGroup,
      start: currentStart,
      stop: lastStop,
    });
  }

  return groupedCaptions;
}

// Function to load the selected video
async function loadVideo(videoPath: string, captionStyle: string = "default") {
  try {
    // Clear existing video clips
    composition
      .findClips(core.VideoClip)
      .forEach((clip) => composition.remove(clip));

    // Clear existing text clips (captions)
    composition
      .findClips(core.TextClip)
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

    // Get selected caption style and group captions
    const styleConfig = captionStyles[captionStyle];
    const groupedCaptions = groupCaptions(captions, styleConfig.wordsPerFrame);

    // Add captions with selected style
    groupedCaptions.forEach((group) => {
      composition.add(
        new core.TextClip({
          text: group.tokens.join(" "),
          start: new core.Timestamp(group.start),
          stop: new core.Timestamp(group.stop),
          x: TARGET_WIDTH / 2,
          y: TARGET_HEIGHT * 0.85,
          ...styleConfig.style,
        })
      );
    });
  } catch (error) {
    console.error("Error loading video:", error);
    throw error;
  }
}

// Set up video selection handling
const videoList = document.getElementById("video-list") as HTMLSelectElement;
const captionStyleSelect = document.getElementById(
  "caption-style"
) as HTMLSelectElement;

// Handle video selection change
videoList.addEventListener("change", async (event) => {
  const selectedVideoPath = (event.target as HTMLSelectElement).value;
  const selectedStyle = captionStyleSelect.value;
  await loadVideo(selectedVideoPath, selectedStyle);
});

// Handle caption style change
captionStyleSelect.addEventListener("change", async () => {
  const selectedVideoPath = videoList.value;
  const selectedStyle = captionStyleSelect.value;
  await loadVideo(selectedVideoPath, selectedStyle);
});

// Initial video load
await loadVideo(videoList.value, "default");

// Add audio
await composition.add(
  new core.AudioClip(await core.AudioSource.from("/speech.wav"), {
    transcript: core.Transcript.fromJSON(captions).optimize(),
  })
);
