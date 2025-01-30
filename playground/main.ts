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
  wordsPerFrame: number;  // How many words to show per caption
  style: Partial<core.TextClipProps>;  // The visual style
}

// Define caption styles using TextClip properties with grouping information
const captionStyles: Record<string, CaptionGrouping> = {
  default: {
    wordsPerFrame: 1,  // Show one word at a time
    style: {
      fontSize: 20,
      fillStyle: '#FFFFFF',
      stroke: {
        color: '#000000',
        width: 2,
        alpha: 1,
      },
      textAlign: 'center',
      textBaseline: 'middle',
    }
  },
  dramatic: {
    wordsPerFrame: 2,  // Show two words at a time
    style: {
      fontSize: 16,
      fillStyle: '#FFD700', // Gold color
      stroke: {
        color: '#000000',
        width: 4,
        alpha: 1,
      },
      shadow: {
        color: '#000000',
        blur: 4,
        distance: 2,
        alpha: 0.6,
      },
      textAlign: 'center',
      textBaseline: 'middle',
    }
  },
  modern: {
    wordsPerFrame: 3,  // Show three words at a time
    style: {
      fontSize: 22,
      fillStyle: '#FFFFFF',
      stroke: {
        color: '#000000',
        width: 1,
        alpha: 0.5,
      },
      shadow: {
        color: '#000000',
        blur: 8,
        distance: 3,
        alpha: 0.8,
      },
      textCase: 'upper',
      textAlign: 'center',
      textBaseline: 'middle',
    }
  },
  subtitle: {
    wordsPerFrame: 4,  // Show four words at a time (more like traditional subtitles)
    style: {
      fontSize: 20,
      fillStyle: '#FFFFFF',
      stroke: {
        color: '#000000',
        width: 1,
        alpha: 0.8,
      },
      shadow: {
        color: '#000000',
        blur: 2,
        distance: 1,
        alpha: 0.5,
      },
      textAlign: 'center',
      textBaseline: 'middle',
    }
  },
  minimal: {
    wordsPerFrame: 5,  // Show five words at a time
    style: {
      fontSize: 18,
      fillStyle: '#FFFFFF',
      stroke: {
        color: '#000000',
        width: 1,
        alpha: 0.3,
      },
      textAlign: 'center',
      textBaseline: 'middle',
    }
  }
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
function groupCaptions(captions: typeof import('../src/test/cap_tim.json'), wordsPerFrame: number) {
  const groupedCaptions: Array<{
    tokens: string[];
    start: number;
    stop: number;
  }> = [];
  
  let currentGroup: string[] = [];
  let currentStart: number | null = null;
  let lastStop: number | null = null;

  captions.forEach(segment => {
    segment.forEach(caption => {
      if (currentGroup.length === 0) {
        currentStart = caption.start;
      }

      currentGroup.push(caption.token);
      lastStop = caption.stop;

      if (currentGroup.length >= wordsPerFrame) {
        groupedCaptions.push({
          tokens: [...currentGroup],
          start: currentStart!,
          stop: lastStop
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
      stop: lastStop
    });
  }

  return groupedCaptions;
}

// Function to load the selected video with captions
async function loadVideo(videoPath: string, captionStyle: string = 'default') {
  try {
    // Clear existing video clips
    composition.findClips(core.VideoClip).forEach(clip => composition.remove(clip));

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

    // Add captions
    captions.forEach((segment) => {
      segment.forEach((caption) => {
        composition.add(
          new core.TextClip({
            text: caption.token,
            start: new core.Timestamp(caption.start),
            stop: new core.Timestamp(caption.stop),
            textAlign: 'center',
            textBaseline: 'middle',
            fontSize: 20,
            stroke: {
              width: 2,
              color: '#000000',
            },
            x: composition.width / 2,
            y: composition.height * 0.85,
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
const videoList = document.getElementById('video-list') as HTMLSelectElement;

videoList.addEventListener('change', async (event) => {
  const selectedVideoPath = (event.target as HTMLSelectElement).value;
  const selectedStyle = captionStyleSelect.value;
  await loadVideo(selectedVideoPath, selectedStyle);
});

// Handle caption style change
captionStyleSelect.addEventListener('change', async () => {
  const selectedVideoPath = videoList.value;
  const selectedStyle = captionStyleSelect.value;
  await loadVideo(selectedVideoPath, selectedStyle);
});

// Initial video load with default style
await loadVideo(videoList.value, 'default');

// Add audio
await composition.add(
  new core.AudioClip(await core.AudioSource.from("/speech.wav"), {
    transcript: core.Transcript.fromJSON(captions).optimize(),
  })
);
