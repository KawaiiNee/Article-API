const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../error");

const authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) throw new UnauthenticatedError("Authentication Invalid");

  try {
    // if verified, grant user ID
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userID: user.userID };
    next();
  } catch (error) {
    console.log({ error });
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

module.exports = authentication;
