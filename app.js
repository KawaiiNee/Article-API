require("dotenv").config();
require("express-async-errors");
const cors = require("cors");

// express
const express = require("express");
const app = express();

// middleware
app.use(express.json());
const authentication = require("./middleware/authentication");
app.use(cors());

const PORT = process.env.PORT || 3000;
const connect = require("./db/connect");

// router
const authRouter = require("./route/auth");
const articlesRouter = require("./route/article");

app.get("/", (req, res) => {
  res.send("Test api");
});
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
