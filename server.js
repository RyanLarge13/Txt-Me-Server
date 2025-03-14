import express from "express";
import http from "http";
import parser from "body-parser";
import SignUpRouter from "./routes/signUpRouter.js";
import LoginRouter from "./routes/loginRouter.js";
import VerifyRouter from "./routes/verifyRouter.js";
import UserRouter from "./routes/userRouter.js";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

const clients = new Map();

app.use(cors());
app.use(parser.json({ urlencoded: true }));
app.use("/signup", SignUpRouter);
app.use("/login", LoginRouter);
app.use("/verify", VerifyRouter);
app.use("/user", UserRouter);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const number = socket.handshake.query.number;
  console.log("New Connection");

  if (!clients.has(number)) {
    clients.set(number, socket.id);
  }

  socket.on("text-message", (clientMessage) => {
    console.log(clientMessage);

    if (!clientMessage) {
      console.log("No message sent from client");
    }

    const clientToSendTo = clients.get(recipient);
    // Validate the client message
    // Check for back html, etc...
    // Check for bad information that should not be there

    if (clientToSendTo) {
      io.to(clientToSendTo).emit("text-message", clientMessage);
      // Send message to DB
    } else {
      // Send error back to sender
      console.log("no client to send to");
    }
  });

  socket.on("disconnect", (client) => {
    console.log("A client disconnected");
    console.log(client);
    clients.delete(client.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 8080");
});
