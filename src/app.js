const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const config = require("./config/config");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler.js");
const logger = console;
const session = require("./config/session");

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(session);

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

const limiter = rateLimit(config.rateLimit);
app.use("/api", limiter);
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(`/api/${config.apiVersion}`, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
