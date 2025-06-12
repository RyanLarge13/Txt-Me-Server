import express from "express";
import http from "http";
import parser from "body-parser";
import SignUpRouter from "./routes/signUpRouter.js";
import LoginRouter from "./routes/loginRouter.js";
import VerifyRouter from "./routes/verifyRouter.js";
import UserRouter from "./routes/userRouter.js";
import MessageRouter from "./routes/messageRouter.js";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import client from "./utils/client.js";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

const clients = new Map();
const messages = new Map();

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

const InMem_StoreMessage = (clientMessage) => {
  /*
 type Message = {
  messageid: number;
  message: string;
  sent: boolean;
  sentat: Date;
  delivered: boolean;
  deliveredat: Date | null;
  read: boolean;
  readat: Date | null;
  fromnumber: string;
  tonumber: string;
};

  */

  const to = clientMessage.tonumber;
  const from = clientMessage.fromnumber;

  const greaterThan = to > from;

  const mapKey = `${greaterThan ? to : from}-${greaterThan ? from : to}`;

  if (!messages.has(mapKey)) {
    messages.set(mapKey, [clientMessage]);
  } else {
    messages.get(mapKey).push(clientMessage);
  }
};

const DB_SaveMessages = (socketNumber) => {};

const Socket_NewConnection = (socket) => {
  const number = socket.handshake.query.number;
  console.log("New Connection");

  // Do not check if client already exists. Instead create or update always on every connection
  clients.set(number, socket.id);

  // Set this number a tracking data for when a client goes to disconnect
  socket.number = number;
  socket.on("text-message", Socket_NewTextMessage);
  socket.on("disconnect", () => Socket_Disconnect(socket));
};

const Socket_NewTextMessage = (clientMessage) => {
  if (!clientMessage) {
    console.log("No message sent from client");
  }

  const clientToSendTo = clients.get(clientMessage.tonumber);
  const sender = clients.get(clientMessage.fromnumber);

  // Validate the client message
  // Check for back html, etc...
  // Check for bad information that should not be there
  if (clientToSendTo) {
    try {
      io.to(clientToSendTo).emit("text-message", clientMessage);
      InMem_StoreMessage(clientMessage);
      io.to(sender).emit(`message-update`, {
        id: clientMessage.messageid,
        sessionNumber: clientMessage.tonumber,
        delivered: true,
        time: new Date(),
      });
    } catch (err) {
      console.log(
        `Error emitting socket message from the server to client. Error: ${err}`
      );
      io.to(sender).emit("delivery-error", {
        messageid: clientMessage.messageid,
        reason: "Message failed to send",
        sessionNumber: clientMessage.tonumber,
      });
    }
    // Send message to DB
  } else {
    // Send error back to sender
    console.log("No client to send to");
    InMem_StoreMessage(clientMessage);
  }
};

const Socket_Disconnect = (socket) => {
  console.log("Client disconnected");
  clients.delete(socket.number);
  DB_SaveMessages(socket.number);
  /*
    TODO:
      IMPLEMENT:
        1. Remove Client from list?
  */
};

io.on("connection", Socket_NewConnection);

server.listen(PORT, "0.0.0.0", async () => {
  console.log("Server running on port 8080");
});
