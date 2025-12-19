const session = require("express-session");

module.exports = session({
  name: process.env.SESSION_NAME || "cafe-lab.sid",
  secret: process.env.SESSION_SECRET || "cafe-lab-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true kalau HTTPS
    maxAge: 1000 * 60 * 60 * 2, // 2 jam
  },
});
