var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

var address = system.args[1];
var imagePath = system.args[2];
var imageId = system.args[3];
var metaOutput = system.args[4];

page.viewportSize = {width:1280, height:720};
page.clipRect = {top:0, left:0, width:1280, height:720};


page.open(address, function () {
	var metadata = page.evaluate(function () {
        var links = Array.prototype.slice.call(document.querySelectorAll('a'));
        var input = document.querySelectorAll('input');
        var buttons = document.querySelectorAll('button');
        return {
		    'width':document.width,
			'height':document.height,
		    'links': links.map(function (e) {
            return {'x':e.offsetLeft,
                    'y':e.offsetTop,
                    'width':e.offsetWidth,
                    'height':e.offsetHeight,
					'href':e.href};
        })};
    });
	var height = metadata.height;
	var i = 0;
	metadata.images = []
	console.log('page height: ' + height);
	for (var scroll = 0; scroll < height; scroll += 700)
	{
	    var imgPath = imagePath + '/' + imageId + '-' + i + '.jpg';
		console.log('writing image file: ' + imgPath);
        page.scrollPosition = {left:0, top:scroll};
        page.render(imgPath);
		metadata.images.push('/img/' + imageId + '-' + i + '.jpg');
		i++;
	}
    fs.write(metaOutput, JSON.stringify(metadata), 'w');
    // Signal to caller that write is finished by removing lock.
	fs.remove(metaOutput + '.lock');
	phantom.exit();
});
