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

exports.load_unit_map = function(){
	var values = [];
	pool.getConnection(function(err, connection) {
		connection.query(sql_mapping.get_sport_item_resource, values, function(err, ret){
			for (var i=0;i<ret.length;i++){
				var item_id = ret[i].item_id;
				var unit = ret[i].unit;
				global.unitMap.set(item_id, unit);
			}
			connection.release();
		});
	})
};

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
	if (item_id == '16'){
		if (record < 60)
			return {level : 0};
		else if (record < 80)
			return {level : 1};
		else if (record < 90)
			return {level : 2};
		else
			return {level : 3};
	}
	if (isNaN(parseFloat(record))){
		return {record : record, score : '', level : -1, is_dev : '0'};
	}
	if (item_id == '2' || item_id == '7')
		return {record : record, score : '/', level : -2, is_dev : '0'};
	var key = item_id + grade + sex;
	var list = global.scoreMap.get(key);
	if (item_id == '14'){
		if (record == ',' || record == '' || record == undefined)
			return {record : record, score : '0', level : -1, is_dev : '0'};
		var sight = record.split(',');
		var left = parseFloat(sight[0]);
		var right = parseFloat(sight[1]);
		if (left < 5){
			if (right < 5)
				return {record : record, score : '0', level : 0, is_dev : '0'};
			else
				return {record : record, score : '60', level : 0, is_dev : '0'};
		} else {
			if (right < 5)
				return {record : record, score : '60', level : 0, is_dev : '0'};
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
};

exports.get_jump_addition = function(score, grade, sex){
	var score = parseInt(score);
	var grade = parseInt(grade);
	var sex = parseInt(sex);
	if (isNaN(score) || isNaN(grade) || isNaN(sex))
		return {score : '', record : ''};
	switch(grade){
		case 1: if (sex == 1)
					record = 109;
				else
					record = 117;	
				break;
		case 2: if (sex == 1)
					record = 117;
				else
					record = 127;
				break;
		case 3: if (sex == 1)
					record = 126;
				else
					record = 139;
				break;
		case 4: if (sex == 1)
					record = 137; 
				else
					record = 149;
				break;
		case 5: if (sex == 1)
					record = 148;
				else
					record = 158;
				break;
		case 6: if (sex == 1)
					record = 157;
				else
					record = 166;
				break;
	}	
	if (score - record >= 40)
		return {score : 20, record : score - record};
	if (score - record >= 38)
		return {score : 19, record : score - record}
	if (score - record >= 36)
		return {score : 18, record : score - record}	
	if (score - record >= 34)
		return {score : 17, record : score - record}
	if (score - record >= 32)
		return {score : 16, record : score - record}
	if (score - record >= 30)
		return {score : 15, record : score - record}
	if (score - record >= 28)
		return {score : 14, record : score - record}
	if (score - record >= 26)
		return {score : 13, record : score - record}
	if (score - record >= 24)
		return {score : 12, record : score - record}
	if (score - record >= 22)
		return {score : 11, record : score - record}
	if (score - record >= 20)
		return {score : 10, record : score - record}
	if (score - record >= 18)
		return {score : 9, record : score - record}
	if (score - record >= 16)
		return {score : 8, record : score - record}
	if (score - record >= 14)
		return {score : 7, record : score - record}
	if (score - record >= 12)
		return {score : 6, record : score - record}
	if (score - record >= 10)
		return {score : 5, record : score - record}
	if (score - record >= 8)
		return {score : 4, record : score - record}
	if (score - record >= 6)
		return {score : 3, record : score - record}
	if (score - record >= 4)
		return {score : 2, record : score - record}
	if (score - record >= 2)
		return {score : 1, record : score - record}
	return {score : 0, record : 0}
};

exports.get_total_score = function(item_id, grade, score){
	var item_id = parseInt(item_id);
	var grade = parseInt(grade);
	var score = parseInt(score);
	if (isNaN(item_id) || isNaN(grade) || isNaN(score))
		return 0
	switch(item_id){
		case -1:
			return 0.15 * parseInt(score)
		case 0:
			return 0.2 * parseInt(score)
		case 4:
			if (grade == 1 || grade == 2){
				return 0.3 * parseInt(score)
			} else if (grade == 3 || grade == 4){
				return 0.2 * parseInt(score)
			} else if (grade == 5 || grade == 6){
				return 0.1 * parseInt(score)
			}
		case 5:
			if (grade == 3 || grade == 4){
				return 0.1 * parseInt(score)
			} else if (grade == 5 || grade == 6){
				return 0.2 * parseInt(score)
			}
		case 6:
			return 0.15 * parseInt(score)
		case 8:
			if (grade == 1 || grade == 2 || grade == 3 || grade == 4){
				return 0.2 * parseInt(score)
			} else if (grade == 5 || grade == 6){
				return 0.1 * parseInt(score)
			}
		case 9:
			if (grade == 5 || grade == 6)
				return 0.1 * parseInt(score)
		case 15 : 
			return score;
	}
	return 0
}
