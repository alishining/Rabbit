var express = require('express');
var sql = require('../dao/sql_tool');
var sql_mapping = require('../dao/sql_mapping');
var tools = require('../tools/sms');
var result = require('../tools/result');

exports.sms = function(req, res, next){
	var phone = '18610091662';
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
	var values = ['18610091662']
	sql.query(req, res, sql_mapping.login, values, next, function(ret){
		try {
			if (ret[0].children_list != '') {
				var children_list = ret[0].children_list.split(',');
				var student_id = children_list[1];
				values = [student_id];
				sql.query(req, res, sql_mapping.get_student_info, values, next, function(ret){
					result.succ.msg = ret;
					res.json(result.succ);
				})
			}
		} catch(err) {
			res.json(result.fail);
		}
	})
};

exports.bind_student = function(req, res, next){
	var student_id = '1a32';
	var student_name = 'syf';
	var check_code = 22;
	var phone = '18610091662';
	var values = [student_id];
	sql.query(req, res, sql_mapping.check_student, values, next, function(ret){
		try {
			if (ret[0].bind_status == 0 && ret[0].check_code == check_code && student_name == ret[0].student_name) {
				values = [','+student_id+';'+student_name, phone];
				sql.query(req, res, sql_mapping.bind_student, values, next, function(ret){
					values = [-1, student_id];
					sql.query(req, res, sql_mapping.update_student_status, values, next, function(ret){
						res.json(result.succ);
					});	
				})
			} else {
				res.json(result.fail);
			}
		} catch(err) {
			res.json(result.fail);
		}
	});
};

exports.unbind_student = function(req, res, next){
	var student_id = '1a32';
	var phone = '18610091662';
	var student_name = 'syf';
	var values = [','+student_id+';'+student_name, phone]; 
	sql.query(req, res, sql_mapping.unbind_student, values, next, function(ret){
		try {
			values = [0, student_id];
			sql.query(req, res, sql_mapping.update_student_status, values, next, function(ret){
				if (ret) {
					res.json(result.succ);
				} else {
					res.json(result.fail);
				}
			});
		} catch(err) {
			res.json(result.fail);
		}
	})
};

exports.add_major_account = function(req, res, next){
	var phone = '188';
	var values = [phone, '', '', '', '', ''];
	sql.query(req, res, sql_mapping.add_genearch_account, values, next, function(ret){
		if (ret){
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	});
};

exports.get_genearch_info = function(req, res, next){
	var phone = '';
	var values = [phone];
	sql.query(req, res, sql_mapping, get_genearch_info, values, next, function(ret){
		if (ret && ret[0] != undefined) {
			result.succ.msg = ret;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	})
};

exports.mod_genearch_info = function(req, res, next){
	var name = 'shining';
	var role = 'father';
	var phone = '18610091662';	
	var values = [name, role, phone];
	sql.query(req, res, sql_mapping.mod_genearch_info, values, next, function(ret){
		if (ret) {
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	});
};

exports.add_assist_account = function(req, res, next){
	var phone = '18610091662';
	var assist_phone = '15389286011';
	var role = 'father';
	var values = [phone];
	sql.query(req, res, sql_mapping.get_children_list, values, next, function(ret){
		try {
			values = [assist_phone, '', role, ret[0].children_list, '', phone, ''];
			sql.query(req, res, sql_mapping.add_genearch_account, values, next, function(ret){
				values = [','+assist_phone+';'+role, phone];
				sql.query(req, res, sql_mapping.add_genearch_to_list, values, next, function(ret){
					if (ret)
						res.json(result.succ);
					else
						res.json(result.fail);
				})
			});
		} catch(err) {
			res.json(result.fail);
		}
	})
};

exports.del_assist_account = function(req, res, next){
	var phone = '18610091662';
	var assist_phone = '15389286011';
	var values = [assist_phone];
	var role = 'father';
	sql.query(req, res, sql_mapping.del_genearch_account, values, next, function(ret){
		values = [','+assist_phone+';'+role, phone];
		sql.query(req, res, sql_mapping.del_genearch_to_list, values, next, function(ret){
			if (ret)
				res.json(result.succ);
			else
				res.json(result.fail);
		});
	});
};

exports.get_assist_account_list = function(req, res, next){
	var phone = '18610091662';
	var values = [phone];
	sql.query(req, res, sql_mapping.get_assist_list, values, next, function(ret){
		try{
			result.succ.msg = ret[0].genearch_list;
			res.json(result.succ);
		} catch(err){
			res.json(result.fail);
		}
	});
};

exports.get_child_info = function(req, res, next){
	var student_id = '';
	var values = [student_id];
	sql.query(req, res, sql_mapping.get_student_info, values, next, function(ret){
		if (ret && ret[0] != undefined) {
			result.succ.msg = ret;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	})
};

exports.get_children_list = function(req, res, next){
	var phone = '18610091662';
	var values = [phone];
	sql.query(req, res, sql_mapping.get_children_list, values, next, function(ret){
		if (ret && ret[0] != undefined){
			result.succ.msg = ret[0].children_list;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	})
};

exports.get_child_xeight = function(req, res, next){
	var student_id = '07411040'; 
	var item = '身高';
	var values = [student_id, item];
	sql.query(req, res, sql_mapping.get_child_xeight, values, next, function(ret){
		if (ret) {
			result.succ.msg = ret;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	});
};

exports.is_reach_standard = function(req, res, next){
};

exports.get_daily_detail = function(req, res, next){
	var ds = '2016-01-13';
	var student_id = '07411040';
	var values = [ds, student_id];
	sql.query(req, res, sql_mapping.get_daily_detail, values, next, function(ret){
		if (ret && ret[0] != undefined) {
			result.succ.msg = ret;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		};
	});
};

exports.get_calendar = function(req, res, next){
	var myDate = new Date();
	var year = myDate.getFullYear();
	var month = myDate.getMonth()+1;
	myDate = new Date(year+'-'+month+'-1');
	var day = myDate.getDay();
	res.json(day);
};

exports.get_training_rate = function(req, res, next){
	var year = '';
	var month = '';
	var values = [];
	sql.query(req, res, sql_mapping.get_training_rate, values, next, function(ret){
		if (ret && ret[0] != undefined) {
			result.succ.msg = ret;
			res.json(result.succ);
		} else {
			res.json(result.fail);
		}
	});
};

exports.get_score_list = function(req, res, next){
};

exports.record_training_item = function(req, res, next){
	var student_id = '07411040'; 
	var item = '';
	var ds = '';
	var values = [student_id, item, ds];
	sql.query(req, res, sql_mapping.record_training_item, values, next, function(ret){
		if (ret && ret[0] != undefined)
		res.json(result.succ);
		else
		res.json(result.fail);	
	});
}
