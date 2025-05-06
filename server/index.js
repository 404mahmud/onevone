require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const PASSWORD = process.env.PASSWORD;

app.use(cors());
app.get("/", (req, res) => res.send("Chat server is running."));

io.use((socket, next) => {
  const { password } = socket.handshake.auth;
  if (password !== PASSWORD) {
    return next(new Error("Authentication error"));
  }
  next();
});

io.on("connection", (socket) => {
  const username = socket.handshake.auth.username;
  socket.username = username;

  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      user: socket.username,
      message: msg,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));