import express from "express";
import cors from "cors";
import { WebSocket } from "ws";
import { IamAuthenticator } from "ibm-cloud-sdk-core";
import TextToSpeechV1 from "ibm-watson/text-to-speech/v1.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config(); // If your file is named `.env.local`, use dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

const WATSON_API_KEY = "gHRYqo6LL2caBO0K7mx3kd_oiF1O0FW49lq3ja0ch1Wy";
const WATSON_INSTANCE_ID = "f43c1f22-b1b5-4917-b211-cadd55bdcab3";
const WATSON_SERVICE_URL =
  "https://api.au-syd.text-to-speech.watson.cloud.ibm.com";

// Debugging: Check if environment variables are loaded
console.log("Watson API Key:", WATSON_API_KEY);
console.log("Watson Instance ID:", WATSON_INSTANCE_ID);
console.log("Watson Service URL:", WATSON_SERVICE_URL);

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/generated", express.static(join(__dirname, "public/generated")));

// Text-to-speech endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voice } = req.body;

    // Ensure API key is available
    if (!WATSON_API_KEY || !WATSON_SERVICE_URL) {
      return res
        .status(500)
        .json({ error: "Watson API credentials are missing" });
    }

    // Initialize Watson TTS
    const tts = new TextToSpeechV1({
      authenticator: new IamAuthenticator({
        apikey: WATSON_API_KEY,
      }),
      serviceUrl: WATSON_SERVICE_URL,
    });

    // Get access token
    await tts.authenticator.tokenManager.requestToken();
    const accessToken = await tts.authenticator.tokenManager.getToken();

    // Create WebSocket URL
    const wsUrl = new URL(
      `/instances/${WATSON_INSTANCE_ID}/v1/synthesize`,
      WATSON_SERVICE_URL.replace("https", "wss")
    );
    wsUrl.searchParams.set("access_token", accessToken);
    wsUrl.searchParams.set("voice", voice);

    // Generate unique filename
    const timestamp = Date.now();
    const audioFilename = `speech_${timestamp}.wav`;
    const timingFilename = `timing_${timestamp}.json`;

    // Create directories if they don't exist
    const audioDir = join(__dirname, "public", "generated", "audio");
    const timingDir = join(__dirname, "public", "generated", "timing");
    await mkdir(audioDir, { recursive: true });
    await mkdir(timingDir, { recursive: true });

    // Initialize data collection
    const audioChunks = [];
    const timingData = [];
    let marks = [];

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl.toString());

      ws.on("open", () => {
        const synthesisRequest = {
          text,
          accept: "audio/wav",
          timings: ["words"],
          voice: voice,
        };

        ws.send(JSON.stringify(synthesisRequest));
      });

      ws.on("message", (data) => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.marks) {
            marks = marks.concat(jsonData.marks);
          }
          if (jsonData.words) {
            const [word, start, end] = jsonData.words[0];
            timingData.push({
              token: word,
              start: Math.round(start * 1000),
              stop: Math.round(end * 1000),
            });
          }
        } catch (e) {
          // Handle binary audio data
          audioChunks.push(data);
        }
      });

      ws.on("close", async () => {
        try {
          // Process marks
          marks.forEach(([name, time]) => {
            const timeMs = Math.round(time * 1000);
            const insertIndex = timingData.findIndex(
              (item) => item.start >= timeMs
            );
            if (insertIndex !== -1) {
              timingData.splice(insertIndex, 0, {
                token: name,
                start: timeMs,
                stop: timeMs,
              });
            }
          });

          // Save files
          const audioBuffer = Buffer.concat(audioChunks);
          const audioPath = join(audioDir, audioFilename);
          const timingPath = join(timingDir, timingFilename);

          await writeFile(audioPath, audioBuffer);
          await writeFile(timingPath, JSON.stringify([timingData], null, 2));

          // Send response
          res.status(200).json({
            audioUrl: `/generated/audio/${audioFilename}`,
            timingUrl: `/generated/timing/${timingFilename}`,
            message: "Files generated successfully",
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      ws.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error in text-to-speech generation:", error);
    res.status(500).json({ error: error.message });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


