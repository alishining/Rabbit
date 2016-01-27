var express = require('express');
var multipart = require('connect-multiparty');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var sql_mapping = require('../dao/sql_mapping');

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
	console.log(req.body);
	if (sex == undefined || class_id == undefined || year == undefined || term == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [sex, class_id, year,term];
	sql.query(req, res, sql_mapping.student_sport_report, values, next, function(err, ret){
		try {
			var report_list = [];
			var id_set = new Set();
			for (var i=0;i<ret.length;i++){
				if (!id_set.has(ret[i].student_id)){
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
							break;
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
};

