var http = require('http');
var sql_mapping = require('../dao/sql_mapping');
var pool = require('../dao/sql_pool').mysql_pool();
var result = {
	header : {
				 code : "200",
				 msg  : "成功"
			 },
	data : {
		   }
}

exports.load_score_level = function(req, res, next) {
	var values = [];
	pool.getConnection(function(err, connection) {
		connection.query(sql_mapping.load_score_level, values, function(err, ret){
			var flag = '';
			for (var i=0;i<ret.length;i++){
				var item_id = ret[i].item_id;
				var grade = ret[i].grade;
				var sex = ret[i].sex;
				var record = ret[i].record;
				var score = ret[i].score;
				var level = ret[i].level;
				var is_dev = ret[i].is_dev;
				var key = item_id + grade + sex;
				if (flag != key){
					global.scoreMap.set(key, []);
					flag = key;
				}
				global.scoreMap.get(key).push({record, score, level, is_dev});
			}
			connection.release();
			if (res != undefined){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {};
				res.json(result);
			}
		});
	})
};

exports.get_score_level = function(item_id, grade, sex, record){
	var key = item_id + grade + sex;
	var list = global.scoreMap.get(key);
	if (item_id == '0'){
		for (var i=0;i<list.length;i++){
			if (list[i].record < record){
				console.log(list[i]);
				return list[i];
			}
		}
	} else {
		for (var i=list.length-1;i>=0;i++){
			if (list[i].record < record){
				console.log(list[i]);
				return list[i];
			}
		}
	}
}
