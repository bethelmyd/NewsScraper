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

// A GET request to scrape the nytimes website
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with request
//    request("http://www.nytimes.com/", function(error, response, html) {

// //     // Then, we load that into cheerio and save it to $ for a shorthand selector
//      var $ = cheerio.load(html);
// //     // Now, we grab every h2 within an article tag, and do the following:
//      $("h2.story-heading").each(function(i, element) {
//  //       // Save an empty result object
//        var result = {};

// //       // Add the text and href of every link, and save them as properties of the result object
//        result.title = $(this).children("a").text();
//        result.link = $(this).children("a").attr("href");
// //       // Using our Article model, create a new entry
// //       // This effectively passes the result object to the entry (and the title and link)
//        var entry = new Article(result);
//       // Now, save that entry to the db
//       entry.save(function(err, doc) {
//         // Log any errors
//         if (err) {
//           console.log(err);
//         }
//         // Or log the doc
//         else {
//           //console.log(doc);          
//          }
//        }); //end save


//      }); //end each

//     res.redirect("/articles");
//    });  //end request


//    }); //end app.get

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

    Article.find({articleId: req.body.articleId}, function(error, results){
        if(error)
        {
            console.log(error);
            res.send(error);
        }
        else{
            //see if anything was found
            if(results.length == 0)  //record wasn't there so save
            {
                var result = {};
                result.articleId = req.body.articleId;
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

// This will grab an article by it's article id
app.get("/articles/:id", function(req, res) {

 // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "articleId": req.params.id })
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
      res.json(doc);
    }
  });

});

// Create a new note or replace an existing note
app.post("/createNote", function(req, res) {

  // Create a new note and pass the req.body to the entry
  var note = {
      articleId: parseInt(req.body.articleId),
      title: req.body.title,
      body: req.body.body
  }
  var newNote = new Note(note);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
        var articleId = note.articleId;
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "articleId":  articleId}, { $push: { "notes": doc._id } }, { new: true })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

// Route to see notes we have added for a given article
app.get("/seeNotes/:id", function(req, res) {
// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "articleId": req.params.id })
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
//                var objectId = mongoose.Types.ObjectId(note._id);
                Article.update({"articleId": note.articleId}, {$pullAll: {"notes": [note._id]}});
                note.remove();
                res.json(note);
            }
        }

    });

});

// // New note creation via POST route
// app.post("/submitNote", function(req, res) {
//   // Use our Note model to make a new note from the req.body
//   var newNote = new Note(req.body);
//   // Save the new note to mongoose
//   newNote.save(function(error, doc) {
//     // Send any errors to the browser
//     if (error) {
//       res.send(error);
//     }
//     // Otherwise
//     else {
//       // Find our user and push the new note id into the User's notes array
//       Article.findOneAndUpdate({}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
//         // Send any errors to the browser
//         if (err) {
//           res.send(err);
//         }
//         // Or send the newdoc to the browser
//         else {
//           //res.send(newdoc);
//           console.log(newdoc);
//         }
//       });
//     }
//   });
// });

// // Route to see what user looks like WITH populating
// app.get("/populateduser", function(req, res) {
//   // Prepare a query to find all users..
//   Article.find({})
//     // ..and on top of that, populate the notes (replace the objectIds in the notes array with bona-fide notes)
//     .populate("notes")
//     // Now, execute the query
//     .exec(function(error, doc) {
//       // Send any errors to the browser
//       if (error) {
//         res.send(error);
//       }
//       // Or send the doc to the browser
//       else {
//         //res.send(doc);
//         console.log(doc);
//       }
//     });
// });




}//end exports