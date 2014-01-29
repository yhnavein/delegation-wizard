var http = require("http"),
    moment = require("moment"),
    zlib = require("zlib");

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
  var buffer = [];

  var callback = function(response) {
    var gunzip = zlib.createGunzip();
    response.pipe(gunzip);

    gunzip.on('data', function (chunk) {
      buffer.push(chunk.toString());
    });

    gunzip.on('error',function(e){
      console.log("Error: " + e.message);
      console.log( e.stack );
    });

    gunzip.on('end', function () {
      success(buffer.join(""));
    });
  };

  http.request(options, callback).end();
};

exports.getPLNCourse = function(req, res){
  var currency = req.query.currency;
  var day = moment(req.query.date); //date when document will be submitted
  var nbpDate = day.format("YYMMDD");
  console.log('Data: ' + nbpDate);

  makeRequest('/kursy/xml/dir.txt', function(data) {
    console.log('Received response from NBP!');
    console.log(data);
    res.send("respond with a resource");
    res.end();
    //res.send({builds: data.build, buildsCount: data.count });
  });

};