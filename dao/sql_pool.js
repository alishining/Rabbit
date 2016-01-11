var mysql = require('mysql');

exports.mysql_pool = function(){
	return mysql.createPool({
				host : "rds10rt86mm7y97h14hr.mysql.rds.aliyuncs.com",
				port : 3306,
				user : "shining",
				password : "iatsjtu2011",
				database : "lpty"
		   });
}

