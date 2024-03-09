import Twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendVerifyTxt = async (number, pin) => {
  try {
    const res = await twilioClient.messages.create({
      from: process.env.TWILIO_NUMBER,
      body: `Txt Me verification pin ${pin}`,
      to: number,
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

export default sendVerifyTxt;
