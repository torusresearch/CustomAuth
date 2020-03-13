var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var path = require('path');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.get('/',function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/example.html'));
})

app.get('/bundle.js',function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/bundle.js'));
})

app.get('/redirect', (request, response) => {
    response.sendFile(path.join(__dirname, '/dist/redirect.html'))
})

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(3000);