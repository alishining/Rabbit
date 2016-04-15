var express = require('express');
var multipart = require('connect-multiparty');
var lunar_day = require('../tools/lunar_day');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var sql_mapping = require('../dao/sql_mapping');
var tools = require('../tools/load_score_level');
var constant = require('../tools/constant');

var result = {
	header : {
		code : "200",
		msg  : "成功"
	},
	data : {
	}
}   

exports.pad_login = function(req, res, next){
	var account  = req.body.account;
	var password = req.body.password;
	if (account == undefined || password == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [account];
	sql.query(req, res, sql_mapping.pad_login, values, next, function(err, ret){
		try {
			if (ret[0].password == password){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {result : '0', uid : account, msg : '登录成功', school_id : ret[0].school_id, school : ret[0].school};
				res.json(result);
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {result : '-1', msg : '密码错误'};
				res.json(result);
			}
		} catch(err) {
			result.header.code = "200";
			result.header.msg  = "失败";
			result.data = {result : '-1', msg : '用户不存在'};
			res.json(result);
		}
	})
}

exports.pad_init = function(req, res, next){
	var uid = req.body.uid;
	var school_id = req.body.school_id;
	if (uid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [uid];
	sql.query(req, res, sql_mapping.get_account_class_list, values, next, function(err, ret){
		try{
			var class_id_list = ret[0].class_list.split(',');
		}catch(err){
			var class_id_list = [];
		}
		var class_list = [];
		var sport_item = [];
		for (var i=0;i<class_id_list.length;i++){
			if (class_id_list[i][0] == '1'){
				if (class_id_list[i][2] != '0')
					var cls = class_id_list[i][2] + class_id_list[i][3];
				else
					var cls = class_id_list[i][3];
				switch(class_id_list[i][1]){
					case '1' : 
						class_list.push({class_id : class_id_list[i], name : '一年级' + cls + '班', 
										 sport_item : [0, 2, 4, 6, 7, 8, 14]});
						break;
					case '2' :
						class_list.push({class_id : class_id_list[i], name : '二年级' + cls + '班',
										 sport_item : [0, 2, 4, 6, 7, 8, 14]});
						break;
					case '3' :
						class_list.push({class_id : class_id_list[i], name : '三年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 14]});
						break;
					case '4' :
						class_list.push({class_id : class_id_list[i], name : '四年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 14]});
						break;
					case '5' :
						class_list.push({class_id : class_id_list[i], name : '五年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 9, 14]});
						break;
					case '6' :
						class_list.push({class_id : class_id_list[i], name : '六年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 9, 14]});
						break;
					case '7' :
						class_list.push({class_id : class_id_list[i], name : '七年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13, 14]});
						break;
					case '8' :
						class_list.push({class_id : class_id_list[i], name : '八年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13, 14]}); 
						break;
					case '9' :
						class_list.push({class_id : class_id_list[i], name : '九年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13, 14]}); 
						break;
				}
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {};
				res.json(result);
			}
		}
		var date = new Date();
		var year = date.getFullYear();
		values = ['%' + year + '%', class_id_list, school_id];
		sql.query(req, res, sql_mapping.get_class_student, values, next, function(err, ret){
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {class_list : class_list, student : ret};
			res.json(result);
		});
	})
};

exports.pad_teacher_info = function(req, res, next){
	var uid = req.body.uid;
	if (uid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [uid];
	sql.query(req, res, sql_mapping.pad_teacher_info, values, next, function(err, ret){
		if (ret.length == 0){
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {msg : '老师不存在'};
			res.json(result);
		} else {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {teacher_info : ret[0]};
			res.json(result);
		}
	});
};

exports.submit_report_forms = function(req, res, next){
	var uid = req.body.uid;
	var sign = req.body.sign;
	var check_better = req.body.check_better;
	var tid = req.body.tid;
	var title = req.body.title;
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var time = req.body.time;
	var student_score = req.body.student_score;
	var teacher = req.body.teacher;
	if (uid == undefined || sign == undefined || check_better == undefined || tid == undefined || title == undefined || class_id == undefined || item_id == undefined || time == undefined || student_score == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}

	var score_map = new Map();
	var values = [school_id, class_id, item_id];
	sql.query(req, res, sql_mapping.get_current_form, values, next, function(err, ret){
		for (var i=0;i<ret.length;i++){
			if (ret[i].record != '')
				score_map.set(ret[i].student_id, {record : ret[i].record, score : ret[i].score, level : ret[i].level});
		}
		var student_score_list = JSON.parse(student_score);
		var del_values = [];
		var add_values = [];
		var add_current = [];
		var item_values = [];
		var rate = student_score_list.length;
		var has_rate = 0;
		for(var i=0;i<rate;i++){
			var student_id = student_score_list[i].student_id;
			var student_number = student_score_list[i].student_number;
			var student_name = student_score_list[i].student_name;
			var sex = student_score_list[i].sex;
			var grade = class_id[1];
			var record = student_score_list[i].record;
			var score = tools.get_score_level(item_id, grade, sex, record).score;
			var level = tools.get_score_level(item_id, grade, sex, record).level;
			del_values.push(student_id);
			item_values = [];
			item_values.push(tid);
			item_values.push(student_id);
			item_values.push(student_number);
			item_values.push(student_name);
			item_values.push(sex);
			item_values.push(record);
			if (record != '') has_rate++;
			item_values.push(score);
			item_values.push(level);
			add_values.push(item_values);
			item_values = [];
			item_values.push(student_id);
			item_values.push(student_number);
			item_values.push(student_name);
			item_values.push(sex);
			item_values.push(school_id);
			item_values.push(class_id);
			item_values.push(item_id);
			if (record == '' && score_map.get(student_id) != undefined){
				item_values.push(score_map.get(student_id).record);
				item_values.push(score_map.get(student_id).score);
				item_values.push(score_map.get(student_id).level);
				add_current.push(item_values);
				continue;
			}
			if (score_map.get(student_id) != undefined && record != '' && check_better == '1' && item_id != '14'){
				var map_record = parseFloat(score_map.get(student_id).record);
				var st_record = parseFloat(record);
				var map_score = score_map.get(student_id).score;
				var map_level = score_map.get(student_id).level; 
				var st_record = parseFloat(record); 
				if (item_id == '0' || item_id == '9' || item_id == '12' ||  item_id == '13'){
					if (map_record > st_record){
						item_values.push(record);
						item_values.push(score);
						item_values.push(level);
					} else {
						record = score_map.get(student_id).record;
						item_values.push(record);
						item_values.push(map_score);
						item_values.push(map_level);
					}
				} else {
					if (map_record > st_record){
						record = score_map.get(student_id).record;
						item_values.push(record);
						item_values.push(map_score);
						item_values.push(map_level);
					} else {
						record = st_record;
						item_values.push(record);
						item_values.push(score);
						item_values.push(level);
					}
				}
			} else {
				item_values.push(record);
				item_values.push(score);
				item_values.push(level);
			}
			add_current.push(item_values);
			if (item_id == '8'){
				item_values = [];
				item_values.push(student_id);
				item_values.push(student_number);
				item_values.push(student_name);
				item_values.push(sex);
				item_values.push(school_id);
				item_values.push(class_id);
				item_values.push('15');
				item_values.push(tools.get_jump_addition(record, grade, sex).record);
				item_values.push(tools.get_jump_addition(record, grade, sex).score);
				item_values.push('-2');
				add_current.push(item_values);
			}
		}
		var year = lunar_day.get_term().year;
		var term = lunar_day.get_term().term;
		if (item_id == '8'){
			var item_list = [item_id, '15']; 
		} else {
			var item_list = [item_id]; 
		}
		values = [class_id, school_id, item_list];
		sql.query(req, res, sql_mapping.del_current_form, values, next, function(err, ret){
			values = [add_current];
			sql.query(req, res, sql_mapping.add_current_form, values, next, function(err, ret){
				try{
					if (sign == 0){
						values = [uid, title, school_id, item_id, class_id, has_rate, time, time, '1', year, term];
						sql.query(req, res, sql_mapping.add_test_report, values, next, function(err, ret){
							tid = ret.insertId;
							for (var i=0;i<add_values.length;i++){
								add_values[i][0] = tid;
							}
							values = [add_values];
							sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
								var grade = class_id[1];
								if (class_id[2] == '0')
									var cls = class_id[3];
								else
									var cls = class_id[2] + class_id[3];	
								values = [school_id, class_id, year+'年'+'第'+term+'学期'+grade+'年级'+cls+'班报表', teacher, time, '1'];
								sql.query(req, res, sql_mapping.add_form_list, values, next, function(err, ret){
									result.header.code = "200";
									result.header.msg  = "提交成功";
									result.data = {result : '0', msg : '提交成功', tid : tid};
									res.json(result);
								});
							});		
						});
					} else {
						var values = [del_values, tid];
						sql.query(req, res, sql_mapping.del_student_test, values, next, function(err, ret){
							values = [add_values];
							sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
								values = [has_rate, time, tid]; 
								sql.query(req, res, sql_mapping.update_test_report, values, next, function(err, ret){
									var grade = class_id[1];
									if (class_id[2] == '0')
										var cls = class_id[3];
									else
										var cls = class_id[2] + class_id[3];
									values = [school_id, class_id, year+'年'+'第'+term+'学期'+grade+'年级'+cls+'班报表', teacher, time, '1'];
									sql.query(req, res, sql_mapping.add_form_list, values, next, function(err, ret){
										result.header.code = "200";
										result.header.msg  = "提交成功";
										result.data = {result : '0', msg : '提交成功', tid : tid};
										res.json(result);
									});
								});
							});  
						});
					}
				} catch(err){
					result.header.code = "500";
					result.header.msg  = "提交失败";
					result.data = {result : '0', msg : '提交失败'};
					res.json(result);
				}
			});
		});
	});
};

exports.get_test_report = function(req, res, next){
	var uid = req.body.uid;
	if (uid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var year = lunar_day.get_term().year;
	var term = lunar_day.get_term().term;
	var values = [uid, year, term];
	sql.query(req, res, sql_mapping.get_test_report, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {report_list : ret};
		res.json(result);
	});

};

exports.del_test_report = function(req, res, next){
	var tid_list = req.body.tid_list;
	if (tid_list == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};    
		res.json(result);
		return;  
	}
	var values = [tid_list.split(',')];
	sql.query(req, res, sql_mapping.del_test_report, values, next, function(err, ret){
		sql.query(req, res, sql_mapping.mov_student_test, values, next, function(err, ret){
			if (err){
				result.header.code = "500";
				result.header.msg  = "删除失败";
				result.data = {};
				res.json(result);
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {result : '0', msg : '删除失败'};
			res.json(result);
		});
	});
};

exports.save_test_report = function(req, res, next){
	var sign = req.body.sign;
	var tid = req.body.tid;
	var uid = req.body.uid;
	var title = req.body.title;
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var time = req.body.time;
	var student_score = req.body.student_score;	
	if (sign == undefined || tid == undefined || uid == undefined || title == undefined || school_id == undefined ||class_id == undefined || item_id == undefined || time == undefined || student_score == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var student_score_list = JSON.parse(student_score);
	var del_values = [];
	var add_values = [];
	var item_values = [];
	var rate = student_score_list.length;
	var has_rate = 0;
	for(var i=0;i<rate;i++){
		del_values.push(student_score_list[i].student_id);
		item_values = [];
		item_values.push(tid);
		item_values.push(student_score_list[i].student_id);
		item_values.push(student_score_list[i].student_number);
		item_values.push(student_score_list[i].student_name);
		var sex = student_score_list[i].sex;
		item_values.push(sex);
		if (student_score_list[i].score != '')
			has_rate++;
		var record = student_score_list[i].record;
		item_values.push(record);
		item_values.push(tools.get_score_level(item_id, class_id[1], sex, record).score);
		item_values.push(tools.get_score_level(item_id, class_id[1], sex, record).level);
		add_values.push(item_values);
	}
	try{
		if (sign == 0){
			var year = lunar_day.get_term().year;
			var term = lunar_day.get_term().term;
			values = [uid, title, school_id, item_id, class_id, has_rate, time, time, '1', year, term];
			sql.query(req, res, sql_mapping.add_test_report, values, next, function(err, ret){
				tid = ret.insertId;
				for (var i=0;i<add_values.length;i++){
					add_values[i][0] = tid;
				}
				values = [add_values];
				sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
					result.header.code = "200";
					result.header.msg  = "成功";
					result.data = {result : '0', msg : '保存成功', tid : tid};
					res.json(result);
				});
			});
		} else {
			var values = [del_values, tid];
			sql.query(req, res, sql_mapping.del_student_test, values, next, function(err, ret){
				values = [add_values];
				sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
					values = [has_rate, time, tid];
					sql.query(req, res, sql_mapping.update_test_report, values, next, function(err, ret){
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data = {result : '0', msg : '保存成功', tid : tid};
						res.json(result);
					});
				});
			});
		}
	} catch(err){
		result.header.code = "500";
		result.header.msg  = "保存失败";
		result.data = {result : '0', msg : '保存失败'};
		res.json(result);
	}
}

exports.add_homework = function(req, res, next){
	var school_id = req.body.school_id;
	var class_list = req.body.class_list;
	var item_list = req.body.item_list;
	if (school_id == undefined || class_list == undefined || item_list == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var class_list = class_list.split(',');
	var insert = [];
	var one_class = [];
	for (var i=0;i<class_list.length;i++){
		one_class = [];
		one_class.push(school_id);
		one_class.push(class_list[i]);
		one_class.push(item_list);
		insert.push(one_class);
	}
	var values = [school_id, class_list];
	sql.query(req, res, sql_mapping.del_homework, values, next, function(err, ret){
		values = [insert];
		sql.query(req, res, sql_mapping.add_homework, values, next, function(err, ret){
			if (err){
				result.header.code = "500";
				result.header.msg  = "重复添加";
				result.data = {};
				res.json(result);
				return;
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {result : '0', msg : '发布成功'};
			res.json(result);
		});
	});
};

exports.mod_homework = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var item_list = req.body.item_list;
	if (school_id == undefined || class_id == undefined || item_list == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	if (item_list == ''){
		var values = [school_id, class_id];
		sql.query(req, res, sql_mapping.mov_homework, values, next, function(err, ret){
			result.header.code = "200";
			result.header.msg  = "发布成功";
			result.data = {result : '0', msg : '发布成功'};
			res.json(result);
		});
	} else {
		var values = [item_list, school_id, class_id];
		sql.query(req, res, sql_mapping.update_homework, values, next, function(err, ret){
			result.header.code = "200";
			result.header.msg  = "发布成功";
			result.data = {result : '0', msg : '发布成功'};
			res.json(result);
		});
	}
};

exports.get_homework = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	if (school_id == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [school_id, class_id];
	sql.query(req, res, sql_mapping.get_homework, values, next, function(err, ret){
		var date  = new Date();
		var month = date.getMonth()+1;
		var day = date.getDate();
		if (date.getMonth()+1 < 10)
		month = '0'+ (date.getMonth()+1);
		if (date.getDate() < 10)
			day = '0' + date.getDate();
		var ds = date.getFullYear() + '-' + month  + '-' + day;
		values = [class_id, school_id, ds];
		sql.query(req, res, sql_mapping.get_homework_rate, values, next, function(err, _ret){
			values = [class_id, school_id];
			sql.query(req, res, sql_mapping.count_student, values, next, function(err, __ret){
				var total = 0;
				try{
					total = parseInt(__ret[0].total); 
				} catch(err){
					console.log(err);
				}
				var homework_list = [];
				try{
					if (ret.length != 0){
						var item_list = ret[0].item_list.split(',');
						for (var i=0;i<item_list.length;i++){
							var item = item_list[i].split(':')[0];
							var count = parseInt(item_list[i].split(':')[1]);
							if (_ret.length != 0){
								var flag = 0;
								for (var u=0;u<_ret.length;u++){
									if (_ret[u].item == item){
										homework_list.push({item : item, count : count, rate : parseInt((parseInt(_ret[u].count)/(count*total))*100) + '%'});
										flag = 1;
									}
								}
								if (flag == 0)
									homework_list.push({item : item, count : count, rate : 0+'%'});
							} else {
								homework_list.push({item : item, count : count, rate : 0+'%'});
							}
						}
					}
				}catch(err){
					console.log(err);
				}
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {homework_list : homework_list};
				res.json(result);
			});
		})
	});
};

exports.detail_homework = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var count = req.body.count;
	if (class_id == undefined || school_id == undefined || item_id == undefined || count == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data = {};
		res.json(result);
		return;
	}
	var date  = new Date();
	var month = date.getMonth()+1;
	var day = date.getDate();
	if (date.getMonth()+1 < 10)
		month = '0'+ (date.getMonth()+1);
	if (date.getDate() < 10)
		day = '0' + date.getDate();
	var ds = date.getFullYear() + '-' + month  + '-' + day;
	var finished_list = [];
	var unfinished_list = [];
	var values = [item_id, ds, school_id, class_id];
	sql.query(req, res, sql_mapping.get_detail_homework, values, next, function(err, ret){
		if (ret){
			for (var i=0;i<ret.length;i++){
				var number = ret[i].student_number;
				var name = ret[i].student_name;
				var sex = ret[i].sex;
				try{
					var score_list = ret[i].score_list.split(',');
				} catch(err){
					var score_list = [];
				}
				var score_list_len = score_list.length;
				var score = [];
				for (var u=0;u<score_list_len;u++){
					score.push(score_list[u].split(':')[1]);
				}
				if (score_list_len < count){
					unfinished_list.push({rate : score.length + '/' + count, name : name, sex : sex, number : number, score_list : score});
				} else {
					finished_list.push({rate : score.length + '/' + count, name : name, sex : sex, number : number, score_list : score});
				}
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {date : ds, finished_list : finished_list, unfinished_list : unfinished_list, unfinished_count : unfinished_list.length, finished_count : finished_list.length};  
			res.json(result);
		} else {
			result.header.code = "500";
			result.header.msg  = "数据不存在";
			result.data = {};  
			res.json(result);
		}
	});
};

exports.get_form = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	if (school_id == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data = {};
		res.json(result);
		return;
	}
	var values = [school_id, class_id];
	sql.query(req, res, sql_mapping.get_form, values, next, function(err, ret){
		sql.query(req, res, sql_mapping.get_form_title, values, next, function(err, _ret){
			try{
				var teacher = _ret[0].teacher;
				var title = _ret[0].title;
				var time = _ret[0].time;	
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {student_list : ret, teacher : teacher, title : title, time : time};
				res.json(result);
			}catch(err){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {};
				res.json(result);
			}
		});
	});
};

exports.get_history_form = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var tid = req.body.tid;
	if (school_id == undefined || class_id == undefined || tid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data = {};
		res.json(result);
		return;
	}
	var values = [school_id, class_id, tid];
	sql.query(req, res, sql_mapping.get_history_form, values, next, function(err, ret){
		values = [tid];
		sql.query(req, res, sql_mapping.get_form_title_from_tid, values, next, function(err, _ret){
			try{
				var teacher = _ret[0].teacher;
				var title = _ret[0].title;
				var time = _ret[0].time;
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {student_list : ret, teacher : teacher, title : title, time : time};
				res.json(result);
			}catch(err){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {};
				res.json(result);
			}
		});
	});
};

exports.submit_to_school = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var title = req.body.title;
	var teacher = req.body.teacher;
	var time = req.body.time;
	if (school_id == undefined || class_id == undefined || teacher == undefined || time == undefined || title == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data = {};
		res.json(result);
		return;
	}
	var year = lunar_day.get_term().year;
	var term = lunar_day.get_term().term;
	var values = [school_id, class_id, title, teacher, time, '0'];
	sql.query(req, res, sql_mapping.add_form_list, values, next, function(err, ret){
		var tid = ret.insertId;
		values = [school_id, class_id];
		sql.query(req, res, sql_mapping.get_form, values, next, function(err, ret){
			var student_list = [];
			var score_list = [];
			var sport_list = [];
			var tmp = '';
			for (var i=0;i<ret.length;i++){
				if (tmp != ret[i].item_id){
					tmp = ret[i].item_id;
					if (ret[i].item_id == '8')
						sport_list.push('15');
					sport_list.push(ret[i].item_id);
				}
				var one_record = [];
				one_record.push(tid);
				one_record.push(ret[i].student_id);
				one_record.push(ret[i].num);
				one_record.push(ret[i].name);
				one_record.push(ret[i].sex);
				one_record.push(ret[i].school_id);
				one_record.push(ret[i].class_id);
				one_record.push(ret[i].item_id);
				one_record.push(ret[i].record);
				one_record.push(ret[i].score);
				one_record.push(ret[i].level);
				student_list.push(one_record);
				var item_list = [];
				var id = ret[i].student_id;
				var sex = ret[i].sex;
				var item_id = ret[i].item_id;
				var record = ret[i].record;
				var grade = ret[i].class_id[1];
				var score = ret[i].score;
				var level = ret[i].level;
				switch(parseInt(item_id)){
					case 2 : 
						item_list.push(id,sex,school_id,class_id,'2', constant.height,'',record,global.unitMap.get('2'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 7 :
						item_list.push(id,sex,school_id,class_id,'7', constant.weight,'',record,global.unitMap.get('7'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 6 :
						item_list.push(id,sex,school_id,class_id,'6', constant.lung,'',record,global.unitMap.get('6'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 0 :
						item_list.push(id,sex,school_id,class_id,'0', constant.run50,'',record,global.unitMap.get('0'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 4 :
						item_list.push(id,sex,school_id,class_id,'4', constant.sit_reach,'',record,global.unitMap.get('4'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 8 :
						item_list.push(id,sex,school_id,class_id,'8', constant.jump,'',record,global.unitMap.get('8'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 5 :
						item_list.push(id,sex,school_id,class_id,'5', constant.situp,'',record,global.unitMap.get('5'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 9 : 
						item_list.push(id,sex,school_id,class_id,'9', constant.run8_50,'',record,global.unitMap.get('9'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 14 : 
						item_list.push(id,sex,school_id,class_id,'14', constant.sight,'',record,global.unitMap.get('14'),score,level,year,term);
						score_list.push((item_list));
						break;
					case 15 : 
						item_list.push(id,sex,school_id,class_id,'15', constant.jump_add,'',record,global.unitMap.get('15'),score,'',year,term);
						score_list.push((item_list));
				}
			}
			values = [student_list];
			if (score_list.length != 0){
				sql.query(req, res, sql_mapping.add_history_form, values, next, function(err, ret){
					values = [year, term, school_id, class_id + '%', sport_list];
					sql.query(req, res, sql_mapping.del_form_report, values, next, function(err, ret){
						values = [score_list];
						sql.query(req, res, sql_mapping.add_report, values, next, function(err, ret){
							if(err){
								console.log(err);
								result.header.code = "500";
								result.header.msg  = "提交失败";
								result.data = {};
								res.json(result);
								return;
							}
							result.header.code = "200";
							result.header.msg  = "成功";
							result.data = {result : '0', msg : '提交成功'};
							res.json(result);
						})
					})
				});
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {result : '-1', msg : '提交失败'};
				res.json(result);
			}
		});
	});
};

exports.get_form_list = function(req, res, next){
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	if (school_id == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data = {};
		res.json(result);
		return;
	}
	var values = [school_id, class_id];
	sql.query(req, res, sql_mapping.get_form_list, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {content : ret};
		res.json(result);
	});
};

exports.get_test_detail = function(req, res, next){
	var tid = req.body.tid;
	var values = [tid];
	sql.query(req, res, sql_mapping.get_test_detail, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {student_list : ret};
		res.json(result);
	});
};

exports.update_teacher_img = function(req, res, next){
	var uid = req.body.uid;
	var tmp_filename = req.files.value.path;
	if (uid == undefined || tmp_filename == undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data        = {};
		res.json(result);
		return;
	}

	var date  = new Date();
	var key = encrypt.md5(uid+date) + '.jpg';
	var extra = new qiniu.io.PutExtra();
	var putPolicy = new qiniu.rs.PutPolicy('lingpaotiyu');
	var uptoken = putPolicy.token();
	qiniu.io.putFile(uptoken, key, tmp_filename, extra, function(err, ret) {
		if (!err) {
			var file_name = 'http://7xq9cu.com1.z0.glb.clouddn.com/' + key;
			var values = [file_name, uid];
			sql.query(req, res, sql_mapping.update_teacher_img, values, next, function(err, ret){
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data        = {result : '0',
									  msg    : '上传成功'};
				res.json(result);
			});
		} else {
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data        = {result : '-1',
								  msg    : '上传失败' ,
								  err    : err};
			res.json(result);
		}
	});
};

exports.get_grade_sport_item = function(req, res, next){
	var grade = req.body.grade;
	if (grade == undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data        = {};
		res.json(result);
		return;
	}
	var sport_list = new Set();
	var values = [grade.split(',')];
	sql.query(req, res, sql_mapping.get_grade_sport_item, values, next, function(err, ret){
		for (var i=0;i<ret.length;i++){
			var tmp = ret[i].item_list.split(',');
			for (var j=0;j<tmp.length;j++){
				sport_list.add(tmp[j]);
			}
		}
		var res_list = [];
		for (var i=0;i<50;i++){
			if (sport_list.has(i+'')){
				res_list.push(i);
			}
		}
		result.header.code = '200';
		result.header.msg  = '成功';
		result.data        = {sport_item : res_list};
		res.json(result);
	});
};

exports.get_static_level = function(req, res, next){
	result.header.code = '200';
	result.header.msg  = '成功';
	result.data = { items:[ { "id":6, "type":2, "girl":[ [1200,1000,600], [1400,1200,700], [1600,1400,800], [1800,1600,900], [2050,1850,1050], [2300,2100,1200] ], "boy":[ [1500,1300,700], [1800,1500,800], [2100,1700,900], [2400,1900,1100], [2700,2200,1300], [3000,2500,1500] ] }, { "id":0, "type":1, "boy":[ [10.4,10.6,12.6], [9.8,10.0,12.0], [9.3,9.5,11.5], [8.9,9.1,11.1], [8.6,8.8,10.8], [8.4,8.6,10.6] ], "girl":[ [11.2,11.8,13.8], [10.2,10.8,12.8], [9.4,10.0,12.0], [8.9,9.5,11.5], [8.5,9.1,11.1], [8.4,9.0,11.0] ] }, { "id":4, "type":2, "boy":[ [13.0,11.0,0.0], [13.2,10.6,-0.4], [13.4,10.2,-0.8], [13.6,9.8,-2.2], [13.8,9.4,-2.6], [14.0,9.0,-4.0] ], "girl":[ [16.0,13.4,2.4], [16.3,13.3,2.3], [16.6,13.2,2.2], [16.9,13.1,2.1], [17.2,13.0,2.0], [17.5,12.9,1.9] ] }, { "id":8, "type":2, "boy":[ [99,87,17], [107,95,25], [116,104,34], [127,115,45], [138,126,56], [147,135,65] ], "girl":[ [103,87,17], [113,97,27], [125,109,39], [135,119,49], [144,128,58], [152,136,66] ] }, { "id":5, "type":2, "boy":[ [ ], [ ], [42,36,16], [43,37,17], [44,38,18], [45,39,19] ], "girl":[ [ ], [ ], [42,36,16], [43,37,17], [44,38,18], [45,39,19] ] }, { "id":9, "type":1, "boy":[ [ ], [ ], [ ], [ ], [102,108,138], [96,102,132] ], "girl":[ [ ], [ ], [ ], [ ], [107,113,143], [103,109,139] ] } ] }; 
	res.json(result);
}
