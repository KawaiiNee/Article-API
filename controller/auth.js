const User = require("../model/User");
const { BadRequestError, UnauthenticatedError } = require("../error");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(200).json({
    user: { firstName: user.firstName, lastName: user.lastName },
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide both email & password");
  }

  // verify credentials
  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError("Invalid Credentials");
  const isPasswordMatch = await user.verifyPassword(password);
  if (!isPasswordMatch) throw new UnauthenticatedError("Invalid Credentials");

  const token = user.createJWT();
  res.status(200).json({
    user: { firstName: user.firstName, lastName: user.lastName },
    token,
  });
};

module.exports = { register, login };
