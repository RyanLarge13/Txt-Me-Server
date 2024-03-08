import vonage from "@vonage/server-sdk";
import dotenv from "dotenv";
dotenv.config();

const { Vonage } = vonage;

const vonageClient = new Vonage({
 apiKey: process.env.VONAGE_API_KEY,
 apiSecret: process.env.VONAGE_API_SECRET
});

const sendVerifyTxt = async (number, code) => {
 try {
  const res = await vonageClient.verify.start({
   number,
   brand: "Txt Me",
   code_length: 6,
   pin_expiry: 300,
   code: code
  });
  return res;
 } catch (err) {
  console.log(err);
 }
};

export default sendVerifyTxt;
