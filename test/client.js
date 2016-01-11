var http = require('http');


exports.test = function(path) {
	var options =
	{
		hostname : '127.0.0.1',
		port : 3000,
		method : 'POST',
		path : path,
		handers: {
		}
	};

	var data = {}
	data = JSON.stringify(data);

	var req = http.request(options, function(res){
		chunks = '';
		res.on('data',function(chunk){
			chunks += chunk;
		}).on('end', function() {
			console.log("I am response : " + chunks);
		});

	});	
	req.end(data+'\n');
}
