
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var nbp = require('./routes/nbp');
var http = require('http');
var path = require('path');
var i18n = require('./i18n');

if (process.env.NODE_ENV !== 'production'){
  require('longjohn');
}

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(i18n);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/nbp/getPLNRate', nbp.getPLNRate);
app.get('/changeLocale/:locale', function (req, res) {
  res.cookie('locale', req.params.locale);
  res.redirect("/");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
