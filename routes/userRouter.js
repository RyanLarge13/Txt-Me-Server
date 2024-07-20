import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
 getAllContacts,
 getAllMessages,
 getConversationByUser
} from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.get("/contacts", auth, getAllContacts);
UserRouter.get("/messages", auth, getAllMessages);
UserRouter.get("/messages/:userId", auth, getConversationByUser);
export default UserRouter;

