const path = require("path");
const fs = require("fs");
const multer = require("multer");
const slugify = require("slugify");
const Article = require("../model/Article");
const { BadRequestError, NotFoundError } = require("../error");
// file variables
const mimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uploadDir = "imageUpload";
const folderName = "article-thumbnail";
const fileSizeLimit = 10;
const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
let fileName;

const fileFilter = (req, file, cb) => {
  // if file is one of mimetypes, upload it, reject it otherwise
  const isValidPhoto = mimeTypes.some((type) => type === file.mimetype);
  if (isValidPhoto) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // path to which to store files
    const dirPath = path.join(__dirname, "..", "public", uploadDir, folderName);
    // create dir if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    fileName =
      file.fieldname +
      "-" +
      uniqueSuffix +
      "-" +
      slugify(file.originalname.split(".")[0], {
        lower: true,
        strict: true,
      }) +
      path.extname(file.originalname);
    cb(null, fileName);
  },
});
const upload = multer({
  storage,
  limits: {
    // limit file size to 15mb
    fileSize: 1024 * 1024 * fileSizeLimit,
  },
  fileFilter,
});

const fileUpload = async (req, res) => {
  if (!req.file) {
    return res.status(200).json({ image: null });
  }

  const {
    params: { id: articleID },
    user: { userID },
  } = req;
  const article = await Article.findOne({ _id: articleID, createdBy: userID });

  if (!article) {
    fs.unlink(fileName, (err) => {
      if (err) {
        console.error(`File system error: ${err}`);
      }
    });
    throw new NotFoundError(
      `Can't upload :(... No article found with ID: ${articleID}`
    );
  }

  if (article.thumbnail) {
    fs.unlink(article.thumbnail, (err) => {
      if (err) {
        console.error(`File system error: ${err}`);
      }
    });
  }

  return res.status(200).json({ image: req.file.path });
};

module.exports = { upload, fileUpload };
