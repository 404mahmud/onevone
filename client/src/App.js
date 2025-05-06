import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const socketRef = useRef();
  const bottomRef = useRef();

  const joinChat = () => {
    socketRef.current = io(SERVER_URL, {
      auth: { username, password },
    });

    socketRef.current.on("connect_error", (err) => {
      alert("Failed to connect: " + err.message);
    });

    socketRef.current.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (document.hidden) {
        new Notification("New message from " + msg.user);
      }
      const audio = new Audio("/notify.mp3");
      audio.play();
    });

    setJoined(true);
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socketRef.current.emit("chat message", message);
      setMessage("");
      setShowEmoji(false);
    }
  };

  const addEmoji = (e) => {
    setMessage(message + e.native);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  if (!joined) {
    return (
      <div className="p-4 flex flex-col h-screen justify-center items-center bg-white">
        <h1 className="text-xl font-bold mb-4">Join Chat</h1>
        <input
          className="mb-2 p-2 border rounded w-full max-w-xs"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="mb-4 p-2 border rounded w-full max-w-xs"
          placeholder="Shared Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={joinChat} className="px-4 py-2 bg-blue-500 text-white rounded">
          Enter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl m-1 max-w-xs ${
              msg.user === username ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-black"
            }`}
          >
            <div className="text-xs font-semibold">{msg.user}</div>
            <div>{msg.message}</div>
            <div className="text-[10px] text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 flex gap-2">
        <button onClick={() => setShowEmoji(!showEmoji)}>😀</button>
        <input
          className="flex-1 border rounded px-2"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded">Send</button>
      </div>
      {showEmoji && <Picker onSelect={addEmoji} />}
    </div>
  );
}

export default App;