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

exports.init = function(req, res, next){
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
		var class_list = ret[0].class_list.split(',');
		var sport_item = [];
		for (var i=0;i<class_list;i++){
			if (class_list[i][0] == '1'){
				switch(class_list[i][1]){
					case '1' : 
						sport_item.push({class_id : class_list[i], item : });
						break;
					case '2' :
						break;
					case '3' :
						break;
					case '4' :
						break;
					case '5' :
						break;
					case '6' ''
						break;
				}
			}
		}

	})
};
