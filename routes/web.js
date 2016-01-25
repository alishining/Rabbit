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
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [user_name];
	sql.query(req, res, sql_mapping.school_login, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			if (ret[0].password == password){
				result.data = {result : '0',			
							   uid : user_name, 
							   school : ret[0].school,	
							   msg : '登录成功'};
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

exports.get_province = function(req, res, next){
	var values = [];
	sql.query(req, res, sql_mapping.get_province, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "失败";
			result.data        = {};
			res.json(result);
			return;
		};
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {province : ret};
		res.json(result);
	});
};

exports.get_city = function(req, res, next){
	var province = req.body.province;
	if (province == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [province];
	sql.query(req, res, sql_mapping.get_city, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "失败";
			result.data        = {};
			res.json(result);
			return;
		};
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {city : ret};
		res.json(result);
	});
};

exports.get_district = function(req, res, next){
	var province = req.body.province;
	var city = req.body.city;
	if (province == undefined || city ==undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [province, city];
	sql.query(req, res, sql_mapping.get_district, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "失败";
			result.data        = {};
			res.json(result);
			return;
		};
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {district : ret};
		res.json(result);
	});

};

exports.add_school = function(req, res, next){
	var province = req.body.province;
	var city	 = req.body.city;
	var district = req.body.district;
	var school   = req.body.school;
	var is_cooperate = req.body.is_cooperate;
	if (province == undefined || city == undefined || district == undefined || school == undefined || is_cooperate == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [school,'',province,city,district,'','','','','','','',is_cooperate,'0'];
	sql.query(req, res, sql_mapping.add_school, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.del_school = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_school, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '删除成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.mod_school = function(req, res, next){
	var id			 = req.body.id;
	var school		 = req.body.school;
	var is_cooperate = req.body.is_cooperate;
	if (school == undefined || is_cooperate == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [is_cooperate, school, id];
	sql.query(req, res, sql_mapping.mod_school, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '修改成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.get_school = function(req, res, next){
	var school	  =  '%' + req.body.school + '%';
	var province  =  '%' + req.body.province + '%';
	var city	  =  '%' + req.body.city + '%';
	var district  =  '%' + req.body.district + '%';
	var values = [province, city, district, school];
	console.log(values);
	sql.query(req, res, sql_mapping.get_school, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {school : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.add_grade = function(req, res, next){
	var grade_id = req.body.grade_id;
	var grade    = req.body.grade;
	if (grade_id == undefined || grade == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [grade_id, grade];
	sql.query(req, res, sql_mapping.add_grade, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.del_grade = function(req, res, next){
	var grade_id = req.body.grade_id;
	if (grade_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [grade_id];
	sql.query(req, res, sql_mapping.del_grade, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '删除成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.get_grade = function(req, res, next){
	var values = [];
	sql.query(req, res, sql_mapping.get_grade, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {grade : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.add_class = function(req, res, next){
	var class_id = req.body.grade_id;
	var grade    = req.body.grade;
	var cls      = req.body.cls;
	if (class_id == undefined || grade == undefined || cls == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [class_id, grade, cls];
	sql.query(req, res, sql_mapping.add_class, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.del_class = function(req, res, next){
	var class_id = req.body.class_id;
	if (class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [class_id];
	sql.query(req, res, sql_mapping.del_class, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '删除成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.get_class = function(req, res, next){
	var values = [];
	sql.query(req, res, sql_mapping.get_class, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data		   = {cls : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.add_contract = function(req, res, next){
	var id				= req.body.id;
	var account			= req.body.account;
	var password		= req.body.password;
	var protocol_start	= req.body.protocol_start;
	var protocol_end	= req.body.protocol_end;
	var remind_day		= req.body.remind_day;
	var is_tryout		= req.body.is_tryout;
	var is_cooperate	= req.body.is_cooperate;
	if (id == undefined || account == undefined || password == undefined || protocol_start == undefined || protocol_end == undefined || remind_day == undefined || is_tryout == undefined || is_cooperate == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [account, password, protocol_start, protocol_end, remind_day, is_tryout, is_cooperate, id];
	sql.query(req, res, sql_mapping.add_contract, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.del_contract = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_contract, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '删除成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "删除失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.mod_contract = function(req, res, next){
	var id              = req.body.id;
	var account         = req.body.account;
	var password        = req.body.password;
	var status			= req.body.status;
	var protocol_start  = req.body.protocol_start;
	var protocol_end    = req.body.protocol_end;
	var remind_day      = req.body.remind_day;
	var is_tryout       = req.body.is_tryout;
	if (id == undefined || account == undefined || password == undefined || status == undefined || protocol_start == undefined || protocol_end == undefined || remind_day == undefined || is_tryout == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [account, password, status, is_tryout, protocol_start, protocol_end, remind_day, id];
	sql.query(req, res, sql_mapping.mod_contract, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '修改成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.get_contract = function(req, res, next){
	var school	  =  '%' + req.body.school + '%';
	var province  =  '%' + req.body.province + '%';
	var city	  =  '%' + req.body.city + '%';
	var district  =  '%' + req.body.district + '%';
	var values = [province, city, district, school];
	sql.query(req, res, sql_mapping.get_contract, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {cooperate_school : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	})
};


