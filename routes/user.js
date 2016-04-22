var express = require('express');
var multipart = require('connect-multiparty');
var qiniu   = require('qiniu');
var encrypt = require('../tools/encrypt');
var sql = require('../dao/sql_tool');
var sql_mapping = require('../dao/sql_mapping');
var tools = require('../tools/sms');
var tool = require('../tools/load_score_level');

var result = {
	header : {
		code : "200",
		msg  : "成功"
	},
	data : {
	}
}   

exports.sms = function(req, res, next){
	var phone = req.body.phone;
	var num = Math.floor(Math.random()*10000);
	if (num < 10){
		num = '000' + num;
	} else {
		if (num < 100){
			num = '00' + num;
		} else {
			if (num < 1000)
				num = '0' + num;
		}
	}
	if (tools.sms(num, phone, 1)){
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {result : '0', msg : '发送成功', num : num};
		res.json(result);
	} else {
		result.header.code = "404";
		result.header.msg  = "发送失败";
		result.data        = {};
		res.json(result);
	}
};

exports.login = function(req, res, next){
	var phone = req.body.phone;
	if (phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data		   = {};
		res.json(result);
		return;
	}
	var values = [phone];
	sql.query(req, res, sql_mapping.login, values, next, function(err, ret){
		try {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {result : '0', uid : phone, student_id: ret[0].child, msg : '登录成功'};
			res.json(result);
		} catch(err) {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data = {result : '0', uid : phone, student_id: '', msg : '登录成功'};
			res.json(result);
		}
	})
}

exports.index = function(req, res, next){
	var phone = req.body.uid;
	if (phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values	 = [phone];
	var bmi		 = '0';
	var bmi_type = '';
	sql.query(req, res, sql_mapping.login, values, next, function(err, ret){
		try {
			if (ret[0].child != '') {
				var student_id = ret[0].child;
				values = [student_id];
				sql.query(req, res, sql_mapping.get_student_height, values, next, function(err, ret){
					var height = '';
					try{
						height = ret[0].score;
					} catch(err){
						height = '';
					}
					sql.query(req, res, sql_mapping.get_student_weight, values, next, function(err, ret){
						var weight = '';
						try{
							weight = ret[0].score;
						} catch(err){
							weight = '';
						}
						sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
							if (ret) {
								try{
									var student_info = ret[0];
									result.header.code = "200";
									result.header.msg  = "成功";
									if (weight != '' && height!=''){
										bmi = Math.round(weight/((height/100)*(height/100)));
										if (bmi > 19){
											bmi_type = '偏胖';
										} else {
											if (bmi < 16){
												bmi_type = '偏瘦';
											} else {
												bmi_type = '健康';
											}
										}
									}
									result.data = {student_info :
												   {student_id	: student_info.student_id,
												   sex			: student_info.sex,
												   grade		: student_info.grade,
												   img			: student_info.img,
												   student_name : student_info.student_name,
												   height		: height, 
												   weight		: weight, 
												   score		: student_info.score,
												   bmi			: bmi,
												   bmi_type		: bmi_type}};
									res.json(result);
								} catch(err){
									console.log(err);
									result.header.code = "500";
									result.header.msg  = "默认孩子不存在";
									result.data        = {};
									res.json(result);
								}
							} else {
								result.header.code = "500";
								result.header.msg  = "请求失败";
								result.data        = {};
								res.json(result);
							}
						})
					})
				})
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {student_info : {student_id : ''}};
				res.json(result);
			}
		} catch(err) {
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = {student_info : {student_id : ''}};
			res.json(result);
		}
	})
};

exports.bind_student = function(req, res, next){
	var type = req.body.type;
	var student_id = req.body.bind_student_id;
	var student_name = req.body.student_name;
	var phone = req.body.uid;
	if (type == undefined || student_id == undefined || phone ==undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.check_student, values, next, function(err, ret){
		try {
			if (student_name == ret[0].student_name) {
				values = [student_id, phone];
				sql.query(req, res, sql_mapping.bind_student, values, next, function(err, ret){
					if (err){
						result.header.code = "200";
						result.header.msg  = "成功"; 
						result.data        = {result : '-1', msg    : '帐号重复添加'};
						res.json(result);
						return;
					}
					if (type == -1){
						values = [phone, student_name+'家长', '家长', student_id, '0', ''];
						sql.query(req,res,sql_mapping.add_genearch_account,values,next, function(err, ret){
							values = [student_id, phone];
							sql.query(req, res, sql_mapping.update_child, values, next, function(err, ret){
								if (err){
									result.header.code = "200";
									result.header.msg  = "成功"; 
									result.data		   = {result : '-1',
														  msg	 : '帐号重复添加'};
									res.json(result);
									return;
								}
								result.header.code = "200";
								result.header.msg  = "成功";
								result.data        = {result : '0',
													  msg    : '绑定成功'};
								res.json(result);
							})
						})
					} else {
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data		   = {result : '0',
											  msg    : '绑定成功'};	
						res.json(result);
					}
				})
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data		   = {result : '-1',
									  msg    : '学生已绑定或验证码错误或孩子名称错误'};	
				res.json(result);
			}
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "绑定失败";
			result.data        = {};
			res.json(result);
		}
	});
};

exports.unbind_student = function(req, res, next){
	var student_id = req.body.unbind_student_id;
	var phone = req.body.uid;
	if (student_id == undefined || phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [phone];
	sql.query(req, res, sql_mapping.get_default_child, values, next, function(err, ret){
		try {
			var major_default_child = ret[0].child;
			if (major_default_child != student_id) {
				values = [phone, student_id];
				sql.query(req, res, sql_mapping.unbind_student, values, next, function(err, ret){
					values = [major_default_child, student_id];
					sql.query(req, res, sql_mapping.update_default_child, values, next, function(err, ret){
						try {
							result.header.code = "200";
							result.header.msg  = "成功"; 
							result.data        = {result : '0', msg    : '解绑成功'};
							res.json(result);
						} catch(err) {
							result.header.code = "500";
							result.header.msg  = "解绑失败";
							result.data        = {};
							res.json(result); 
						}
					});
				})
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {result : '-1',
									  msg    : '无法删除默认孩子'};
				res.json(result);
			}
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "无法获取默认孩子ID";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.me = function(req, res, next){
	var phone = req.body.uid;
	if (phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [phone];
	sql.query(req, res, sql_mapping.get_genearch_info, values, next, function(err, ret){
		if (ret && ret[0] != undefined) {
			var clist = [];
			var name = ret[0].name;
			var img = ret[0].img;
			var child = ret[0].child;	
			var role  = ret[0].role;
			var major = ret[0].major;
			if (major == '0') {
				values = [phone];
			} else {
				values = [major];
			}
			sql.query(req, res, sql_mapping.get_children_list, values, next, function(err, ret){
				for (var i=0;i<ret.length;i++){	
					if (child == ret[i].student_id) {
						clist.push({ 
							student_id		:	ret[i].student_id, 
							student_img		:   ret[i].img,
							student_name	:	ret[i].student_name,
							student_num     :   ret[i].student_number,
							student_school	:	ret[i].school,
							student_sex		:	ret[i].sex,
							student_select  :   '1'});
					} else {
						clist.push({ 
						    student_id		:	ret[i].student_id, 
							student_img		:	ret[i].img,
							student_name	:	ret[i].student_name,
							student_num     :   ret[i].student_number,
							student_school  :	ret[i].school,
							student_sex		:	ret[i].sex,
							student_select	:   '0'});
					}
				}
				var url = '';
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data = {img, name, role, phone, major, url, clist};
				res.json(result);
			})
		} else {
			result.header.code = "500";
			result.header.msg  = "无法获取家长信息";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.mod_student_number = function(req, res, next){
	var student_id = req.body.change_student_id;
	var student_number = req.body.student_number;
	if (student_id == undefined || student_number == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_number, student_id];
	sql.query(req, res, sql_mapping.mod_student_number, values, next, function(err, ret){
		if (err){
			result.header.code = "500";
			result.header.msg  = "修改失败";
			result.data        = {};
			res.json(result);
			return;
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {msg : '修改成功', result : '0'};
		res.json(result);
		return;
	});
};

exports.mod_genearch_info = function(req, res, next){
	var name = req.body.name;
	var role = req.body.role;
	var phone = req.body.uid;	
	if (phone == undefined || role == undefined || name == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	} 
	var values = [role, phone];
	sql.query(req, res, sql_mapping.mod_genearch_info, values, next, function(err, ret){
		values = [phone];
		sql.query(req, res, sql_mapping.get_default_child, values, next, function(err, ret){
			var child = '';
			try{
				child = ret[0].child;
			} catch(err){
				result.header.code = "500";
				result.header.msg  = "家长称谓修改失败";
				result.data        = {};
				res.json(result);
				return;
			}
			values = [child];
			sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
				try{
					values = [ret[0].student_name + role,phone];
				} catch(err){
					console.log(err);
					values = ['Null', phone];
				}
				sql.query(req, res, sql_mapping.mod_genearch_name, values, next, function(err, ret){
					try {	
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data        = {result : '0',
											  msg    : '修改成功'};
						res.json(result);
					} catch(err){
						result.header.code = "500";
						result.header.msg  = "修改失败";
						result.data        = {};
						res.json(result);
					}
				});
			});
		});
	});
};

exports.select_student = function(req, res, next){
	var phone = req.body.uid;
	var select_student_id = req.body.select_student_id;
	var name = req.body.name;
	if (phone == undefined || select_student_id == undefined || name == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [select_student_id, phone];
	sql.query(req, res, sql_mapping.update_child, values, next, function(err, ret){
		values = [phone];
		sql.query(req, res, sql_mapping.get_genearch_role, values, next, function(err, ret){
			var role = ret[0].role;	
			values = [name+role, phone];
			sql.query(req, res, sql_mapping.mod_genearch_name, values, next, function(err, ret){
				try{
					result.header.code = "200";
					result.header.msg  = "成功";
					result.data        = {result : '0',
										  msg    : '切换成功'};
					res.json(result);	
				} catch(err) {
					result.header.code = "500";
					result.header.msg  = "选中失败";
					result.data        = {};
					res.json(result);
				}
			});
		});
	});
}

exports.get_assist_list = function(req, res, next){
	var phone = req.body.uid;
	if (phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [phone];
	var alist = [];
	sql.query(req, res, sql_mapping.get_assist_list, values, next, function(err, ret){
		for (var i=0;i<ret.length;i++){
			var img			 = ret[i].img; 
			var role		 = ret[i].role;
			var assist_phone = ret[i].assist_phone;
			alist.push({img  : img,
						role : role, 
						assist_phone : assist_phone});
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {alist};
		res.json(result);
	});
};

exports.add_assist_account = function(req, res, next){
	var phone = req.body.uid;
	var assist_phone = req.body.assist_phone;
	var role = req.body.role;
	if (phone == undefined || assist_phone == undefined || role == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [phone];
	sql.query(req, res, sql_mapping.get_default_child, values, next, function(err, ret){
		try {
			var student_id = ret[0].child;
			values = [student_id];
			sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
				var title = role;
				try{
					title = ret[0].student_name +role; 
				} catch(err){
					//
				}
				values = [assist_phone, title, role, student_id, phone, ''];
				sql.query(req, res, sql_mapping.add_genearch_account, values, next, function(err, ret){
					if (err) {
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data        = {result : '-1',
											  msg    : '帐号重复添加'};
						res.json(result);
						return;
					}
					values = [phone, assist_phone, role, ''];
					sql.query(req, res, sql_mapping.bind_assist, values, next, function(err, ret){
						result.header.code = "200";
						result.header.msg  = "成功"; 
						result.data        = {result : '0',
											  msg    : '添加辅助帐号成功'};
						res.json(result);
					})
				});
			});
		} catch(err) {
			result.header.code = "500";
			result.header.msg  = "添加辅助帐号失败";
			result.data        = {};
			res.json(result);
		}
	})
};

exports.del_assist_account = function(req, res, next){
	var assist_phone = req.body.assist_phone;
	if (assist_phone == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [assist_phone];
	sql.query(req, res, sql_mapping.del_genearch_account, values, next, function(err, ret){
		if (err){
			result.header.code = "200";
			result.header.msg  = "成功"; 
			result.data        = { result : '-1',
								   msg    : '删除失败，账号不存在'};
			res.json(result);
			return;
		}
		sql.query(req, res, sql_mapping.unbind_assist, values, next, function(err, ret){
			if (err){
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = { result : '-1',
									   msg    : '删除失败，账号不存在'};
				res.json(result);
				return;
			}
			result.header.code = "200";
			result.header.msg  = "成功";
			result.data        = { result : '0',
								   msg    : '删除成功'};
			res.json(result);
		});
	});
};

exports.get_child_xeight = function(req, res, next){
	var student_id = req.body.student_id; 
	var item = req.body.item;
	if (item == undefined || student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id, item];
	sql.query(req, res, sql_mapping.get_child_xeight, values, next, function(err, ret){
		try {
			var max = 0, min = 10000000; 
			for (var i=0;i<ret.length;i++) {
				if (max < ret[i].score)
					max = Math.round(ret[i].score);
				if (min > ret[i].score)
					min = Math.floor(ret[i].score);
			}
			var delta = Math.round((max - min) / 4 * 10) / 10.0;
			var y = [0];
			if (delta > 0){
				y = [min-delta, min, min+delta, min+2*delta, min+3*delta, min+4*delta];
			} else {
				if (delta == 0)
					y = [min-10, min, min+10, min+20, min+30, min+40];
			}
			values = [item];
			var x = [];
			sql.query(req, res, sql_mapping.get_avg_xeight, values, next, function(err, ret_avg){
				for (var i=0;i<ret_avg.length;i++){
					for (var j=0;j<ret.length;j++){
						if (ret_avg[i].ds == ret[j].ds){
							var avg = Math.round(ret_avg[i].score);
							if (avg < min)
								avg = min;	
							if (avg > max)
								avg = max;
							x.push({ds : ret[j].ds, avg : avg, score : ret[j].score});
						}
					}
				}
				var x_length = x.length;
				if (x_length < 9){
					for (var i=0;i<9-x_length;i++){
						x.push({ds : '', avg : -1, score : -1});
					}
				}
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data = {x : x, y : y};
				res.json(result);
			});
		} catch(err) {
			result.header.code = '500';
			result.header.msg  = '获取孩子身高/体重失败';
			result.data		   = {};
			res.json(result);
		}
	});
};

exports.get_oneday_detail = function(req, res, next){
	var ds = req.body.ds;
	var student_id = req.body.student_id;
	if (ds == undefined || student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var item_list = [];
	try{
		var values = [student_id];
		sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
			var school_id = ret[0].school_id; 
			var class_id = ret[0].class_id;
			values = [school_id, class_id];
			sql.query(req, res, sql_mapping.get_homework, values, next, function(err, ret){
				var homework_list = ret[0].item_list.split(',');
				values = [ds, student_id];
				sql.query(req, res, sql_mapping.get_oneday_detail, values, next, function(err, ret){
					for (var i=0;i<homework_list.length;i++){
						var flag = 0;
						for (var u=0;u<ret.length;u++){
							if (parseInt(homework_list[i].split(':')[0]) == parseInt(ret[u].item)){
								flag = 1;
								item_list.push({item_id : ret[u].item, 
												score   : ret[u].score, 
												level   : ret[u].level});
							}
						}
						if (flag == 0){
							item_list.push({item_id : homework_list[i].split(':')[0],
											score   : '',
											level   : ''});	
						}
					}
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data        = {item_list};
					res.json(result);
				});
			});
		});
	} catch(err) {
		result.header.code = '500';
		result.header.msg  = '获取失败';
		result.data        = {};
		res.json(result);
	}
};

exports.get_calendar = function(req, res, _next){
	var student_id = req.body.student_id;
	var year = req.body.year;
	var month = req.body.month;
	if (student_id == undefined || year == undefined || month == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var date  = new Date(); 	
	var nYear = date.getFullYear();
	var nMonth = date.getMonth()+1;
	if (year == '' || month == ''){
		year  = nYear;
		month = nMonth;
	}
	var next = 1;
	var last = 1;
	if (year == nYear && month == nMonth){
		next = 0;
	}
	if (month < 10)
		month = '0' + month;
	myDate = new Date(year+'-'+month+'-1');
	var day = myDate.getDay();
	var calendar = [];
	for (var i=0;i<day;i++){
		calendar.push({day : '-1', rate_finish : 0, rate_total : 0});
	}
	var days = 0;
	if (month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12)
		days = 31;
	if (month==4 || month==6 || month==9 || month==11)
		days = 30;
	if (month == 2){
		if (year%4 == 0 && year%100 != 0)
			days = 29;
		else
			days = 28;
	}
	for (var i=1;i<=days;i++){
		if (i < 10) i = '0' + i;
		calendar.push({day : year+'-'+month+'-'+i, rate_finish : 0, rate_total : 0});
	}
	for (var i=0;i<42-days-day;i++){
		calendar.push({day : '-1', rate_finish : 0, rate_total : 0});
	}
	var student_id = req.body.student_id;
	if (student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
		try{
			var school_id = ret[0].school_id;
			var class_id = ret[0].class_id;
		}catch(err){
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data		   = {date : year+'年'+month+'月', calendar:calendar, next:next, last:last};
			res.json(result);
			return;
		}
		values = [school_id, class_id];
		sql.query(req, res, sql_mapping.get_homework, values, next, function(err, ret){
			try{
				var item_list = ret[0].item_list.split(',');
			} catch(err){
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data = {date : year+'年'+month+'月', calendar:calendar, next:next, last:last};
				res.json(result);
				return;
			}
			var homework_list = [];
			for (var i=0;i<item_list.length;i++){
				homework_list.push(item_list[i].split(':')[0]);
			}
			var date_month = '%'+ year + '-' + month + '%';
			values = [student_id, homework_list, date_month];
			try {
				for (var j=0;j<calendar.length;j++)
					calendar[j].rate_total = homework_list.length;
				sql.query(req, res, sql_mapping.rate_finish, values, _next, function(err, ret){
					for (var i=0;i<ret.length;i++){
						for (var j=0;j<calendar.length;j++)
							if (ret[i].ds == calendar[j].day){
								calendar[j].rate_finish = ret[i].count;
								break;
							}
					}
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data = {date : year+'年'+month+'月', calendar:calendar, next:next, last:last};
					res.json(result);
				});
			} catch(err) {
				result.header.code = '500';
				result.header.msg  = '返回运动日志失败';
				result.data = {};
				res.json(result);
			}
		});
	});
};

exports.training = function(req, res, next){
	var student_id = req.body.student_id;
	var grade = req.body.grade;
	if (student_id == undefined || grade == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
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
	var used_list = [];
	var unused_list = [];
	var sign = 0;
	var values = [student_id];
	sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
		try{
			var school_id = ret[0].school_id;
			var class_id = ret[0].class_id;	
		}catch(err){
			result.header.code = "500";
			result.header.msg  = "获取作业列表失败";
			result.data        = {};
			res.json(result);
			return;
		}
		values = [school_id, class_id]; 
		sql.query(req, res, sql_mapping.get_homework, values, next, function(err, ret){
			values = [ds, student_id];
			sql.query(req, res, sql_mapping.get_oneday_detail, values, next, function(err, ret_count){
				values = [grade];
				sql.query(req, res, sql_mapping.get_grade_sport_item, values, next, function(err, ret_sport_item){
					var grade_homework_sport_item = ret_sport_item[0].item_list.split(','); 
					try{
						var item_list = ret[0].item_list.split(',');
						var hint = 1;
						for (var i=0;i<grade_homework_sport_item.length;i++){
							var grade_item = parseInt(grade_homework_sport_item[i]);
							sign = 0;	
							for (var j=0;j<item_list.length;j++){
								var homework_item = parseInt(item_list[j].split(':')[0]);
								hint = item_list[j].split(':')[1];
								if (grade_item == homework_item)
									sign = 2;
								for (var u=0;u<ret_count.length;u++){
									var do_item = parseInt(ret_count[u].item);
									if (grade_item == do_item && grade_item == homework_item){
										var count = ret_count[u].score_list.split(',').length;
										used_list.push({item_id : grade_item, count : count, hint : hint + '次'});	
										sign = 1;
									}
								}
							}
							if (sign == 0)
								unused_list.push({item_id : grade_item, count : 0, hint : hint + '次'});
							else if (sign == 2){
								used_list.push({item_id : grade_item, count : 0, hint : hint + '次'});
							}
						}
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data        = {used_list : used_list, unused_list : unused_list, used_title : '运动作业', unused_title : '其他运动'};
						res.json(result);
					} catch(err){
						for (var i=0;i<grade_homework_sport_item.length;i++){
							unused_list.push({item_id : parseInt(grade_homework_sport_item[i]), count : 0, hint : '1次'});
						}
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data        = {used_list : used_list, unused_list : unused_list, used_title : '运动作业', unused_title : '其他运动'};
						res.json(result);
					}
				});
			});
		});
	});
};


exports.record_training_item = function(req, res, next){
	var score = req.body.score;
	var student_id = req.body.student_id; 
	var item = req.body.item;
	var sex = req.body.sex;
	var grade = req.body.grade;
	var ds = req.body.ds;
	if (score == undefined || grade == undefined || student_id == undefined || item == undefined || ds == undefined || sex == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var id = encrypt.md5(student_id + item + ds);
	var date  = new Date();
	var values = [item, ds, student_id];
	sql.query(req, res, sql_mapping.search_record, values, next, function(err, ret_search){	
		var level = tool.get_score_level(item, grade, sex, score).level;
		if (ret_search[0] == undefined) {
			values      = [id, student_id, item, score, level, date.getTime() + ':' + score + ':' + level, '', ds];
			sql_content = sql_mapping.record_training_item;
		} else {
			values      = [score, level, ',' + date.getTime() + ':' + score + ':' + level, item, student_id, ds];
			sql_content = sql_mapping.update_training_item;
		}
		sql.query(req, res, sql_content, values, next, function(err, ret){
			if (err){
				result.header.code = '500';
				result.header.msg  = '记录失败';
				result.data			= {};
				res.json(result);
				return;
			} 
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data         = {result : '0',
								   msg	  : '记录成功'};
			res.json(result);
		});
	});
};

exports.get_history_record = function(req, res, next){
	var student_id = req.body.student_id;
	var item = req.body.item;
	var page = req.body.page;
	if (student_id == undefined || item == undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data        = {};
		res.json(result);
		return;
	}
	var start = page * 20 - 20;
	var end = start + 20; 
	var values = [student_id, item];
	var records = [];
	var history_list = [];
	var ds = '';
	sql.query(req, res, sql_mapping.get_history_record, values, next, function(err, ret){
		for (var i=0;i<ret.length;i++){
			try{
				records = ret[i].score_list.split(',');
				ds = ret[i].ds;
			} catch(err) {
				continue;
			}
			for (var j=records.length-1;j>=0;j--){
				try {
					var time = records[j].split(':')[0];
					var score = records[j].split(':')[1];
					var level = records[j].split(':')[2];
					history_list.push({time : ds, id : time, score : score, level : level});
				} catch(err) {
					//
				}
			}
		}
		var result_list = [];
		for (var i=start;i<end;i++){
			if (history_list[i] != undefined)
				result_list.push(history_list[i]);
		}
		var next = 1;
		if (result_list.length != 20)
			next = 0;
		result.header.code = '200';
		result.header.msg  = '成功';
		result.data        = {history_list : result_list, next : next},
		res.json(result);
	})
};

exports.del_history_record = function(req, res, next){
	var id = req.body.id;
	var score = req.body.score;
	var student_id = req.body.student_id;
	var item = req.body.item;
	var level = req.body.level;
	var ds = req.body.ds;
	if (id == undefined || score == undefined || student_id==undefined || item==undefined || ds==undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [item, ds, student_id];
	sql.query(req, res, sql_mapping.search_record, values, next, function(err, ret){
		try{
			if (ret[0] != undefined){
				var score_list = ret[0].score_list.split(',');
				if (score_list.length == 1){
					values = [student_id, item, ds];
					sql_content = sql_mapping.del_record;
				} else {
					var del_record = id + ':' + score + ':' + level;
					var new_score_list = '';
					var new_score = '';
					for (var i=0;i<score_list.length;i++){
						if (del_record != score_list[i]){
							new_score_list = new_score_list + score_list[i] + ',';
							new_score = score_list[i].split(':')[1];
							new_level = score_list[i].split(':')[2];
						}
					}
					new_score_list = new_score_list.substr(0, new_score_list.length-1);
					values = [new_score, new_level, new_score_list, item, student_id, ds];
					sql_content = sql_mapping.del_history_record;
				}
				sql.query(req, res, sql_content, values, next, function(err, ret){
					if (err){
						result.header.code = '500';
						result.header.msg  = '删除失败';
						result.data         = {};
						res.json(result);
						return;
					}
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data         = {result : '0',
										   msg    : '删除成功'};
					res.json(result);
				});
			} else {
				result.header.code = '500';
				result.header.msg  = '删除失败';
				result.data         = {};
				res.json(result);
				return;
			}
		} catch(err){
			console.log(err);
		}
	});
}

exports.upload_img = function(req, res, next){
	var uid	            = req.body.uid;
	var student_img_id  = req.body.student_img_id;
	var tmp_filename	= req.files.value.path;
	var type			= req.body.type;
	if ((type == 0 && student_img_id == undefined) || uid == undefined || tmp_filename == undefined || type == undefined){ 
		result.header.code = '400'; 
		result.header.msg  = '参数不存在';  
		result.data        = {}; 
		res.json(result); 
		return; 
	} 
	var id = '';
	var sql_content = '';
	if (type == 0){
		id = student_img_id;
		sql_content = sql_mapping.update_student_img;
	}
	if (type == 1){
		id = uid;
		sql_content = sql_mapping.update_genearch_img;
	}
	var date  = new Date(); 
	var key = encrypt.md5(id+date) + '.jpg'; 
	var extra = new qiniu.io.PutExtra(); 
	var putPolicy = new qiniu.rs.PutPolicy('lingpaotiyu'); 
	var uptoken = putPolicy.token(); 
	qiniu.io.putFile(uptoken, key, tmp_filename, extra, function(err, ret) { 
		if (!err) { 
			var file_name = 'http://7xq9cu.com1.z0.glb.clouddn.com/' + key;
			var values = [file_name, id];
			sql.query(req, res, sql_content, values, next, function(err, ret){
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

exports.get_sport_item_resource = function(req, res, next){
	var values = [];
	sql.query(req, res, sql_mapping.get_sport_item_resource, values, next, function(err, ret){	
		if (err){
			result.header.code = '500';
			result.header.msg  = '获取失败';
			result.data			= {};
			res.json(result);
			return;
		} 
		result.header.code = '200';
		result.header.msg  = '成功';
		result.data         = {resource : ret};
		res.json(result);
	});
};

exports.get_oil_table = function(req, res, next){
	var item_id = req.body.item_id;
	var sex = req.body.sex;
	var grade = req.body.grade;
	if (item_id == undefined || sex == undefined || grade == undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data         = {};
		res.json(result);
		return;
	}
	var values = [item_id, sex, grade];
	var oil_list = [];
	var scale = [];
	var delta = 1;
	if (item_id == '0')
		var delta = 0.1;
	if (item_id == '2' || item_id == '7'){
		if (item_id == '2')
			scale = [60,90,120,150,180,210,240];
		else
			scale = [0,20,40,60,80,100,120];
		result.header.code = '200';
		result.header.msg  = '成功';
		result.data         = {scale : scale, color:'#33c8cf', delta : 0.1};
		res.json(result);
	} else {
		if (item_id == '0' || item_id == '9' || item_id == '13' || item_id == '12'){
			sql.query(req, res, sql_mapping.get_oil_table, values, next, function(err, _ret){
				var ret = [];
				if (_ret.length > 0){
					ret.push({record : _ret[0].record, level : _ret[0].level});
					for (var i=0;i<_ret.length;i++){
						if (_ret[i].score == '60' || _ret[i].score == '80' || _ret[i].score == '90'){
							ret.push({record : _ret[i].record, level : _ret[i].level});
						}
					}
					ret.push({record : _ret[_ret.length-1].record, level : _ret[_ret.length-1].level});
				}
				if (err || ret.length < 5) {
					oil_list.push({level:'',		record:0, color:'',		   angle:0});
					oil_list.push({level:'优秀',	record:0, color:'#55b7f6', angle:20});
					oil_list.push({level:'良好',	record:0, color:'#6de58e', angle:30});
					oil_list.push({level:'及格',	record:0, color:'#fccc5e', angle:40});
					oil_list.push({level:'不及格',	record:0, color:'#ff7e78', angle:10});
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data        = {oil_list : oil_list, delta:delta};
					res.json(result);
					return;
				}
				var total = ret[0].record - ret[4].record;
				oil_list.push({level  : '', record : ret[0].record, color  : '', angle  : 0});
				oil_list.push({level  : '优秀', 
							   record : ret[1].record, 
							   color  : '#55b7f6',
							   angle  : (ret[0].record - ret[1].record)*100 / total});
				oil_list.push({level  : '良好',	
							   record : ret[2].record, 
							   color  : '#6de58e', 
							   angle  : (ret[1].record - ret[2].record)*100 / total});
				oil_list.push({level  : '及格', 
							   record : ret[3].record, 
							   color  : '#fccc5e',
							   angle  : (ret[2].record - ret[3].record)*100 / total});
				oil_list.push({level  : '不及格', 
							   record : ret[4].record, 
							   color  : '#ff7e78', 
							   angle  : (ret[3].record - ret[4].record)*100 / total});
				result.header.code  = '200';
				result.header.msg   = '成功';
				result.data         = {oil_list : oil_list, delta: delta};
				res.json(result);
			});
		} else {
			sql.query(req, res, sql_mapping.get_oil_table, values, next, function(err, _ret){
				var ret = [];
				if (_ret.length > 0){
					ret.push({record : _ret[0].record, level : _ret[0].level});
					for (var i=0;i<_ret.length;i++){
						if (_ret[i].score == '60' || _ret[i].score == '80' || _ret[i].score == '90'){
							ret.push({record : _ret[i].record, level : _ret[i].level});
						}
					}
					ret.push({record : _ret[_ret.length-1].record, level : _ret[_ret.length-1].level});
				}
				var delta = 0.1;
				if (item_id == '8' || item_id == '6' || item_id == '3' || item_id == '5')
					delta = 1;
				if (err || ret.length < 5) {
					oil_list.push({level:'',		record:0, color:'',		   angle:0});
					oil_list.push({level:'不及格',	record:0, color:'#ff7e78', angle:10});
					oil_list.push({level:'及格',	record:0, color:'#fccc5e', angle:40});
					oil_list.push({level:'良好',	record:0, color:'#6de58e', angle:30});
					oil_list.push({level:'优秀',	record:0, color:'#55b7f6', angle:20});
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data         = {oil_list : oil_list, delta:delta};
					res.json(result);
					return;
				}
				var total = ret[4].record - ret[0].record;
				oil_list.push({level:'', record:ret[0].record, color:'', angle: 0});
				oil_list.push({level  : '不及格', record : ret[1].record, color  : '#ff7e78', angle  : (ret[1].record - ret[0].record)*100 / total});
				oil_list.push({level  : '及格', record : ret[2].record, color  : '#fccc5e', angle  : (ret[2].record - ret[1].record)*100 / total});
				oil_list.push({level  : '良好', record : ret[3].record, color  : '#6de58e', angle  : (ret[3].record - ret[2].record)*100 / total});
				oil_list.push({level  : '优秀', record : ret[4].record, color  : '#55b7f6', angle  : (ret[4].record - ret[3].record)*100 / total});
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data         = {oil_list : oil_list, delta : delta};
				res.json(result);
			});
		}
	}
};

exports.get_report = function(req, res, _next){
	var student_id = req.body.student_id;
	var page = req.body.page;
	if (student_id == undefined || page == undefined){
		result.header.code = '400';
		result.header.msg  = '参数不存在';
		result.data         = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	var report_list = [];
	var report = [];
	var year = '';
	var term = '';
	var next = 1;
	sql.query(req, res, sql_mapping.get_student_info, values, _next, function(err, ret){
		if (ret.length == 0){
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data         = {result : '-1', msg : '学生信息不存在'};
			res.json(result);
			return;
		}
		var grade = parseInt(ret[0].grade);
		sql.query(req, res, sql_mapping.get_report, values, _next, function(err, ret){
			try{
				for (var i=0;i<ret.length;i++){
					var item = parseInt(ret[i].item_id);
					if (ret[i].year != year || ret[i].term != term){
						if (report.length!=0){
							report_list.push({title : year+'年第'+term+'学期', report : report});
						}
						report = [];	
						year = ret[i].year;
						term = ret[i].term;
						if (((grade == 1 || grade == 2) && (item == -1 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)) || ((grade == 3 || grade == 4) && (item == -1 || item == 5 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)) || ((grade == 5 || grade == 6) && (item == -1 || item == 9 || item == 5 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)))
							report.push({item_id : item, score : ret[i].score, record : ret[i].record, level : ret[i].level});
					} else {
						if (((grade == 1 || grade == 2) && (item == -1 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)) || ((grade == 3 || grade == 4) && (item == -1 || item == 5 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)) || ((grade == 5 || grade == 6) && (item == -1 || item == 9 || item == 5 || item == 0 || item == 2 || item == 7 || item == 6 || item == 4 || item == 8)))
							report.push({item_id : item, score : ret[i].score, record : ret[i].record, level : ret[i].level});
					}
				}
				if (report.length!=0){
					report_list.push({title : year+'年第'+term+'学期', report : report});
				}
				if (page <= report_list.length){	
					if (parseInt(page) == report_list.length)
						next = 0;
					else
						next = 1;
					result.header.code = '200';
					result.header.msg  = '成功';
					result.data         = {report : report_list[page - 1], next : next};
					res.json(result);
				} else {
					result.header.code = '500';
					result.header.msg  = '暂无成绩单';
					result.data         = {};
					res.json(result);
				}
			} catch(err){
				result.header.code = '500';
				result.header.msg  = '获取失败';
				result.data         = {};
				res.json(result);
				console.log(err);
			}
		});
	});
}
