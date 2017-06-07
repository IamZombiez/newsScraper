// Node Dependencies
var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Import the Comment and Article models
var Note = require('../models/notes.js');
var Article = require('../models/articles.js');

// Routes

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
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
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
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

app.get("/saved", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({"saved":true}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error// Or send the doc to the browser as a json object
      );
    } else {
      res.json(doc);
    }
  });
});

app.get("/saved-articles", function(req, res) {
  // Grab every doc in the Articles array
res.sendFile(path.join(__dirname, "public/saved-articles.html"));
});

app.get("/saved", function(req, res) {
  // Grab every doc in the Articles array
res.sendFile(path.join(__dirname, "saved.html"));
});

app.get("/marksaved/:id", function(req, res) {

  Article.update({
    "_id": req.params.id
  }, {

    $set: {
      "saved": true
    }
  }, function(error, edited) {

    if (error) {

      res.send(error);
    } else {

      res.send(edited);
    }
  });

});

app.get("/markunsaved/:id", function(req, res) {

  Article.update({
    "_id": req.params.id
  }, {

    $set: {
      "saved": false
    }
  }, function(error, edited) {

    if (error) {

      res.send(error);
    } else {

      res.send(edited);
    }
  });

});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
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
