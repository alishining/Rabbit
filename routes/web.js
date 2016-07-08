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

exports.reset_default_password = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [parseInt(id)];
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
	var contract = req.body.contract;
	var start_time = req.body.start_time;
	var end_time = req.body.end_time;
	var fee_status = req.body.fee_status;
	var proxy = req.body.proxy;
	var manager = req.body.manager;
	var ipad = req.body.ipad;
	var school_addr = req.body.school_addr;
	var school_contact = req.body.school_contact;
	var phone = req.body.phone;
	console.log(req.body);
	if (province == undefined || city == undefined || district == undefined || school == undefined || is_cooperate == undefined || contract == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [school];
	sql.query(req, res, sql_mapping.get_school_num, values, next, function(err, ret){
		var num = ret[0].count; 
		if (num == 0)
			num = '';
		var school_account = school+num;
		values = [school,'',province,city,district,school_account,start_time,end_time,0,0,'',is_cooperate,'0', contract, manager, fee_status, '0', proxy, ipad, school_addr, school_contact, phone];
		try {
			sql.query(req, res, sql_mapping.add_school, values, next, function(err, ret){
				values = [school_account, '123456', '', '', ret.insertId, school, '', '1', '0', ''];
				sql.query(req, res, sql_mapping.add_school_user, values, next, function(err, ret){
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
			})
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
	var fee_status   = req.body.fee_status;
	var contract	 = req.body.contract;
	var start_time   = req.body.start_time;
	var end_time	 = req.body.end_time;
	var ipad = req.body.ipad;
	var school_addr = req.body.school_addr;
	var school_contact = req.body.school_contact;
	var phone = req.body.phone;
	if (school == undefined || is_cooperate == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [fee_status, contract, start_time, end_time, ipad, school_addr, school_contact, phone, id];
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
	var class_id = req.body.class_id;
	var grade    = req.body.grade;
	var cls      = req.body.cls;
	if (class_id == undefined || grade == undefined || cls == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [class_id, cls, grade];
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
	var status			= req.body.status;
	var protocol_start  = req.body.protocol_start;
	var protocol_end    = req.body.protocol_end;
	var remind_day      = req.body.remind_day;
	var is_tryout       = req.body.is_tryout;
	if (id == undefined || status == undefined || protocol_start == undefined || protocol_end == undefined || remind_day == undefined || is_tryout == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [status, is_tryout, protocol_start, protocol_end, remind_day, id];
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

exports.add_health_item = function(req, res, next){
	var health_item = req.body.health_item;
	if (health_item == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [health_item];
	sql.query(req, res, sql_mapping.add_health_item, values, next, function(err, ret){
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

exports.del_health_item = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_health_item, values, next, function(err, ret){
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

exports.get_health_item = function(req, res, next){
	var values = [];
	sql.query(req, res, sql_mapping.get_health_item, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {health_item : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.add_sport_item = function(req, res, next){
	var item_id = req.body.item_id;
	var name = req.body.name;
	var icon = req.body.icon;
	var nb_icon = req.body.nb_icon;
	var unit = req.body.unit;
	var type = req.body.type;
	var health_item = req.body.health_item;
	var training_direction = req.body.training_direction;
	var training_guide = req.body.training_guide;
	if (item_id == undefined || name == undefined || icon == undefined || nb_icon == undefined || unit == undefined || type == undefined || health_item == undefined || training_direction == undefined || training_guide == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item_id,name,icon,nb_icon,unit,type,health_item,training_direction,training_guide];
	sql.query(req, res, sql_mapping.add_sport_item, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.del_sport_item = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_sport_item, values, next, function(err, ret){
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
	});
};

exports.mod_sport_item = function(req, res, next){
	var item_id = req.body.item_id;
	var name = req.body.name;
	var icon = req.body.icon;
	var nb_icon = req.body.nb_icon;
	var unit = req.body.unit;
	var type = req.body.type;
	var health_item = req.body.health_item;
	var training_direction = req.body.training_direction;
	var training_guide = req.body.training_guide;
	var id = req.body.id;
	if (item_id == undefined || name == undefined || icon == undefined || nb_icon == undefined || unit == undefined || type == undefined || health_item == undefined || training_direction == undefined || training_guide == undefined || id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item_id,name,icon,nb_icon,unit,type,health_item,training_direction,training_guide, id];
	sql.query(req, res, sql_mapping.mod_sport_item, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {result : '0',  msg : '修改成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.get_sport_item = function(req, res, next){
	var item_name = '%' + req.body.item_name + '%';
	if (item_name == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [item_name];
	sql.query(req, res, sql_mapping.get_sport_item, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {sport_item : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.add_score_level = function(req, res, next){
	var item_id = req.body.item_id;
	var grade   = req.body.grade;
	var sex     = req.body.sex;
	var record  = req.body.record;
	var score   = req.body.score;
	var level   = req.body.level;
	var is_dev  = req.body.is_dev;
	if (item_id == undefined || grade == undefined || sex == undefined || record == undefined || score == undefined || level == undefined || is_dev == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item_id, grade, sex, record, score, level, is_dev];
	sql.query(req, res, sql_mapping.add_score_level, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.del_score_level = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.del_score_level, values, next, function(err, ret){
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
	});
};

exports.mod_score_level = function(req, res, next){
	var item_id = req.body.item_id;
	var grade   = req.body.grade;
	var sex     = req.body.sex;
	var record  = req.body.record;
	var score   = req.body.score;
	var level   = req.body.level;
	var is_dev  = req.body.is_dev;
	var id		= req.body.id; 
	if (item_id == undefined || grade == undefined || sex == undefined || record == undefined || score == undefined || level == undefined || id == undefined || is_dev == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item_id, grade, sex, record, score, level, is_dev, id];
	sql.query(req, res, sql_mapping.mod_score_level, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {result : '0',  msg : '修改成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.get_score_level = function(req, res, next){
	var item_id = req.body.item_id;
	if (item_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item_id];
	sql.query(req, res, sql_mapping.get_score_level, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {score_level : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

//--------------------------------------

exports.add_proxy = function(req, res, next){
	var name = req.body.name;
	var province = req.body.province;
	var city = req.body.city;
	var district = req.body.district;
	var addr = req.body.addr;
	var owner = req.body.owner;
	var phone = req.body.phone;
	if (name == undefined || addr == undefined || province == undefined || city == undefined || district == undefined || owner == undefined || phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = ['', name, province, city, district, addr, owner, phone, 0];
	sql.query(req, res, sql_mapping.add_proxy, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.get_proxy = function(req, res, next){
	var id = req.body.id;
	if (id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
	    result.data        = {};
		res.json(result);
		return;
	}
	var values = [id];
	sql.query(req, res, sql_mapping.get_proxy, values, next, function(err, ret){
		values = [id];
		sql.query(req, res, sql_mapping.get_school_from_proxy, values, next, function(err, ret1){
			values = [id];
			sql.query(req, res, sql_mapping.get_manager, values, next, function(err, ret2){
				try {
					result.header.code = "200";
					result.header.msg  = "成功"; 
					result.data = {manager : ret2, school : ret1, info : ret};
					res.json(result);
				} catch(err) {
					result.header.code = "500";
					result.header.msg  = "查询失败";
					result.data        = {};
					res.json(result);
				}
			})
		})
	});
};

exports.get_proxy_list = function(req, res, next){
	var province = '%' + req.body.province + '%';
	var city = '%' + req.body.city + '%';
	var district = '%' + req.body.district + '%';
	var values = [province, city, district];
	sql.query(req, res, sql_mapping.get_proxy_list, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {proxy_list : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.add_manager = function(req, res, next){
	var name = req.body.name;
	var sex = req.body.sex;
	var proxy = req.body.proxy;
	var phone = req.body.phone;
	if (name == undefined || phone == undefined || sex == undefined || proxy == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [name, sex, phone, proxy];
	sql.query(req, res, sql_mapping.add_manager, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : '0',  msg : '添加成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.get_manager = function(req, res, next){
	var proxy = req.body.proxy;
	if (proxy == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [proxy];
	sql.query(req, res, sql_mapping.get_manager, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {manager : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.mod_manager = function(req, res, next){
	var id = req.body.id;
	var name = req.body.name;
	var phone = req.body.phone;
	if (name == undefined || phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [name, phone, id];
	console.log(req.body);
	sql.query(req, res, sql_mapping.mod_manager, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : 0, msg : '编辑成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "编辑失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.mod_proxy = function(req, res, next){
	var id = req.body.id;
	var owner = req.body.owner;
	var phone = req.body.phone;
	if (owner == undefined || phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [owner, phone, id];
	sql.query(req, res, sql_mapping.mod_proxy, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : 0, msg : '编辑成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "编辑失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.trans_work = function(req, res, next){
	var manager_out = req.body.manager_out;
	var manager_in = req.body.manager_in;
	if (manager_out == undefined || manager_in == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [manager_in, manager_out];
	sql.query(req, res, sql_mapping.trans_work, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {result : 0, msg : '交接成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "交接失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.search_school = function(req, res, next){
	var key = req.body.key;
	if (key == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = ['%' + key + '%'];
	sql.query(req, res, sql_mapping.search_school, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {manager : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.search_proxy = function(req, res, next){
	var key = req.body.key;
	if (key == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = ['%' + key + '%'];
	sql.query(req, res, sql_mapping.search_proxy, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data = {manager : ret};
			res.json(result);
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "查询失败";
			result.data        = {};
			res.json(result);
		}
	});
}
