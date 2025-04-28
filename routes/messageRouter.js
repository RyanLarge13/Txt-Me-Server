import express from "express";
import auth from "../middleware/authenticateToken.js";
import { getMessages } from "../controllers/messageController.js";

const MessageRouter = express.Router();

MessageRouter.get("/", auth, getMessages);

export default MessageRouter;
