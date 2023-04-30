const session = require("express-session");
const MongoStore = require("connect-mongo");
const config = require("../config");

const sessionStore = MongoStore.create({
    mongoUrl: config.get("mongoose:uri"),
    autoRemove: "interval",
    autoRemoveInterval: 10, // в минутах
});

module.exports = sessionStore;
