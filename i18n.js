var i18n = require('i18n');

i18n.configure({
    locales:['en', 'pl'],
    defaultLocale: 'pl',
    cookie: 'lang',
    directory: __dirname + '/locales'
});

module.exports = function(req, res, next) {

  i18n.init(req, res);
  //res.local('__', res.__);

  var current_locale = i18n.getLocale();

  return next();
};