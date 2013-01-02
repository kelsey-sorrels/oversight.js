var express = require('express');
var sys = require('sys');
var url = require('url');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/page', function(request, response) {
    // Create a random request id
	sys.exec('uuidgen', function(err, stdout, stderr) {
        var requestId = stdout.replace('\n', '');
	    var address = url.parse(request.url, true).query.href;
        var imagePath = './tmp/images';
        var dataPath = './tmp/data/' + requestId + '.json';
        // Create an empty data file so that we can watch when it changes.
		var dataLock = dataPath + '.lock';
		console.log('creating lock file: ' + dataLock);
        sys.exec('touch ' + dataLock);
		var size = 0;
		fs.watchFile(dataLock, {interval: 200}, function (curr, prev) {
			console.log('Lock file changed. Reading data from: ' + dataPath);
	        // parse metadata into object
	        var data = JSON.parse(fs.readFileSync(dataPath));
            response.send(data);
			fs.unwatchFile(dataLock);
        });
	    // Call bin/phantomjs ...
        var cmdLine = ['phantomjs', './src/phantom.js/save-img-and-json.js', address, imagePath, requestId, dataPath].join(' '); 
        console.log('Calling: ' + cmdLine);
		sys.exec(cmdLine);
    });
});

app.get(/^\/img\/[0-9A-Z\-]+.jpg$/, function(request, response) {
    // Create image path from request URL
    var imgPath = './tmp/images/' + url.parse(request.url).pathname.split('/')[2];
    console.log('Sending image:' + imgPath);
    // Send image back as response.set({'Content-Type': 'image/jpeg'})
    response.status(200).sendfile(imgPath);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
