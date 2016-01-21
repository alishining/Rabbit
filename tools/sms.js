var http = require('http');

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
	var ret = {
		header : {
			code : '',
			msg  : ''
		},
		data   : {
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
		ret.header.code = '200'
		ret.header.msg  = '成功';
		ret.data = { result : '0',
					 msg    : '发送成功',
					 num    : num}	
		result.json(ret);
	} catch (err) {
		ret.header.code = '404';
		ret.header.msg  = "获取验证码失败";
		ret.data		   = {};
		result.json(ret);
	}
}
