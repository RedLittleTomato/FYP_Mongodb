const { Schema, model } = require('mongoose')

const flyerSchema = new Schema(
  {
    name: { type: String, required: true, default: 'untitled' },
    description: { type: String, default: '' },
    editor: { type: String, required: true },
    canvas: { type: Object },
    image: String,
    like: [String],
    public: { type: Boolean, required: true, default: false },
    template: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
  { versionKey: false },
)

module.exports = model('flyer', flyerSchema)