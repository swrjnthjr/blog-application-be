const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

//@desc Get all contacts
//@route POST /api/user/register
//@access public
const createUser = asyncHandler(async (req, res) => {
  const { userName, email, password, firstName, lastName, dob } = req.body;
  console.log(req.body);
  if (!userName || !email || !password || !firstName || !lastName || !dob) {
    res.status(400);
    throw new Error("All fields are mandatory.");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered.");
  }

  // hash password
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    userName,
    email,
    firstName,
    lastName,
    dob,
    password: hashPassword,
  });
  if (user) {
    res
      .status(201)
      .json({ _id: user.id, email: user.email, userName: userName });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }

  res.status(200).json({ message: "Register user!", user });
});

//@desc Get all contacts
//@route get /api/user/login
//@access private
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory.");
  }
  const user = await User.findOne({ email });
  //compare password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.userName,
          firstName:user.firstName,
          lastName:user.lastName,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("username or password is invalid!");
  }
});

//@desc Get all contacts
//@route GET /api/user/current
//@access private
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = {
  createUser,
  getCurrentUser,
  loginUser,
};
