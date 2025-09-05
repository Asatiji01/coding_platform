const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../utils/validator");
const redisclient = require("../config/redis");

// Admin registration
const adminRegister = async (req, res) => {
  try {
    console.log("Incoming req.body: ", req.body);

    validate(req.body);
    const { firstname, emailid, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "admin"; // fixed typo

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailid, role: "admin" },
      process.env.JWT_KEY, // unified key
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("Admin register successful");
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Error: " + err.message);
  }
};

// User registration
const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstname, emailid, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailid, role: "user" },
      process.env.JWT_KEY, // unified key
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("User register successful");
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Error: " + err.message);
  }
};

// Login
const login = async (req, res) => {
  try {
    const { emailid, password } = req.body;
    if (!emailid || !password) throw new Error("Invalid credentials both");
   console.log(req.body)
    const user = await User.findOne({ emailid });
    if (!user) throw new Error("Invalid credentials email");

    const match = await bcrypt.compare(password, user.password); // added await
    if (!match) throw new Error("Invalid credentials pass");

    const token = jwt.sign(
      { _id: user._id, emailid, role: user.role },
      process.env.JWT_KEY, // unified key
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 }); // fixed maxAge
    res.status(200).send("User login successful");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(400).send("No token found");

    const payload = jwt.verify(token, process.env.JWT_KEY);

    await redisclient.set(`token:${token}`, "Blocked");
    await redisclient.expireAt(`token:${token}`, payload.exp);

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.send("Logged out successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = { register, login, logout, adminRegister };
