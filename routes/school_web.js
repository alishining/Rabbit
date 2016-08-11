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
var time_tools = require('../tools/tools');
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
	var nick = user_name;
	var values = [user_name];
	sql.query(req, res, sql_mapping.school_login, values, next, function(err, ret){
		try {
			var school_id = ret[0].school_id;
			if (school_id == undefined){
				result.header.code = "500";
				result.header.msg  = "学校获取失败";
				result.data        = {};
				res.json(result);
				return;
			}
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "学校获取失败";
			result.data        = {};
			res.json(result);
			return;
		}
		values = [school_id];
		sql.query(req, res, sql_mapping.school_area, values, next, function(err, _ret){
			try {
				result.header.code = "200";
				result.header.msg  = "成功";
				if (ret[0].teacher_name != undefined && ret[0].teacher_name != '')
					nick = ret[0].teacher_name;
				if (ret[0].password == password){
					result.data = {
						result    : '0',
						uid       : user_name,
						nick	  : nick,
						school    : ret[0].school,
						school_id : ret[0].school_id,
						is_root   : ret[0].is_root,
						province  : _ret[0].province,
						city	  : _ret[0].city,
						district  : _ret[0].district,
						msg		  : '登录成功'};
				} else {
					result.data = {result : '-1', uid : user_name, nick : nick, msg : '密码错误'};
				}
				res.json(result);
			} catch(err) {
				console.log(err);
				result.header.code = "500";
				result.header.msg  = "用户名不存在";
				result.data        = {};
				res.json(result);
			}
		})
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
	});
};

exports.get_default_class = function(req, res,next){
	var account = req.body.account;
	var is_root = req.body.is_root;
	var year = req.body.year;
	var term = '%' + req.body.term + '%';
	var school_id = req.body.school_id;
	if (account == undefined || is_root == undefined || year == undefined || term == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	if (parseInt(is_root) == 0){
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
	} else {
		var values = [year, term, school_id];
		sql.query(req, res, sql_mapping.get_default_class, values, next, function(err, ret){
			try {
				var class_list = [];
				for (var i=0;i<ret.length;i++)
					class_list.push(ret[i].class_id);
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
		});
	}
}

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
		sport_item_list.push('14');
		sport_item_list.push('15');
		sport_item_list.push('16');
		sport_item_list.push('17');
		sport_item_list.push('18');
		sport_item_list.push('19');
		sport_item_list.push('20');
		var total = 0;
		var height = 1;
		var weight = 1;
		var tmp_bmi = 0;
		values = [sport_item_list, sex, class_id, year,term, school_id];
		sql.query(req, res, sql_mapping.student_sport_report, values, next, function(err, ret){
			try {
				var report_list = [];
				var id_set = new Set();
				for (var i=0;i<ret.length;i++){
					var sort = 0;
					switch(ret[i].item_id){
						case 2  : sort = 1; 
									break;
						case 7  : sort = 2;
									break;
						case -1 : sort = 3;
									break;
						case 14 : sort = 4;
									break;
						case 6  : sort = 5;
									break;
						case 0  : sort = 6;
									break;
						case 4  : sort = 7;
									break;
						case 8  : sort = 8;
									break;
						case 5  : sort = 9;
									break;
						case 9  : sort = 10;
									break;
						case 10 : sort = 11;
									break;
						case 11 : sort = 12;
									break;
						case 12 : sort = 13;
									break;
						case 13 : sort = 14;
									break;
						case 15 : sort = 15;
									break;
						case 17 : sort = 16;
									break;
						case 18 : sort = 17;
									break;
						case 19 : sort = 18;
									break;
						case 20 : sort = 19;
									break;
						case 16 : sort = 20;
									break;
					}
					if (!id_set.has(ret[i].student_id)){
						if (ret[i].item_id == -1)
							tmp_bmi = ret[i].record;
						total = 0;
						id_set.add(ret[i].student_id);
						total += tools.get_total_score(ret[i].item_id, grade, ret[i].score);
						report_list.push({student_id   : ret[i].student_id,
										  student_name : ret[i].student_name,
										  student_number : ret[i].student_number,
										  sex          : ret[i].sex,
										  item_list    : [{sort   : sort, 
														   item   : ret[i].item, 
														   item_id : ret[i].item_id,
														   record : ret[i].record, 
														   score  : ret[i].score, 
														   level  : ret[i].level}]});
					} else {
						if (ret[i].item_id == -1)
							tmp_bmi = ret[i].record;
						total += tools.get_total_score(ret[i].item_id, grade, ret[i].score);
						var score = ret[i].score;
						var record = ret[i].record;
						if (ret[i].item_id == 16){
							score = total.toFixed(1);
							record = score;
							values = [score,score,year,term,class_id,school_id,ret[i].student_id];
							if (score != ret[i].score){
								sql.query(req, res, sql_mapping.update_total_score, values, next, function(err, ret){
									//
								})
							}
						}
						if (ret[i].item_id == 2){
							height = parseFloat(record)/100;

						}
						if (ret[i].item_id == 7){
							weight = parseFloat(record);
							var bmi = Math.round(weight/(height*height)*10)*0.1; 
							bmi = bmi.toFixed(1);
							var score = tools.get_bmi_level(grade, ret[i].sex, bmi).score;
							var level = tools.get_bmi_level(grade, ret[i].sex, bmi).level;
							if (isNaN(bmi)){
								bmi = '';
								score = '';
								level = '';
							}
							values = [bmi,score,level,year,term,class_id,school_id,ret[i].student_id];
							if (bmi != tmp_bmi){
								sql.query(req, res, sql_mapping.update_bmi, values, next, function(err, ret){
									//
								})
							}
						}
						for (var j=0;j<report_list.length;j++){
							if (report_list[j].student_id == ret[i].student_id){
								report_list[j].item_list.push({ sort   : sort,
																item   : ret[i].item,
																item_id : ret[i].item_id,
																record : record,
																score  : score,
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
				console.log(err);
				result.header.code = "500";
				result.header.msg  = "获取失败";
				result.data        = {};
				res.json(result);
			}
		})
	})
};

exports.sport_item_report_rate = function(req, res, next){
	var year = req.body.year;
	var term = req.body.term;
	var class_id = '%' + req.body.class_id + '%';
	if (req.body.class_id != ''){
		var grade = class_id[2];
	} else {
		var grade = '6';
	}
	var school_id = req.body.school_id;
	if (year == undefined || class_id == undefined || school_id == undefined || term == undefined){
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
			sport_item_list.push(-1);
			sport_item_list.push(14);
			sport_item_list.push(16);
			values = [sport_item_list, year, class_id, school_id, term];
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
	var term = req.body.term;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var school_id = req.body.school_id;
	var values = [year, term, class_id, item_id, school_id];
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
			var sex = parseInt(ret[i].sex);
			switch(ret[i].level){
				case '0' :
					if (sex == 1){
						boy_failed.push(ret[i].student_name);
					} else {
						if (sex == 2){
							girl_failed.push(ret[i].student_name);
						}
					};
					break;
				case '1' :
					if (sex == 1){
						boy_normal.push(ret[i].student_name);
					} else {
						if (sex == 2){
							girl_normal.push(ret[i].student_name);
						}
					};
					break;
				case '2' :
					if (sex == 1){
						boy_good.push(ret[i].student_name);
					} else {
						if (sex == 2){
							girl_good.push(ret[i].student_name);
						}
					};
					break;
				case '3' :
					if (sex == 1){
						boy_great.push(ret[i].student_name);
					} else {
						if (sex == 2){
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
			var sight_flag = 0;
			var jump_add_flag = 0;
			var r800_add_flag = 0;
			var r1000_add_flag = 0;
			var ytxs_add_flag = 0;
			var ywqz_add_flag = 0;
			for (var i=0;i<ret.length;i++){
				var grade = ret[i].class_id[1];
				var item_id = ret[i].item_id;
				if ((grade == 1 || grade == 2) && !(item_id == -1 || item_id == 2 || item_id == 7 || item_id == 6 || item_id == 0 || item_id == 4 || item_id == 8 || item_id == 14 || item_id == 15))
					continue;
				if ((grade == '3' || grade == '4') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '8' || item_id == '14' || item_id == '5' || item_id == '15'))
					continue;
				if ((grade == '5' || grade == '6') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '8' || item_id == '14' || item_id == '5' || item_id == '9' || item_id == '15'))
					continue;
				if ((grade == '7' || grade == '8' || grade == '9') && !(item_id == '-1' || item_id == '2' || item_id == '7' || item_id == '6' || item_id == '0' || item_id == '4' || item_id == '10' || item_id == '11' || item_id == '12' || item_id == '13' || item_id == '14' || item_id == '5' || item_id == '15' || item_id == '17' || item_id == '18' || item_id == '19' || item_id == '20'))
					continue;
				if (!id_set.has(ret[i].student_id)){
					if (one_student.length != 0){
						one_student[0].total_score = total_score;
						one_student[0].total_level = tools.get_score_level('16', grade, 0, total_score).level;
						one_student[0].total_area  = tools.get_area_level(total_score);
						if (sight_flag == 0){
							one_student[0].enginery.push({item : constant.sight, record : ',', score : '', level : '', unit : '', area : ''});
						}
						if (jump_add_flag == 0){
							one_student[0].addition.push({item : constant.jump_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
						}
						if (r800_add_flag == 0){
							one_student[0].addition.push({item : constant.r800_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
						}
						if (r1000_add_flag == 0){
							one_student[0].addition.push({item : constant.r1000_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
						}
						if (ytxs_add_flag == 0){
							one_student[0].addition.push({item : constant.ytxs_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
						}
						if (ywqz_add_flag == 0){
							one_student[0].addition.push({item : constant.ywqz_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
						}
						all_student.push(one_student);
					}
					sight_flag = 0;
					jump_add_flag = 0;
					r800_add_flag = 0;
					r1000_add_flag = 0;
					ytxs_add_flag = 0;
					ywqz_add_flag = 0;
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
									  addition     : [],
									  suggestion   : [],
									  total_score  : 0,
									  total_level  : 0,
									  total_area   : 0});
				}
				total_score += tools.get_total_score(item_id, grade, ret[i].score);
				if (ret[i].level[0] == '-')
					tmp_level = '0';
				else
					tmp_level = ret[i].level;
				var content = global.suggestionMap.get(item_id + tmp_level + tools.get_area_level(ret[i].score));
				if (item_id == '2' || item_id == '7' || item_id == '-1'){
					one_student[0].form.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						one_student[0].suggestion.push({content : content});
				} else if (item_id == '6' || item_id == '14'){
					if (item_id == '14')
						sight_flag = 1;
					one_student[0].enginery.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						one_student[0].suggestion.push({content : content});
				} else if (item_id == '15'){
					jump_add_flag = 1;
					one_student[0].addition.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : '/', unit : ret[i].unit, area : '/'});
				} else if (item_id == '17'){
					r800_add_flag = 1;
					one_student[0].addition.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : '/', unit : ret[i].unit, area : '/'});
				} else if (item_id == '18'){
					r1000_add_flag = 1;
					one_student[0].addition.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : '/', unit : ret[i].unit, area : '/'});
				} else if (item_id == '19'){
					ytxs_add_flag = 1;
					one_student[0].addition.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : '/', unit : ret[i].unit, area : '/'});
				} else if (item_id == '20'){
					ywqz_add_flag = 1;
					one_student[0].addition.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : '/', unit : ret[i].unit, area : '/'});
				} else {
					one_student[0].stamina.push({item : ret[i].item, record : ret[i].record, score : ret[i].score, level : ret[i].level, unit : ret[i].unit, area : tools.get_area_level(ret[i].score)});
					if (content != undefined)
						if (!((grade == 5 || grade == 6) && (item_id == '8'))){
							one_student[0].suggestion.push({content : content});
						}
				}
			}
			if (one_student.length != 0){
				one_student[0].total_score = total_score;
				one_student[0].total_level = tools.get_score_level('16', grade, 0, total_score).level;
				one_student[0].total_area  = tools.get_area_level(total_score);
				if (sight_flag == 0)
					one_student[0].enginery.push({item : constant.sight, record : ',', score : '', level : '', unit : '', area : ''});
				if (jump_add_flag == 0)
					one_student[0].addition.push({item : constant.jump_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
				if (r800_add_flag == 0){
					one_student[0].addition.push({item : constant.r800_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
				}
				if (r1000_add_flag == 0){
					one_student[0].addition.push({item : constant.r1000_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
				}
				if (ytxs_add_flag == 0){
					one_student[0].addition.push({item : constant.ytxs_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
				}
				if (ywqz_add_flag == 0){
					one_student[0].addition.push({item : constant.ywqz_add, record : 0, score : 0, level : '/', unit : '', area : '/'});
				}
				all_student.push(one_student);
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {all_student : all_student};
			res.json(result);
		} catch(err) {
			console.log(err);
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
			if (!tool.sms(num, teacher_phone, 2)){
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
	var values = [student_id, '', student_name, sex, nationality, birth, address, school_id, school, class_id, grade, cls, 0, '', '0', ''];
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
	var num = req.body.num;
	var type = '%' + req.body.type + '%';
	num = parseInt(num);
	if (school_id == undefined || page == undefined || num == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var start = page * num - num;
	var end = start + num;
	var values = [school_id, type];
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
	var num = req.body.num;
	var type = '%' + req.body.type + '%';
	num = parseInt(num);
	if (input == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id, input, input, grade, cls, type];
	sql.query(req, res, sql_mapping.search_student, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
			return;
		} else {
			var start = page * num - num;
			var end = start + num;	
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
	var class_id = '%' + req.body.class_id + '%';
	var school_id = req.body.school_id;
	if (class_id == undefined || days == undefined || school_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [class_id, school_id, class_id, school_id, Number(days)];
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
	var file_name = req.body.file_name;
	var tmp_filename = req.files.file_upload.path;
	if (account == undefined || year == undefined || term == undefined || file_name == undefined || tmp_filename == undefined || school_id == undefined || school == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	try{
		var file_content = xlsx.parse(tmp_filename);
	}catch(err){
		result.header.code = "500";
		result.header.msg  = "上传文件格式不正确";
		result.data        = {};
		res.json(result);
		return;
	}
	var del_values = [];
	var add_str = [];
	var score_list = [];
	var item_list = [];
	var num_map = new Map();
	var student_map = new Map();
	var sid_list = [];
	
	for (var i=0;i<file_content.length;i++){
		var student_list = file_content[i].data;
		for (var j=1;j<student_list.length;j++){
			var line = student_list[j];
			var student_id = '';
			var student_info = {grade : '', class_number : '', class_name : '', student_id : '', nationality : '', name : '', sex : '', birth : '', id_card_num : '', stundent_from : '', address : '', height : '', weight : '', lung : '', run50 : '', sit_reach : '', jump : ''};
			for (var u=0;u<line.length;u++){
				var field = line[u];
				try{
					if (field[0] == 'L' || field[0] == 'D' || field[0] == 'T')
						student_id = field;
				}catch(err){
					//
				}
				switch(student_list[0][u]){
					case '年级编号' : 
						student_info.grade = line[u];
						break;
					case '班级编号' : 
						student_info.class_number = line[u];
						break;
					case '班级名称' : 
						student_info.class_name = line[u];
						break;
					case '学籍号'   : 
						student_info.student_id = line[u];
						break;
					case '民族代码' :
					    student_info.nationality = line[u];
				   	    break;
					case '姓名'		: 
						student_info.name = line[u];
						break;
					case '性别'		: 
						student_info.sex = line[u];
						break;
					case '出生日期'	: 
						student_info.birth = line[u];
						break;
					case '身份证号'	: 
						student_info.id_card = line[u];
						break;
					case '学生来源'	: 
						student_info.stundent_from = line[u];
						break;
					case '家庭住址'	: 
						student_info.address = line[u];
						break;
					case '身高'		: 
						student_info.height = line[u];
						break;
					case '体重'		: 
						student_info.weight = line[u];
						break;
					case '肺活量'	: 
						student_info.lung = line[u];
						break;
					case '50米跑'	: 
						student_info.run50 = line[u];
						break;
					case '坐位体前屈' : 
						student_info.sit_reach = line[u];
						break;
					case '一分钟跳绳' : 
						student_info.jump = line[u];
						break;
					case '50*8往返跑':
						student_info.run8_50 = line[u];
						break;
					case '一分钟仰卧起坐':
						student_info.situp = line[u];
						break;
				}
			}
			if (student_id != ''){
				sid_list.push(student_id);
				student_map.set(student_id, student_info);
			}
		}
	}
	for(var i=0;i<sid_list.length;i++){
		var student_info = student_map.get(sid_list[i]);
		var total = 0;
		var add_values = [];
		if (num_map.get(student_info.class_number) == undefined){
			num_map.set(student_info.class_number,1);
		} else {
			num_map.set(student_info.class_number,num_map.get(student_info.class_number)+1);
		}
		var student_number = num_map.get(student_info.class_number);
		var grade = parseInt(student_info.grade)%10;
		if (isNaN(grade))
			continue;
		var class_number = student_info.class_number;
		try{
			var cls = student_info.class_name.match(/([0-9]+)班/);
			var class_id = student_info.grade + cls[1];
		}catch(err){
			var class_id = class_number; 
		}
		class_name = student_info.class_name;
		var student_id = student_info.student_id;
		var nationality = student_info.nationality;
		var name = student_info.name;
		var sex = student_info.sex;
		if (sex == '男')
			sex = 1;
		if (sex == '女')
			sex = 2;
		if (isNaN(parseInt(student_info.birth))){
			var birth = '';
		} else {
			if (student_info.birth.length == 10){
				var birth = student_info.birth;
			} else {
				var date = new Date(1000*(parseInt(student_info.birth)*86400 - 2209161600)); 
				var yy = date.getFullYear(); 
				var mm = date.getMonth()+1;
				var dd = date.getDate();
				if (mm < 10) mm = '0'+mm;
				if (dd < 10) dd = '0'+dd;
				var birth = yy+'-'+mm+'-'+dd;
			}
		}
		var id_card = student_info.id_card;
		var student_from = student_info.student_from;
		var address = student_info.address;
		var height = student_info.height;
		var weight = student_info.weight;
		var lung = student_info.lung;
		var run50 = student_info.run50;
		var sit_reach = student_info.sit_reach;
		var	jump = student_info.jump;
		var situp = student_info.situp;
		var run8_50 = student_info.run8_50;
		var jump_add_score = tools.get_jump_addition(jump, grade, sex).score;
		var jump_add_record = tools.get_jump_addition(jump, grade, sex).record;
		del_values.push(student_id);
		if (isNaN(parseInt(class_id)))
			continue;
		add_values.push(student_id,student_number,name,sex,nationality,birth,address,school_id,school,class_id,parseInt(class_id)%1000 / 100,parseInt(class_id)%100,0,'','0',class_number);
		add_str.push((add_values));
		item_list = [];
		var score = '';
		var level = '';
		item_list.push(student_id,sex,school_id,class_id,'2',constant.height,'',height,global.unitMap.get('2'),score,level,year,term);
		score_list.push((item_list));
		item_list = [];
		score = '';
		level = '';
		item_list.push(student_id,sex,school_id,class_id,'7',constant.weight,'',weight,global.unitMap.get('7'),score,level,year,term);
		score_list.push((item_list));
		item_list = [];
		if (lung == undefined){
			lung = '';
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('6', grade, sex, lung).score;
			total += tools.get_total_score(6, grade, score);
			level = tools.get_score_level('6', grade, sex, lung).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'6',constant.lung,'',lung,global.unitMap.get('6'),score,level,year,term);
		score_list.push((item_list));
		item_list = [];
		if (run50 == undefined){
			run50 = '';
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('0', grade, sex, run50).score;
			total += tools.get_total_score(0, grade, score);
			level = tools.get_score_level('0', grade, sex, run50).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'0',constant.run50,'',run50,global.unitMap.get('0'),score,level,year,term);
		score_list.push((item_list));
		item_list = [];
		if (sit_reach == undefined){
			sit_reach = '';
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('4', grade, sex, sit_reach).score;
			total += tools.get_total_score(4, grade, score);
			level = tools.get_score_level('4', grade, sex, sit_reach).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'4',constant.sit_reach,'',sit_reach,global.unitMap.get('4'),score,level,year,term);
		score_list.push((item_list));

		item_list = [];
		if (jump == undefined){
			jump = '';
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('8', grade, sex, jump).score;
			total += tools.get_total_score(8, grade, score);
			level = tools.get_score_level('8', grade, sex, jump).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'8',constant.jump,'',jump,global.unitMap.get('8'),score,level,year,term);
		score_list.push((item_list));

		item_list = [];
		if (situp == undefined){
			situp = '';
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('5', grade, sex, situp).score;
			total += tools.get_total_score(5, grade, score);
			level = tools.get_score_level('5', grade, sex, situp).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'5',constant.situp,'',situp,global.unitMap.get('5'),score,level,year,term);
		score_list.push((item_list));

		item_list = [];
		try{
			var tmp = run8_50.split("'");
			run8_50 = parseInt(tmp[0])*60+parseInt(tmp[1]);
			if (isNaN(run8_50))
				run8_50 = '';
		}catch(err){
			run8_50 = '';
		}
		if (run8_50 == ''){
			score = '';
			level = '';
		} else {
			score = tools.get_score_level('9', grade, sex, run8_50).score;
			total += tools.get_total_score(9, grade, score);
			level = tools.get_score_level('9', grade, sex, run8_50).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'9',constant.run8_50,'',run8_50,global.unitMap.get('9'),score,level,year,term);
		score_list.push((item_list));

		item_list = [];
		height = parseFloat(height) / 100;
		weight = parseFloat(weight);
		var bmi = Math.round(weight/(height*height)*10)*0.1;
		bmi = bmi.toFixed(1);
		if (isNaN(bmi))
			bmi = '';
		if (bmi == ''){
			score = '';
			level = '';
		} else {
			score = tools.get_bmi_level(grade, sex, bmi).score;
			total += tools.get_total_score(-1, grade, score);
			level = tools.get_bmi_level(grade, sex, bmi).level;
		}
		item_list.push(student_id,sex,school_id,class_id,'-1',constant.bmi,'',bmi,'',score,level,year,term);
		score_list.push((item_list));

		item_list = [];
		total += jump_add_score;
		item_list.push(student_id,sex,school_id,class_id,'15',constant.jump_add,'',jump_add_record,global.unitMap.get('8'),jump_add_score,'',year,term);
		score_list.push((item_list));

		item_list = [];
		level = tools.get_score_level('16', grade, sex, total).level;
		item_list.push(student_id,sex,school_id,class_id,'16',constant.total,'',total,'',total, level,year,term);
		score_list.push((item_list));
		item_list = [];
		item_list.push(student_id,sex,school_id,class_id,'14',constant.sight,'','','','',tools.get_score_level('14', grade, sex, '').level,year,term);
		score_list.push((item_list));
	}
	if (add_str.length == 0){
		result.header.code = "500";
		result.header.msg  = "失败";
		result.data = {result : '-1', msg : '解析文件失败'};
		res.json(result);
		return;
	}
	var values = [school_id];
	sql.query(req, res, sql_mapping.mod_del_flag, values, next, function(err, ret){
		if (err){
			console.log(err);
			result.header.code = "500";
			result.header.msg  = "失败";
			result.data = {result : '-1', msg : '导入失败'};
			res.json(result);
			return;
		}
		values = [del_values];
		sql.query(req, res, sql_mapping.mov_student, values, next, function(err, ret){
			if (err){
				console.log(err);
				result.header.code = "500";
				result.header.msg  = "失败";
				result.data = {result : '-1', msg : '导入删除失败'};
				res.json(result);
				return;	
			}
			values = [add_str];
			sql.query(req, res, sql_mapping.add_student, values, next, function(err, ret){
				if (err){
					result.header.code = "500";
					result.header.msg  = "失败";
					result.data = {result : '-1', msg : '导入失败，请查看是否有重复学籍号'};
					res.json(result);
					return;
				}
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
	var date  = new Date();
	var opt_time = time_tools.get_current_time();
	try{
		var tmp_file_name = file_name.split('.')[0];
	} catch(err){
		var tmp_file_name = file_name;
	}
	var key = tmp_file_name + '-' + date.getTime() + '.xlsx';
	var extra = new qiniu.io.PutExtra();
	var putPolicy = new qiniu.rs.PutPolicy('lingpaotiyu');
	var uptoken = putPolicy.token();
	qiniu.io.putFile(uptoken, key, tmp_filename, extra, function(err, ret) {
		if (!err) {
			var file_path = 'http://7xq9cu.com1.z0.glb.clouddn.com/' + key;
			values = [year+'年第'+term+'学期', opt_time, account, file_name+'('+add_str.length+')', file_path];
			sql.query(req, res, sql_mapping.add_upload_log, values, next, function(err, ret){
				try{
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data        = {result : '0', msg : '上传完毕'};
					res.json(result);
				}catch(err){
					//
				}
			});
		} else {
			console.log(err);
			result.header.code = '500';
			result.header.msg  = '上传失败';
			result.data		   = {};
			res.json(result);
		}
	});
};

exports.score_output = function(req, res, next){
	var account = req.body.account;
	var school_id = req.body.school_id;
	var year = req.body.year;
	var term = req.body.term;
	if (year == undefined || term == undefined || school_id == undefined){
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
	student_info.push(constant.height);
	student_info.push(constant.weight);
	student_info.push(constant.lung);
	student_info.push(constant.run50);
	student_info.push(constant.sit_reach);
	student_info.push(constant.jump);
	student_info.push(constant.situp);
	student_info.push(constant.run8_50);
	var values = [school_id, school_id, year, term];
	sql.query(req, res, sql_mapping.score_output, values, next, function(err, ret){
		try{
			report_list.push(student_info);
			var item_map = new Map();
			student_info = [];
			for (var i=0;i<ret.length;i++){
				if (ret[i].student_id != student_id){
					if (item_map.size != 0){
						student_info.push(item_map.get(2));
						student_info.push(item_map.get(7));
						student_info.push(item_map.get(6));
						student_info.push(item_map.get(0));
						student_info.push(item_map.get(4));
						student_info.push(item_map.get(8));
						student_info.push(item_map.get(5));
						student_info.push(item_map.get(9));
						report_list.push(student_info);
						student_info = [];
						item_map.clear();
					}
					student_id = ret[i].student_id;
					student_info.push('1'+ret[i].grade);
					student_info.push(ret[i].class_number);
					student_info.push(ret[i].class);
					student_info.push(ret[i].student_id);
					student_info.push(ret[i].nationality);
					student_info.push(ret[i].student_name);
					student_info.push(ret[i].sex);
					student_info.push(ret[i].birth);
					student_info.push(ret[i].address);
					if (ret[i].item_id == 0 || ret[i].item_id == 1 || ret[i].item_id == 2 || ret[i].item_id == 3 || ret[i].item_id == 4 || ret[i].item_id == 5 || ret[i].item_id == 6 || ret[i].item_id == 7 || ret[i].item_id == 8 || ret[i].item_id == 9){
						if (ret[i].item_id == 9){
							if (isNaN(parseInt(ret[i].record))){
								item_map.set(9, '');
							} else {
								var min = parseInt(ret[i].record) / 60;
								var second = parseInt(ret[i].record) % 60;
								item_map.set(9, min+"'"+second+'"');
							}
						} else {
							item_map.set(ret[i].item_id, ret[i].record);
						}
					}
				} else {
					if (ret[i].item_id == 0 || ret[i].item_id == 1 || ret[i].item_id == 2 || ret[i].item_id == 3 || ret[i].item_id == 4 || ret[i].item_id == 5 || ret[i].item_id == 6 || ret[i].item_id == 7 || ret[i].item_id == 8 || ret[i].item_id == 9){
						if (ret[i].item_id == 9){
							if (isNaN(parseInt(ret[i].record))){
								item_map.set(9, '');
							} else {
								var min = parseInt(parseInt(ret[i].record) / 60);
								var second = parseInt(ret[i].record) % 60;
								item_map.set(9, min+"'"+second+'"');
							}
						} else {
							item_map.set(ret[i].item_id, ret[i].record);
						}	
					}
				}		
			}		
			if (student_info.length !=0){
				student_info.push(item_map.get(2));
				student_info.push(item_map.get(7));
				student_info.push(item_map.get(6));
				student_info.push(item_map.get(0));
				student_info.push(item_map.get(4));
				student_info.push(item_map.get(8));
				student_info.push(item_map.get(5));
				student_info.push(item_map.get(9));
				report_list.push(student_info);
			}
			var file = xlsx.build([{name : "worksheets", "data" : report_list}]);
			fs.writeFileSync('student.xlsx', file, 'binary');

			var date  = new Date();
			var opt_time = time_tools.get_current_time();
			var key = account + '-' + date.getFullYear() + (date.getMonth()+1) + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + '.xlsx';
			var extra = new qiniu.io.PutExtra();
			var putPolicy = new qiniu.rs.PutPolicy('lingpaotiyu');
			var uptoken = putPolicy.token();
			qiniu.io.putFile(uptoken, key, path.resolve()+'/student.xlsx', extra, function(err, ret) {
				if (!err) {
					var file_name = 'http://7xq9cu.com1.z0.glb.clouddn.com/' + key;
					values = [key, year+'年第'+term+'学期', opt_time, account, file_name];
					sql.query(req, res, sql_mapping.add_download_log, values, next, function(err, ret){
						result.header.code = '200';
						result.header.msg  = '成功';
						result.data        = {url : file_name};
						res.json(result);
					});
				} else {
					console.log(err);
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
};

exports.get_remind_day = function(req, res, next){
	var school = req.body.school;
	if (school == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var date = new Date();
	var values = [school];
	sql.query(req, res, sql_mapping.get_remind_day, values, next, function(err, ret){
		try{
			var date1 = new Date(ret[0].protocol_end);
			var day = Math.round((date1-date) / 86400000);
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {day : day};
			res.json(result);
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "获取剩余天数失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
};

exports.get_download_list = function(req, res, next){
	var account = req.body.account;
	if (account == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.get_download_list, values, next, function(err, ret){
		try{
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {download_list : ret};
			res.json(result);
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "获取剩余天数失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
}

exports.get_upload_list = function(req, res, next){
	var account = req.body.account;
	if (account == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.get_upload_list, values, next, function(err, ret){
		try{
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {upload_list : ret};
			res.json(result);
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "获取剩余天数失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
};

exports.get_download_detail = function(req, res, next){
	var school_id = req.body.school_id;
	var year = req.body.year;
	var term = req.body.term;
	if (school_id == undefined || year == undefined || term == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id, school_id, year, term];
	sql.query(req, res, sql_mapping.get_download_detail, values, next, function(err, ret){
		try{
			var download_detail = [];
			download_detail.push({empty_list : [], rate : '', class_name : '一年级'});
			download_detail.push({empty_list : [], rate : '', class_name : '二年级'});
			download_detail.push({empty_list : [], rate : '', class_name : '三年级'});
			download_detail.push({empty_list : [], rate : '', class_name : '四年级'});
			download_detail.push({empty_list : [], rate : '', class_name : '五年级'});
			download_detail.push({empty_list : [], rate : '', class_name : '六年级'});
			var total = 0;
			var tmp = '';
			for(var i=0;i<ret.length;i++){
				if (ret[i].class_id[1] != tmp){
					tmp = ret[i].class_id[1];
					total = 1;
					if (parseInt(ret[i].count) == 0){
						if (ret[i].class_id[2] != '0')
							var cls_name = ret[i].class_id[2] + ret[i].class_id[3];
						else
							var cls_name = ret[i].class_id[3];
						try {
							download_detail[parseInt(ret[i].class_id[1])-1].empty_list.push(cls_name+'班');
							var list_len = download_detail[parseInt(ret[i].class_id[1])-1].empty_list.length;
							download_detail[parseInt(ret[i].class_id[1])-1].rate = (total - list_len) + '/' + total; 
						} catch(err){
							console.log(err);
						}
					} else {
						var list_len = download_detail[parseInt(ret[i].class_id[1])-1].empty_list.length;
						download_detail[parseInt(ret[i].class_id[1])-1].rate = (total - list_len) + '/' + total;
					}
				} else {
					total = total + 1;
					if (parseInt(ret[i].count) == 0){
						if (ret[i].class_id[2] != '0')
							var cls_name = ret[i].class_id[2] + ret[i].class_id[3];
						else
							var cls_name = ret[i].class_id[3];
						try {
							download_detail[parseInt(ret[i].class_id[1])-1].empty_list.push(cls_name+'班');
							var list_len = download_detail[parseInt(ret[i].class_id[1])-1].empty_list.length;
							download_detail[parseInt(ret[i].class_id[1])-1].rate = (total - list_len) + '/' + total; 
						} catch(err){
							console.log(err);
						}
					} else {
						var list_len = download_detail[parseInt(ret[i].class_id[1])-1].empty_list.length;
						download_detail[parseInt(ret[i].class_id[1])-1].rate = (total - list_len) + '/' + total;
					}
				}
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {download_detail : download_detail};
			res.json(result);
		} catch(err){
			console.log(err);
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
};

exports.add_free_test = function(req, res, next){
	var student_id = req.body.student_id;
	var reason = req.body.reason;
	if (student_id == undefined || reason == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.add_free_test, values, next, function(err, ret){
		values = [student_id, reason];
		sql.query(req, res, sql_mapping.add_free_test_reason, values, next, function(err, ret){
			try{
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {result : 0, msg : "添加成功"};
				res.json(result);
			} catch(err){
				result.header.code = "500";
				result.header.msg  = "添加失败";
				result.data        = {};
				res.json(result);
				return;
			}
		});
	});
};

exports.del_free_test = function(req, res, next){
	var student_id = req.body.student_id;
	if (student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.del_free_test, values, next, function(err, ret){
		try{
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {result : 0, msg : "删除成功"};
			res.json(result);
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
};

exports.get_free_test = function(req, res, next){
	var school_id = req.body.school_id;
	var grade = req.body.grade;
	var cls = req.body.cls;
	var page = req.body.page;
	var num = req.body.num;
	num = parseInt(num);
	if (school_id == undefined || grade == undefined || cls == undefined || page == undefined || num == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var start = page * num - num;
	var end = start + num;
	var student_list = [];
	var values = [school_id, '%'+ grade +'%', '%'+ cls +'%'];
	sql.query(req, res, sql_mapping.get_free_test, values, next, function(err, ret){
		try{
			for (var i=start;i<end;i++){
				if (ret[i] != undefined){
					student_list.push(ret[i]);
				}	
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {free_test_list : student_list, total : ret.length};
			res.json(result);
		} catch(err){
			result.header.code = "500";
			result.header.msg  = "获取失败";
			result.data        = {};
			res.json(result);
			return;
		}
	});
};


