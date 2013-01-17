//we're going to need a lib which calls AWS
var AWS = require('aws-lib');
//we're going to read some config from the file system
var fs = require('fs');
//we're going to store the AWS credentials for this session in a variable
var AWSCredentials;
//use express web framework instead of built-in node.js html http://expressjs.com/guide.html
var express = require('express'), resource = require('express-resource');
var app = express();

//give aws credentials to each request
app.use(function (req, res, next) {
    console.log('in set aws creds middleware');
    if (AWSCredentials)
    {
        console.log('using cached aws creds');
        req.AWSCredentials = AWSCredentials
        next();
    }
    else {
        readAWSCredentials(function(creds) { req.AWSCredentials = AWSCredentials = creds; next(); });
    }
});

//set up controllers
var autoscale = app.resource('autoscale', require('./controllers/autoscale'));

//define global error handler for web requests
var errorHandler = function(err, req, res, next) {
  //log to console
  console.log("in error handler");
  //console.error(err.stack);
  //return 500 (and error to user)
  if (req.xhr) {
      res.send(500, { error: err.message });
  }
  else{
      res.send(500, "<h1>An error occured</h1><p>" + err.message + "</p>");
  }
  console.log('finished global error handler');
  return next(err);
};
app.use(errorHandler);


function readAWSCredentials (next) {
//start reading our AWS credentials from disk
console.log('Reading credentials...');
fs.readFile("./credentials/aws-credentials.json", 'utf-8', function(error, fileContents) {
    if (error) {
        console.log('there was an error reading aws-creds');
        console.log(error);
        throw error;
    }
    console.log('Successfully read creds: ' + fileContents);
    next(JSON.parse(fileContents));
  
});
}

//set up routes

//home page gets list of auto-scale groups
app.get('/',function (req, res, next) {

    res.send('hi!');
    
      
    });
    
    app.listen(process.env.PORT);