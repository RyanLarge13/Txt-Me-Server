import express from "express";
import { getChallenge, loginReg } from "../controllers/loginController.js";

const LoginRouter = express.Router();

LoginRouter.post("/", loginReg);
LoginRouter.get("/challenge", getChallenge);

export default LoginRouter;
