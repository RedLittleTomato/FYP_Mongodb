const Flyer = require('../models/flyer-model')
const ObjectID = require("mongodb").ObjectID

function status200(res, data) {
  return res.status(200).json({ success: true, data: data })
}

// bad request
function status400(res, errorMessage) {
  return res.status(400).json({ success: false, error: errorMessage })
}

// not found
function status404(res, errorMessage) {
  return res.status(404).json({ success: false, error: errorMessage })
}

getFlyer = async (req, res) => {
  await Flyer.findOne({ _id: req.params.id }, (err, flyer) => {
    if (err) return status400(res, err)

    if (!flyer) return status404(res, 'Flyer not found.')

    if (ObjectID(req.user._id).toHexString() !== flyer.editor) return status404(res, 'The flyer not belongs to the user.')

    return res.status(200).json({ success: true, data: flyer })
  }).catch(err => console.log(err))
}

getSavedFlyers = async (req, res) => {
  if (!req.user.saved.length) return status404(res, 'No saved flyer found.')

  await Flyer.find({ '_id': { $in: req.user.saved } }, (err, flyers) => {
    if (err) return status400(res, err)

    if (!flyers.length) return status404(res, 'No flyer found.')

    return res.status(200).json({ success: true, length: flyers.length, data: flyers })
  }).catch(err => console.log(err))
}

getTemplateFlyers = async (req, res) => {
  await Flyer.find({}, (err, flyers) => {
    if (err) return status400(res, err)

    if (!flyers.length) return status404(res, 'No flyer found.')

    // filter out the flyers are can be used as a template
    flyers = flyers.filter(flyer => flyer.template === true);

    return res.status(200).json({ success: true, length: flyers.length, data: flyers })
  }).catch(err => console.log(err))
}

getPreviewFlyer = async (req, res) => {

  await Flyer.findOne({ _id: req.params.id }, (err, flyer) => {
    if (err) return status400(res, err)

    if (!flyer) return status404(res, 'Flyer not found.')

    if (!flyer.public) return status404(res, 'The flyer is not public.')

    return res.status(200).json({ success: true, data: flyer })
  }).catch(err => console.log(err))
}

getFlyers = async (req, res) => {
  await Flyer.find({}, (err, flyers) => {
    if (err) return status400(res, err)

    if (!flyers.length) return status404(res, 'No flyer found.')

    // filter out the flyers belongs to the user
    // flyers = flyers.filter(flyer => flyer.editor === ObjectID(req.user._id).toHexString());

    return res.status(200).json({ success: true, length: flyers.length, data: flyers })
  }).catch(err => console.log(err))
}

createNewFlyer = (req, res) => {
  const body = req.body
  if (!body) return status400(res, 'You must provide an flyer.')

  const newFlyer = new Flyer(body)
  if (!newFlyer) return status400(res, 'Flyer details are missing!')

  newFlyer.save((err, doc) => {
    if (err) return status400(res, err)
    return res.status(200).json({
      success: true,
      id: newFlyer._id,
      message: 'New flyer created successful!',
      data: doc
    })
  })
}

saveFlyerChanges = async (req, res) => {
  const body = req.body

  if (!body) return status400(res, 'You must provide the latest flyer to update.')

  await Flyer.findOne({ _id: body.id }, (err, flyer) => {
    if (err) return status404(res, 'Flyer not found!')

    if (ObjectID(req.user._id).toHexString() !== body.editor) return status404(res, 'The flyer not belongs to the user.')

    flyer.name = body.name ? body.name : flyer.name
    flyer.description = body.description ? body.description : flyer.description
    flyer.canvas = body.canvas ? body.canvas : flyer.canvas
    flyer.image = body.image ? body.image : flyer.image
    flyer
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: 'Flyer updated!',
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

likeFlyer = async (req, res) => {
  const body = req.body

  if (!body) return status400(res, 'You must provide the flyer to like.')

  await Flyer.findOne({ _id: body.flyer_id }, (err, flyer) => {
    if (err) return status404(res, 'Flyer not found!')

    if (body.like) {
      if (flyer.like.includes(req.user._id)) return status404(res, 'User already liked the flyer!')
      flyer.like.push(req.user._id)
    } else {
      const index = flyer.like.indexOf(req.user._id)
      if (index === -1) return status404(res, 'User didnt like the flyer before!')
      flyer.like.splice(index, 1)
    }

    flyer
      .save()
      .then(() => {
        return res.status(200).json({
          success: true,
          message: body.like ? 'Liked' : 'Unliked',
        })
      })
      .catch(error => {
        return res.status(404).json({
          error,
          message: 'Flyer cannot updated!',
        })
      })
  })
}

deleteFlyer = async (req, res) => {
  await Flyer.findOneAndDelete({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).json({ success: false, error: err })
    }

    if (!user) return status404(res, 'Flyer not found.')

    return res.status(200)
  }).catch(err => console.log(err))
}

module.exports = {
  getFlyer,
  getSavedFlyers,
  getTemplateFlyers,
  getPreviewFlyer,
  getFlyers,
  createNewFlyer,
  saveFlyerChanges,
  likeFlyer,
  deleteFlyer
}