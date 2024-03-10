import Mailer from "./utils/Mailer.mjs";

const futureTime = new Date(Date.now() + 5 * 60000);
const timeString = futureTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

const mailer = new Mailer(
 "verifyEmail.html",
 [
  { name: "user", string: "Ryan" },
  { name: "otp", string: "026471" },
  { name: "timeLimit", string: "5" },
  {
   name: "date",
   string: timeString
  }
 ],
 "ryanlarge13@gmail.com"
);

mailer.sendEmail("Test Verification!");
