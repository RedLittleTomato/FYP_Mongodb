const mongoose = require('mongoose')

// mongoose
//   .connect('mongodb://localhost:27017/fyp_project', { useNewUrlParser: true })
//   .catch(e => {
//     console.error('Connection error', e.message)
//   })

mongoose.connect('mongodb://localhost:27017/fyp_project', { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
  if (err) console.error('Connection error', err.message);
  console.log("database is connected");
});

const db = mongoose.connection

module.exports = db