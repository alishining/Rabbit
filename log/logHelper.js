var helper = {};
exports.helper = helper;

var log4js = require('log4js');
var fs = require("fs");
var path = require("path");


var objConfig = JSON.parse(fs.readFileSync("log4js.json", "utf8"));

if(objConfig.appenders){
	var baseDir = objConfig["customBaseDir"];
	var defaultAtt = objConfig["customDefaultAtt"];

	for(var i= 0, j=objConfig.appenders.length; i<j; i++){
		var item = objConfig.appenders[i];
		if(item["type"] == "console")
			continue;

		if(defaultAtt != null){
			for(var att in defaultAtt){
				if(item[att] == null)
					item[att] = defaultAtt[att];
			}
		}
		if(baseDir != null){
			if(item["filename"] == null)
				item["filename"] = baseDir;
			else
				item["filename"] = baseDir + item["filename"];
		}
		var fileName = item["filename"];
		if(fileName == null)
			continue;
		var pattern = item["pattern"];
		if(pattern != null){
			fileName += pattern;
		}
		var category = item["category"];
		if(!isAbsoluteDir(fileName))
			throw new Error("配置节" + category + "的路径不是绝对路径:" + fileName);
		var dir = path.dirname(fileName);
		checkAndCreateDir(dir);
	}
}


log4js.configure(objConfig);

var logDebug = log4js.getLogger('logDebug');
var logInfo = log4js.getLogger('logInfo');
var logWarn = log4js.getLogger('logWarn');
var logErr = log4js.getLogger('logErr');

helper.debug = function(msg){
	if(msg == null)
		msg = "";
	logDebug.debug(msg);
};

helper.info = function(msg){
	if(msg == null)
		msg = "";
	logInfo.info(msg);
};

helper.warn = function(msg){
	if(msg == null)
		msg = "";
	logWarn.warn(msg);
};

helper.error = function(msg, exp){
	if(msg == null)
		msg = "";
	if(exp != null)
		msg += "\r\n" + exp;
	logErr.error(msg);
};


exports.use = function(app) {
	app.use(log4js.connectLogger(logInfo, {level:'debug', format:':method :url'}));
}


function checkAndCreateDir(dir){
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
}


function isAbsoluteDir(path){
	if(path == null)
		return false;
	var len = path.length;

	var isWindows = process.platform === 'win32';
	if(isWindows){
		if(len <= 1)
			return false;
		return path[1] == ":";
	}else{
		if(len <= 0)
			return false;
		return path[0] == "/";
	}
}
