import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
dotenv.config();

class Mailer {
 constructor(file, replaceables, recipient) {
  this.file = file;
  this.replaceables = replaceables;
  this.recipient = recipient;
  this.transporter = nodemailer.createTransport({
   service: process.env.EMAIL_SERVICE,
   auth: {
    user: process.env.EMAIL,
    pass: process.env.GMAIL_APPKEY
   }
  });
  this.__filename = fileURLToPath(import.meta.url);
  this.__dirname = dirname(this.__filename);
  this.templatePath = path.join(
   this.__dirname,
   `../emailTemplates/${this.file}`
  );
  this.template = "";
 }
 async initializeTemplate() {
  this.template = await fs.readFile(this.templatePath, "utf-8");
 }
 async sendEmail(subject) {
  await this.initializeTemplate();
  this.replaceables.forEach(obj => {
   this.template = this.template.replace(`{${obj.name}}`, obj.string);
  });
  const mailOptions = {
   from: process.env.EMAIL,
   to: this.recipient,
   subject,
   html: this.template
  };
  try {
   const info = await this.transporter.sendMail(mailOptions);
   console.log(`Email sent: ${info.response}`);
   return true;
  } catch (err) {
   console.log(err);
   return false;
  }
 }
}

export default Mailer;
