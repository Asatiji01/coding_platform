const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis'); 

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Token not present");
    }

    // Verify JWT signature
    const payload = jwt.verify(token, process.env.JWT_KEY);

    // Check if token exists in Redis (blacklist/whitelist check)
    const isBlocked = await redisClient.get(token);
    if (isBlocked) {
      return res.status(401).send("Token expired or blocked");
    }

    // Extract user id
    const { _id } = payload;
    if (!_id) {
      return res.status(401).send("Invalid token");
    }

    // Find user from DB
    const result = await User.findById(_id);
    if (!result) {
      return res.status(401).send("User not found");
    }

    // Attach user to request for further use
    req.result = result;

    next(); // continue
  } catch (err) {
    res.status(401).send("Authentication failed: " + err.message);
  }
};

module.exports = userMiddleware;
