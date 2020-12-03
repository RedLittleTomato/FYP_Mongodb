const { Schema, model } = require('mongoose')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltFactor = 10;

const userSchema = new Schema(
  {
    username: { type: String, required: true, index: true, unique: true },
    email: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    saved: [String],
    token: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true },
  { versionKey: false },
)

// hashing the user password (pre function)
userSchema.pre('save', function (next) {
  var user = this;

  // Only run this function if password was moddified (not on other update functions)
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(saltFactor, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    })

  })
});

// user login and check password
userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) { // this.password is hashed password that stored in db
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

// check user logged in
userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), process.env.SECRET_KEY);

  user.token = token;

  user.save(function (err, user) {
    if (err) return cb(err);
    return cb(null, user);
  })
}

// find whether a user is logged-in or not
userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, process.env.SECRET_KEY, function (err, decode) {
    user.findOne({ "_id": decode, "token": token }, function (err, user) {
      if (err) return cb(err);
      return cb(null, user);
    })
  })
};

// user logout and remove token
userSchema.methods.deleteToken = function (token, cb) {
  var user = this;

  user.update({ $unset: { token: 1 } }, function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  })
}

module.exports = model('user', userSchema)