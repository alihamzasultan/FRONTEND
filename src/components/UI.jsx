import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [isListening, setIsListening] = useState(false); // State to track if voice input is active
  const recognitionRef = useRef(null); // Ref to store the SpeechRecognition instance
  const timeoutRef = useRef(null); // Ref for timeout handling

  // Initialize SpeechRecognition
  useEffect(() => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true; // Keep listening after one sentence
    recognition.interimResults = false; // Only final results
    recognition.lang = "en-US"; // Set language

    // Handle speech recognition results
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript; // Get the latest result
      input.current.value = transcript; // Update the input field

      // Automatically send the transcribed text to the chatbot
      chat(transcript);

      // Restart the mic after sending input
      restartRecognition();
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false); // Stop listening on error
      restartRecognition(); // Restart recognition to recover from the error
    };

    // Handle end of recognition
    recognition.onend = () => {
      if (isListening) {
        // If still supposed to be listening, restart recognition
        restartRecognition();
      }
    };

    recognitionRef.current = recognition; // Store the recognition instance in a ref

    // Cleanup on unmount
    return () => {
      recognition.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, message]);

  // Restart recognition
  const restartRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.start();
      }, 100); // Small delay before restarting
    }
  };

  // Start/stop voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current.stop(); // Stop listening
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear the timeout
      }
    } else {
      recognitionRef.current.start(); // Start listening
      setIsListening(true);

      // Periodically check and restart the mic
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          restartRecognition();
        }
      }, 5000); // Check every 5 seconds
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">3D Avatar Chatbot</h1>
          <p></p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-blue-400 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-blue-400 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                chat(input.current.value);
                input.current.value = "";
              }
            }}
          />
          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            className={`p-4 rounded-md ${
              isListening
                ? "bg-red-500 hover:bg-red-600" // Red when listening
                : "bg-blue-400 hover:bg-blue-600" // Blue when not listening
            } text-white`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};