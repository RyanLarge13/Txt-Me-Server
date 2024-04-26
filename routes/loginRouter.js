import express from "express";
import auth from "../middleware/authenticateToken.js";
import {
 magicPin,
 phonePin,
 fetchUserData
} from "../controllers/loginController.js";

const LoginRouter = express.Router();

LoginRouter.post("/email", magicPin);
LoginRouter.get("/phone", phonePin);
LoginRouter.get("/", auth, fetchUserData);

export default LoginRouter;
