const User = require('../models/user-model')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// bad request
function status400(res, errorMessage) {
  return res.status(400).json({ success: false, error: errorMessage })
}

// not found
function status404(res, errorMessage) {
  return res.status(404).json({ success: false, error: errorMessage })
}

register = (req, res) => {
  const body = req.body
  if (!body) return status400(res, 'You must provide a user.')

  const newUser = new User(body)
  if (!newUser) return status400(res, 'User details are missing!')

  User.findOne({ email: newUser.email }, function (err, user) {
    if (err) return res.status(400).json({ success: false, error: `error1 => ${err}` })
    if (user) return res.status(400).json({ success: false, message: "This email is registered in the system." })

    newUser.save((err, doc) => {
      if (err) return res.status(400).json({ success: false, error: `error2 => ${err}` })
      return res.status(200).json({
        success: true,
        message: 'Register successful!',
      })
    })
  })
}

login = (req, res) => {
  const loginUser = new User(req.body)
  User.findOne({ 'email': loginUser.email }, function (err, user) {
    if (!user) return res.json({ isAuth: false, message: 'Login failed.' })

    user.comparePassword(loginUser.password, (err, isMatch) => {
      if (err) return status400(res, err);
      if (!isMatch) return res.json({ isAuth: false, message: "Login failed" })

      user.generateToken((err, user) => {
        if (err) return status400(res, err)

        res.json({
          isAuth: true,
          id: user._id,
          type: user.type,
          token: user.token
        })
      })
    })
  })
}

logout = (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return status400(res, err);
    return res.sendStatus(200);
  })
}

forgotPassword = async (req, res) => {
  const userEmail = req.body.email;
  await User.findOne({ email: userEmail }, (error, user) => {
    if (error) return status400(res, error)

    if (!user) return status404(res, `The email does registered with us before.`)

    const randomNumber = Math.random().toString().slice(2, 22);
    const token = jwt.sign(randomNumber, process.env.SECRET_KEY);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.save(function (error) {
      if (error) return status400(res, error)
    });

    const transporter = nodemailer.createTransport({
      service: process.env.SENDER_EMAIL_DOMAIN,
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL_ADDRESS,
        pass: process.env.SENDER_EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL_ADDRESS,
      to: userEmail,
      subject: 'E-Flyer Reset Password',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        `${process.env.WEBSITE_URL}reset-password?t=${token}` + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        if (error) return status400(res, error)
      } else {
        return res.status(200).json({
          success: true,
          message: `We just sent the email to ${userEmail} with the reset password link inside. 
          The link will expire after 1 hour (reset before ${user.resetPasswordExpires}).`
        })
      }
    });
  }).catch(err => console.log(err))
}

resetValidation = async (req, res) => {
  await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) { return status400(res, 'Opps! The password reset token and url are invalid or have expired.') }
    return res.status(200).json({
      success: true,
      id: user._id
    })
  })
}

updatePassword = async (req, res) => {
  const body = req.body

  if (!body) return status400(res, 'You must provide a password to update')

  await User.findOne({ _id: body.user_id }, (err, user) => {
    if (err) return status404(res, 'User not found!')

    user.password = body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    user
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: 'Password updated!',
        })
      })
      .catch(error => {
        return res.status(404).json({
          error,
          message: 'Password not updated!',
        })
      })
  })
}

saveFlyer = async (req, res) => {
  const body = req.body

  if (!body) return status400(res, 'You must provide a flyer to save')

  await User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return status404(res, 'User not found!')

    if (body.save) {
      if (user.saved.includes(body.flyer_id)) return status404(res, 'The flyer already saved!')
      user.saved.push(body.flyer_id)
    } else {
      const index = user.saved.indexOf(body.flyer_id)
      if (index === -1) return status404(res, 'User didnt save the flyer before!')
      user.saved.splice(index, 1)
    }

    user
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: body.save ? 'Saved' : 'Unsaved',
        })
      })
      .catch(error => {
        return res.status(404).json({
          error,
          message: 'Flyer not updated!',
        })
      })
  })
}

checkSavedFlyer = async (req, res) => {
  await User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return status404(res, 'User not found!')

    var saved = false;

    if (user.saved.length !== 0) {
      saved = user.saved.includes(req.query.flyer_id)
    }

    return res.status(200).json({ success: true, saved: saved })
  })
}

getSavedFlyerList = async (req, res) => {
  await User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return status404(res, 'User not found!')

    return res.status(200).json({ success: true, data: user.saved })
  })
}

updateUser = async (req, res) => {
  const body = req.body

  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a body to update',
    })
  }

  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(404).json({
        err,
        message: 'User not found!',
      })
    }
    // user = new User({
    //   username: body.username,
    //   email: body.email,
    //   password: body.password
    // });
    user.username = body.username
    user.email = body.email
    user.password = body.password
    user
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          id: user._id,
          message: 'User updated!',
        })
      })
      .catch(error => {
        return res.status(404).json({
          error,
          message: 'User not updated!',
        })
      })
  })
}

deleteUser = async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).json({ success: false, error: err })
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: `User not found` })
    }

    return res.status(200).json({ success: true, data: user })
  }).catch(err => console.log(err))
}

getUserById = async (req, res) => {
  await User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).json({ success: false, error: err })
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: `User not found` })
    }
    return res.status(200).json({ success: true, data: user })
  }).catch(err => console.log(err))
}

getUsers = async (req, res) => {
  await User.find({}, (err, users) => {
    if (err) {
      return res.status(400).json({ success: false, error: err })
    }
    if (!users.length) {
      return res
        .status(404)
        .json({ success: false, error: `User not found` })
    }
    return res.status(200).json({ success: true, data: users })
  }).catch(err => console.log(err))
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetValidation,
  updatePassword,
  saveFlyer,
  checkSavedFlyer,
  getSavedFlyerList,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
}