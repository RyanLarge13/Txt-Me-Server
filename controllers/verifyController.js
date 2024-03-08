import sendVerifyTxt from "../utils/vonage.js";

export const sendPhoneCode = async number => {
 const textRes = await sendVerifyTxt(number);
};

export const verifyPhoneCode = async (req, res) => {};
