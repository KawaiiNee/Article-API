require("dotenv").config();
require("express-async-errors");

// express & connection
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const connect = require("./db/connect");

// security packages
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);
app.use(helmet());

// middleware
app.use(express.json());
const authentication = require("./middleware/authentication");
app.use(cors());

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// router
const authRouter = require("./route/auth");
const articlesRouter = require("./route/article");

// api documentation
// app.get("/", (req, res) => {
//   res.send(`<h1> API Docs </h1><a href="/api-docs">Documentation</a>`);
// });
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// route
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/articles", authentication, articlesRouter);

// error handler middleware
app.use(require("./middleware/not-found"));
app.use(require("./middleware/custom-error-handler"));

async function start() {
  try {
    await connect(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
  } catch (error) {
    console.log(error);
  }
}

start();
