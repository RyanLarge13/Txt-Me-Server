import { challenge } from "../utils/helpers.js";

export const loginReg = async (req, res) => {
  console.log(req.body);
};

export const loginBiometrics = async (req, res) => {};

export const loginMagicLink = async (req, res) => {};

export const getChallenge = async (req, res) => {
  const newKey = challenge();
  return res.status(201).json({ challenge: newKey });
};
