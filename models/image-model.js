const { Schema, model } = require('mongoose')

const imageSchema = new Schema(
  {
    name: { type: String, required: true },
    img: {
      data: Buffer,
      contentType: String
    },
    uploadedBy: { type: String, required: true }
  },
  { timestamps: true },
  { versionKey: false },
)

module.exports = model('image', imageSchema)