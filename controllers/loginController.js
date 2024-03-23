import ResHdlr from "../utils/ResponseHandler.js";
import Valdtr from "../utils/Validator.js";

export const fetchUserData = async (req, res) => {};

export const magicPin = (req, res) => {
 const email = req.body.email;
 if (!email || !Valdtr.valEmail(email)) {
  return ResHdlr.badReq(res, "Please pass in a valid email");
 }
 try {
  
 } catch (err) {
  
 }
};

export const phonePin = (req, res) => {};
