import express from "express";
import { magicPin, phonePin} from "../controllers/loginController.js";

const LoginRouter = express.Router();

LoginRouter.post("/email", magicPin);
LoginRouter.get("/phone", phonePin);

export default LoginRouter;
