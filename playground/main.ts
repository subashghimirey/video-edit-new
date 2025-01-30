import * as core from '../src';
import captions from '../src/test/cap_tim.json';
import { setupControls } from './controls';
import { setupTimeline } from './timeline';

// Initialize the composition
const composition = new core.Composition();

setupControls(composition);
setupTimeline(composition);

interface VideoMetadata {
  width: number;
  height: number;
}

// Function to get video dimensions
async function getVideoDimensions(videoPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const tempVideo = document.createElement('video');
    tempVideo.onloadedmetadata = () => {
      resolve({
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight
      });
    };
    tempVideo.onerror = () => reject(new Error('Failed to load video metadata'));
    tempVideo.src = videoPath;
  });
}

// Function to load the selected video
async function loadVideo(videoPath: string) {
  try {
    // Clear existing video clips
    composition.findClips(core.VideoClip).forEach(clip => composition.remove(clip));

    // Load video metadata first
    const dimensions = await getVideoDimensions(videoPath);
    
    // Load the video source
    const videoSource = await core.VideoSource.from(videoPath);

    // Calculate aspect ratios using the dimensions we got separately
    const videoAspectRatio = dimensions.width / dimensions.height;
    const compositionAspectRatio = composition.width / composition.height;

    // Determine scaling factor
    const scale = videoAspectRatio > compositionAspectRatio
      ? composition.width / dimensions.width
      : composition.height / dimensions.height;

    // Add video clip with proper scaling
    const video = await composition.add(
      new core.VideoClip(videoSource, {
        volume: 0.1,
        anchor: 0.5,
        position: 'center',
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
    console.error('Error loading video:', error);
    throw error;
  }
}

// Set up video selection handling
const videoList = document.getElementById('video-list') as HTMLSelectElement;

videoList.addEventListener('change', async (event) => {
  const selectedVideoPath = (event.target as HTMLSelectElement).value;
  await loadVideo(selectedVideoPath);
});

// Initial video load
await loadVideo(videoList.value);

// Add audio
await composition.add(
  new core.AudioClip(await core.AudioSource.from('/speech.wav'), {
    transcript: core.Transcript.fromJSON(captions).optimize(),
  })
);