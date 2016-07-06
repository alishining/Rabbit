var mysql = require('mysql');

exports.mysql_pool = function(){
	return mysql.createPool({
				host : "rm-bp1c37x8r30w7yzcy.mysql.rds.aliyuncs.com",
				port : 3306,
				user : "shining",
				password : "iatsjtu2011",
				database : "lpty"
		   });
}

