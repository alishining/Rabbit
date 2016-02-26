var http = require('http');

exports.sms = function(num, phone) {
	var options =
	{
		hostname : '222.185.228.25',
		port : 8000,
		method : 'GET',
		path : '/msm/sdk/http/sendsms.jsp?username=JSMB260900&scode=1mqp6qtf&content=@1@=' + num + '&mobile=' + phone + '&tempid=MB-2016010601',
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
