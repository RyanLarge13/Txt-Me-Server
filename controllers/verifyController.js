import ResHdlr from "../utils/ResponseHandler.js";
import Valdtr from "../utils/Validator.js";
import Mailer from "../utils/Mailer.mjs";
import client from "../utils/client.js";

const setPhoneVerified = async (res, user, clntCon) => {
 if (user.verifiedphone) {
  return ResHdlr.sucRes(res, "Logged in with phone number", null);
 }
 try {
  const updatedUser = await clntCon.query(
   `
   UPDATE Users
   SET passcode = $1, passused = $2, passexpiresat = $3, verifiedphone = $4
   WHERE userid = $5 AND username = $6 AND email = $7
   `,
   [null, true, new Date(), true, user.userId, user.username, user.email]
  );
  return ResHdlr.sucRes(res, "Your phone number is now verified", null);
 } catch (err) {
  console.log(err);
  return ResHdlr.qryErr(
   res,
   "There was an issues connecting our servers to retrieve your data. Please try again later and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
  );
 }
};

const setEmailVerified = async (res, user, clntCon) => {
 if (user.verifiedemail) {
  return ResHdlr.sucRes(res, "Logged in with email", null);
 }
 try {
  const updatedUser = await clntCon.query(
   `
   UPDATE Users
   SET passemailcode = $1, passemailused = $2, passemailexpiresat = $3, verifiedemail = $4
   WHERE userid = $5 AND username = $6 AND email = $7
   `,
   [null, true, new Date(), true, user.userId, user.username, user.email]
  );
  return ResHdlr.sucRes(res, "Your email is now verified", null);
 } catch (err) {
  console.log(err);
  return ResHdlr.qryErr(
   res,
   "There was an issues connecting our servers to retrieve your data. Please try again later and if the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
  );
 }
};

export const verifyPhoneCode = async (req, res) => {
 const user = req.user;
 if (!user) {
  console.log("no req user");
  return ResHdlr.authErr(res, "You are not authorized to access this data");
 }
 const sixDigitPin = req.body.pin;
 if (!sixDigitPin || !Valdtr.valPin(sixDigitPin)) {
  return ResHdlr.badReq(res, "You must pass in a valid pin");
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
     "You must login or signup for an account before attempting to verify your phone number"
    );
   }
   const { passcode, passexpiresat, passused } = dbUser.rows[0];
   if (new Date(passexpiresat).getTime() <= new Date().getTime()) {
    // reset phone code
    return ResHdlr.authErr(
     res,
     "your pass code has expired, please request a new one from the login page or click verify phone from your profile"
    );
   }
   if (passused) {
    // reset code
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
    setPhoneVerified(res, user, clntCon);
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

export const verifyEmailCode = async (req, res) => {
 const user = req.user;
 if (!user) {
  return ResHdlr.authErr(
   res,
   "You are not authorized to make this request. Please login and try again"
  );
 }
 const emailCode = req.body.pin;
 if (!emailCode || !Valdtr.valPin(emailCode)) {
  return ResHdlr.badReq(res, "Please input a valid code");
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
     "You must login or signup for an account before attempting to verify your email"
    );
   }
   const { passemailcode, passemailexpiresat, passemailused } = dbUser.rows[0];
   if (new Date(passemailexpiresat).getTime() <= new Date().getTime()) {
    // reset email codes
    return ResHdlr.authErr(
     res,
     "your pass code has expired, please request a new one from the login page or click verify email from your profile"
    );
   }
   if (passemailused) {
    // reset email code
    return ResHdlr.authErr(
     res,
     "You have previously used this one time pass code. Get a new one from your profile to verify your email"
    );
   }
   if (!passemailcode) {
    return ResHdlr.badReq(
     res,
     "You need to use a code sent to your email in order to verify your account"
    );
   }
   if (passemailcode !== emailCode) {
    return ResHdlr.authErr(
     res,
     "Incorrect code, please attempt your code one more time"
    );
   }
   if (passemailcode === emailCode) {
    setEmailVerified(res, user, clntCon);
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
  return ResHdlr.conErr(res, err, "Verying email");
 }
};

export const newPinEmail = async (req, res) => {
 const email = req.body;
 if (!email) {
  return ResHdlr.badReq(res, "");
 }
 try {
  const clntCon = await client.connect();
  try {
   const userExists = await clntCon.query(`
     SELECT * FROM users 
     WHERE email = $1;
   `);
   if (userExists.rows.length < 1) {
    return ResHdlr.badReq(
     res,
     "We do not have record of you in our system. Please sign up for an account first."
    );
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
  return ResHdlr.conErr(res, err, "New Email Pin");
 }
};

export const newPinPhone = async (req, res) => {};
