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
