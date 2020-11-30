const express = require('express')

const UserCtrl = require('../controllers/user-ctrl')
const auth = require('../middlewares/auth');

const router = express.Router()

router.post('/login', UserCtrl.login)
router.post('/register', UserCtrl.register)
router.get('/reset/:token', UserCtrl.resetValidation)
router.put('/updatepassword', UserCtrl.updatePassword)
router.put('/forgotpassword', UserCtrl.forgotPassword)

// auth
router.get('/checksavedflyer', auth, UserCtrl.checkSavedFlyer)
router.put('/saveflyer', auth, UserCtrl.saveFlyer)
router.get('/logout', auth, UserCtrl.logout)

router.put('/user/:id', UserCtrl.updateUser)
router.delete('/user/:id', UserCtrl.deleteUser)
router.get('/user/:id', UserCtrl.getUserById)
router.get('/users', UserCtrl.getUsers)

module.exports = router