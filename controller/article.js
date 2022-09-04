const Article = require("../model/Article");
const { NotFoundError } = require("../error");

// PUBLIC
const getArticles = async (req, res) => {
  const articles = await Article.find({ public: true });
  res.status(200).json({ articles, count: articles.length });
};
// PUBLIC
const getArticle = async (req, res) => {
  const { slug } = req.params;
  const article = await Article.findOne({ slug, public: true });

  if (!article) {
    throw new NotFoundError(
      `The article might be missing or have been set as private`
    );
  }

  res.status(200).json({ article });
};

// USER EXCLUSIVE
const getUserArticles = async (req, res) => {
  const articles = await Article.find({ createdBy: req.user.userID }).sort(
    "updatedAt"
  );
  res.status(200).json({ articles, count: articles.length });
};
// USER EXCLUSIVE
const getUserArticle = async (req, res) => {
  const {
    params: { slug },
    user: { userID },
  } = req;
  const article = await Article.findOne({ slug, createdBy: userID });

  if (!article) {
    throw new NotFoundError(`No article found`);
  }

  res.status(200).json({ article });
};

const createArticle = async (req, res) => {
  // reference user
  req.body.createdBy = req.user.userID;
  const article = await Article.create(req.body);

  res.status(200).json({ article });
};

const updateArticle = async (req, res) => {
  const {
    params: { id: articleID },
    user: { userID },
  } = req;

  const article = await Article.findOneAndUpdate(
    { _id: articleID, createdBy: userID },
    req.body,
    { new: true, runValidators: true }
  );

  // to run Model.pre("validate")
  await article.save();

  if (!article) {
    throw new NotFoundError(`No article found with ID: ${articleID}`);
  }

  res.status(200).json({ article });
};

const deleteArticle = async (req, res) => {
  const {
    params: { id: articleID },
    user: { userID },
  } = req;

  const article = await Article.findOneAndRemove({
    _id: articleID,
    createdBy: userID,
  });

  if (!article) {
    throw new NotFoundError(`No article found with ID: ${articleID}`);
  }

  res.status(200).json({ article });
};

module.exports = {
  getArticles,
  getArticle,
  getUserArticles,
  getUserArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};
