"use strict";

//$.ready(function(){
  $(document).on("click", "#scrape", function(){
    //alert("clicked");
     window.location.replace("/scrape");
  });

  $(document).on("click", ".saveArticle", function(){
    //alert("clicked");
    var thisBtnId = $(this).attr("id");
    var aTagId = thisBtnId.substring(thisBtnId.indexOf("-")+1);
    var aTag = $("#"+aTagId);
    var article = {};
    article.articleId = aTagId;
    article.title = aTag.html().trim();
    article.link = aTag.attr("href").trim();
    $.post("/saveArticle", article, function(data, status){
      if(status == "success")
      {
        //alert("Saved " + data);
        // $("#saveArticle-"+article.articleId).css("display", "none");
        // $("#noteBtnArea-"+article.articleId).css("display", "inline");       
      }
      else
      {
        alert("error writing to database");
      }
        
    });
  });

  $(document).on("click", ".addNote", function(){
    var thisId = $(this).attr("id");
    var articleId = thisId.substring(thisId.indexOf("-")+1);
    $("#saveNote").attr("data", articleId);
  });

  $(document).on("click", "#saveNote", function(){
    //alert("clicked");
    var title = $("#noteTitle").val().trim();
    var body = $("#noteArea").val().trim();
    if(title == "")
    {
      alert("Please enter a title");
      return;
    }
    if(body == "")
    {
      alert("Please enter a note");
      return;
    }
    var articleId = $(this).attr("data");
    var data = {
        "articleId": parseInt(articleId),
        "title" : title,
        "body" : body
    };

    $.post("/createNote/", data, function(data, status){
      if(data==null)
        alert("Please save article first.");
      $("#noteTitle").val("");
      $("#noteArea").val("");
      $("#addNoteModal").modal("hide");
    });

  });

$(document).on("click", ".seeNotes", function(){
    var thisId = $(this).attr("id");
    var articleId = thisId.substring(thisId.indexOf("-")+1);
    var notesBody = $("#seeNotesBody");
    notesBody.attr("data", articleId);  //may not use this
    $.get("/seeNotes/"+articleId, function(data, status){
      //alert(data);
      var notesBody = $("#seeNotesBody");
      notesBody.html("");
      if(data == null || data.length == 0)
      {
        notesBody.html("<p>No notes are available for this article.</p>");
        return;
      }
      var html = "";
      for(var i = 0; i < data.length; i++)
      {
        html += "<div class=\"panel panel-default\">";
        html += "<p class=\"panel-heading text-center\">" + data[i].title + "</p>";
        html += "<p class=\"panel-body\">" + data[i].body + "</p>";
        html += "<p class=\"panel-footer\"><button class=\"btn btn-danger btn-sm deleteNote\" id = \""+ data[i]._id +"\">Delete Note</button></p>";
        html += "</div>";        
      }
      notesBody.append(html);
    });

});

$(document).on("click", ".closeBtn", function(){
      $("#noteTitle").val("");
      $("#noteArea").val("");  
});


$(document).on("click", ".deleteNote", function(){
    var thisBtn = $(this);
    var noteId = thisBtn.attr("id");
    $.post("/deleteNote/"+noteId, function(data, status){
      console.log(data);
        if(data != null)
        {
          thisBtn.parent().parent().remove();
        }
    });

});


//});

// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });


// // Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//   // Empty the notes from the note section
//   $("#notes").empty();
//   // Save the id from the p tag
//   var thisId = $(this).attr("data-id");

//   // Now make an ajax call for the Article
//   $.ajax({
//     method: "GET",
//     url: "/articles/" + thisId
//   })
//     // With that done, add the note information to the page
//     .done(function(data) {
//       console.log(data);
//       // The title of the article
//       $("#notes").append("<h2>" + data.title + "</h2>");
//       // An input to enter a new title
//       $("#notes").append("<input id='titleinput' name='title' >");
//       // A textarea to add a new note body
//       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//       // A button to submit a new note, with the id of the article saved to it
//       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//       // If there's a note in the article
//       if (data.note) {
//         // Place the title of the note in the title input
//         $("#titleinput").val(data.note.title);
//         // Place the body of the note in the body textarea
//         $("#bodyinput").val(data.note.body);
//       }
//     });
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .done(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });

