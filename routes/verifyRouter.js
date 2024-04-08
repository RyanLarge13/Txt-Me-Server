import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
  verifyPhoneCode,
  verifyEmailCode,
} from "../controllers/verifyController.js";

const VerifyRouter = express.Router();

VerifyRouter.post("/phone", auth, verifyPhoneCode);
VerifyRouter.post("/email", auth, verifyEmailCode);

export default VerifyRouter;
