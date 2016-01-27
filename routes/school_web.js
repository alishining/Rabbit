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

exports.reset_default_password = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.reset_default_password, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data = {result : '0',  msg : '修改成功'};
		res.json(result);
	});
};

