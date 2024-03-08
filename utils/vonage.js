import vonage from "@vonage/server-sdk";
import dotenv from "dotenv";
dotenv.config();

const { Vonage } = vonage;

const vonageClient = new Vonage({
 apiKey: process.env.VONAGE_API_KEY,
 apiSecret: process.env.VONAGE_API_SECRET
});

const sendVerifyTxt = async number => {
 try {
  const res = await vonageClient.verify.start({
   number,
   brand: "Txt Me"
  });
  return res;
 } catch (err) {
  console.log(err);
 }
};

export default sendVerifyTxt;
