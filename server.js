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

const app = express();
const server = http.createServer(app);
const wws = new WebSocketServer({ server });
// const redis = new Redis();

app.use(cors());
app.use(parser.json({ urlencoded: true }));
app.use("/signup", SignUpRouter);
app.use("/login", LoginRouter);
app.use("/verify", VerifyRouter);
app.use("/message", MessageController);

wws.on("connection", (socket) => {
  console.log(socket);
  socket.on("error", (err) => {
    console.log(err);
  });
  socket.on("message", (data) => {
    console.log(data.toString("utf-8"));
  });
  socket.on("close", () => {
    console.log("closing");
  });
});

server.listen(8080, () => {
  console.log("Server running on port 8080");
});
