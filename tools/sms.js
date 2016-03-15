var http = require('http');

exports.sms = function(num, phone) {
	var options =
	{
		hostname : '112.74.76.186',
		port : 8030,
		method : 'GET',
		path : '/msm/sdk/http/sendsms.jsp?username=JSM40886&scode=gm7glvnt&veryCode=xgcgjlael00d&content=@1@=' + num + '&mobile=' + phone + '&tempid=JSM40886-0002',
		handers: {
		}
	};
	try {
		var req = http.request(options, function(res){
			chunks = '';
			res.on('data',function(chunk){
				chunks += chunk;
			}).on('end', function() {
				console.log("SMS RESPONSE: " + chunks);
			});

		});	
		req.end('\n');
		return true;
	} catch (err) {
		return false;
	}
}
