var http = require("http"),
    moment = require("moment"),
    zlib = require("zlib"),
    sugar = require("sugar"),
    nbpDirCache = require("../nbpDirCache")(),
    xml2json = require("xml2json");

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

var makeRequest = function(path, success) {
  options.path = path;
  var chunks = [];

  var callback = function(response) {

    response.on('data', function (chunk) {
      chunks.push(chunk);
    });

    response.on('end', function () {
      var buffer = Buffer.concat(chunks);
      var encoding = response.headers['content-encoding'];
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          success(decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
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

var makeDirRequest = function(successCallback) {
  var cache = nbpDirCache.get(Date.now());

  if(cache !== null){
    successCallback(cache);
    return;
  }

  makeRequest('/kursy/xml/dir.txt', function(data) {
    nbpDirCache.set(Date.now(), data);
    successCallback(data);
  });
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

var fixMoneyValue = function(value) {
  value = value.replace(',', '.');
  return parseFloat(value);
};

exports.getPLNRate = function(req, res){
  var currency = req.query.currency;
  var day = moment(req.query.date); //date when document will be submitted
  var nbpDate = parseInt(day.format("YYMMDD"), 10);

  makeDirRequest(function(data) {
    var tableName = findProperExchangeRateTable(data, nbpDate);
    if(tableName === null || typeof tableName === 'undefined'){
      res.send(400, 'We can\'t find proper exchange rates!');
      res.end();
    }

    var url = '/kursy/xml/' + tableName.trim() + '.xml';
    makeRequest(url, function(ratesXml) {
      var ratesJson = JSON.parse( xml2json.toJson(ratesXml) );

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
    });
  });

};