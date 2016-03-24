var express = require('express');
var path = require('path');
var qiniu   = require('qiniu');
var fs = require('fs');
var xlsx = require("node-xlsx");
var multipart = require('connect-multiparty');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var tool = require('../tools/sms');
var tools = require('../tools/load_score_level');
var sql_mapping = require('../dao/sql_mapping');
var constant = require('../tools/constant');

var result = {
	header : {
		code : "200",
		msg  : "成功"
	},
	data : {
	}
}   

exports.school_login = function(req, res, next){
	var user_name = req.body.user_name;
	var password  = req.body.password;
	if (user_name == undefined || password == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [user_name];
	sql.query(req, res, sql_mapping.school_login, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			if (ret[0].password == password){
				result.data = {
					result    : '0',
					uid       : user_name,
					school    : ret[0].school,
					school_id : ret[0].school_id,
					is_root   : ret[0].is_root,
					msg		  : '登录成功'};
			} else {
				result.data = {result : '-1', uid : user_name, msg : '登录失败'};
			}
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "登录失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.mod_password = function(req, res, next){
	var account = req.body.account;
	var password = req.body.password;
	var old_password = req.body.old_password;
	if (account == undefined || password == undefined || old_password == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.school_login, values, next, function(err, ret){
		try{
			if (old_password != ret[0].password){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {msg : '原始密码不正确', code : '-1'};
				res.json(result);
				return;
			}
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "帐号不存在";
			result.data        = {};
			res.json(result);
			return;
		}
		values = [password, account];
		sql.query(req, res, sql_mapping.mod_password, values, next, function(err, ret){
			if (err){
				result.header.code = "500";
				result.header.msg  = "修改失败";
				result.data        = {};
				res.json(result);
				return;
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {msg : '修改成功', code : '0'};
			res.json(result);
		});
	});
}

exports.get_user_class = function(req, res, next){
	var account = req.body.account;
	if (account == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.get_user_class, values, next, function(err, ret){
		try {
			var class_list = ret[0].class_list.split(',');
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {user_class : class_list};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.student_sport_report = function(req, res, next){
	var sex		 = '%' + req.body.sex + '%';
	var class_id = req.body.class_id;
	var year	 = req.body.year;
	var term	 = req.body.term;
	var grade	 = class_id[1]; 
	var school_id = req.body.school_id;
	if (sex == undefined || class_id == undefined || year == undefined || term == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [grade];
	sql.query(req, res, sql_mapping.get_grade_sport_item, values, next, function(err, ret){
		var sport_item_list = ret[0].item_list.split(',');
		sport_item_list.push('-1');
		values = [sport_item_list, sex, class_id, year,term, school_id];
		sql.query(req, res, sql_mapping.student_sport_report, values, next, function(err, ret){
			try {
				var report_list = [];
				var id_set = new Set();
				var height = '';
				var weight = '';
				var flag = 0;
				for (var i=0;i<ret.length;i++){
					if (!id_set.has(ret[i].student_id)){
						flag = 0;
						height = ''; 
						weight = '';	
						id_set.add(ret[i].student_id);
						report_list.push({student_id   : ret[i].student_id,
										  student_name : ret[i].student_name,
										  sex          : ret[i].sex,
										  item_list    : [{item   : ret[i].item, 
														   record : ret[i].record, 
														   score  : ret[i].score, 
														   level  : ret[i].level}]});
					} else {
						for (var j=0;j<report_list.length;j++){
							if (report_list[j].student_id == ret[i].student_id){
								report_list[j].item_list.push({ item   : ret[i].item,
																record : ret[i].record,
																score  : ret[i].score,
																level  : ret[i].level});
							}
						}	
					}
				}
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {report_list : report_list};
				res.json(result);
			} catch(err) {
				result.header.code = "500";
				result.header.msg  = "获取失败";
				result.data        = {};
				res.json(result);
			}
		})
	})
};

exports.sport_item_report_rate = function(req, res, next){
	var year =  req.body.year;
	var class_id = req.body.class_id + '%';
	var grade = class_id[1];
	var school_id = req.body.school_id;
	if (year == undefined || class_id == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [grade];
	sql.query(req, res, sql_mapping.get_grade_sport_item, values, next, function(err, ret){
		try {
			var sport_item_list = ret[0].item_list.split(',');
			sport_item_list.push('-1');
			values = [sport_item_list, year, class_id, school_id];
			sql.query(req, res, sql_mapping.sport_item_report_rate, values, next, function(err, ret){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {sport_item_rate : ret};
				res.json(result);
			});
		} catch(err){
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {sport_item_rate : []};
			res.json(result);
		}
	})
};

exports.grade_sport_item_rank = function(req, res, next){
	var year =  req.body.year;
	var item_id =  req.body.item_id;
	var grade = '1' + req.body.grade + '%';
	var school_id = req.body.school_id;
	if (year == undefined || item_id == undefined || grade == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result); 
		return;
	}
	var values = [year, item_id, grade, school_id];
	sql.query(req, res, sql_mapping.grade_sport_item_rank, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {grade_sport_item_rank : ret};
		res.json(result);
	});
};

exports.class_level_chart = function(req, res, next){
	var year = req.body.year;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var school_id = req.body.school_id;
	var values = [year, class_id, item_id, school_id];
	if (year == undefined || class_id == undefined || item_id == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	sql.query(req, res, sql_mapping.class_level_chart, values, next, function(err, ret){
		var boy_great = [];
		var girl_great = [];
		var boy_good = [];
		var girl_good = [];
		var boy_normal = [];
		var girl_normal = [];
		var boy_failed = [];
		var girl_failed = [];
		for (var i=0;i<ret.length;i++){
			switch(ret[i].level){
				case '0' :
					if (ret[i].sex == 1){
						boy_failed.push(ret[i].student_name);
					} else {
						if (ret[i].sex == 2){
							girl_failed.push(ret[i].student_name);
						}
					};
					break;
				case '1' :
					if (ret[i].sex == 1){
						boy_normal.push(ret[i].student_name);
					} else {
						if (ret[i].sex == 2){
							girl_normal.push(ret[i].student_name);
						}
					};
					break;
				case '2' :
					if (ret[i].sex == 1){
						boy_good.push(ret[i].student_name);
					} else {
						if (ret[i].sex == 2){
							girl_good.push(ret[i].student_name);
						}
					};
					break;
				case '3' :
					if (ret[i].sex == 1){
						boy_great.push(ret[i].student_name);
					} else {
						if (ret[i].sex == 2){
							girl_great.push(ret[i].student_name);
						}
					};
					break;
			}	
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {class_level_chart : {boy_great  : boy_great, girl_great : girl_great,
												   boy_good   : boy_good, girl_good : girl_good,
												   boy_normal : boy_normal, girl_normal : girl_normal,
												   boy_failed : boy_failed, girl_failed : girl_failed}};
		res.json(result);	
	});
};

exports.health_record = function(req, res, next){
	var year = req.body.year;
	var term = req.body.term;
	var sex  = '%' + req.body.sex + '%';
	var class_id = req.body.class_id;
	var school_id = req.body.school_id;
	if (year == undefined || term == undefined || sex == undefined || class_id == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [sex, class_id, term, year, school_id];
	sql.query(req, res, sql_mapping.health_record, values, next, function(err, ret){
		try {
			var one_student = [];
			var all_student = [];
			var total_score = 0;
			var id_set = new Set();
			for (var i=0;i<ret.length;i++){
				var grade = ret[i].class_id[1];
				var item_id = ret[i].item_id;
				if ((grade == '1' || grade == '2') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '8' || item_id == '14'))
					continue;
				if ((grade == '3' || grade == '4') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '8' || item_id == '14' || item_id == '5'))
					continue;
				if ((grade == '5' || grade == '6') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '8' || item_id == '14' || item_id == '5' || item_id == '9'))
					continue;
				if (!id_set.has(ret[i].student_id)){
					if (one_student.length != 0){
						one_student[0].total_score = total_score;
						all_student.push(one_student);
					}
					id_set.add(ret[i].student_id);
					total_score = 0;
					one_student = [];
					one_student.push({student_id   : ret[i].student_id,
									  student_name : ret[i].student_name,
									  class_id	   : ret[i].class_id,
									  birth		   : ret[i].birth,
									  sex          : ret[i].sex,
									  nationality  : ret[i].nationality,
									  year		   : ret[i].year,
									  term		   : ret[i].term,
									  form		   : [],
									  enginery	   : [],
									  stamina	   : [],
									  suggestion   : [],
									  total_score  : 0});
				}
				switch(item_id){
					case '-1':
						total_score += 0.15 * parseInt(ret[i].score);
						break;
					case '0':
						total_score += 0.2 * parseInt(ret[i].score);
						break;
					case '4':
						if (grade == '1' || grade == '2'){
							total_score += 0.3* parseInt(ret[i].score);
						} else if (grade == '3' || grade == '4'){
							total_score += 0.2* parseInt(ret[i].score);
						} else if (grade == '5' || grade == '6'){
							total_score += 0.1* parseInt(ret[i].score);
						}
						break;
					case '5':
						if (grade == '3' || grade == '4'){
							total_score += 0.1* parseInt(ret[i].score);
						} else if (grade == '5' || grade == '6'){
							total_score += 0.2* parseInt(ret[i].score);
						}
						break;
					case '6':
						total_score += 0.15 * parseInt(ret[i].score);
						break;
					case '8':
						if (grade == '1' || grade == '2' || grade == '3' || grade == '4'){
							total_score += 0.2* parseInt(ret[i].score);
						} else if (grade == '5' || grade == '6'){
							total_score += 0.1* parseInt(ret[i].score);
						}
						break;
					case '9':
						if (grade == '5' || grade == '6'){
							total_score += 0.1* parseInt(ret[i].score);
						}
						break;
				}
				var content = global.suggestionMap.get(item_id + ret[i].level + tools.get_area_level(ret[i].score));
				if (item_id == '2' || item_id == '7' || item_id == '-1'){
					one_student[0].form.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						one_student[0].suggestion.push({content : ret[i].item + content});
				} else if (item_id == '6' || item_id == '14'){
					one_student[0].enginery.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						one_student[0].suggestion.push({content : ret[i].item + content});
				} else {
					one_student[0].stamina.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						one_student[0].suggestion.push({content : ret[i].item + content});
				}
			}
			if (one_student.length != 0)
				all_student.push(one_student);
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {all_student : all_student};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
		}

	});
};

exports.add_teacher = function(req, res, next){
	var teacher_name = req.body.teacher_name;
	var teacher_phone = req.body.teacher_phone;
	var class_list = req.body.class_list;
	var school_id = req.body.school_id;
	var school = req.body.school;
	if (teacher_name == undefined || teacher_phone == undefined || class_list == undefined || school_id == undefined || school == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var num = Math.floor(Math.random()*10000);
	if (num < 10){
		num = '000' + num;
	} else {
		if (num < 100){
			num = '00' + num;
		} else {
			if (num < 1000){
				num = '0' + num;
			}
		}
	}
	var values = [teacher_phone];
	sql.query(req, res, sql_mapping.check_school_user, values, next, function(err, ret){
		if (ret && ret[0] == undefined){
			if (!tool.sms(num, teacher_phone)){
				result.header.code = "500";
				result.header.msg  = "短信发送失败";
				result.data        = {};
				res.json(result);
				return;
			}
			values = [teacher_phone,num, teacher_name, teacher_phone, school_id, school, class_list, '0', '0', ''];
			sql.query(req, res, sql_mapping.add_school_user, values, next, function(err, ret){
				if (err){
					result.header.code = "500";
					result.header.msg  = "添加失败";
					result.data        = {};
					res.json(result);
					return;
				}
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {result : '0', msg : '添加成功', class_list : class_list, account : teacher_phone, id : ret.insertId, teacher_name : teacher_name};
				res.json(result);
			});
		} else {
			result.header.code = "500";
			result.header.msg  = "帐号重复添加";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.del_teacher = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_school_user, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {result : '0', msg : '删除成功'};
		res.json(result);
	});
};

exports.mod_teacher = function(req, res, next){
	var teacher_name = req.body.teacher_name;
	var teacher_phone = req.body.teacher_phone;
	var class_list = req.body.class_list;
	if (teacher_name == undefined || teacher_phone == undefined || class_list == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [teacher_phone,teacher_phone,teacher_name,class_list,teacher_phone];
	sql.query(req, res, sql_mapping.mod_school_user, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {result : '0', msg : '修改成功'};
		res.json(result);
	});
};

exports.get_teacher = function(req, res, next){
	var school_id = req.body.school_id;
	if (school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id];
	sql.query(req, res, sql_mapping.get_school_user, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {teacher_list : ret};
		res.json(result);
	});
};

exports.add_student = function(req, res, next){
	var student_name = req.body.student_name;
	var sex = req.body.sex;
	var nationality = req.body.nationality;
	var grade = req.body.grade;
	var cls = req.body.cls;
	var student_id = req.body.student_id;
	var birth = req.body.birth;
	var address = req.body.address;
	var school = req.body.school;
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	if (student_name == undefined || sex == undefined || nationality == undefined || grade == undefined || cls == undefined || student_id == undefined || birth == undefined || address == undefined || school == undefined || school_id == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id, '', student_name, sex, nationality, birth, address, school_id, school, class_id, grade, cls, 0, '', student_id];
	sql.query(req, res, sql_mapping.add_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {result : '0', msg : '添加成功'};
		res.json(result);
	});
};

exports.del_student = function(req, res, next){
	var student_id = req.body.student_id;
	if (student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.del_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {result : '0', msg : '删除成功'};
		res.json(result);
	});
};

exports.mod_student = function(req, res, next){
	var student_name = req.body.student_name;
	var sex = req.body.sex;
	var nationality = req.body.nationality;
	var student_id = req.body.student_id;
	var birth = req.body.birth;
	var address = req.body.address;
	if (student_name == undefined || sex == undefined || nationality == undefined || student_id == undefined || birth == undefined || address == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id, student_name, sex, nationality, birth, address, student_id];
	sql.query(req, res, sql_mapping.mod_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {result : '0', msg : '修改成功', student_id : student_id, student_name : student_name,
					   sex : sex, nationality : nationality, birth : birth, address : address};
		res.json(result);
	});
};

exports.get_student = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	if (class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id, class_id];
	sql.query(req, res, sql_mapping.get_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};   
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {student_list : ret};
		res.json(result);
	});
};

exports.get_all_student = function(req, res, next){
	var school_id = req.body.school_id;
	var page = req.body.page;
	if (school_id == undefined || page == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var start = page * 20 - 20;
	var end = start + 20;
	var values = [school_id];
	var student_list = [];
	sql.query(req, res, sql_mapping.get_all_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
			return;	
		}
		for (var i=start;i<end;i++){
			if (ret[i] != undefined){
				student_list.push(ret[i]);
			}	
		}
		var total = ret.length;
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {total : ret.length, student_list : student_list};
		res.json(result);
	});
}

exports.search_student = function(req, res, next){
	var school_id = req.body.school_id;
	var input = '%' + req.body.input + '%';
	var cls = '%' + req.body.cls + '%';
	var grade = '%' + req.body.grade + '%';
	var page = req.body.page;
	if (input == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id, input, input, grade, cls];
	sql.query(req, res, sql_mapping.search_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
			return;
		} else {
			var start = page * 20 - 20;
			var end = start + 20;	
			var student_list = [];
			for (var i=start;i<end;i++){
				if (ret[i] != undefined){
					student_list.push(ret[i]);
				}
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {total : ret.length, student_list : student_list};
			res.json(result);
		}
	});
}

exports.get_daily_training_rate = function(req, res, next){
	var days	 = req.body.days;
	var class_id = req.body.class_id;
	if (class_id == undefined || days == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [class_id, Number(days)];
	sql.query(req, res, sql_mapping.get_daily_training_rate, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {training_rate : ret};
		res.json(result);
	});
};

exports.score_input = function(req, res, next){
	var year = req.body.year;
	var term = req.body.term;
	var account = req.body.account;
	var school = req.body.school;
	var school_id = req.body.school_id;
	var tmp_filename = req.files.file_upload.path;
	if (account == undefined || year == undefined || term == undefined || tmp_filename == undefined || school_id == undefined || school == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var list = xlsx.parse(tmp_filename);
	var del_values = [];
	var add_str = [];
	var score_list = [];
	var item_list = [];
	for (var i=0;i<list.length;i++){
		var student_list = list[i].data;
		for (var j=1;j<student_list.length;j++){
			var record_list = student_list[j];
			if (record_list.length != 0){
				var add_values = [];
				grade = parseInt(record_list[0])%10;
				class_id = record_list[1]+'';
				if (class_id.length != 4)
					continue;
				cls = record_list[2];
				student_id = record_list[3];
				nationality = record_list[4];
				name = record_list[5];
				sex = record_list[6];
				var date = new Date(1000*(parseInt(record_list[7])*86400 - 2209161600)); 
				var yy = date.getFullYear(); 
				var mm = date.getMonth()+1;
				var dd = date.getDate();
				if (mm < 10) mm = '0'+mm;
				if (dd < 10) dd = '0'+dd;
				birth = yy+'-'+mm+'-'+dd;
				address = record_list[8];
				height = record_list[9];
				weight = record_list[10];
				lung = record_list[11];
				run50 = record_list[12];
				sit_reach = record_list[13];
				jump = record_list[14];
				situp = record_list[15];
				run8_50 = record_list[16];
				del_values.push(student_id);
				add_values.push(student_id,0,name,sex,nationality,birth,address,school_id,school,class_id,parseInt(class_id)%1000 / 100,parseInt(class_id)%100,0,'',student_id);
				add_str.push((add_values));
				item_list = [];
				var score = tools.get_score_level('2', grade, sex, height).score;
				var level = tools.get_score_level('2', grade, sex, height).level;
				item_list.push(student_id,sex,school_id,class_id,'2',constant.height,'',height,'cm',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('7', grade, sex, weight).score;
				level = tools.get_score_level('7', grade, sex, weight).level;
				item_list.push(student_id,sex,school_id,class_id,'7',constant.weight,'',weight,'kg',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('6', grade, sex, lung).score;
				level = tools.get_score_level('6', grade, sex, lung).level;
				item_list.push(student_id,sex,school_id,class_id,'6',constant.lung,'',lung,'ml',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('0', grade, sex, run50).score;
				level = tools.get_score_level('0', grade, sex, run50).level;
				item_list.push(student_id,sex,school_id,class_id,'0',constant.run50,'',run50,'s',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('4', grade, sex, sit_reach).score;
				level = tools.get_score_level('4', grade, sex, sit_reach).level;
				item_list.push(student_id,sex,school_id,class_id,'4',constant.sit_reach,'',sit_reach,'个',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('8', grade, sex, jump).score;
				level = tools.get_score_level('8', grade, sex, jump).level;
				item_list.push(student_id,sex,school_id,class_id,'8',constant.jump,'',jump,'个',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('5', grade, sex, situp).score;
				level = tools.get_score_level('5', grade, sex, situp).level;
				item_list.push(student_id,sex,school_id,class_id,'5',constant.situp,'',situp,'个',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				score = tools.get_score_level('9', grade, sex, run8_50).score;
				level = tools.get_score_level('9', grade, sex, run8_50).level;
				item_list.push(student_id,sex,school_id,class_id,'9',constant.run8_50,'',run8_50,'s',score,level,year,term);
				score_list.push((item_list));
				item_list = [];
				height = parseFloat(height) / 100;
				weight = parseFloat(weight);
				var bmi = Math.round(weight/(height*height)*10)*0.1;
				bmi = bmi.toFixed(1);
				if (isNaN(bmi))
					bmi = '';
				score = tools.get_bmi_level(grade, sex, bmi).score;
				level = tools.get_bmi_level(grade, sex, bmi).level;
				item_list.push(student_id,sex,school_id,class_id,'-1',constant.bmi,'',bmi,'',score,level,year,term);
				score_list.push((item_list));
			}
		}
	}
	var values = [del_values];
	sql.query(req, res, sql_mapping.mov_student, values, next, function(err, ret){
		if (err){
			console.log(err);
		}
		values = [add_str];
		sql.query(req, res, sql_mapping.add_student, values, next, function(err, ret){
			values = [school_id];
			sql.query(req, res, sql_mapping.get_class_list, values, next, function(err, ret){
				try{
					var class_list = '';
					for (var i=0;i<ret.length;i++){
						if (ret[i].class_id.length == 4)
							class_list = class_list + ret[i].class_id + ',';
					}
					class_list = class_list.substr(0, class_list.length-1);
					values = [class_list, account];
					sql.query(req, res, sql_mapping.update_class_list, values, next, function(err, ret){
						if (err){
							console.log(err);
						}
					});
				} catch(err) {
					console.log(err);
				}
			});
		});
	});
	values = [year,term,school_id,'%%'];
	sql.query(req, res, sql_mapping.del_report, values, next, function(err, ret){
		if (err){
			console.log(err);
		}
		values = [score_list];
		sql.query(req, res, sql_mapping.add_report, values, next, function(err, ret){
			if(err){
				console.log(err);
			}
		});
	});
	result.header.code = "200";
	result.header.msg  = "成功";
	result.data = {result : '0', msg : '上传完毕'};
	res.json(result);
};

exports.score_output = function(req, res, next){
	var school_id = req.body.school_id;
	var year = req.body.year;
	var term = req.body.term;
	var class_id = '%' + req.body.class_id + '%';
	if (year == undefined || term == undefined || class_id == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var student_id ='';
	var report_list = [];
	var student_info = [];
	student_info.push('年级编号');
	student_info.push('班级编号');
	student_info.push('班级名称');
	student_info.push('学籍号');
	student_info.push('民族代码');
	student_info.push('姓名');
	student_info.push('性别');
	student_info.push('出生日期');
	student_info.push('家庭住址');
	var values = [school_id, class_id, year, term];
	sql.query(req, res, sql_mapping.score_output, values, next, function(err, ret){
		try{
			var sign = ret[0].student_id;
			for (var i=0;i<ret.length;i++){
				if (sign != ret[i].student_id)
					break;
				switch(ret[i].item_id){
					case '0' :	student_info.push(constant.run50);
								break;
					case '1' :	student_info.push(constant.balance);
								break;
					case '2' :	student_info.push(constant.height);
								break;
					case '3' :	student_info.push(constant.updown);
								break;
					case '4' :	student_info.push(constant.sit_reach);
								break;
					case '5' :	student_info.push(constant.situp);
								break;
					case '6' :	student_info.push(constant.lung);
								break;
					case '7' :	student_info.push(constant.weight);
								break;
					case '8' :	student_info.push(constant.jump);
								break;
					case '9' :  student_info.push(constant.run8_50);
								break;
				}
			}
			report_list.push(student_info);
			student_info = [];
			for (var i=0;i<ret.length;i++){
				if (ret[i].student_id != student_id){
					student_id = ret[i].student_id;
					if (student_info.length !=0)
						report_list.push(student_info);
					student_info = [];
					student_info.push(ret[i].grade);
					student_info.push(ret[i].class_id);
					student_info.push(ret[i].class);
					student_info.push(ret[i].student_id);
					student_info.push(ret[i].nationality);
					student_info.push(ret[i].student_name);
					student_info.push(ret[i].sex);
					student_info.push(ret[i].birth);
					student_info.push(ret[i].address);
					student_info.push(ret[i].record);
				} else {
					student_info.push(ret[i].record);
				}		
			}		
			if (student_info.length !=0)
				report_list.push(student_info);
			
			var file = xlsx.build([{name : "worksheets", "data" : report_list}]);
			fs.writeFileSync('student.xlsx', file, 'binary');

			var date  = new Date();
			var key = 'student'+ school_id + '-' + date.getTime() + '.xlsx';
			var extra = new qiniu.io.PutExtra();
			var putPolicy = new qiniu.rs.PutPolicy('lingpaotiyu');
			var uptoken = putPolicy.token();
			qiniu.io.putFile(uptoken, key, path.resolve()+'/student.xlsx', extra, function(err, ret) {
				if (!err) {
					var file_name = 'http://7xq9cu.com1.z0.glb.clouddn.com/' + key;
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data        = {url : file_name};
					res.json(result);
				} else {
					result.header.code = '500';
					result.header.msg  = '下载失败';
					result.data		   = {};
					res.json(result);
				}
			});
		} catch(err){
			console.log(err);
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {result : '-1', msg : '没有数据'};
			res.json(result);
		}
	});
};

exports.reset_school_user_password = function(req, res, next){
	var account = req.body.account;
	if (account == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.reset_school_user_password, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "重置失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "重置成功";
		result.data        = {};
		res.json(result);
	});
}
