

"use client";
import React, { useState } from "react";

//import VideoEditor from "./VideoEditor"; // Import the VideoEditor component

const VOICE_OPTIONS = [
  { id: "en-GB_JamesV3Voice", name: "James (British Male)", accent: "British" },
  { id: "en-GB_KateV3Voice", name: "Kate (British Female)", accent: "British" },
  {
    id: "en-US_AllisonV3Voice",
    name: "Allison (American Female)",
    accent: "American",
  },
  {
    id: "en-US_EmilyV3Voice",
    name: "Emily (American Female)",
    accent: "American",
  },
  {
    id: "en-US_HenryV3Voice",
    name: "Henry (American Male)",
    accent: "American",
  },
  {
    id: "en-US_KevinV3Voice",
    name: "Kevin (American Male)",
    accent: "American",
  },
  {
    id: "en-US_LisaV3Voice",
    name: "Lisa (American Female)",
    accent: "American",
  },
  {
    id: "en-US_MichaelV3Voice",
    name: "Michael (American Male)",
    accent: "American",
  },
  {
    id: "en-US_OliviaV3Voice",
    name: "Olivia (American Female)",
    accent: "American",
  },
];

const TextToSpeechGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [generatedTimingUrl, setGeneratedTimingUrl] = useState(null);

  const cleanText = (text: string) => {
    const markTags: string[] = [];
    let cleanedText = text;

    // Extract and temporarily store mark tags
    const markRegex = /<mark[^>]*>.*?<\/mark>/g;
    let markIndex = 0;
    cleanedText = cleanedText.replace(markRegex, (match) => {
      markTags.push(match);
      return `__MARK${markIndex++}__`;
    });

    // Remove punctuation except for spaces and mark placeholders
    cleanedText = cleanedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, "");

    // Restore mark tags
    markTags.forEach((tag, index) => {
      cleanedText = cleanedText.replace(`__MARK${index}__`, tag);
    });

    return cleanedText;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess(false);

const API_URL = process.env.NODE_ENV === 'production' 
  ? "/api/text-to-speech"
  : "http://localhost:3000/api/text-to-speech";
    try {
      const cleanedText = cleanText(inputText);

      const response = await fetch(`/api/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanedText,
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const { audioUrl, timingUrl } = await response.json();

      console.log(audioUrl, timingUrl);

      // Set the generated audio and timing URLs in state
      setGeneratedAudioUrl(audioUrl);
      setGeneratedTimingUrl(timingUrl);

      setSuccess(true);

      setTimeout(() => {
  const queryParams = new URLSearchParams({
    audioUrl: `/generated/audio/${audioUrl.split('/').pop()}`,  // Get just the filename
    timingUrl: `/generated/timing/${timingUrl.split('/').pop()}`  // Get just the filename
  });
  window.location.href = `/text-to-video.html?${queryParams.toString()}`;
}, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    
 <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          maxWidth: "48rem",
          padding: "2rem",
          backgroundColor: "#ffffff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          border: "1px solid #e5e7eb",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            color: "#111827",
            lineHeight: "2.25rem",
          }}
        >
          Text to Speech Generator
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label
              htmlFor="voice-select"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Select Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                outline: "none",
                backgroundColor: "#f9fafb",
                fontSize: "0.875rem",
                color: "#111827",
                cursor: "pointer",
              }}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="text-input"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Enter Text
            </label>
            <textarea
              id="text-input"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: "100%",
                minHeight: "10rem",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                outline: "none",
                backgroundColor: "#f9fafb",
                fontSize: "0.875rem",
                color: "#111827",
                resize: "vertical",
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: isGenerating || !inputText.trim() ? "#9ca3af" : "#3b82f6",
              color: "#ffffff",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: isGenerating || !inputText.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isGenerating ? "Generating..." : "Generate Audio"}
          </button>

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                borderRadius: "0.5rem",
                border: "1px solid #fecaca",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                borderRadius: "0.5rem",
                border: "1px solid #bbf7d0",
                fontSize: "0.875rem",
              }}
            >
              Files generated successfully! Redirecting to video editor...
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default TextToSpeechGenerator;
