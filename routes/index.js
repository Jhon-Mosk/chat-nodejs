var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    res.render("index", { user: req.session.user, username: req.session.username });
});

module.exports = router;
