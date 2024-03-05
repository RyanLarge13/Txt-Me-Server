class Validator {
 constructor() {}

 valStr(
  string,
  maxLength = 10,
  minLength = 3,
  customRegex = /^[a-zA-Z0-9!@#$%^&*()_+{}[\]:;<>,.?/~`\-\\s]*$/,
  customEscapeMap = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   '"': "&quot;",
   "'": "&#039;"
  }
 ) {
  string.trim();
  if (typeof string !== "string") {
   return false;
  }
  const stringLength = string.length;
  if (stringLength < minLength || stringLength > maxLength) {
   return false;
  }
  const nonDangerousPatterns = customRegex.test(string);
  if (!nonDangerousPatterns) {
   return false;
  }
  string.replace(
   new RegExp(`[${Object.keys(customEscapeMap).join("")}]`),
   match => customEscapeMap[match]
  );
  return true;
 }

 valInt(testLen, minSize = 0, maxSize = 100000, customRegex = /^\d+$/, number) {
  if (typeof number !== "number") {
   return false;
  }
  if (!testLen) {
   if (number < minSize || number > maxSize) {
    return false;
   }
  }
  const stringifiedNumber = number.toString();
  if (testLen) {
   if (
    stringifiedNumber.length > maxSize ||
    stringifiedNumber.length < minSize
   ) {
    return false;
   }
  }
  const isAValidNumber = customRegex.test(stringifiedNumber);
  if (!isAValidNumber) {
   return false;
  }
  if (!Number.isInteger(number)) {
   return false;
  }
  return true;
 }

 valUsername(username) {
  const isValidName = this.valStr(username, 20, 3);
  if (!isValidName) {
   return false;
  }
  return true;
 }

 valEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (typeof email !== "string") {
   return false;
  }
  const isValidEmail = this.valStr(email, 50, 5, emailRegex, {});
  if (!isValidEmail) {
   return false;
  }
  return true;
 }

 valPassword(password) {
  if (typeof password !== "string") {
   return false;
  }
  const passwordRegex =
   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const isValidPassword = this.valStr(password, 40, 8, passwordRegex, {});
  if (!isValidPassword) {
   return false;
  }
  return true;
 }

 valPhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== "string") {
   return;
  }
  const phoneRegex = /^(\(\d{3}\)-\d{3}-\d{4}|\d{3}-\d{3}-\d{4})$/;
  const isValidPhone = this.valStr(phoneNumber, 14, 12, phoneRegex, {
   "(": "",
   ")": "",
   "-": ""
  });
  const formattedNum = phoneNumber.replace(/[()-]/g, "");
  const phoneNumberNums = Number(formattedNum);
  const isValidNumber = this.valInt(true, 10, 10, undefined, phoneNumberNums);
  if (!isValidPhone) {
   return false;
  }
  if (!isValidNumber) {
   return false;
  }
  return true;
 }
}

const Valdtr = new Validator();

export default Valdtr;
