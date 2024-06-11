import express from "express";
import http from "http";
import parser from "body-parser";
import WebSocket, { WebSocketServer } from "ws";
import Redis from "ioredis";
import SignUpRouter from "./routes/signUpRouter.js";
import LoginRouter from "./routes/loginRouter.js";
import VerifyRouter from "./routes/verifyRouter.js";
// import MessageController from "./routes/messageController.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const wws = new WebSocketServer({ server });
const redisClient = new Redis();
const redisSubscriber = new Redis();

const clients = new Map();

app.use(cors());
app.use(parser.json({ urlencoded: true }));
app.use("/signup", SignUpRouter);
app.use("/login", LoginRouter);
app.use("/verify", VerifyRouter);
//app.use("/message", MessageController);

const addNewClient = (userId, socket) => {
  clients.set(userId, socket);
};

const removeClient = (userId) => {
  clients.delete(userId);
};

const getClient = (userId) => {
  clients.get(userId);
};

redisSubscriber.subscribe("user:*", (err, count) => {
  if (err) {
    console.log(err);
  }
});

redisSubscriber.on("message", async (channel, message) => {
  const userId = channel.split(":")[1];
  const socketId = await getClient(userId);
  if (socketId) {
    const socket = wws.clients.get(socketId);
    if (socket) {
      socket.send(message);
    }
  }
});

wws.on("connection", (socket) => {
  const userId = req.params.userId;
  if (userId) {
    addNewClient(userId, socket);
    socket.on("close", () => removeClient(userId));
    socket.on("message", (data) => {
      const { recipientId: recipientId, text } = JSON.parse(data);
      const message = JSON.stringify({ senderId: userId, text });
      redisClient.publish(`user:${recipientId}`, message);
    });
  } else {
    socket.close();
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 8080");
});
