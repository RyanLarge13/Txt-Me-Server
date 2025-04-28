import express from "express";
import auth from "../middleware/authenticateToken.js";
import { getMessages } from "../controllers/messageController";

const MessageRouter = express.Router();

MessageRouter.get("/", auth, getMessages);

export default MessageRouter;
