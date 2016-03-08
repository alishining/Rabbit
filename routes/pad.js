var express = require('express');
var multipart = require('connect-multiparty');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var sql_mapping = require('../dao/sql_mapping');
var tools = require('../tools/sms');

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
				result.data = {result : '0', uid : account, msg : '登录成功'};
				res.json(result);
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data = {result : '-1', msg : '登录失败'};
				res.json(result);
			}
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "内部错误";
			result.data = {};
			res.json(result);
		}
	})
}

exports.pad_init = function(req, res, next){
	var uid = req.body.uid;
	if (uid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [uid];
	sql.query(req, res, sql_mapping.get_account_class_list, values, next, function(err, ret){
		var class_id_list = ret[0].class_list.split(',');
		var class_list = [];
		var sport_item = [];
		for (var i=0;i<class_id_list.length;i++){
			if (class_id_list[i][0] == '1'){
				var cls = class_id_list[i][2] + class_id_list[i][3];
				switch(class_id_list[i][1]){
					case '1' : 
						class_list.push({class_id : class_id_list[i], name : '一年级' + cls + '班', 
										 sport_item : [0, 2, 4, 6, 7, 8]});
						break;
					case '2' :
						class_list.push({class_id : class_id_list[i], name : '二年级' + cls + '班',
										 sport_item : [0, 2, 4, 6, 7, 8]});
						break;
					case '3' :
						class_list.push({class_id : class_id_list[i], name : '三年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8]});
						break;
					case '4' :
						class_list.push({class_id : class_id_list[i], name : '四年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8]});
						break;
					case '5' :
						class_list.push({class_id : class_id_list[i], name : '五年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 9]});
						break;
					case '6' :
						class_list.push({class_id : class_id_list[i], name : '六年级' + cls + '班',
										 sport_item : [0, 2, 4, 5, 6, 7, 8, 9]});
						break;
					case '7' :
						class_list.push({class_id : class_id_list[i], name : '七年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13]});
						break;
					case '8' :
						class_list.push({class_id : class_id_list[i], name : '八年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13]}); 
						break;
					case '9' :
						class_list.push({class_id : class_id_list[i], name : '九年级' + cls + '班',
										 sport_item : [0, 4, 5, 10, 11, 12, 13]}); 
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
		values = ['%' + year + '%'];
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
			result.data = {teacher_info : ret};
			res.json(result);
		}
	});
};

exports.submit_report_forms = function(req, res, next){
	var sign = req.body.sign;
	var tid = req.body.tid;
	var title = req.body.title;
	var school_id = req.body.school_id;
	var class_id = req.body.class_id;
	var item_id = req.body.item_id;
	var update_time = req.body.update_time;
	var create_time = req.body.create_time;
	var student_score = req.body.student_score;
	if (sign == undefined || tid == undefined || title == undefined || class_id == undefined || item_id == undefined || update_time == undefined || create_time == undefined || student_score == undefined){
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
	for(var i=0;i<rate;i++){
		del_values.push(student_score_list[i].student_id);
		item_values = [];
		item_values.push(tid);
		item_values.push(student_score_list[i].student_id);
		item_values.push(student_score_list[i].student_number);
		item_values.push(student_score_list[i].student_name);
		item_values.push(student_score_list[i].sex);
		item_values.push(student_score_list[i].score);
		item_values.push(student_score_list[i].level);
		add_values.push(item_values);
	}
	try{
		if (sign == 0){
			var values = [title, school_id, item_id, class_id, rate, create_time, update_time];
			sql.query(req, res, sql_mapping.add_test_report, values, next, function(err, ret){
				values = [add_values];
				sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
					result.header.code = "200";
					result.header.msg  = "提交成功";
					result.data = {};
					res.json(result);
				});		
			});
		} else {
			var values = [del_values];
			sql.query(req, res, sql_mapping.del_student_test, values, next, function(err, ret){
				values = [add_values];
				sql.query(req, res, sql_mapping.add_student_test, values, next, function(err, ret){
					values = [rate, update_time, tid]; 
					sql.query(req, res, sql_mapping.update_test_report, values, next, function(err, ret){
						result.header.code = "200";
						result.header.msg  = "提交成功";
						result.data = {};
						res.json(result);
					});
				});  
			});
		}
	} catch(err){
		result.header.code = "500";
		result.header.msg  = "提交失败";
		result.data = {};
		res.json(result);
	}
};

exports.get_test_report = function(req, res, next){
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
	sql.query(req, res, sql_mapping.get_test_report, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {report_list : ret};
		res.json(result);
	});

};

exports.del_test_report = function(req, res, next){
	var tid = req.body.tid_list;
	if (tid == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};    
		res.json(result);
		return;  
	}
	var values = [tid_list];
	sql.query(req, res, sql_mapping.del_test_report, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data = {};
			res.json(result);
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {};
		res.json(result);
	});
};
