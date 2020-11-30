require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const db = require('./config').get(process.env.NODE_ENV);

// Middleware
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())

// Force https ==> not sure how to use
// app.use(function (req, res, next) {
//   var protocol = req.get('x-forwarded-proto');
//   protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
// });

// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // ssl: true,
  // sslValidate: false,
  // sslKey: require('fs').readFileSync(process.env.SSL_KEY_FILE),
  // sslCert: require('fs').readFileSync(process.env.SSL_CRT_FILE),
}, function (err) {
  if (err) {
    console.log("Error ==> ", err)
  } else {
    console.log("Database is connected")
  }
});

// Routes
const flyerRouter = require('./routes/flyer-router')
const userRouter = require('./routes/user-router')
app.get('/', (req, res) => { res.send('Hello World!') })
app.use('/api', flyerRouter)
app.use('/api', userRouter)

// listening port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))