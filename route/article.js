const express = require("express");
const router = express.Router();

const {
  getArticles,
  getArticle,
  getUserArticles,
  getUserArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controller/article");

const { upload, fileUpload } = require("../controller/imageUpload");

router.route("/").get(getArticles).post(createArticle);
router.get("/view/:slug", getArticle);
router.get("/dashboard", getUserArticles);
router.get("/dashboard/:slug", getUserArticle);
router.patch("/dashboard/:id", updateArticle);
router.delete("/dashboard/:id", deleteArticle);
router.post("/upload/:id", upload.single("image"), fileUpload);

module.exports = router;
