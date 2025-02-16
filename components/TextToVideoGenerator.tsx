// "use client";
// import React, { useState } from "react";

// const VOICE_OPTIONS = [
//   { id: "en-GB_JamesV3Voice", name: "James (British Male)", accent: "British" },
//   { id: "en-GB_KateV3Voice", name: "Kate (British Female)", accent: "British" },
//   {
//     id: "en-US_AllisonV3Voice",
//     name: "Allison (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_EmilyV3Voice",
//     name: "Emily (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_HenryV3Voice",
//     name: "Henry (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_KevinV3Voice",
//     name: "Kevin (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_LisaV3Voice",
//     name: "Lisa (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_MichaelV3Voice",
//     name: "Michael (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_OliviaV3Voice",
//     name: "Olivia (American Female)",
//     accent: "American",
//   },
// ];

// const TextToSpeechGenerator = ({ onGenerated }) => {
//   const [inputText, setInputText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const cleanText = (text) => {
//     const markTags = [];
//     let cleanedText = text;

//     // Extract and temporarily store mark tags
//     const markRegex = /<mark[^>]*>.*?<\/mark>/g;
//     let markIndex = 0;
//     cleanedText = cleanedText.replace(markRegex, (match) => {
//       markTags.push(match);
//       return `__MARK${markIndex++}__`;
//     });

//     // Remove punctuation except for spaces and mark placeholders
//     cleanedText = cleanedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, "");

//     // Restore mark tags
//     markTags.forEach((tag, index) => {
//       cleanedText = cleanedText.replace(`__MARK${index}__`, tag);
//     });

//     return cleanedText;
//   };

//   const handleGenerate = async () => {
//     if (!inputText.trim()) {
//       setError("Please enter some text");
//       return;
//     }

//     setIsGenerating(true);
//     setError("");
//     setSuccess(false);

//     try {
//       const cleanedText = cleanText(inputText);

//       const response = await fetch("/api/text-to-speech", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           text: cleanedText,
//           voice: selectedVoice,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate speech");
//       }

//       const { audioUrl, timingUrl } = await response.json();

//       // Create download links for the audio file
//       const audioLink = document.createElement("a");
//       audioLink.href = audioUrl;
//       audioLink.download = audioUrl.split("/").pop();
//       audioLink.click();

//       // Create download links for the timing file
//       const timingLink = document.createElement("a");
//       timingLink.href = timingUrl;
//       timingLink.download = timingUrl.split("/").pop();
//       timingLink.click();

//       setSuccess(true);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Text to Speech Generator</h1>

//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label
//             htmlFor="voice-select"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Select Voice
//           </label>
//           <select
//             id="voice-select"
//             value={selectedVoice}
//             onChange={(e) => setSelectedVoice(e.target.value)}
//             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {VOICE_OPTIONS.map((voice) => (
//               <option key={voice.id} value={voice.id}>
//                 {voice.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label
//             htmlFor="text-input"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Enter Text
//           </label>
//           <textarea
//             id="text-input"
//             placeholder="Enter your text here..."
//             className="w-full min-h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//           />
//         </div>

//         <button
//           onClick={handleGenerate}
//           disabled={isGenerating || !inputText.trim()}
//           className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {isGenerating ? "Generating..." : "Generate Audio"}
//         </button>

//         {error && (
//           <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
//         )}

//         {success && (
//           <div className="p-4 bg-green-50 text-green-700 rounded-lg">
//             Files generated successfully! Check your downloads folder.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TextToSpeechGenerator;

// "use client";
// import React, { useState } from "react";

// const VOICE_OPTIONS = [
//   { id: "en-GB_JamesV3Voice", name: "James (British Male)", accent: "British" },
//   { id: "en-GB_KateV3Voice", name: "Kate (British Female)", accent: "British" },
//   {
//     id: "en-US_AllisonV3Voice",
//     name: "Allison (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_EmilyV3Voice",
//     name: "Emily (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_HenryV3Voice",
//     name: "Henry (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_KevinV3Voice",
//     name: "Kevin (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_LisaV3Voice",
//     name: "Lisa (American Female)",
//     accent: "American",
//   },
//   {
//     id: "en-US_MichaelV3Voice",
//     name: "Michael (American Male)",
//     accent: "American",
//   },
//   {
//     id: "en-US_OliviaV3Voice",
//     name: "Olivia (American Female)",
//     accent: "American",
//   },
// ];

// const TextToSpeechGenerator = () => {
//   const [inputText, setInputText] = useState("");
//   const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const cleanText = (text) => {
//     const markTags = [];
//     let cleanedText = text;

//     // Extract and temporarily store mark tags
//     const markRegex = /<mark[^>]*>.*?<\/mark>/g;
//     let markIndex = 0;
//     cleanedText = cleanedText.replace(markRegex, (match) => {
//       markTags.push(match);
//       return `__MARK${markIndex++}__`;
//     });

//     // Remove punctuation except for spaces and mark placeholders
//     cleanedText = cleanedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, "");

//     // Restore mark tags
//     markTags.forEach((tag, index) => {
//       cleanedText = cleanedText.replace(`__MARK${index}__`, tag);
//     });

//     return cleanedText;
//   };

//   const handleGenerate = async () => {
//     if (!inputText.trim()) {
//       setError("Please enter some text");
//       return;
//     }

//     setIsGenerating(true);
//     setError("");
//     setSuccess(false);

//     try {
//       const cleanedText = cleanText(inputText);

//       const response = await fetch("/api/text-to-speech", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           text: cleanedText,
//           voice: selectedVoice,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate speech");
//       }

//       const { audioUrl, timingUrl } = await response.json();

//       // Create download links for the audio file
//       const audioLink = document.createElement("a");
//       audioLink.href = audioUrl;
//       audioLink.download = audioUrl.split("/").pop();
//       audioLink.click();

//       // Create download links for the timing file
//       const timingLink = document.createElement("a");
//       timingLink.href = timingUrl;
//       timingLink.download = timingUrl.split("/").pop();
//       timingLink.click();

//       setSuccess(true);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Text to Speech Generator</h1>

//       <div className="space-y-4">
//         <div className="space-y-2">
//           <label
//             htmlFor="voice-select"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Select Voice
//           </label>
//           <select
//             id="voice-select"
//             value={selectedVoice}
//             onChange={(e) => setSelectedVoice(e.target.value)}
//             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             {VOICE_OPTIONS.map((voice) => (
//               <option key={voice.id} value={voice.id}>
//                 {voice.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label
//             htmlFor="text-input"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Enter Text
//           </label>
//           <textarea
//             id="text-input"
//             placeholder="Enter your text here..."
//             className="w-full min-h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//           />
//         </div>

//         <button
//           onClick={handleGenerate}
//           disabled={isGenerating || !inputText.trim()}
//           className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {isGenerating ? "Generating..." : "Generate Audio"}
//         </button>

//         {error && (
//           <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
//         )}

//         {success && (
//           <div className="p-4 bg-green-50 text-green-700 rounded-lg">
//             Files generated successfully! Check your downloads folder.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TextToSpeechGenerator;

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

    const API_URL = import.meta.env.PROD
      ? "/api/text-to-speech"
      : "http://localhost:3000/api/text-to-speech";

    try {
      const cleanedText = cleanText(inputText);

      const response = await fetch("/api/text-to-speech", {
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

      // Set the generated audio and timing URLs in state
      setGeneratedAudioUrl(audioUrl);
      setGeneratedTimingUrl(timingUrl);

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Text to Speech Generatorssss</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="voice-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select Voice
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {VOICE_OPTIONS.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="text-input"
            className="block text-sm font-medium text-gray-700"
          >
            Enter Text
          </label>
          <textarea
            id="text-input"
            placeholder="Enter your text here..."
            className="w-full min-h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !inputText.trim()}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Audio"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
            Files generated successfully!
          </div>
        )}
      </div>

      {/* Pass the generated audio and timing URLs to the VideoEditor component */}
    </div>
  );
};

export default TextToSpeechGenerator;
