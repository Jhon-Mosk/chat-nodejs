const createError = require("http-errors");

module.exports = function (res, req, next) {
    if (!req.session.user) {
        return next(createError(401, "Вы не авторизованы"));
    }

    next();
};
