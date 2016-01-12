var http = require('http');
var ret = require('./result');


exports.sms = function(num, phone, result) {
	var options =
	{
		hostname : '222.185.228.25',
		port : 8000,
		method : 'GET',
		path : '/msm/sdk/http/sendsms.jsp?username=JSMB260900&scode=175395&content=@1@=' + num + '&mobile=' + phone + '&tempid=MB-2016010601',
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
		
		ret.succ.msg = num;
		result.json(ret.succ);
	} catch (err) {
		result.json(ret.fail);
	}
}
