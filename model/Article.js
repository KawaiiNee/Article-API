const mongoose = require("mongoose");
const marked = require("marked");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const DOMPurify = createDomPurify(new JSDOM().window);

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      minlength: 4,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      minlength: 4,
      maxlength: 256,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    public: {
      type: Boolean,
      default: false,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    markdown: {
      type: String,
      maxlength: 17000,
      trim: true,
      default: "Currently empty",
    },

    sanitizedHTML: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      match: [/\.(gif|jpe?g|png)$/i, "Invalid File"],
    },
  },
  { timestamps: true }
);

//  run before any crud to ensure slug value
ArticleSchema.pre("validate", async function () {
  // unique slug
  if (this.title) {
    // capitalize
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }

  // capitalize
  if (this.description) {
    this.description =
      this.description.charAt(0).toUpperCase() + this.description.slice(1);
  }

  // creating & sanitizing markdown
  if (this.markdown) {
    this.sanitizedHTML = DOMPurify.sanitize(marked.parse(this.markdown));
  }
});

module.exports = mongoose.model("Article", ArticleSchema);
