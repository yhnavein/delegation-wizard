"use strict";

/**
 * Keymetrics HTTP analyzer
 */
require('pmx').init();

/**
 * Module dependencies.
 */
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var routes = require('./routes');
var nbp = require('./routes/nbp');
var path = require('path');
var i18n = require('./i18n');

// if (process.env.NODE_ENV !== 'production'){
//   require('longjohn');
// }

var app = express();

// all environments
app.set('port', 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.methodOverride());
app.use(i18n);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 3600000 * 24 * 7 }));

var db = require('./models/sequelize');

// development only
if ('development' === app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/print', routes.print);
app.get('/nbp/getPLNRate', nbp.getPLNRate);
app.get('/changeLocale/:locale', function (req, res) {
  res.cookie('locale', req.params.locale);
  res.redirect("/");
});

db
  .sequelize
  .sync({ force: false })
  .then(function() {
      app.listen(app.get('port'), function() {
        console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
      });
  });
