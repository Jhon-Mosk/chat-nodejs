const crypto = require("crypto");
const async = require("async");
const util = require("util");

const mongoose = require("../lib/mongoose"),
    Schema = mongoose.Schema;

const schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now(),
    },
});

schema.methods.encryptPassword = function (password, salt) {
    return crypto.createHmac("sha1", salt).update(password).digest("hex");
};

schema
    .virtual("password")
    .set(function (password) {
        this.__plainPassword = password;
        this.salt = Math.random() + "";
        this.hashedPassword = schema.methods.encryptPassword(password, this.salt);
    })
    .get(function () {
        return this.__plainPassword;
    });

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password, this.salt) === this.hashedPassword;
};

schema.statics.authorize = function (username, password, callback) {
    const User = this;

    async.waterfall(
        [
            function (callback) {
                User.findOne({ username: username })
                    .then((user) => {
                        callback(null, user)
                    }).catch((err) => {
                        callback(err)
                    })
            },
            function (user, callback) {
                if (user) {
                    if (user.checkPassword(password)) {
                        callback(null, user);
                    } else {
                        callback(new AuthError("Пароль неверен"));
                    }
                } else {
                    var user = new User({ username: username, password: password });
                    user.save()
                        .then((res) => {
                            callback(null, res);
                        })
                        .catch((err) => {
                            callback(err);
                        });
                }
            },
        ],
        callback
    );
};

exports.User = mongoose.model("User", schema);

class AuthError extends Error {
    name = "AuthError";
    constructor(message) {
        super()
        this.message = message;
    }
}

exports.AuthError = AuthError;
