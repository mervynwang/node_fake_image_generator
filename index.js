/**
 * fake image 
 *
 *
 * @author Mervyn
 * 
 **/
var gm = require('gm'), 
server = require('http'),
fs = require('fs'), 
url = require('url'), 
path = require('path'),
qs = require('querystring'),
im = gm.subClass({ imageMagick: true });
;

var debug 		= false,		//DEBUG MESG
	newImage	= false,		// alway create new image
    extName     = '|jpg|jpeg|png|gif|ico|',
	HttpPort 	= 8000,		//HTTP port
    tmpDir		= './cache/';  

var reg = ['_(size)(\\d+x\\d+)', '_(bg)([0-9a-f]{3,6})', '_tp'];

/**
 * 回應 http 200  & img
 *
 **/
function r200(rep){
	fn64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // put base64_encode(image) Here;
	if(debug){
		rep.writeHead(200, { 'Content-Type': 'text/html', 'Pragma' : 'no-cache', 'Cache-Control': 'no-cache, must-revalidate'});
		rep.end('');	
	} else {
		rep.writeHead(200, { 'Content-Type': 'image/gif', 'Pragma' : 'no-cache', 'Cache-Control': 'no-cache, must-revalidate'});
		rep.end(new Buffer(fn64, 'base64').toString('binary'));
	}
}

function sendImage(fn, rep, type){
    var fileStream = fs.createReadStream(fn);
    rep.writeHead(200, { 'Content-Type': 'image/'+type});
    fileStream.pipe(rep);		
}

function loadImage(ip, rep){
	var imagePN = tmpDir + ip.width + 'x' + ip.height + ip.bg + '.' + ip.type;
	fs.exists(imagePN, function(exists){

		if(debug){
			console.log( imagePN + "exists :: " + exists);
		}

		if(!exists || newImage) {

			var center = top = 0
			, font = ip.width + 'x' + ip.height
			, min = (ip.width < ip.height)? ip.width: ip.height 
			, isWide  = (ip.width > ip.height)? true : false
			, fontsize = isWide? Math.ceil(min/3) : Math.ceil(min/4)  ;

			if(debug){
				console.log("isWide : %s", isWide);
				console.log("fontsize: %s" ,fontsize);
				console.log("center %s" ,center);
				console.log("top %s" ,top);
				console.log('create new image');
			}

			im(parseInt(ip.width), parseInt(ip.height), ip.bg)
			.pointSize(fontsize)
			.gravity('Center')
			.drawText(center, top, font)
			.write(imagePN, function(err){
				if(err && debug){
					console.log(err);
				}
				sendImage(imagePN, rep, ip.type);	
			});

		} else {

			sendImage(imagePN, rep, ip.type);

		}
	});
}

function processParam(i, n, ip){
	switch(i){
		case 'size':
			var size = n.split('x');
			if(debug) {
                console.log(size);
            }
			if(!isNaN(size[0])) ip.width = parseInt(size[0]);
			if(!isNaN(size[1])) ip.height = parseInt(size[1]);
			break;

		case 'bg':
			n = n.toUpperCase();
			if(n.search(/^[0-9A-F]{3}$|^[0-9A-F]{6}$/) == 0) {
				ip.bg = '#'+n;
			}
			break;

		case 'tp':	
			ip.transparent = true;
			break;
	}
}

// handling client request.
server.createServer(function (request, response) {

	var params = {"uri":'', "file":'', "query":''},
	imageParams = {"width":100, "height":100, "bg": '#F0F0F0', "transparent": false, "type" : "png"};
	params.uri = url.parse(request.url);
	params.file = path.basename(params.uri.pathname);
    params.ext = path.extname(params.uri.pathname).replace(/./, '');
	params.query = qs.parse(params.uri.query);
    
    if( extName.indexOf(params.ext) == -1 ) {
        response.writeHead(404);
        return true;
    }
    imageParams.type = params.ext;
    
	if( params.file == 'favicon.ico') {
		r200(response);
		return true;
	}

	for(var i in params.query){
		processParam(i, params.query[i], imageParams);
	}

	if(debug) {
		console.log("\n\n");
		console.log("====== params ========");
		console.dir(params);
		console.log("====== file ========");
		console.dir(imageParams);
		console.log("====== run ========");
	}

	loadImage(imageParams, response);	

}).listen(HttpPort);