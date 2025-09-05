const validator = require("validator");

const validate = (user) => {
  console.log("Incoming user:", user);

  const mfield = ['firstname','emailid','password'];
  const isvalid = mfield.every((item) => user.hasOwnProperty(item));
  if (!isvalid) throw new Error("invalid user input missing required fields");

  if (!validator.isEmail(user.emailid)) {
    throw new Error("Invalid email format");
  }
//   if (!validator.isStrongPassword(user.password)) {
//     throw new Error("Invalid password format");
//   }
};

module.exports = validate;
