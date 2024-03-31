const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("user not authorized!");
    }

    console.log(decoded);
    req.user = decoded.user;
    next();
  });

  if (!token) {
    res.status(401);
    throw new Error("user not authorized!");
  }
});

module.exports = validateToken;
