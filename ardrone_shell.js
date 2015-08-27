'use strict';

var consts        = require("./ardrone_constants.js")
  , at            = require("./ardrone_at.js")
  , navdata       = require("./ardrone_navdata.js")
  , config        = require("./config.js");

var express        = require('express')
  , cookieParser   = require('cookie-parser')
  , bodyParser     = require('body-parser')
  , app            = express();

app.use(cookieParser());

/*
 * Body parser
 *
 */
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

app.set('views',       './htdocs/views');
app.set('view engine', 'jade');

Object.keys(config.STATIC_ROUTES).forEach(function(url) {
  app.use(url, express.static(config.STATIC_ROUTES[url]));
});

app.use(at);

app.get('/*', function(req, res) {
 res.render('home', {});
});

app.listen(8080, "0.0.0.0");
