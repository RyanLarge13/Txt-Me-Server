import express from "express";
import {signUpReg} from "../controllers/signUpController.js"

const SignUpRouter = express.Router();

SignUpRouter.post("/", signUpReg);


export default SignUpRouter