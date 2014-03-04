var sugar = require("sugar"),
    nbpDirCache = require("../nbpDirCache")(),
    mongojs = require('mongojs'),
    xml2json = require("xml2json");

var db = mongojs('mongodb://localhost/test', ['nbpRates']);
var exchangeRates = db.nbpRates;

