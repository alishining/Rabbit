var express = require('express');
var xlsx = require("node-xlsx");
var multipart = require('connect-multiparty');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var tools = require('../tools/sms');
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
	if (year == undefined || term == undefined || sex == undefined || class_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [sex, class_id, term, year];
	sql.query(req, res, sql_mapping.health_record, values, next, function(err, ret){
		try {
			var health_record_list = [];
			var id_set = new Set();
			for (var i=0;i<ret.length;i++){
				if (!id_set.has(ret[i].student_id)){
					id_set.add(ret[i].student_id);
					health_record_list.push({student_id   : ret[i].student_id,
						   				     student_name : ret[i].student_name,
											 class_id	  : ret[i].class_id,
											 birth		  : ret[i].birth,
											 sex          : ret[i].sex,
											 nationality  : ret[i].nationality,
											 year		  : ret[i].year,
											 term		  : ret[i].term,
											 item_list    : [{item			: ret[i].item, 
															  health_item	: ret[i].health_item, 
															  record		: ret[i].record,
															  unit			: ret[i].unit,
															  score			: ret[i].score, 
															  level			: ret[i].level}]});
				} else {
					for (var j=0;j<health_record_list.length;j++){
						if (health_record_list[j].student_id == ret[i].student_id){
							health_record_list[j].item_list.push({ item			 : ret[i].item,
																   health_item   : ret[i].health_item,
																   record		 : ret[i].record,
																   unit			 : ret[i].unit,
																   score		 : ret[i].score,
																   level		 : ret[i].level});
							break;
						}
					}	
				}
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {health_record_list : health_record_list};
			res.json(result);
		} catch(err) {
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
			if (!tools.sms(num, teacher_phone)){
				result.header.code = "500";
				result.header.msg  = "短信发送失败";
				result.data        = {};
				res.json(result);
				return;
			}
			values = [teacher_phone,num, teacher_name, teacher_phone, school_id, school, class_list, '0', '0'];
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
	console.log(req.body);
	var values = [student_id, '', student_name, sex, nationality, birth, address, school_id, school, class_id, grade, cls, 0, '', student_id, '0'];
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
	console.log(req.body);
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

exports.get_daily_training_rate = function(req, res, next){
	var days	 = req.body.days;
	var class_id = req.body.class_id;
	if (class_id == undefined || days == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [class_id, Number(days)];
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
	var school = req.body.school;
	var school_id = req.body.school_id;
	var tmp_filename = req.files.file_upload.path;
	if (year == undefined || term == undefined || tmp_filename == undefined || school_id == undefined || school == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var list = xlsx.parse(tmp_filename);
	var del_values = [];
	var add_str = [];
	for (var i=0;i<list.length;i++){
		var student_list = list[i].data;
		for (var j=1;j<student_list.length;j++){
			var record_list = student_list[j];
			if (record_list.length != 0){
				console.log(record_list);
				var add_values = [];
				grade = record_list[0];
				class_id = record_list[1];
				cls = record_list[2];
				student_id = record_list[3];
				nationality = record_list[4];
				name = record_list[5];
				sex = record_list[6];
				birth = record_list[7];
				address = record_list[8];
				height = record_list[9];
				weight = record_list[10];
				lung = record_list[11];
				run50 = record_list[12];
				sit_reach = record_list[13];
				jump = record_list[14];
				situp = record_list[15];
				del_values.push(student_id);
				add_values.push(student_id);
				add_values.push(0);	
				add_values.push(name); 
				add_values.push(sex); 
				add_values.push(nationality);
				add_values.push(birth);
				add_values.push(address);
				add_values.push(school_id);
				add_values.push(school);
				add_values.push(class_id);
				add_values.push(grade%10);
				add_values.push(cls);
				add_values.push(0);
				add_values.push('no_pic');
				add_values.push(student_id);
				add_values.push('0');
				add_str.push((add_values));
			}
		}
	}
	var values = [del_values];
	sql.query(req, res, sql_mapping.mov_student, values, next, function(err, ret){
		if (err){
			console.log(err);
		}
		values = [add_str];
		sql.query(req, res, sql_mapping.add_student, values, next, function(err, ret){
			if(err){
				console.log(err);
			}
		});
	});
	result.header.code = "200";
	result.header.msg  = "成功";
	result.data = {result : '0', msg : '上传完毕'};
	res.json(result);
};


