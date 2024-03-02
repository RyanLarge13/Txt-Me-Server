import jwt from "jsonwebtoken";

const signToken = user => {
 const token = jwt.sign(user, process.env.JWT_SECRET, {
  expiresIn: "1h",
  algorithm: "RSA",
  issuer: "txt me"
 });
 return token;
};

export default signToken;
