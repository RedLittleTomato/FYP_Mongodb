const express = require('express')

const flyerCtrl = require('../controllers/flyer-ctrl')
const auth = require('../middlewares/auth');

const router = express.Router()

// router.get('/flyers', flyerCtrl.getFlyersByUserId)
// router.get('/flyer/:id', flyerCtrl.getFlyerById)
// router.put('/flyer/:id', flyerCtrl.updateFlyer)
// router.delete('/flyer/:id', flyerCtrl.deleteFlyer)

router.get('/flyer/preview/:id', flyerCtrl.getPreviewFlyer)

// auth
router.get('/flyer/:id', auth, flyerCtrl.getFlyer)
router.get('/flyers', auth, flyerCtrl.getFlyers)
router.get('/flyers/saved', auth, flyerCtrl.getSavedFlyers)
router.get('/flyers/template', auth, flyerCtrl.getTemplateFlyers)
router.post('/flyer', auth, flyerCtrl.createNewFlyer)
router.put('/flyer', auth, flyerCtrl.saveFlyerChanges)
router.put('/flyer/like', auth, flyerCtrl.likeFlyer)
router.delete('/flyer/:id', auth, flyerCtrl.deleteFlyer)

module.exports = router