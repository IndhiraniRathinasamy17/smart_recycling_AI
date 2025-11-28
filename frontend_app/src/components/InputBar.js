



// src/components/InputBar.js
// import React, { useState, useRef, useEffect } from "react";
// import "./InputBar.css";

// export default function InputBar({ onSendMessage, onUploadFile }) {
//   const [text, setText] = useState("");
//   const [showMenu, setShowMenu] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [useWebSpeech, setUseWebSpeech] = useState(false);

//   const fileInputRef = useRef(null);
//   const recognitionRef = useRef(null);

//   useEffect(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition || null;

//     if (SpeechRecognition) {
//       setUseWebSpeech(true);
//       const r = new SpeechRecognition();
//       r.lang = "en-IN";
//       r.interimResults = false;
//       r.maxAlternatives = 1;

//       r.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setText((t) => (t ? `${t} ${transcript}` : transcript));
//       };

//       r.onerror = (e) => console.warn("SpeechRecognition error:", e);
//       r.onend = () => setListening(false);

//       recognitionRef.current = r;
//     }
//   }, []);

//   // -------- MediaRecorder (fallback recording) --------
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);

//   const startMediaRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);

//       recordedChunksRef.current = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) recordedChunksRef.current.push(e.data);
//       };

//       mediaRecorder.onstop = async () => {
//         const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

//         const form = new FormData();
//         form.append("file", blob, "recording.webm");

//         try {
//           const resp = await fetch("http://127.0.0.1:8000/audio/transcribe", {
//             method: "POST",
//             body: form,
//           });

//           const data = await resp.json();
//           if (data?.text) {
//             setText((t) => (t ? `${t} ${data.text}` : data.text));
//           }
//         } catch (err) {
//           console.error("Transcription failed:", err);
//         }
//       };

//       mediaRecorder.start();
//       mediaRecorderRef.current = mediaRecorder;
//       setListening(true);
//     } catch (err) {
//       alert("Microphone access denied.");
//     }
//   };

//   const stopMediaRecording = () => {
//     const mr = mediaRecorderRef.current;
//     if (mr && mr.state !== "inactive") {
//       mr.stop();
//       mr.stream.getTracks().forEach((t) => t.stop());
//     }
//     setListening(false);
//   };

//   // -------- Mic Toggle --------
//   const toggleMic = async () => {
//     if (useWebSpeech && recognitionRef.current) {
//       if (!listening) {
//         recognitionRef.current.start();
//         setListening(true);
//       } else {
//         recognitionRef.current.stop();
//         setListening(false);
//       }
//       return;
//     }

//     if (!listening) startMediaRecording();
//     else stopMediaRecording();
//   };

//   // -------- Send & Upload Handlers --------
//   const handleSend = () => {
//     if (text.trim()) {
//       onSendMessage(text.trim());
//       setText("");
//     }
//   };

//   const handleFileClick = () => {
//     setShowMenu(false);
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (e) => {
//     if (e.target.files.length > 0) {
//       onUploadFile(e.target.files[0]);
//     }
//   };

//   return (
//     <div className="input-bar-container">
//       <div className="input-wrapper">
//         <h2 className="header-text">What can I help with?</h2>

//         <div className="input-box">
//           {/* + Button */}
//           <div className="plus-btn" onClick={() => setShowMenu(!showMenu)}>
//             +
//           </div>

//           {showMenu && (
//             <div className="menu-popup">
//               <div className="menu-item" onClick={handleFileClick}>
//                 📁 Upload Image / File
//               </div>
//             </div>
//           )}

//           <input
//             type="text"
//             placeholder="Ask anything"
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             className="input-field"
//           />

//           {/* Microphone */}
//           <button
//             className={`icon mic ${listening ? "recording" : ""}`}
//             onClick={toggleMic}
//             title={
//               useWebSpeech
//                 ? "Voice typing (Web Speech API)"
//                 : "Record audio (upload for transcription)"
//             }
//           >
//             {listening ? "●" : "🎙️"}
//           </button>

//           {/* Send */}
//           <button className="icon send" onClick={handleSend}>
//             ↪
//           </button>

//           {/* Hidden File Input */}
//           <input
//             type="file"
//             ref={fileInputRef}
//             style={{ display: "none" }}
//             onChange={handleFileChange}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }






// src/components/InputBar.js
import React, { useState, useRef, useEffect } from "react";
import "./InputBar.css";

export default function InputBar({ onSendMessage, onUploadFile }) {
  const [text, setText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition) {
      setUseWebSpeech(true);
      const r = new SpeechRecognition();
      r.lang = "en-IN";
      r.interimResults = false;
      r.maxAlternatives = 1;

      r.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((t) => (t ? `${t} ${transcript}` : transcript));
      };
      r.onerror = (e) => console.warn("SpeechRecognition error", e);
      r.onend = () => setListening(false);

      recognitionRef.current = r;
    }
    return () => {
      // cleanup if recognition exists
      if (recognitionRef.current) recognitionRef.current.onresult = null;
    };
  }, []);

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // prefer a safe mimeType - some browsers require it
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined;
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // stop all tracks
        try {
          mediaStreamRef.current && mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch (err) {}

        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

        // upload for transcription
        const form = new FormData();
        form.append("file", blob, "recording.webm");

        try {
          const resp = await fetch("http://172.16.66.15:8000/audio/transcribe", {
            method: "POST",
            body: form,
          });
          const data = await resp.json();
          if (data?.text) setText((t) => (t ? `${t} ${data.text}` : data.text));
        } catch (err) {
          console.error("Transcription upload failed:", err);
          alert("Transcription failed.");
        } finally {
          setListening(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setListening(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // ensure tracks are stopped
      mediaStreamRef.current && mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      setListening(false);
    }
  };

  // const toggleMic = async () => {
  //   if (useWebSpeech && recognitionRef.current) {
  //     if (!listening) {
  //       try {
  //         recognitionRef.current.start();
  //         setListening(true);
  //       } catch (e) {
  //         console.warn("SpeechRecognition start failed", e);
  //       }
  //     } else {
  //       recognitionRef.current.stop();
  //       setListening(false);
  //     }
  //     return;
  //   }

  //   if (!listening) startMediaRecording();
  //   else stopMediaRecording();
  // };
  const toggleMic = async () => {
  if (!listening) {
    // START recording
    try {
      await startMediaRecording();
      setListening(true);
    } catch (err) {
      console.log("Mic start error:", err);
      alert("Microphone not available.");
    }
  } else {
    // STOP recording
    stopMediaRecording();
    setListening(false);
  }
};


  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setText("");
    }
  };

  const handleFileClick = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="input-bar-container">
      <div className="input-wrapper">
        <h2 className="header-text">What can I help with?</h2>

        <div className="input-box">
          <div className="plus-btn" onClick={() => setShowMenu(!showMenu)}>+</div>

          {showMenu && (
            <div className="menu-popup">
              <div className="menu-item" onClick={handleFileClick}>📁 Upload Image / File</div>
            </div>
          )}

          <input
            type="text"
            placeholder="Ask anything"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field"
            onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();    // stop newline
    handleSend();          // trigger send function
  }
}}
          />

          {/* <button
            className={`icon mic ${listening ? "recording" : ""}`}
            onClick={toggleMic}
            title={useWebSpeech ? "Voice typing (Web Speech API)" : "Record audio (upload for transcription)"}
          >
            {listening ? "●" : "🎙️"}
          </button> */}
          {/* <button className="icon mic" onClick={toggleMic}>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
    <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-3.08A7 7 0 0 0 19 11z"/>
  </svg>
</button> */}
<button className={`icon mic ${listening ? "recording" : ""}`} onClick={toggleMic}>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
    <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-3.08A7 7 0 0 0 19 11z"/>
  </svg>
</button>



          <button className="icon send" onClick={handleSend}>↪</button>

          <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
