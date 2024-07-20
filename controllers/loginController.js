import ResHdlr from "../utils/ResponseHandler.js";
import Valdtr from "../utils/Validator.js";
import client from "../utils/client.js";

export const fetchUserData = async (req, res) => {
 const user = req.user;
 if (!user) {
  ResHdlr.authErr(res, "Please login before using the app");
 }
 return ResHdlr.sucRes(res, "You have successfully logged in", { user: user });
};

export const magicPin = async (req, res) => {
 const email = req.body.email;
 if (!email || !Valdtr.valEmail(email)) {
  return ResHdlr.badReq(res, "Please pass in a valid email");
 }
 try {
  const clientCon = await client.connect();
  try {
  } catch (err) {
   console.log(err);
   clientCon.end();
   return ResHdlr.qryErr(res, err);
  }
 } catch (err) {
  console.log(err);
  client.end();
  return ResHdlr.conErr(res, err, "Magic pin email");
 }
};

export const phonePin = (req, res) => {};
