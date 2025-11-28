



// import React, { useEffect, useRef } from "react";
// import "./ChatWindow.css";

// export default function ChatWindow({ messages }) {
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="chat-window">
//       {messages.map((msg) => (
//         <div
//           key={msg.id}
//           className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
//         >
//           {msg.content}
//         </div>
//       ))}
//       <div ref={bottomRef}></div>
//     </div>
//   );
// }



// src/components/ChatWindow.js
import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";

export default function ChatWindow({ messages = [] }) {
  const bottomRef = useRef(null);
useEffect(() => {
  if (messages.length > 1) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);


  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
        >
          {msg.type === "file" ? (
            // assume content is a URL or path
            <img src={msg.content} alt={msg.filename || "file"} style={{ maxWidth: "100%", borderRadius: 8 }} />
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
