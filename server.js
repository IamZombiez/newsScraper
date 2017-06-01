//Express
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

// See files in public folder
app.use(express.static(__dirname + '/views'));

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

//For Handlebars
app.set('views', './views/layouts')
app.engine('hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');