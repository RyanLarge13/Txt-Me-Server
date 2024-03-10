import Valdtr from "../utils/Validator.js";
import ResHdlr from "../utils/ResponseHandler.js";
import Mailer from "../utils/Mailer.js";
import client from "../utils/client.js";
import sendVerifyTxt from "../utils/twilio.js";
import signToken from "../middleware/signToken.js";
import { hashPass, genRandomCode, getDateInFuture, hoursMinutesInFuture} from "../utils/helpers.js";

export const signUpReg = async (req, res) => {
 const { username, email, password, phone } = req.body.newUser;
 if (!username) {
  return ResHdlr.badReq(res, "You must provide a valid username to signup.");
 }
 if (!email) {
  return ResHdlr.badReq(res, "You must provide a valid email to signup.");
 }
 if (!password) {
  return ResHdlr.badReq(res, "You must provide a valid password to signup.");
 }
 if (!phone) {
  return ResHdlr.badReq(
   res,
   "You must provide a valid phone number to signup."
  );
 }
 const isValidUsername = Valdtr.valUsername(username);
 const isValidEmail = Valdtr.valEmail(email);
 const isValidPassword = Valdtr.valPassword(password);
 const isValidNumber = Valdtr.valPhoneNumber(phone);
 if (!isValidUsername) {
  return ResHdlr.badReq(
   res,
   "The username you entered does not follow our standard. Please provide a valid username with these rules"
  );
 }
 if (!isValidEmail) {
  return ResHdlr.badReq(
   res,
   "You must provide a valid email address to create an account, this ensures the security of your authentication and effortless experience while using Txt Me"
  );
 }
 if (!isValidNumber) {
  return ResHdlr.badReq(
   res,
   "The phone number you entered must be a valid format. We accept two formats (XXX)-XXX-XXXX or XXX-XXX-XXXX do not forget your dashes"
  );
 }
 if (!isValidPassword) {
  return ResHdlr.badReq(
   res,
   "We take the security of your information, conversations and your other data very seriously and take pride in making sure you are safe, you must enter a password with these rules"
  );
 }
 try {
  const clntCon = await client.connect();
  try {
   const existingUser = await clntCon.query(
    `
   SELECT * FROM Users
   WHERE email = $1;
   `,
    [email]
   );
   if (existingUser.rows.length > 0) {
    return ResHdlr.badReq(
     res,
     "A user with this email already exists. Are you trying to login? If you have an account already and have forgotten your credentials please click the forgot creds link below"
    );
   }
   const hashedPass = await hashPass(password);
   const formattedPhoneNum = phone.replace(/[()-]/g, "");
   const passcodeForPhoneVerification = genRandomCode();
   const passcodeForEmailVerification = genRandomCode();
   const expireDate = getDateInFuture(5);
   const existingPhone = await clntCon.query(
    `
   SELECT * FROM Users
   WHERE phoneNumber = $1
   RETURNING*;
   `,
    [formattedPhoneNum]
   );
   if (existingPhone.rows.length > 0) {
    return ResHdlr.badReq(
     res,
     `The phone number ${phone} is already attached to
    an account on our system. If you are certain this number is yours, please
    immediately contact support`
    );
   }
   try {
    const newUser = await client.query(
     `
    INSERT INTO Users(username, email, password, phoneNumber, passcode,
    passExpiresAt, passUsed)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
     [
      username,
      email,
      hashedPass,
      formattedPhoneNum,
      passcodeForPhoneVerification,
      expireDate,
      false
     ]
    );
    if (newUser.rows.length < 1) {
     return ResHdlr.srvErr(
      res,
      "We cannot create a new account at this moment. More than likely there is an important security update on our servers right now. Please try to create a new account later and if the issue persists, contact the developer at"
     );
    }
    const dbUser = newUser.rows[0];
    const token = signToken({
     username: dbUser.username,
     email: dbUser.email,
     phoneNumber: dbUser.phonenumber,
     userId: dbUser.userid
    });
    const txtSentRes = await sendVerifyTxt(
     "+1" + formattedPhoneNum,
     passcodeForPhoneVerification
    );
    const mailer = new Mailer(
     "verifyEmail.js",
     [
      { name: "user", string: username },
      { name: "otp", string: passcodeForEmailVerification },
      { name: "timeLimit", string: "5" }, 
      { name: "date", string: hoursMinutesInFuture() }
     ],
     email
    );
    mailer.sendEmail("Verify Your Email");
    console.log(txtSentRes);
    return ResHdlr.sucCreate(
     res,
     "We successfully created your new account. Follow up by confirming your phone number! Welcome to Txt Me, you will receive a text message shortly",
     { newUser: newUser.rows[0], token: token }
    );
   } catch (err) {
    return ResHdlr.qryErr(res, err);
   }
  } catch (err) {
   client.end();
   return ResHdlr.qryErr(res, err);
  }
 } catch (err) {
  client.end();
  return ResHdlr.conErr(res, err, "Sign up");
 }
 const securePassword = hashPass(password);
};
