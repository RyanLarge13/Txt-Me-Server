import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
  verifyPhoneCode,
  verifyEmailCode,
  newPinPhone,
  newPinEmail,
  verifyPinEmail,
  verifyPinPhone,
} from "../controllers/verifyController.js";

const VerifyRouter = express.Router();

VerifyRouter.post("/phone", auth, verifyPhoneCode);
VerifyRouter.post("/email", auth, verifyEmailCode);
VerifyRouter.post("/phone/newpin", newPinPhone);
VerifyRouter.post("/email/newpin", newPinEmail);
VerifyRouter.post("/pin/email", verifyPinEmail);
VerifyRouter.post("/pin/phone", verifyPinPhone);

export default VerifyRouter;
