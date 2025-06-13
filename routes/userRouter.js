import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
  addContact,
  getAllContacts,
  getAllMessages,
  getConversationByUser,
  deleteContact,
} from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.get("/contacts", auth, getAllContacts);
UserRouter.get("/contacts/delete/:contactid", auth, deleteContact);
UserRouter.post("/contacts/new", auth, addContact);
UserRouter.get("/messages", auth, getAllMessages);
UserRouter.get("/messages/:userId", auth, getConversationByUser);
export default UserRouter;
