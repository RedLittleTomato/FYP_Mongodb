const User = require('../models/user-model');

// check whether the user has been logged in or not
auth = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).send({ error: 'Token Missing' });
  }

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(401).json({
      error: true,
      isAuth: false,
      message: "Cannot find the token"
    });

    req.token = token;
    req.user = user;
    next();
  })
}

module.exports = auth;