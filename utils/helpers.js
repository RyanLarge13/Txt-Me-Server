import crypto from "crypto";

export const challenge = () => {
  const newChallenge = crypto.randomBytes(32).toString("base64");
  return newChallenge;
};
