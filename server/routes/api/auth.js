const express = require("express");
const router = express.Router();
let middleware = require('../../middleware');

// check auth token
router.get("/", middleware.checkToken, (req, res) => {
    res.status(200).send();
});

module.exports = router;