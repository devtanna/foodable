function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

module.exports = {
  validateEmail: validateEmail,
};
