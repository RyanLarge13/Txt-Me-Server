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
import webpush from "web-push";
import dotenv from "dotenv";
import client from "./utils/client.js";
dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

const PUBLIC_VAPID_KEY = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
const PRIVATE_VAPID_KEY = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:ryanlarge@ryanlarge.dev",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

const clients = new Map();
const messages = new Map();
const subscriptions = new Map();

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

const sendPushNotification = (clientMessage) => {
  if (subscriptions.has(clientMessage.tonumber)) {
    console.log("subscription found for client in subscription map");
    const subs = subscriptions.get(clientMessage.tonumber);

    const payload = {
      // Add a toname from the frontend
      title: clientMessage.toname,
      body: clientMessage.message,
    };
    subs.forEach(async (s) => {
      try {
        console.log("Sending web push to client", clientMessage.tonumber);
        await webpush.sendNotification(s, payload);
      } catch (err) {
        console.log("Error sending web push to client");

        if (err.statusCode === 410 || err.statusCode === 404) {
          const newSubs = subs.filter((_s) => _s.endpoint !== s.endpoint);

          subscriptions.set(clientMessage.tonumber, newSubs);
        }
      }
    });
  } else {
    console.log("subscriptions do not have this client", clientMessage);
  }
};

const subscribeClient = (subscribeInfo) => {
  console.log("Subscribing client to web push notifications");
  if (subscriptions.has(subscribeInfo.number)) {
    subscriptions.get(subscribeInfo.number).push(subscribeInfo.subscription);
  } else {
    subscriptions.set(subscribeInfo.number, [subscribeInfo.subscription]);
  }

  const sender = clients.get(subscribeInfo.number);

  if (!sender) {
    console.log(
      "Sender must have logged off after trying to subscribe to web push notifications. No sender to send web-push-success too"
    );
  }

  // Let the frontend know they have successfully been subscribed and their subscription is saved in memory
  io.to(sender).emit("web-push-sub-success", {
    message: "Server: Successfully subscribed to push notifications!!!",
    subscribed: true,
    subscription: subscribeInfo.subscription,
  });

  console.log(
    "Ping sent to client for successful subscription to web push on server"
  );
};

const Socket_NewConnection = (socket) => {
  const number = socket.handshake.query.number;
  const subscribeInfo = socket.handshake.query.subscribeInfo;
  console.log("New Connection");

  // Do not check if client already exists. Instead create or update always on every connection
  clients.set(number, socket.id);

  if (subscribeInfo.newClient) {
    subscribeClient(subscribeInfo);
  }

  // Set this number a tracking data for when a client goes to disconnect
  socket.number = number;
  socket.on("text-message", Socket_NewTextMessage);
  socket.on("messages-read", Socket_ReadMessages);
  socket.on("disconnect", () => Socket_Disconnect(socket));
};

const Socket_NewTextMessage = (clientMessage) => {
  if (!clientMessage) {
    console.log("No message sent from client");
    return;
  }

  const clientToSendTo = clients.get(clientMessage.tonumber);
  const sender = clients.get(clientMessage.fromnumber);

  // Validate the client message
  // Check for back html, etc...
  // Check for bad information that should not be there

  if (clientToSendTo) {
    try {
      io.to(clientToSendTo).emit("text-message", clientMessage);
    } catch (err) {
      console.log(
        `Error emitting socket message from the server to client. Error: ${err}`
      );
      io.to(sender).emit("delivery-error", {
        messageid: clientMessage.messageid,
        reason: "Message failed to send",
        sessionNumber: clientMessage.tonumber,
      });
      return;
    }

    try {
      io.to(sender).emit(`message-update`, {
        id: clientMessage.messageid,
        sessionNumber: clientMessage.tonumber,
        delivered: true,
        time: new Date(),
      });

      console.log("Ping sent to sender updating delivered at values");
    } catch (err) {
      console.log(
        "Error when sending message update to client with clientToSendTo",
        err
      );
    }
    sendPushNotification(clientMessage);
    InMem_StoreMessage(clientMessage);
    // Send message to DB
  } else {
    // Send error back to sender
    console.log("No client to send to");
    try {
      io.to(sender).emit(`message-update`, {
        id: clientMessage.messageid,
        sessionNumber: clientMessage.tonumber,
        delivered: true,
        time: new Date(),
      });
    } catch (err) {
      console.log(
        "Error when sending message update to client when no clientToSendTo",
        err
      );
    }
    sendPushNotification(clientMessage);
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

const Socket_ReadMessages = (fromNumber) => {
  console.log(
    "Socket got a ping to send messages read to a client",
    fromNumber
  );
  if (clients.has(fromNumber)) {
    console.log("Client exists to send 'messages read' ping");
    const client = clients.get(fromNumber);

    try {
      io.to(client).emit("messages-read", fromNumber);
      console.log("Ping sent to client to update messages read");
    } catch (err) {
      console.log(
        "Error sending messages-read trigger to client. Error: ",
        err
      );
    }
  } else {
    // Send web push and talk with the service worker maybe? Or update local messages
    console.log("No client to send ping that messages were read");
  }
};

io.on("connection", Socket_NewConnection);

server.listen(PORT, "0.0.0.0", async () => {
  console.log("Server running on port 8080");
});
