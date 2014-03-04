var moment = require("moment"),
    sugar = require("sugar"),
    nbpService = require('../app/nbpService'),
    mongojs = require('mongojs');

var db = mongojs('mongodb://localhost/test', ['nbpRates']);
var exchangeRates = db.nbpRates;

var fixMoneyValue = function(value) {
  value = value.replace(',', '.');
  return parseFloat(value);
};

var processResponse = function(ratesJson, currency, res) {
  var reqCurrency = ratesJson.tabela_kursow.pozycja.find(function(el) {
    return el.kod_waluty === currency;
  });

  if(typeof reqCurrency === 'undefined')
    res.send(400, 'Unknown currency!');
  else
    res.send({
      submitDate: ratesJson.tabela_kursow.data_publikacji,
      multiplier: reqCurrency.przelicznik,
      averageRate: fixMoneyValue(reqCurrency.kurs_sredni),
      currencyCode: reqCurrency.kod_waluty
    });

  res.end();
};

var processExchangeRates = function(err, data, currency, res, date) {
  if(err) {
    res.send(400, err);
    res.end();
    return;
  }

  exchangeRates.save({
    json: data,
    date: date.format("YYMMDD")
  }, function(err, saved) {
    console.log('ratesJson: ' + data);
    processResponse(data, currency, res);
  });
};

exports.getPLNRate = function(req, res){
  var currency = req.query.currency;
  var day = moment(req.query.date); //date when document will be submitted

  exchangeRates.findOne({date: day.format("YYMMDD")}, function(err, data) {
    if( err || !data)
      console.log("No records returned!");
    else {
      processResponse(data.json, currency, res);
      return;
    }

    nbpService.requestRatesTable(function(err, data){
      processExchangeRates(err, data, currency, res, day);
    }, day);

  });

};