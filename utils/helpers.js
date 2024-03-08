import crypto from "crypto";
import bcrypt from "bcryptjs";

export const challenge = () => {
 const newChallenge = crypto.randomBytes(32).toString("base64");
 return newChallenge;
};

export const hashPass = async password => {
 const hashedPassword = await bcrypt.hash(password, 10);
 return hashedPassword;
};

export const genRandomCode = () => {
 let code = "";
 for (let i = 0; i < 6; i++) {
  code += Math.floor(Math.random() * 10);
 }
 return code;
};

export const getDateInFuture = (minutes) => {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + minutes * 60000);
  return futureDate;
}

