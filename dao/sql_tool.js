var moment = require('moment');
moment.locale('zh-cn');
var pool = require('./sql_pool').mysql_pool();

exports.query = function(req, res, sql_query, values, next, callback) {
	pool.getConnection(function(err, connection) {
		if (err)
			next(err);
		connection.query(sql_query, values, function(err, ret){
			if (err)
				next(err);
			callback(ret);
			connection.release();
		}); 
	})
};
