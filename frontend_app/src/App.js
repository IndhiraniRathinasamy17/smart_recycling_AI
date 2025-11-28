



// import React, { useState } from "react";
// import Sidebar from "./components/Sidebar";
// import ChatWindow from "./components/ChatWindow";
// import InputBar from "./components/InputBar";

// import "./App.css";

// function App() {
//   const [history, setHistory] = useState([]);          // Left-side past chats
//   const [messages, setMessages] = useState([]);        // Chat messages for current session

//   // ➤ Create new empty chat session
//   const handleNewChat = () => {
//     setMessages([]);  
//     setHistory([...history, { title: "New Session", id: Date.now() }]);
//   };

//   // ➤ When user clicks a history item
//   const handleSelectHistory = (item) => {
//     console.log("Selected Chat:", item);
//     // Later you can load actual saved chat messages
//   };

//   // ➤ User sends a text message
//   // const handleSendMessage = (msg) => {
//   //   const userMsg = { sender: "user", text: msg };

//   //   setMessages((prev) => [...prev, userMsg]);

//     // Later: call backend → add bot reply
//     // const botResponse = await api.sendMessage(msg)
//   // };
// const handleSendMessage = (text) => {
//     const newMsg = {
//       id: Date.now(),
//       sender: "user",
//       type: "text",
//       content: text,
//     };
//     setMessages((prev) => [...prev, newMsg]);
//   };





//   // ➤ User uploads a photo or file
//   // const handleUploadFile = (file) => {
//   //   const fileMsg = { sender: "user", file };

//   //   setMessages((prev) => [...prev, fileMsg]);

//   //   console.log("Uploaded file:", file);

//   //   // Later: send file to backend
//   // };


// const handleUploadFile = async (file) => {
//     const form = new FormData();
//     form.append("file", file);

//     // upload to backend (example API)
//     const resp = await fetch("http://127.0.0.1:8000/upload", {
//       method: "POST",
//       body: form,
//     });

//     const data = await resp.json();

//     const newMsg = {
//       id: Date.now(),
//       sender: "user",
//       type: "file",
//       content: data.url, // PUT YOUR FILE URL HERE
//     };

//     setMessages((prev) => [...prev, newMsg]);
//   };




//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       <Sidebar
//         history={history}
//         onNewChat={handleNewChat}
//         onSelectHistory={handleSelectHistory}
//       />

//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <ChatWindow messages={messages} />

//         <InputBar
//           onSendMessage={handleSendMessage}
//           onUploadFile={handleUploadFile}
//         />
//       </div>
      
//     </div>
//   );
// }

// export default App;












// import React, { useState } from "react";
// import Sidebar from "./components/Sidebar";
// import ChatWindow from "./components/ChatWindow";
// import InputBar from "./components/InputBar";

// import "./App.css";

// function App() {
//   const [history, setHistory] = useState([]);      // Left-side past chats
//   const [messages, setMessages] = useState([]);    // Chat messages for current session

//   // ➤ Create a new empty chat session
//   const handleNewChat = () => {
//     setMessages([]);  
//     setHistory([...history, { title: "New Session", id: Date.now() }]);
//   };

//   // ➤ When user clicks past chat
//   const handleSelectHistory = (item) => {
//     console.log("Selected Chat:", item);
//     // Later you can load saved chat messages from backend
//   };

//   // ➤ When user sends a text message
//   const handleSendMessage = (text) => {
//     const newMsg = {
//       id: Date.now(),
//       sender: "user",
//       type: "text",
//       content: text,
//       time: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, newMsg]);
//   };

//   // ➤ When user uploads a file
//   const handleUploadFile = async (file) => {
//     const form = new FormData();
//     form.append("file", file);

//     try {
//       const resp = await fetch("http://127.0.0.1:8000/upload", {
//         method: "POST",
//         body: form,
//       });

//       const data = await resp.json();

//       const newMsg = {
//         id: Date.now(),
//         sender: "user",
//         type: "file",
//         content: data.url || "File uploaded",
//         filename: file.name,
//         time: new Date().toLocaleTimeString(),
//       };

//       setMessages((prev) => [...prev, newMsg]);

//     } catch (err) {
//       console.error("Upload error:", err);
//       alert("File upload failed!");
//     }
//   };

//   return (
//   <div style={{ display: "flex", height: "100vh" }}>
    
//     {/* Left Sidebar */}
//     <Sidebar
//       history={history}
//       onNewChat={handleNewChat}
//       onSelectHistory={handleSelectHistory}
//     />

//     {/* Right Chat Area */}
//     <div style={{
//       flex: 1,
//       display: "flex",
//       flexDirection: "column",
//       background: "white"
//     }}>
      
//       {/* Scrollable message area */}
//       <div style={{ flex: 1, overflowY: "auto" }}>
//         <ChatWindow messages={messages} />
//       </div>

//       {/* Input bar at bottom */}
//       <InputBar
//         onSendMessage={handleSendMessage}
//         onUploadFile={handleUploadFile}
//       />

//     </div>
//   </div>
// );
// }

// export default App;







import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import { sendMessageToBackend } from "./services/api";
import "./App.css";

function App() {
  const [history, setHistory] = useState([]);  
  const [messages, setMessages] = useState([]);

  // ➤ Create new chat session
const handleNewChat = () => {
  if (messages.length > 0) {
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: `Session ${prev.length + 1}`,
        messages: messages   // ✅ store complete message list
      }
    ]);
  }

  // Start empty new session
  setMessages([]);
};


  // ➤ Select past chat (not implemented yet)
const handleSelectHistory = (item) => {
  if (item && item.messages) {
    setMessages(item.messages);   // ✅ load stored chat
  }
};

  // ➤ Handle text message
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "text",
      content: text,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // ⭐ send message to backend
    const botReply = await sendMessageToBackend(text);

    const botMsg = {
      id: Date.now() + 1,
      sender: "bot",
      type: "text",
      content: botReply,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  // ➤ Handle file upload
  const handleUploadFile = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const userMsg = {
      id: Date.now(),
      sender: "user",
      type: "file",
      content: `📁 ${file.name}`,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const resp = await fetch("http://172.16.66.15:8000/file/upload", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        type: "text",
        content: `File received: ${data.file_info.filename} (${data.file_info.size_kb} KB)`,
        time: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Upload error:", err);

      const errorMsg = {
        id: Date.now() + 2,
        sender: "bot",
        type: "text",
        content: "❌ File upload failed!",
        time: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar
        history={history}
        onNewChat={handleNewChat}
        onSelectHistory={handleSelectHistory}
      />

      {/* Main chat area */}
  <div style={{ 
  marginLeft: "250px",   // ⭐ Leave space for sidebar
  flex: 1,
  display: "flex",
  flexDirection: "column",
  background: "white",
  height: "100vh",
  overflow: "hidden"
}}>

        
        {/* Scrollable messages */}
          <div style={{
    flex: 1,
    overflowY: "auto",
    paddingBottom: "120px"   // space for input bar
  }}>
    <ChatWindow messages={messages} />
  </div>

 {/* FIXED Input Bar */}
<div style={{
  position: "fixed",
  bottom: 0,
  left: "250px",    // MATCH sidebar width
  right: 0,
  background: "white",
  padding: "10px 20px",
  borderTop: "1px solid #ddd",
  zIndex: 999
}}>

        {/* Input bar */}
        <InputBar
          onSendMessage={handleSendMessage}
          onUploadFile={handleUploadFile}
        />
      </div>
    </div>
    </div>
  );
}

export default App;
