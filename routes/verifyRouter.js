import express from "express";
import auth from "../middleware/authenticateToken.js";
import { verifyPhoneCode, verifyEmailCode} from "../controllers/verifyController.js";

const VerifyRouter = express.Router();

VerifyRouter.post("/phone", verifyPhoneCode);
VerifyRouter.post("/email", verifyEmailCode);

export default VerifyRouter;
