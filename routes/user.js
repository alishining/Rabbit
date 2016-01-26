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
	tools.sms(num, phone, res);
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
	var values = [phone];
	sql.query(req, res, sql_mapping.login, values, next, function(err, ret){
		try {
			if (ret[0].child != '') {
				var student_id = ret[0].child;
				values = [student_id];
				sql.query(req, res, sql_mapping.get_student_info, values, next, function(err, ret){
					if (ret) {
						var student_info = ret[0];
						result.header.code = "200";
						result.header.msg  = "成功";
						result.data = {student_info};
						res.json(result);
					}
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
	var check_code = req.body.check_code;
	var phone = req.body.uid;
	if (type == undefined || student_id == undefined || check_code == undefined || phone ==undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [student_id];
	sql.query(req, res, sql_mapping.check_student, values, next, function(err, ret){
		try {
			if (ret[0].bind_status == 0 && ret[0].check_code == check_code && student_name == ret[0].student_name) {
				values = [phone, student_id, student_name, ret[0].img];
				sql.query(req, res, sql_mapping.bind_student, values, next, function(err, ret){
					values = [student_id, phone];
					sql.query(req, res, sql_mapping.update_child, values, next, function(err, ret){
						values = [-1, student_id];
						sql.query(req, res, sql_mapping.update_student_status,values,next, function(err, ret){
							if (type == -1){
								values = [phone, student_name+'的家长', '家长', student_id, '0', ''];
								sql.query(req,res,sql_mapping.add_genearch_account,values,next, function(err, ret){
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
							} else {
								result.header.code = "200";
								result.header.msg  = "成功";
								result.data		   = {result : '0',
													  msg    : '绑定成功'};	
								res.json(result);
							}
						})
					})	
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
	if (student_id == undefined || phone ==undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [phone];
	sql.query(req, res, sql_mapping.get_default_child, values, next, function(err, ret){
		try {
			if (ret[0].child != student_id) {
				values = [phone, student_id];
				sql.query(req, res, sql_mapping.unbind_student, values, next, function(err, ret){
					try {
						values = [0, student_id];
						sql.query(req, res, sql_mapping.update_student_status, values, next, function(err,ret){
							result.header.code = "200";
							result.header.msg  = "成功"; 
							result.data        = {result : '0',
												  msg    : '解绑成功'};
							res.json(result);
						});
					} catch(err) {
						result.header.code = "500";
						result.header.msg  = "解绑失败";
						result.data        = {};
						res.json(result); 
					}
				})
			} else {
				result.header.code = "200";
				result.header.msg  = "成功";
				result.data        = {result : '-1',
									  msg    : '默认孩子ID为空'};
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
							student_school	:	ret[i].school,
							student_sex		:	ret[i].sex,
							student_select  :   '1'});
					} else {
						clist.push({ 
						    student_id		:	ret[i].student_id, 
							student_img		:	ret[i].img,
							student_name	:	ret[i].student_name,
							student_school  :	ret[i].school,
							student_sex		:	ret[i].sex,
							student_select	:   '0'});
					}
				}
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data = {img, name, role, phone, major, clist};
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
	var values = [name, role, phone];
	sql.query(req, res, sql_mapping.mod_genearch_info, values, next, function(err, ret){
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
};

exports.select_student = function(req, res, next){
	var phone = req.body.uid;
	var select_student_id = req.body.select_student_id;
	if (phone == undefined || select_student_id == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var values = [select_student_id, phone];
	sql.query(req, res, sql_mapping.update_child, values, next, function(err, ret){
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
			values = [assist_phone, role, role, ret[0].child, phone, ''];
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
					min = Math.round(ret[i].score);
			}
			var delta = Math.round((max - min) / 4 * 10) / 10.0;
			var y = [0];
			if (delta > 0){
				y = [min-delta, min, min+delta, min+2*delta, min+3*delta, min+4*delta];
			} else {
				if (delta == 0)
					y = [min];
			}
			var ret_length = ret.length;
			if (ret_length < 9) {
				for (var i=0;i<9-ret_length;i++)
					ret.push({ds : '', score : -1});
			}
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data = {x : ret, y : y};
			res.json(result);
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
	var values = [ds, student_id];
	var item_list = [];
	try{
		sql.query(req, res, sql_mapping.get_oneday_detail, values, next, function(err, ret){
			for (var i=0;i<ret.length;i++){
				item_list.push({item_id : ret[i].item, 
						score : ret[i].score, 
						level : '0',
						item_name : '身高',
						item_img  : 'http://7xq9cu.com1.z0.glb.clouddn.com/1ad47a02d4ad698c14b4458029274401.jpg'});
			}
			result.header.code = '200';
			result.header.msg  = '成功';
			result.data        = {item_list};
			res.json(result);
		});
	} catch(err) {
		result.header.code = '500';
		result.header.msg  = '获取失败';
		result.data        = {};
		res.json(result);
	}
};

exports.get_calendar = function(req, res, next){
	var date  = new Date(); 
	var year  = date.getFullYear();
	var month = date.getMonth()+1;
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
	var date_month = '%'+ year + '-' + month + '%';
	var values = [student_id, date_month];
	try {
		sql.query(req, res, sql_mapping.rate_total, values, next, function(err, ret){
			for (var i=0;i<ret.length;i++){
				for (var j=0;j<calendar.length;j++)
					if (ret[i].ds == calendar[j].day){
						calendar[j].rate_total = ret[i].count;
						break;
					}
			}
			sql.query(req, res, sql_mapping.rate_finish, values, next, function(err, ret){
				for (var i=0;i<ret.length;i++){
					for (var j=0;j<calendar.length;j++)
						if (ret[i].ds == calendar[j].day){
							calendar[j].rate_finish = ret[i].count;
							break;
						}
				}
				result.header.code = '200';
				result.header.msg  = '成功';
				result.data = {calendar};
				res.json(result);
			});
		});
	} catch(err) {
		result.header.code = '500';
		result.header.msg  = '返回日历失败';
		result.data = {};
		res.json(result);
	}
};

exports.training = function(req, res, next){
	var student_id = req.body.student_id;
	if (student_id == undefined){
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
	console.log(ds);
	var values = [ds, student_id];
	var item_list = [];
	sql.query(req, res, sql_mapping.get_oneday_detail, values, next, function(err, ret){
		var finish = ret.length;
		for (var i=0;i<ret.length;i++){
			if (ret[i].score == ''){
				finish = finish - 1;
				item_list.push({item_id : ret[i].item, 
						sign : '-1', 
						item_img : 'http://7xq9cu.com1.z0.glb.clouddn.com/1ad47a02d4ad698c14b4458029274401.jpg',
						item_name : '身高'});	
			} else {
				item_list.push({item_id : ret[i].item, 
						sign : '0', 
						item_img : 'http://7xq9cu.com1.z0.glb.clouddn.com/1ad47a02d4ad698c14b4458029274401.jpg',
						item_name : '体重'});
			}
		}
		result.header.code = "200";
		result.header.msg  = "成功";
		result.data        = {rate : finish+'/'+ret.length,
							  item_list : item_list};
		res.json(result);
	});
};


exports.record_training_item = function(req, res, next){
	var score = req.body.score;
	var student_id = req.body.student_id; 
	var item = req.body.item;
	var ds = req.body.ds;
	if (score == undefined || student_id == undefined || item == undefined || ds == undefined){
		result.header.code = "400";
		result.header.msg  = "参数不存在";
		result.data        = {};
		res.json(result);
		return;
	}
	var id = encrypt.md5(student_id + item + ds);
	var values = [id];
	sql.query(req, res, sql_mapping.search_record, values, next, function(err, ret){	
		if (ret && ret[0] != undefined) {
			values      = [score, id];
			sql_content = sql_mapping.update_training_item;
		} else {
			values      = [id, student_id, item, score, ds];
			sql_content = sql_mapping.record_training_item;
		}
		sql.query(req, res, sql_content, values, next, function(err, ret){
			if (err){
				result.hearder.code = '500';
				result.hearder.msg  = '记录失败';
				result.data			= {};
				res.json(result);
				return;
			} 
			result.hearder.code = '200';
			result.hearder.msg  = '成功';
			result.data         = {result : '0',
								   msg	  : '记录成功'};
			res.json(result);
		});
	});
};

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
