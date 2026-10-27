const validator = require("validator");

const validate = (data) => {
  const mandatoryField = ['firstName', 'emailId', 'password'];

  const isAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));

  if (!isAllowed) {
    throw new Error("All fields (first name, email, and password) are required");
  }

  if (typeof data.firstName !== 'string' || data.firstName.trim().length < 3) {
    throw new Error("First name must be at least 3 characters long");
  }

  if (!validator.isEmail(data.emailId)) {
    throw new Error("Please enter a valid email address");
  }

  if (typeof data.password !== 'string' || data.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(data.password)) {
    throw new Error("Password must contain at least one uppercase letter (A-Z)");
  }

  if (!/[a-z]/.test(data.password)) {
    throw new Error("Password must contain at least one lowercase letter (a-z)");
  }

  if (!/[0-9]/.test(data.password)) {
    throw new Error("Password must contain at least one number (0-9)");
  }

  if (!/[^a-zA-Z0-9]/.test(data.password)) {
    throw new Error("Password must contain at least one special symbol (e.g. @, #, $, !)");
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Password is not strong enough");
  }
};

module.exports = validate;
