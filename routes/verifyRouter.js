import express from "express";

const VerifyRouter = express.Router();

VerifyRouter.get("/verify/phone");
VerifyRouter.post("/verify/phone");
VerifyRouter.get("/verify/email");
VerifyRouter.post("/verify/email");

export default VerifyRouter;

