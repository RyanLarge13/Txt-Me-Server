import Valdtr from "../utils/Validator.js";
import ResHdlr from "../utils/ResponseHandler.js";
import client from "../utils/client.js";

const setPhoneVerified = async (res, user) => {
 try {
  const clntCon = await client.connect();
  try {
   const updatedUser = clntCon.query(
    `
   UPDATE users
   SET passcode = $1, passused = $2, passexpiresat = $3, verifiedPhone = $4
   WHERE userId = $5 AND username = $6 AND email = $7
   `,
    [null, true, new Date(), true, user.userid, user.username, user.email]
   );
   return ResHdlr.sucRes(res, "Your phone number is now verified", null);
  } catch (err) {
   console.log(err);
   return ResHdlr.qryErr(
    res,
    "There was an issues connecting our servers to retrieve your data. Please try again later and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
   );
  }
 } catch (err) {
  console.log(err);
  ResHdlr.conErr(
   res,
   "Our servers cannot reach your data at the moment, please try again later. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev",
   "Updating users verified phone number"
  );
 }
};

export const verifyPhoneCode = async (req, res) => {
 const user = req.user;
 const sixDigitPin = req.body.pin;
 if (!user) {
  return ResHdlr.authErr(res, "You are not authorized to access this data");
 }
 try {
  const clntCon = await client.connect();
  try {
   const dbUser = await clntCon.query(
    `
   SELECT * FROM Users 
   WHERE userId = $1 AND username = $2 AND email = $3;
   `,
    [user.userId, user.username, user.email]
   );
   if (dbUser.rows.length < 1) {
    return ResHdlr.badReq(
     res,
     "You must login or signup for an count before attempting to verify your phone number"
    );
   }
   const { passcode, passexpiresat, passused } = dbUser.rows[0];
   if (new Date(passexpiresat).getTime() <= new Date().getTime()) {
    return ResHdlr.authErr(
     res,
     "your pass code has expired, please request a new one from the login page or click verify phone from your profile"
    );
   }
   if (passused) {
    return ResHdlr.authErr(
     res,
     "You have previously used this one time pass code. Get a new one from your profile to verify your phone number"
    );
   }
   if (!passcode) {
    return ResHdlr.badReq(
     res,
     "You need to use a code sent to your phone number in order to verify your account"
    );
   }
   if (passcode !== sixDigitPin) {
    return ResHdlr.authErr(
     res,
     "Incorrect code, please attempt your code one more time"
    );
   }
   if (passcode === sixDigitPin) {
    return setPhoneVerified(res, user);
   }
  } catch (err) {
   console.log(err);
   ResHdlr.qryErr(
    res,
    "We cannot connect to your area right now. We are terribly sorry. If the error persists please contact the developer at"
   );
  }
 } catch (err) {
  console.log(err);
  return ResHdlr.conErr(res, err, "Verying phone number");
 }
};
