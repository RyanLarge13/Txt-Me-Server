import crypto from "crypto";
import bcrypt from "bcryptjs";

export const challenge = () => {
 const newChallenge = crypto.randomBytes(32).toString("base64");
 return newChallenge;
};

export const hashPass = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};
