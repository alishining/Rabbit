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

exports.sport_item_report_rate = function(req, res, next){
	var year =  req.body.year;
	var class_id = req.body.class_id;
	if (year == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [year, class_id];
	sql.query(req, res, sql_mapping.sport_item_report_rate, values, next, function(err, ret){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {sport_item_rate : ret};
		res.json(result);
	});
};

exports.grade_sport_item_rank = function(req, res, next){
	var year =  req.body.year;
	var item_id =  req.body.item_id;
	var grade = req.body.grade + '%';
	if (year == undefined || item_id == undefined || grade == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result); 
		return;
	}
	var values = [year, item_id, grade];
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
	var values = [year, class_id, item_id];
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
		result.data        = {class_level_chart : {boy_great : boy_great, girl_great : girl_great,
												   boy_good : boy_good, girl_good : girl_good,
												   boy_normal : boy_normal, girl_normal : girl_normal,
												   boy_failed : boy_failed, girl_failed : girl_failed}};
		res.json(result);	
	});
}
