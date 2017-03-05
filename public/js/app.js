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
        if(jQuery.isEmptyObject(data) || (typeof(data.articleId) === "undefined"))
          alert("Article already saved");
        else
          alert("Article " + data.title + " saved.");

        $("#saveArticle-"+article.articleId).prop("disabled", true);
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
    var aTag = $("#"+articleId);   ////INSERTED
    var articleTitle = aTag.text().trim();   ////INSERTED

    var data = {
//        "articleId": parseInt(articleId),  ////CHANGED to below
        "articleTitle": articleTitle,
        "title" : title,
        "body" : body
    };

    $.post("/createNote/", data, function(data, status){
      console.log(data);
      if(jQuery.isEmptyObject(data))
        alert("Please save article first.");
      $("#noteTitle").val("");
      $("#noteArea").val("");
      $("#addNoteModal").modal("hide");
    });

  });

$(document).on("click", ".seeNotes", function(){
    var thisId = $(this).attr("id");
    var articleId = thisId.substring(thisId.indexOf("-")+1);
    var aTag = $("#"+articleId);  ////INSERTED
    var title = aTag.text().trim();  ////INSERTED
    var notesBody = $("#seeNotesBody");
    notesBody.attr("data", articleId);  //may not use this
    // $.get("/seeNotes/"+articleId, function(data, status){   ////CHANGED to one below
    $.get("/seeNotes/"+title, function(data, status){
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
        if(!jQuery.isEmptyObject(data))
        {
          thisBtn.parent().parent().remove();
          var notesBody = $("#seeNotesBody");  //check to see if there are still notes in the body
          if(notesBody.html() == "")
          {
            notesBody.html("<p>No notes are available for this article.</p>");           
          }
        }
    });

});


//});


