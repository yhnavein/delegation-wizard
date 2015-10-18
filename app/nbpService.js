'use strict';

var http = require("http"),
    zlib = require("zlib"),
    nbpIndexCache = require("../app/nbpIndexCache")(),
    xml2json = require("xml2json"),
    sugar = require("sugar");

var options = {
  host: 'www.nbp.pl',
  port: 80,
  path: '',
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip,deflate,sdch',
    'Accept-Language': 'en-US,en;q=0.8'
  }
};

var findProperExchangeRateTable = function(data, date) {
  var lines = data.split('\n');
  var dateNo;
  for (var i = lines.length - 1; i >= 0; i--) {
    dateNo = parseInt(lines[i].substr(5), 10);
    if(dateNo < date && lines[i].charAt(0).toLowerCase() === 'a') {
      return lines[i];
    }
  }
  return null;
};

var makeTableRequest = function(path, success) {
  options.path = path;
  var chunks = [];

  var callback = function(response) {

    response.on('data', function (chunk) {
      chunks.push(chunk);
    });

    response.on('end', function () {
      var buffer = Buffer.concat(chunks);
      var encoding = response.headers['content-encoding'];
      if (encoding === 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          success(decoded && decoded.toString());
        });
      } else if (encoding === 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          success(decoded && decoded.toString());
        });
      } else {
        success(buffer.toString());
      }
    });
  };

  http.request(options, callback).end();
};

/*
    This method checks first if is there present cached version of index file
    from NBP site. We don't want to download this file every time as it changes
    max few times a day.
*/
var makeIndexRequest = function(successCallback) {
  var cache = nbpIndexCache.get(Date.now());

  if(cache !== null){
    successCallback(cache);
    return;
  }

  makeTableRequest('/kursy/xml/dir.txt', function(data) {
    nbpIndexCache.set(Date.now(), data);
    successCallback(data);
  });
};


exports.requestRatesTable = function(callback, date) {
  var nbpDate = parseInt(date.format("YYMMDD"), 10);

  makeIndexRequest(function(indexContents) {
    var tableName = findProperExchangeRateTable(indexContents, nbpDate);
    if(tableName === null || typeof tableName === 'undefined'){
      callback('Exchange rate table couldn\'t be found!', null);
    }

    var url = '/kursy/xml/' + tableName.trim() + '.xml';
    makeTableRequest(url, function(ratesXml) {
      var ratesJson = JSON.parse( xml2json.toJson(ratesXml) );

      callback(null, ratesJson);
    });
  });
};
