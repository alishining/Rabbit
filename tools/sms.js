var http = require('http');

exports.sms = function(num, phone, type) {
	var model = '';
	if (type == 1){
		model = 'JSM40886-0002'
	} else if (type == 2){
		model = 'JSM40886-0003'
	}
	var options =
	{
		hostname : '112.74.76.186',
		port : 8030,
		method : 'GET',
		path : '/service/httpService/httpInterface.do?method=sendMsg&username=JSM40886&password=gm7glvnt&veryCode=xgcgjlael00d&mobile=' + phone + '&content=@1@=' +  num + '&msgtype=2&tempid=' + model,
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
