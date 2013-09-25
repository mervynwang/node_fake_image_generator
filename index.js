/**
 * fake image 
 *
 *
 * @author Mervyn
 * 
 **/
var gm = require('gm'), http = require('http'), fs = require('fs');

var debug 		= true,		//DEBUG MESG
	HttpPort 	= 888,		//HTTP port
    tmpDir		= './cache/';  

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

// handling client request.
server.createServer(function (request, response) {

	// Get USER Inforation
	var params = request.url.split('/');
	params.shift();//remove first /(root)
	
	if(debug) {
		console.dir(params);
	}

	if( funName == 'favicon.ico') {
		r200(response);
	} else {
	
	
	}

}).listen(HttpPort);