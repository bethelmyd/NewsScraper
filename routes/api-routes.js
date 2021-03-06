"use strict";

var express = require("express");
var mongoose = require("mongoose");
// Our scraping tools
var cheerio = require("cheerio");

// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");

mongoose.Promise = Promise;
var request = Promise.promisify(require("request"));
Promise.promisifyAll(request);

// Requiring our Note and Article models
var Note = require("../models/note.js");
var Article = require("../models/article.js");

// Routes
// ======
module.exports = function(app) {

// Simple index route
app.get("/", function(req, res) {
  res.render("index", {articles: []});
});

app.get("/scrape", function(req, res) {
    var articleId = 0;
    
  // First, we grab the body of the html with request
  var hbsObject = request("https://www.nytimes.com/", function(error, response, html) {

//     // Then, we load that into cheerio and save it to $ for a shorthand selector
     var $ = cheerio.load(html);

     var results = [];
//     // Now, we grab every h2 within an article tag, and do the following:
     $("h2.story-heading").each(function(i, element) {
 //       // Save an empty result object
       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object

        result.articleId = ++articleId;
        result.title = $(this).children("a").text();
        result.link = $(this).children("a").attr("href");
        if(result.title != '' && result.link != '' && result.title != undefined && result.link != undefined)
            results.push(result);
     }); //end each

        var hbsObject = {
            articles: results
        };
        //hbsObject.articles = results;
        //console.log(hbsObject);
        console.log("inside scrape");  //this prints but AFTERWARDS I see the GET on the console

        res.render("index", hbsObject);
    });  //end request


   }); //end app.get
   

app.post("/saveArticle", function(req, res) {

//    Article.find({articleId: req.body.articleId}, function(error, results){   /////CHANGED to one below
    Article.find({title: req.body.title}, function(error, results){
        if(error)
        {
            console.log(error);
            res.send({});
        }
        else{
            //see if anything was found
            if(results.length == 0)  //record wasn't there so save
            {
                var result = {};
//                result.articleId = req.body.articleId;  ///// CHANGED
                result.title = req.body.title;
                result.link = req.body.link;
            //       // Using our Article model, create a new entry
            //       // This effectively passes the result object to the entry (and the title and link)
                var entry = new Article(result);
                // Now, save that entry to the db
                entry.save(function(err, doc) {
                    // Log any errors
                    if (err) {
                    console.log(err);
                    }
                    // Or log the doc
                    else {
                        console.log(doc);
                        res.send(doc);          
                    }
                }); //end save
            }
            else
            {
                res.send(results);
            }
        }
    });  //end find

}); //end app.get


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {


  // TODO: Finish the route so it grabs all of the articles
  Article.find({}, function(error, results) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
        var hbsObject = {
            articles: results
        };
        //console.log(hbsObject);
        console.log("inside articles");  //this prints but AFTERWARDS I see the GET on the console
        res.render("index", hbsObject);
        // res.send(hbsObject);
    }
  });


});

// Create a new note or replace an existing note
app.post("/createNote", function(req, res) {
//  var articleId = parseInt(req.body.articleId);  ////COMMENTED OUT
//   Article.findOne({articleId: articleId}, function(err, article){  ////CHANGED to one below
  Article.findOne({title: req.body.articleTitle}, function(err, article){
      if(err) throw err;
      if(article)
      {
        var note = {
//            articleId: articleId,  ////COMMENTED out
            title: req.body.title,
            body: req.body.body
        }
        var newNote = new Note(note);

        // And save the new note the db
        newNote.save(function(error, doc) {
            // Log any errors
            if (error) {
                throw error;
            }
            // Otherwise
            else {
                // var articleId = note.articleId;   ////COMMENTED out
            var articleTitle = req.body.articleTitle;
            // Use the article id to find and update it's note
            // Article.findOneAndUpdate({ "articleId":  articleId}, { $push: { "notes": doc._id } }, { new: true })  ////CHANGED to one below
            Article.findOneAndUpdate({ "title":  articleTitle}, { $push: { "notes": doc._id } }, { new: true })            
            // Execute the above query
            .exec(function(err, doc) {
                // Log any errors
                if (err) {
                    throw err;
                }
                else {
                // Or send the document to the browser
                res.send(doc);
                }
            });
            }
        });
      }
      else{
          res.send(null);  //article wasn't saved
      }
  });
  // Create a new note and pass the req.body to the entry
});

// Route to see notes we have added for a given article
//app.get("/seeNotes/:id", function(req, res) {  ////CHANGED to one below
app.get("/seeNotes/:title", function(req, res) {
// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   Article.findOne({ "articleId": req.params.id })   ////CHANGED to one below
  Article.findOne({ "title": req.params.title })
  // ..and populate all of the notes associated with it
  .populate("notes")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
    console.log(doc);
    if(doc == null)
        res.json([]);
    else
        res.json(doc.notes);      
    }
  });
});

app.post("/deleteNote/:id", function(req, res){
    var noteId = req.params.id;
    Note.findOne({ "_id": noteId }, function(error, note){
        if(error)
        {
            console.log(error);
            throw error;
        }
        else{
            console.log(note);
            if(note == null)
                res.json(null);
            else{
                console.log(noteId);
                Article.where({"articleId": note.articleId}).update({$pullAll: {"notes": [note._id]}}).exec();  //YOU NEED THE exec

                note.remove();
                res.json(note);
            }
        }

    });

 });


// // This will grab an article by it's article id
// app.get("/articles/:id", function(req, res) {

//  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
// //  Article.findOne({ "articleId": req.params.id })   ////CHANGED to one below
//   Article.findOne({ "_id": req.params.id })  // ..and populate all of the notes associated with it
//   .populate("notes")
//   // now, execute our query
//   .exec(function(error, doc) {
//     // Log any errors
//     if (error) {
//       throw error;
//     }
//     // Otherwise, send the doc to the browser as a json object
//     else {
//       res.json(doc);
//     }
//   });

// });


}//end exports