import express from "express";
import auth from "../middleware/authenticateToken.js";
import { verifyPhoneCode } from "../controllers/verifyController.js";

const VerifyRouter = express.Router();

VerifyRouter.post("/phone", auth, verifyPhoneCode);
VerifyRouter.post("/email");

export default VerifyRouter;
