const express = require('express');
const { bookingController, getUserBookings ,deletebooking} = require("../controllers/booking/bookingController")
const router = express.Router();

router.post('/', bookingController);
router.get('/:userId', getUserBookings);
router.delete('/:id', deletebooking);


module.exports = router;
