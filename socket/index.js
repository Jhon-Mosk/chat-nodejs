const { Server } = require("socket.io");
const log = require("../lib/log")(module);
var createError = require("http-errors");
const { User } = require("../models/user");
const sessionStore = require("../lib/sessionStore");
const cookie = require("cookie");
const config = require("../config");
var cookieParser = require("cookie-parser");

async function loadSession(sid) {
    return new Promise((resolve, reject) => {
        sessionStore.get(sid, (err, session) => {
            if (err) {
                log.error(err);
                return err;
            }
            if (!session) {
                resolve(null);
            } else {
                resolve(session);
            }
        });
    });
}

async function loadUser(session) {
    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return null;
    } else {
        log.debug("retrieving user ", session.user);
        try {
            const user = await User.findById(session.user);

            if (!user) {
                throw createError(403, "Anonymous session may not connect");
            }

            return user;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "localhost:*",
        },
        logger: log,
    });

    io.use(async (socket, next) => {
        try {
            // сделать handshakeData.cookies - объектом с cookie
            socket.handshake.cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const sidCookie = socket.handshake.cookies[config.get("session:key")];
            const sid = cookieParser.signedCookie(sidCookie, config.get("session:secret"));
            const session = await loadSession(sid);
            socket.handshake.session = session;
            const user = await loadUser(session);
            socket.handshake.user = user;
        } catch (err) {
            log.error(err);
            if (err instanceof createError.HttpError) {
                next(createError(401, "Вы не авторизованы"));
            }

            next(err);
        }

        next();
    });

    io.sockets.on("sessreload", async function (sid) {
        const clients = io.sockets.sockets;

        for (const client of clients.values()) {
            const sidCookie = client.handshake.cookies[config.get("session:key")];
            const clientSid = cookieParser.signedCookie(sidCookie, config.get("session:secret"));

            if (clientSid === sid) {
                try {
                    const session = await loadSession(sid);

                    client.handshake.session = session;

                    if (!session) {
                        client.emit("logout");
                        client.disconnect();
                        return;
                    }
                } catch (err) {
                    if (err) {
                        client.emit("error", "server error");
                        client.disconnect();
                        return;
                    }
                }
            }
        }
    });

    io.sockets.on("connection", function (socket) {
        const username = socket.handshake.user.get("username");

        socket.broadcast.emit("join", username);

        socket.on("message", function (text, cb) {
            socket.broadcast.emit("message", username, text);
            cb && cb();
        });

        socket.on("disconnect", function () {
            socket.broadcast.emit("leave", username);
        });
    });

    return io;
};
