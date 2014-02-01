var http = require("http"),
    moment = require("moment"),
    zlib = require("zlib");
var querystring = require("querystring");

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

exports.getPLNCourse = function(req, res){
  var currency = req.query.currency;
  var day = moment(req.query.date); //date when document will be submitted
  var nbpDate = parseInt(day.format("YYMMDD"), 10);
  console.log('Data: ' + nbpDate);

  makeRequest('/kursy/xml/dir.txt', function(data) {
    console.log('Received response from NBP!');
    var tableName = findProperExchangeRateTable(data, nbpDate);
    if(tableName === null){
      res.send('We can\'t find proper exchange rates!');
      res.end();
    }

    var url = '/kursy/xml/' + tableName.trim() + '.xml';
    console.log(url);
    makeRequest(url, function(ratesXml) {
      console.log('Received exchange rates from NBP!');
      console.log(ratesXml);

      res.send(url);
      res.end();
    });
  });

};