
var qiniu = require('qiniu');

function uploadFile(localFile, key, uptoken) {
	var extra = new qiniu.io.PutExtra();
	extra.params = params;
	extra.mimeType = mimeType;
	extra.crc32 = crc32;
	extra.checkCrc = checkCrc;

	qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
		if(!err) {
			//上传成功， 处理返回值
			console.log(ret.key, ret.hash);
			ret.key & ret.hash
		} else {
			//上传失败， 处理返回代码
			console.log(err);
			http:developer.qiniu.com/docs/v6/api/reference/codes.html
		}
	});
}
