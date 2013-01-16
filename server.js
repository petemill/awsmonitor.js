//we're going to need a lib which calls AWS
var AWS = require('aws-lib');
//we're going to read some config from the file system
var fs = require('fs');
//we're going to store the AWS credentials for this session in a variable
var AWSCredentials;
//use express web framework instead of built-in node.js html http://expressjs.com/guide.html
var express = require('express');
var app = express();
app.use(app.router);

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

//start reading our AWS credentials from disk
console.log('Setting up (reading credentials)...');
fs.readFile("credentials/aws-credentials.json", 'utf-8', function(error, fileContents) {
    if (error) {
        console.log('there was an error reading aws-creds');
        console.log(error);
        throw error;
    }
    console.log('Successfully read creds: ' + fileContents);
    AWSCredentials = JSON.parse(fileContents);
  
});

//set up routes

//home page gets list of auto-scale groups
app.get('/',function (req, res, next) {
    //cannot continue if we don't have any credentials
    if (!AWSCredentials) return next(new Error("AWS Credentials not ready. Perhaps they are still being read from disk."));
    
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Getfting AS groups...');
    var as = AWS.createASClient(AWSCredentials.accessKeyId, AWSCredentials.secretAccessKey,{host: "autoscaling.eu-west-1.amazonaws.com"});
    
    //call AWS asynchronously
    as.call("DescribeAutoScalingGroups", {}, function(err, result) {
        if (err) return next (err);
        if (result.Error) return next(result.Error);
        res.write('/n')
        res.write('DescribeAutoScalingGroups response:' + result)
        res.write(JSON.stringify(result));
        res.end('Hello World fsrom Cloud9\n');
    });
    
      
      
    });
    app.listen(process.env.PORT);