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
	if (record == ''){
		return {record : record, score : '', level : -1, is_dev : '0'};
	}
	if (item_id == '2' || item_id == '7')
		return {record : record, score : '/', level : -2, is_dev : '0'};
	var key = item_id + grade + sex;
	var list = global.scoreMap.get(key);
	if (item_id == '14'){
		var sight = record.split(',');
		var left = parseFloat(sight[0]);
		var right = parseFloat(sight[1]);
		if (left < 5){
			if (right < 5)
				return {record : record, score : '0', level : 0, is_dev : '0'};
			else
				return {record : record, score : '60', level : 1, is_dev : '0'};
		} else {
			if (right < 5)
				return {record : record, score : '60', level : 2, is_dev : '0'};
			else
				return {record : record, score : '100', level : 3, is_dev : '0'};
		}
	}
	if (list != undefined){
		if (item_id == '0' || item_id == '9' || item_id == '12' || item_id == '13'){
			for (var i=0;i<list.length;i++){
				if (parseFloat(list[i].record) >= parseFloat(record)){
					return list[i];
				}
			}
			return {record : record, score : '0', level : 0, is_dev : '0'};
		} else {
			for (var i=list.length-1;i>=0;i--){
				if (parseFloat(list[i].record) <= parseFloat(record)){
					return list[i];
				}
			}
			return {record : record, score : '0', level : 0, is_dev : '0'};
		}
	} else {
		return {record : record, score : '0', level : 0, is_dev : '0'};
	}
};

exports.get_bmi_level = function(grade, sex, bmi){
	var grade = parseInt(grade);
	var sex   = parseInt(sex);
	var bmi   = parseFloat(bmi);
	if (!isNaN(grade) && !isNaN(sex) && !isNaN(bmi)){
		switch(grade){
			case 1:
				if (sex == 1){
					if (bmi <= 13.4)
						return {score : 80, level : 0};
					if (bmi >= 20.4)
						return {score : 60, level : 3};
					if (20.3 >= bmi && bmi >=18.2)
						return {score : 80, level : 2};
					if (18.1 >= bmi && bmi >=13.5)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 13.2)
						return {score : 80, level : 0};
					if (bmi >= 19.3)
						return {score : 60, level : 3};
					if (19.2 >= bmi && bmi >=17.4)
						return {score : 80, level : 2};
					if (17.3 >= bmi && bmi >=13.3)
						return {score : 100, level : 1};
				}
				break;
			case 2:
				if (sex == 1){
					if (bmi <= 13.6)
						return {score : 80, level : 0};
					if (bmi >= 20.5)
						return {score : 60, level : 3};
					if (20.4 >= bmi && bmi >=18.5)
						return {score : 80, level : 2};
					if (18.4 >= bmi && bmi >=13.7)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 13.4)
						return {score : 80, level : 0};
					if (bmi >= 20.3)
						return {score : 60, level : 3};
					if (20.2 >= bmi && bmi >=17.9)
						return {score : 80, level : 2};
					if (17.8 >= bmi && bmi >=13.5)
						return {score : 100, level : 1};
				}
				break;
			case 3:
				if (sex == 1){
					if (bmi <= 13.8)
						return {score : 80, level : 0};
					if (bmi >= 22.2)
						return {score : 60, level : 3};
					if (22.1 >= bmi && bmi >=19.5)
						return {score : 80, level : 2};
					if (19.4 >= bmi && bmi >=13.9)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 13.5)
						return {score : 80, level : 0};
					if (bmi >= 21.2)
						return {score : 60, level : 3};
					if (21.1 >= bmi && bmi >=18.7)
						return {score : 80, level : 2};
					if (18.6 >= bmi && bmi >=13.6)
						return {score : 100, level : 1};
				}
				break;
			case 4:
				if (sex == 1){
					if (bmi <= 14.1)
						return {score : 80, level : 0};
					if (bmi >= 22.7)
						return {score : 60, level : 3};
					if (22.6 >= bmi && bmi >=20.2)
						return {score : 80, level : 2};
					if (20.1 >= bmi && bmi >=14.2)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 13.6)
						return {score : 80, level : 0};
					if (bmi >= 22.1)
						return {score : 60, level : 3};
					if (22.0 >= bmi && bmi >=19.5)
						return {score : 80, level : 2};
					if (19.4 >= bmi && bmi >=13.7)
						return {score : 100, level : 1};
				}
				break;
			case 5:
				if (sex == 1){
					if (bmi <= 14.3)
						return {score : 80, level : 0};
					if (bmi >= 24.2)
						return {score : 60, level : 3};
					if (24.1 >= bmi && bmi >=21.5)
						return {score : 80, level : 2};
					if (21.4 >= bmi && bmi >=14.4)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 13.7)
						return {score : 80, level : 0};
					if (bmi >= 23.0)
						return {score : 60, level : 3};
					if (22.9 >= bmi && bmi >=20.6)
						return {score : 80, level : 2};
					if (20.5 >= bmi && bmi >=13.8)
						return {score : 100, level : 1};
				}
				break;
			case 6:
				if (sex == 1){
					if (bmi <= 14.6)
						return {score : 80, level : 0};
					if (bmi >= 24.6)
						return {score : 60, level : 3};
					if (24.5 >= bmi && bmi >=21.9)
						return {score : 80, level : 2};
					if (21.8 >= bmi && bmi >=14.7)
						return {score : 100, level : 1};
				} else {
					if (bmi <= 14.1)
						return {score : 80, level : 0};
					if (bmi >= 23.7)
						return {score : 60, level : 3};
					if (23.6 >= bmi && bmi >=20.9)
						return {score : 80, level : 2};
					if (20.8 >= bmi && bmi >=14.2)
						return {score : 100, level : 1};
				}
				break;
		} 
	} else {
			return {score : 0, level : 0};
	}
};

exports.load_sport_suggestion = function(){
	var values = [];
	pool.getConnection(function(err, connection) {
		connection.query(sql_mapping.load_sport_suggestion, values, function(err, ret){
			for (var i=0;i<ret.length;i++){
				var item_id = ret[i].item_id;
				var national = ret[i].national;
				var area = ret[i].area;
				var content = ret[i].content;
				var key = item_id + national + area;
				global.suggestionMap.set(key, content);
			}
			connection.release();
		});
	})
};

exports.get_area_level = function(score){
	var score = parseInt(score);
	if (isNaN(score)){
		return 1;
	} else {
		if (score < 60)
			return 1;
		else if (score < 70)
			return 2;
		else if (score < 80)
			return 3;
		else if (score < 90)
			return 4;
		else
			return 5;
	}
}
