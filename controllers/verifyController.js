import ResHdlr from "../utils/ResponseHandler.js";
import Valdtr from "../utils/Validator.js";
import Mailer from "../utils/Mailer.mjs";
import client from "../utils/client.js";
import signToken from "../middleware/signToken.js";
import sendVerifyTxt from "../utils/twilio.js";
import {
  genRandomCode,
  getDateInFuture,
  hoursMinutesInFuture,
} from "../utils/helpers.js";

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

export const verifyPinEmail = async (req, res) => {
  const email = req.body.email;
  const pin = req.body.pin;
  if (!email) {
    return ResHdlr.badReq(
      res,
      "Please request another pin and retry your login"
    );
  }
  if (!pin) {
    return ResHdlr.badReq(
      res,
      "Please provide the 6 digit pin sent to your personal email."
    );
  }
  if (!Valdtr.valEmail(email)) {
    return ResHdlr.badReq(res, "Please provide a valid email to login.");
  }
  if (!Valdtr.valPin(pin)) {
    return ResHdlr.badReq(
      res,
      "Please provide a valid pin sent to your email for login. This will be a 6 digit randomized pin code."
    );
  }

  let clntCon;

  try {
    clntCon = await client.connect();
    try {
      const userExists = await clntCon.query(
        `
     SELECT * FROM users 
     WHERE email = $1;
   `,
        [email]
      );
      if (userExists.rows.length < 1) {
        return ResHdlr.badReq(
          res,
          "Please provide your valid email or, if you have not signed up for a new account, please create a new one."
        );
      }
      const { passemailcode, passemailused, passemailexpiresat } =
        userExists.rows[0];
      if (passemailused) {
        return ResHdlr.badReq(
          res,
          "Please request a new pin before attempting to login"
        );
      }
      if (new Date(passemailexpiresat) < new Date()) {
        return ResHdlr.badReq(
          res,
          "The pass code you previously requested is now expired. For your security, please request a new pin for authentication"
        );
      }
      if (passemailcode !== pin) {
        return ResHdlr.badReq(
          res,
          "The pin you entered is incorrect. Make sure you input the exact pin shown in your email"
        );
      }
      const dbUser = userExists.rows[0];
      const updatedUser = await clntCon.query(
        `
        UPDATE Users
        SET passemailexpiresat = $2,
        passemailused = $3
        WHERE userid = $1
        RETURNING *;
      `,
        [dbUser.userid, new Date(), true]
      );
      if (updatedUser.rows.length < 1) {
        return ResHdlr.qryErr(
          res,
          "There was a problem completing your authentication process. Please try again, and if the issue persists contact the developer at ryanlarge@ryanlarge.dev"
        );
      }
      const newUser = {
        username: dbUser.username,
        email: dbUser.email,
        phoneNumber: dbUser.phonenumber,
        userId: dbUser.userid,
      };
      const token = signToken(newUser);
      return ResHdlr.sucRes(res, "You have successfully logged in", {
        newUser: newUser,
        token: token,
      });
    } catch (err) {
      console.log(err);
      ResHdlr.qryErr(
        res,
        "We cannot connect to your area right now. We are terribly sorry. If the error persists please contact the developer at ryanlarge@ryanlarge.dev"
      );
    }
  } catch (err) {
    console.log(err);
    return ResHdlr.conErr(res, err, "Verify pin email login");
  } finally {
    clntCon.release();
  }
};

export const verifyPinPhone = async (req, res) => {
  const { phone, pin } = req.body;
  if (!phone) {
    return ResHdlr.badReq(
      res,
      "You must provide a phone number so we know who you are"
    );
  }
  if (!pin) {
    return ResHdlr.badReq(
      res,
      "You must provide a pin to login to your account."
    );
  }
  if (!Valdtr.valPin(pin)) {
    return ResHdlr.badReq(
      res,
      "Please provide a valid pin. Check your phone for a new 6 digit pin"
    );
  }

  let clntCon;

  try {
    clntCon = await client.connect();
    try {
      const userExists = await clntCon.query(`
     SELECT * FROM users 
     WHERE phoneNumber = $1;
   `);
      if (userExists.rows.length < 1) {
        return ResHdlr.badReq(
          res,
          "We do not have record of your phone number in our system, please make sure you input your actual phone number."
        );
      }
      const { passcode, passexpiresat, passused } = userExists.rows[0];
      if (passused) {
        return ResHdlr.badReq(
          res,
          "Please request a new pin before attempting to login"
        );
      }
      if (new Date(passexpiresat) < new Date()) {
        return ResHdlr.badReq(
          res,
          "This pin has expired. Please request a new pin before attempting to login."
        );
      }
      if (passcode !== pin) {
        return ResHdlr.badReq(
          res,
          "Incorrect pin. Please try again, make sure to check your phone for the latest pin you request."
        );
      }
      const dbUser = userExists.rows[0];
      const updatedUser = await clntCon.query(
        `
        UPDATE Users
        SET passexpiresat = $2,
        passused = $3
        WHERE userid = $1
        RETURNING *;
      `,
        [dbUser.userid, new Date(), true]
      );
      if (updatedUser.rows.length < 1) {
        return ResHdlr.qryErr(
          res,
          "There was a problem completing your authentication process. Please try again, and if the issue persists contact the developer at ryanlarge@ryanlarge.dev"
        );
      }
      const token = signToken({
        username: dbUser.username,
        email: dbUser.email,
        phoneNumber: dbUser.phonenumber,
        userId: dbUser.userid,
      });
      return ResHdlr.sucRes(res, "You have successfully logged in", {
        newUser: newUser.rows[0],
        token: token,
      });
    } catch (err) {
      console.log(err);
      ResHdlr.qryErr(
        res,
        "We cannot connect to your area right now. We are terribly sorry. If the error persists please contact the developer at ryanlarge@ryanlarge.dev"
      );
    }
  } catch (err) {
    console.log(err);
    return ResHdlr.conErr(res, err, "Verify pin login");
  } finally {
    clntCon.release();
  }
};

export const verifyPhoneCode = async (req, res) => {
  const user = req.user;
  if (!user) {
    return ResHdlr.authErr(res, "You are not authorized to access this data");
  }
  const sixDigitPin = req.body.pin;
  if (!sixDigitPin || !Valdtr.valPin(sixDigitPin)) {
    return ResHdlr.badReq(res, "You must pass in a valid pin");
  }

  let clntCon;

  try {
    clntCon = await client.connect();
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
  } finally {
    clntCon.release();
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

  let clntCon;

  try {
    clntCon = await client.connect();
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
      const { passemailcode, passemailexpiresat, passemailused } =
        dbUser.rows[0];
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
  } finally {
    clntCon.release();
  }
};

export const newPinEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return ResHdlr.badReq(res, "Please provide a valid email");
  }

  let clntCon;

  try {
    clntCon = await client.connect();
    try {
      const userExists = await clntCon.query(
        `
     SELECT * FROM users 
     WHERE email = $1;
   `,
        [email]
      );
      if (userExists.rows.length < 1) {
        return ResHdlr.badReq(
          res,
          "We do not have record of you in our system. Please sign up for an account first."
        );
      }
      const newPin = genRandomCode();
      const expiresat = getDateInFuture(5);
      const updatedUser = await clntCon.query(
        ` UPDATE Users
      SET passemailcode = $1, 
      passemailexpiresat = $2, 
      passemailused = $3
      RETURNING *;
   `,
        [newPin, expiresat, false]
      );
      if (updatedUser.rows.length < 1) {
        return ResHdlr.srvErr(
          res,
          "We could not verify you via email. Please try a different method at this time. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
        );
      }
      const newUser = updatedUser.rows[0];
      const mailer = new Mailer(
        "verifyEmail.html",
        [
          { name: "user", string: newUser.username },
          { name: "otp", string: newPin },
          { name: "timeLimit", string: "5" },
          { name: "date", string: hoursMinutesInFuture(5) },
        ],
        email
      );
      mailer.sendEmail("Login Via Email");
      return ResHdlr.sucRes(
        res,
        "A one time pass-code was sent to your email."
      );
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
  } finally {
    clntCon.release();
  }
};

export const newPinPhone = async (req, res) => {
  const phone = req.body.phone;
  if (!phone) {
    return ResHdlr.badReq(res, "Please provide a valid phone number");
  }
  if (!Valdtr.valPhoneNumber(phone)) {
    return ResHdlr.badReq(
      res,
      "Please provide a valid phone number attached to your account"
    );
  }

  let clntCon;

  try {
    clntCon = await client.connect();
    const formattedPhoneNum = phone.replace(/[()-]/g, "");
    try {
      const userExists = await clntCon.query(
        `
     SELECT * FROM users 
     WHERE phonenumber = $1;
   `,
        [formattedPhoneNum]
      );
      if (userExists.rows.length < 1) {
        return ResHdlr.badReq(
          res,
          "We do not have record of you in our system. Please sign up for an account first."
        );
      }
      const newPin = genRandomCode();
      const expiresat = getDateInFuture(5);
      const updatedUser = await clntCon.query(
        ` UPDATE Users
      SET passcode = $1, 
      passexpiresat = $2, 
      passused = $3 
      RETURNING *;
   `,
        [newPin, expiresat, false]
      );
      if (updatedUser.rows.length < 1) {
        return ResHdlr.srvErr(
          res,
          "We could not verify you via phone. Please try a different method at this time. If the issue persists, contact the developer at ryanlarge@ryanlarge.dev"
        );
      }
      const txtSentRes = await sendVerifyTxt("+1" + formattedPhoneNum, newPin);
      console.log(txtSentRes);
      return ResHdlr.sucRes(
        res,
        "A one time pass-code was sent to your phone."
      );
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
  } finally {
    clntCon.release();
  }
};
