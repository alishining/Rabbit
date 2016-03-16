var http = require('http');

exports.sms = function(num, phone) {
	var options =
	{
		hostname : '112.74.76.186',
		port : 8030,
		method : 'GET',
		path : '/service/httpService/httpInterface.do?method=sendMsg&username=JSM40419&password=1mqp6qtf&veryCode=qy94z5c1glxh&mobile=' + phone + '&content=@1@=' +  num + '&msgtype=2&tempid=JSM40419-0009',
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
