var AWS = require('aws-lib');
exports.load = function(id, fn) {
 process.nextTick(function(){
    fn(null, "hi");
  });   
}
exports.index = function (req, res, next) {
        //cannot continue if we don't have any credentials
        console.log(req.autoscale);
    if (!req.AWSCredentials) throw new Error("AWS Credentials not ready. Perhaps they are still being read from disk.");
    
   // res.writeHead(200, {'Content-Type': 'text/json'});
    console.log('Getting AS groups...');
    var as = AWS.createASClient(req.AWSCredentials.accessKeyId, req.AWSCredentials.secretAccessKey,{host: "autoscaling.eu-west-1.amazonaws.com"});
    
    //call AWS asynchronously
    var start = +new Date().getTime();
    as.call("DescribeAutoScalingGroups", {}, function(err, result) {
        var end = +new Date().getTime();
        if (err) return next (err);
        if (result.Error) return next(result.Error);
        console.log('Retreived AS groups in ' + (end-start) + 'ms\n');
        
        //map result to the data we want
        var returnGroups = result.DescribeAutoScalingGroupsResult.AutoScalingGroups.member.map(function(group){
            return {
                Name: group.AutoScalingGroupName,
                LoadBalancerName: group.LoadBalancerNames.member,
                MinInstanceCount: group.MinSize,
                MaxInstanceCount: group.MaxSize,
                DesiredInstanceCount: group.DesiredCapacity
            };
        });
        res.send(returnGroups);
    });
};
