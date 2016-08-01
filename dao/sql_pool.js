var mysql = require('mysql');

exports.mysql_pool = function(){
	return mysql.createPool({
				host : "rm-bp1k5zcflc44s05lg.mysql.rds.aliyuncs.com",
				port : 3306,
				user : "shining",
				password : "iatsjtu2011",
				database : "lpty"
		   });
}

