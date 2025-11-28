export default function MessageBubble({ sender, text }) {
  return (
    <div className={`bubble ${sender === "user" ? "bubble-user" : "bubble-ai"}`}>
      {text}
    </div>
  );
}
