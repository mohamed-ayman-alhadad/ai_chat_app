import { useState } from "react";

function VoiceButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Use Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-EG"; // عربي — غيره لـ "en-US" لو عايز انجليزي
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript); // بيبعت الكلام للـ InputBar
    };

    recognition.onerror = (event) => {
      console.error("Voice error:", event.error);
      setListening(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      disabled={disabled || listening}
      className={`p-2 rounded-full transition text-xl
        ${listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-200 hover:bg-gray-300 text-gray-600"
        }`}
      title="Voice message"
    >
      {listening ? "🔴" : "🎤"}
    </button>
  );
}

export default VoiceButton;