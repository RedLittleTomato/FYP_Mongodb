const Image = require('../models/image-model')

uploadImage = (req, res) => {
  const body = req.body
  if (!body) return status400(res, 'You must provide an image.')

  const newImage = new Image(body)
  if (!newImage) return status400(res, 'Image details are missing!')

  newImage.save((err, doc) => {
    if (err) return res.status(400).json({ success: false, error: err })
    return res.status(200).json({
      success: true,
      id: newImage._id,
      message: 'Image uploaded successful!',
      user: doc
    })
  })
}

getUserByUserId = async (req, res) => {
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

getImagesByUserId = async (req, res) => {
  await User.find({ uploadedBy: req.params.id }, (err, users) => {
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