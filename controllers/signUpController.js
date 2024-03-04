import bcryptjs from "bcryptjs";

export const signUpReg = async (req, res) => {
  const { email, username, password, number } = req.body.newUser;
  console.log(req.body);
};
