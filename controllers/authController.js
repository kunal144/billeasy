const User = require("../schema/User");

const jwt = require("jsonwebtoken");
const createError = require("../utils/appError");
const bcrypt = require("bcrypt");

exports.signup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return next(new createError("User already exists", 400));
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    const token = jwt.sign({ _id: newUser._id }, process.env.secretKey, {
      expiresIn: "90d",
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    next(error);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new createError("user not found", 404));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new createError("Incorrect email or password"));
    }
    const token = jwt.sign({ _id: user._id }, process.env.secretKey, {
      expiresIn: "90d",
    });
    res.status(200).json({
      status: "success",
      token,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.Name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
