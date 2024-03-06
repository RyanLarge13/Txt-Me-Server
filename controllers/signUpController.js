import Valdtr from "../utils/Validator.js";
import ResHdlr from "../utils/ResponseHandler.js";
import client from "../utils/client.js";
import { hashPass } from "../utils/helpers.js";

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
      try {
        const newUser = await client.query(
          `
    INSERT INTO Users(username, email, password, phoneNumber)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `,
          [username, email, hashedPass, formattedPhoneNum]
        );
        if (newUser.rows.length < 1) {
          return ResHdlr.srvErr(
            res,
            "We cannot create a new account at this moment. More than likely there is an important security update on our servers right now. Please try to create a new account later and if the issue persists, contact the developer at"
          );
        }
        ResHdlr.sucCreate(
          res,
          "We successfully created your new account. Follow up by confirming your phone number! Welcome to Txt Me",
          newUser.rows[0]
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
