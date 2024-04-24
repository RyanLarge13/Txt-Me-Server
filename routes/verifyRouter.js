import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
 verifyPhoneCode,
 verifyEmailCode,
 newPinPhone, 
 newPinEmail
} from "../controllers/verifyController.js";

const VerifyRouter = express.Router();

VerifyRouter.post("/phone", auth, verifyPhoneCode);
VerifyRouter.post("/email", auth, verifyEmailCode);
VerifyRouter.post("/phone/newpin", newPinPhone);
VerifyRouter.post("/email/newpin", newPinEmail);

export default VerifyRouter;
