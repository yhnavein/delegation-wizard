"use strict";

var moment = require("moment"),
    sugar = require("sugar"),
    nbpService = require('../app/nbpService');

var db = require('../models/sequelize');

var fixMoneyValue = function(value) {
  value = value.replace(',', '.');
  return parseFloat(value);
};

var processResponse = function(ratesJson, currency, res) {
  var reqCurrency = ratesJson.tabela_kursow.pozycja.find(function(el) {
    return el.kod_waluty === currency;
  });

  if(!reqCurrency)
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

  //we want to ensure that we will store in our DB only those proper and archived exchange rates
  //this will also ensure that no future exchange rates will be stored
  if(moment.duration(new Date() - date).asHours() > 48) {
    db.Rate.build({
      json: data,
      date: date.format("YYMMDD")
    })
    .save()
    .finally(function() {
      processResponse(data, currency, res);
    });
  } else {
    processResponse(data, currency, res);
  }
};

exports.getPLNRate = function(req, res){
  var currency = req.query.currency;
  var day = moment(req.query.date); //date when document will be submitted

  db.Rate.findByDate(day)
    .then(function(data) {
      if(!data)
        console.log("Exchange rates for " + day.format("YYMMDD") + " were not found in our internal DB!");
      else {
        processResponse(data.json, currency, res);
        return;
      }

      nbpService.requestRatesTable(function(err, httpData){
        processExchangeRates(err, httpData, currency, res, day);
      }, day);
    });
};
