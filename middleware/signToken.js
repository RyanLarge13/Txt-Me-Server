import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const signToken = user => {
 const token = jwt.sign(user, process.env.JWT_SECRET);
 return token;
};

export default signToken;
