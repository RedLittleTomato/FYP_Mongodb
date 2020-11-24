const { Schema, model } = require('mongoose')

const flyerSchema = new Schema(
  {
    name: { type: String, required: true, default: 'untitled' },
    description: { type: String, default: '' },
    editor: { type: String },
    canvas: { type: Object },
    image: String,
    qrcode: String,
    like: [String],
    public: { type: Boolean, required: true, default: true },
    template: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
  { versionKey: false },
)

module.exports = model('flyer', flyerSchema)