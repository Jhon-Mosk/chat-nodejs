var express = require("express");
const { User, AuthError } = require("../models/user");
const createHttpError = require("http-errors");
var router = express.Router();
const multer = require('multer');

router.get("/", function (req, res, next) {
    res.render("login");
});

router.post("/", multer().none(), function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    User.authorize(username, password, function (err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(createHttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        req.session.username = user.username;
        req.session.user = user._id;
        res.send({});
    });
});

module.exports = router;
