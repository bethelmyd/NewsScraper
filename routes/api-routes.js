"use strict";

var express = require("express");
var mongoose = require("mongoose");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

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
   request("http://www.nytimes.com/", function(error, response, html) {

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
        //console.log(hbsObject);
        console.log("inside scrape");  //this prints but AFTERWARDS I see the GET on the console
        res.render("index", hbsObject);
   });  //end request


   }); //end app.get
   

app.post("/save", function(req, res) {

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

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

   // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included
  Article.find({_id: req.params.id})
    // Send any errors to the browser
    .populate("note")
    // Now, execute that query
    .exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the notes
      else {
        res.send(doc);
      }
    });

});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {


  // TODO
  // ====

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note


});

}