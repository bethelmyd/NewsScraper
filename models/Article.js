// Require mongoose
var mongoose = require("mongoose");
var Note = require("./note.js");

// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  articleId: {
    type: Number,
    required: true
  },
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  // ref refers to the Note model
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
