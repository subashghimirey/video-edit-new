import { start } from "repl";
import * as core from "../src";
import captions from "../src/test/cap_tim.json";
import { setupControls } from "./controls";
import { setupTimeline } from "./timeline";


interface TimingCaption {
  token: string;
  start: number;
  stop: number;
}


// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const audioUrl = urlParams.get('audioUrl');
const timingUrl = urlParams.get('timingUrl');

// Modify the fetchAudioUrl and fetchCaptions functions
async function fetchAudioUrl() {
    if (!audioUrl) {
        throw new Error('No audio URL provided');
    }
    return audioUrl;
}

// async function fetchCaptions() {
//     if (!timingUrl) {
//         throw new Error('No timing URL provided');
//     }
//     const response = await fetch(timingUrl);
//     const data = await response.json();
//     return data;
// }

async function fetchCaptions() {
    if (!timingUrl) {
        throw new Error('No timing URL provided');
    }
    const response = await fetch(timingUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch timing data: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched timing data:', data); // Debug log to see what we're getting
    return data;
}





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

// Interface definitions
interface VideoMetadata {
  width: number;
  height: number;
}

interface CaptionGrouping {
  wordsPerFrame: number;
  style: Partial<core.TextClipProps>;
}

interface UploadedVideo {
  url: string;
  name: string;
}

// Keep track of uploaded videos
const uploadedVideos: UploadedVideo[] = [];

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

// Function to handle file uploads
async function handleFileUpload(file: File): Promise<void> {
  try {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      throw new Error('Please upload a valid video file');
    }

    // Create object URL for the uploaded file
    const videoUrl = URL.createObjectURL(file);

    // Add to uploaded videos array
    uploadedVideos.push({
      url: videoUrl,
      name: file.name
    });

    // Add new option to video-list select
    const videoList = document.getElementById('video-list') as HTMLSelectElement;
    const option = document.createElement('option');
    option.value = videoUrl;
    option.text = `Uploaded: ${file.name}`;
    videoList.add(option);

    // Select the newly uploaded video
    videoList.value = videoUrl;

    // Load the new video
    await loadVideo(videoUrl, captionStyleSelect.value);

  } catch (error) {
    console.error('Error handling file upload:', error);
    alert(`Error uploading video: ${error.message}`);
  }
}

// Function to clean up object URLs
function cleanupUploadedVideos(): void {
  uploadedVideos.forEach(video => {
    URL.revokeObjectURL(video.url);
  });
  uploadedVideos.length = 0;
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

// Function to group captions
function groupCaptions(
  captions: TimingCaption[][],
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

async function fetchAudioDuration() {
    if (!audioUrl) {
        throw new Error('No audio URL provided');
    }
    
    return new Promise((resolve, reject) => {
        const tempAudio = new Audio();
        tempAudio.src = audioUrl;
        
        tempAudio.onloadedmetadata = () => {
            const duration = tempAudio.duration;
            console.log('Audio duration:', duration, 'seconds');
            resolve(duration);
        };
        
        tempAudio.onerror = () => {
            reject(new Error('Failed to load audio metadata'));
        };
    });
}


// Function to load the selected video
async function loadVideo(videoPath: string, captionStyle: string = "default", timingData?: any) {
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

    if (dimensions.width === 0 || dimensions.height === 0) {
      throw new Error('Invalid video dimensions');
    }

    const videoSource = await core.VideoSource.from(videoPath);

    const scaleWidth = TARGET_WIDTH / dimensions.width;
    const scaleHeight = TARGET_HEIGHT / dimensions.height;
    const scale = Math.max(scaleWidth, scaleHeight);

    console.log("Scale factor: ", scale);

    let startTime = 0;
    let stopTime = 10; // Default stop time

     if (audioUrl) {
            try {
                const audioDuration = await fetchAudioDuration();
                stopTime = Number(audioDuration); // Use audio duration as stop time
                console.log('Using audio duration for video stop time:', stopTime);
            } catch (error) {
                console.warn('Failed to get audio duration, using default stop time');
            }
        }

    const video = await composition.add(
      new core.VideoClip(videoSource, {
        volume: 0.1,
        anchor: 0.5,
        position: "center",
        scale,
      })
      .subclip(startTime, stopTime+ 10)
      .offsetBy(0)
    );

    // Use timingData if provided, otherwise fall back to imported captions
    const captionsToUse = await fetchCaptions();
    
    // Get selected caption style and group captions
    const styleConfig = captionStyles[captionStyle];
    const groupedCaptions = groupCaptions(captionsToUse, styleConfig.wordsPerFrame);

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
    alert(`Error loading video: ${error.message}`);
    throw error;
  }
}

// Set up event listeners
const videoList = document.getElementById("video-list") as HTMLSelectElement;
const captionStyleSelect = document.getElementById(
  "caption-style"
) as HTMLSelectElement;
const fileInput = document.getElementById('video-upload') as HTMLInputElement;

// Handle video selection change
videoList.addEventListener("change", async (event) => {
  const selectedVideoPath = (event.target as HTMLSelectElement).value;
  const selectedStyle = captionStyleSelect.value;
  
  try {
    const timingData = timingUrl ? await fetchCaptions() : null;
    await loadVideo(selectedVideoPath, selectedStyle, timingData);
  } catch (error) {
    console.error("Error loading video with timing data:", error);
  }
});


// Handle caption style change
captionStyleSelect.addEventListener("change", async () => {
  const selectedVideoPath = videoList.value;
  const selectedStyle = captionStyleSelect.value;
  
  try {
    const timingData = timingUrl ? await fetchCaptions() : null;
    await loadVideo(selectedVideoPath, selectedStyle, timingData);
  } catch (error) {
    console.error("Error updating caption style with timing data:", error);
  }
});

// Handle file upload
fileInput.addEventListener('change', async (event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    await handleFileUpload(files[0]);
  }
});

// Clean up object URLs when the window is closed/refreshed
window.addEventListener('beforeunload', cleanupUploadedVideos);

// Initial setup
(async () => {
    try {
        // Initial video load
        await loadVideo(videoList.value, "default");

        // Add audio using the provided URL
        if (audioUrl) {
            const audioSource = await core.AudioSource.from(audioUrl);
            const timingData = await fetchCaptions();
            await composition.add(
                new core.AudioClip(audioSource, {
                    transcript: core.Transcript.fromJSON(timingData).optimize(),
                })
            );
        }
    } catch (error) {
        console.error("Error in initial setup:", error);
        console.log("Audio URL:", audioUrl);
        console.log("Timing URL:", timingUrl);
    }
})();