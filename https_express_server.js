var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
  return((user ==='cs360')&&(pass === 'test'));
});
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  app.use('/', express.static('./html', {maxAge: 60*60*1000}));
  app.get('/REST/getcity', function (req, res) {
    var urlObj = url.parse(req.url, true, false);
	var myRe = new RegExp("^"+urlObj.query["q"]);
	
	fs.readFile('cities.dat.txt', function (err, data) {
      if(err) throw err;
      cities = data.toString().split("\n");
      var jsonresult = [];

      for(var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRe); 
        if(result != -1)
          jsonresult.push({city:cities[i]});
      }   

      res.writeHead(200);
      res.end(JSON.stringify(jsonresult));
    });
  });
  app.get('/REST/comment', function (req, res) {
	var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
      if(err) throw err;
      db.collection("comments", function(err, comments){
        if(err) throw err;
        comments.find(function(err, items){
          items.toArray(function(err, itemArr){
            res.json(itemArr);
          });
        });
      });
    });
  });
  app.post('/REST/comment', auth, function (req, res) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
      if(err) throw err;
      db.collection('comments').insert(req.body,function(err, records) {
        //console.log("Record added as "+records[0]._id);
      });

      res.writeHead(200);
      res.end("");
    });
  });