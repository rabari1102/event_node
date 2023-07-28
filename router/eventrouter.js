const express = require("express");
const router = express.Router();

const eventrouter = require("../controller/eventcontroller");

router.post("/signup", eventrouter.eventsignup);
router.post("/login", eventrouter.eventlogin);
router.get('/viewsprofile',eventrouter.viewsProfile);
router.put("/updateprofile", eventrouter.updateProfile);
router.get("/logout", eventrouter.eventLogout);
router.post('/forgetpassword',eventrouter.forgetpassword);
router.post('/sendlink',eventrouter.sendresetpasswordmail);
router.post('/reset',eventrouter.resetpassword);
router.post('/eventcreat',eventrouter.createEvent);
router.post('/updatevent',eventrouter.updateEvent);
router.get('/listEvent',eventrouter.listevent);
router.get('/filterdate',eventrouter.filterEventsByDate);
router.get('/findEvent/:_id',eventrouter.findEventById);

module.exports = router;
