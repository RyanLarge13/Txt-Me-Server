import express from "express";
import { loginReg } from "../controllers/loginController.js";

const LoginRouter = express.Router();

LoginRouter.post("/", loginReg);

export default LoginRouter