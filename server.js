import express from "express";
import http from "http";
import parser from "body-parser";
import SignUpRouter from "./routes/signUpRouter.js";
import LoginRouter from "./routes/loginRouter.js";
import VerifyRouter from "./routes/verifyRouter.js";
import UserRouter from "./routes/userRouter.js";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import MessageRouter from "./routes/messageRouter.js";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

const clients = new Map();

app.use(cors());
app.use(parser.json({ urlencoded: true }));

// Routes ---------------------------------------
app.use("/signup", SignUpRouter);
app.use("/login", LoginRouter);
app.use("/verify", VerifyRouter);
app.use("/user", UserRouter);
app.use("/messages", MessageRouter);
// Routes ---------------------------------------

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

    const clientToSendTo = clients.get(clientMessage.tonumber);
    // Validate the client message
    // Check for back html, etc...
    // Check for bad information that should not be there

    if (clientToSendTo) {
      console.log(clientToSendTo);
      console.log("Sending to frontend");
      try {
        io.to(clientToSendTo).emit("text-message", clientMessage);
        console.log("Message to front end sent");
      } catch (err) {
        console.log(
          `Error emitting socket message from the server to client. Error: ${err}`
        );
      }
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
