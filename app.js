var express = require('express');
var multipart = require('connect-multiparty');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var user_route = require('./routes/user');
var web_route = require('./routes/web');
var school_web_route = require('./routes/school_web');
var pad_route = require('./routes/pad');
var tools = require('./tools/load_score_level');
var app = express();
var schedule = require("node-schedule");
var pool = require('./dao/sql_pool').mysql_pool();
var sql_mapping = require('./dao/sql_mapping');

app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var rule = new schedule.RecurrenceRule();
rule.minute = 40;
var j = schedule.scheduleJob(rule, function(){
	var date = new Date();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	if (month == 8 && day == 1){
		pool.getConnection(function(err, connection) {
			var values = [];
			connection.query(sql_mapping.update_all_school_grade, values, function(err, ret){
				connection.release();
			});
		})
	}
});

global.unitMap = new Map();
tools.load_unit_map();

global.scoreMap = new Map();
tools.load_score_level(undefined, undefined, undefined);

global.suggestionMap = new Map();
tools.load_sport_suggestion();

//RESET SCOREMAP
app.post('/update_score_map', tools.load_score_level);
//User routes
app.post('/sms', user_route.sms);								//短信接口
app.post('/login', user_route.login);							//登录接口
app.post('/index', user_route.index);							//首页信息
app.post('/bind_student', user_route.bind_student);				//绑定学生接口
app.post('/unbind_student', user_route.unbind_student);			//解绑学生接口
app.post('/mod_genearch_info', user_route.mod_genearch_info);	//更新家长信息
app.post('/add_assist_account', user_route.add_assist_account);	//添加辅助帐号
app.post('/del_assist_account', user_route.del_assist_account);	//删除辅助帐号
app.post('/get_child_xeight', user_route.get_child_xeight);		//获取孩子历史身高或体重
app.post('/get_oneday_detail', user_route.get_oneday_detail);	//获取某日的训练详情
app.post('/get_calendar', user_route.get_calendar);				//获取某月的日历及训练进度
app.post('/training', user_route.training);						//训练页面
app.post('/record_training_item', user_route.record_training_item);  //记录训练结果
app.post('/me', user_route.me);										 //我的接口
app.post('/get_assist_list', user_route.get_assist_list);			 //辅助帐号列表
app.post('/select_student', user_route.select_student);				 //选择默认孩子	
var multipartMiddleware = multipart();
app.post('/upload_img', multipartMiddleware, user_route.upload_img); //上传头像
app.post('/get_sport_item_resource', user_route.get_sport_item_resource);  //获取运动项目资源
app.post('/get_oil_table', user_route.get_oil_table);					   //返回油表数据
app.post('/get_history_record', user_route.get_history_record);
app.post('/del_history_record', user_route.del_history_record);
app.post('/get_report', user_route.get_report);
app.post('/mod_student_number', user_route.mod_student_number);
//------------------------------------------------------------------
app.post('/reset_default_password', web_route.reset_default_password);
app.post('/get_province', web_route.get_province);
app.post('/get_city', web_route.get_city);
app.post('/get_district', web_route.get_district);

app.post('/add_school', web_route.add_school);
app.post('/del_school', web_route.del_school);
app.post('/mod_school', web_route.mod_school);
app.post('/get_school', web_route.get_school);

app.post('/add_grade', web_route.add_grade);
app.post('/del_grade', web_route.del_grade);
app.post('/get_grade', web_route.get_grade);

app.post('/add_class', web_route.add_class);
app.post('/del_class', web_route.del_class);
app.post('/get_class', web_route.get_class);

app.post('/del_contract', web_route.del_contract);
app.post('/mod_contract', web_route.mod_contract);
app.post('/get_contract', web_route.get_contract);

app.post('/add_health_item', web_route.add_health_item);
app.post('/del_health_item', web_route.del_health_item);
app.post('/get_health_item', web_route.get_health_item);

app.post('/add_sport_item', web_route.add_sport_item);
app.post('/del_sport_item', web_route.del_sport_item);
app.post('/mod_sport_item', web_route.mod_sport_item);
app.post('/get_sport_item', web_route.get_sport_item);

app.post('/add_score_level', web_route.add_score_level);
app.post('/del_score_level', web_route.del_score_level);
app.post('/mod_score_level', web_route.mod_score_level);
app.post('/get_score_level', web_route.get_score_level);

app.post('/add_proxy', web_route.add_proxy);
app.post('/get_proxy_list', web_route.get_proxy_list);
app.post('/get_proxy', web_route.get_proxy);
app.post('/add_manager', web_route.add_manager);
app.post('/get_manager', web_route.get_manager);
app.post('/mod_manager', web_route.mod_manager);
app.post('/del_manager', web_route.del_manager);
app.post('/mov_manager', web_route.mov_manager);
app.post('/mod_proxy', web_route.mod_proxy);
app.post('/trans_work', web_route.trans_work);
app.post('/search_school', web_route.search_school);
app.post('/search_proxy', web_route.search_proxy);
app.post('/admin_login', web_route.admin_login);
app.post('/upload_resource', multipartMiddleware, web_route.upload_resource);
app.post('/resource_publish', web_route.resource_publish);
app.post('/update_resource', web_route.update_resource);
app.post('/update_feedback', web_route.update_feedback);
app.post('/get_publish_history', web_route.get_publish_history);
//------------------------------------------------------------------
app.post('/school_login', school_web_route.school_login);
app.post('/get_user_class', school_web_route.get_user_class);
app.post('/student_sport_report', school_web_route.student_sport_report);
app.post('/sport_item_report_rate', school_web_route.sport_item_report_rate);
app.post('/grade_sport_item_rank', school_web_route.grade_sport_item_rank);
app.post('/class_level_chart', school_web_route.class_level_chart);
app.post('/health_record', school_web_route.health_record);

app.post('/add_teacher', school_web_route.add_teacher);
app.post('/del_teacher', school_web_route.del_teacher);
app.post('/mod_teacher', school_web_route.mod_teacher);
app.post('/get_teacher', school_web_route.get_teacher);
app.post('/score_input', multipartMiddleware, school_web_route.score_input);
app.post('/add_student', school_web_route.add_student);
app.post('/del_student', school_web_route.del_student);
app.post('/mod_student', school_web_route.mod_student);
app.post('/get_student', school_web_route.get_student);
app.post('/search_student', school_web_route.search_student);
app.post('/get_daily_training_rate', school_web_route.get_daily_training_rate);
app.post('/score_output', school_web_route.score_output);
app.post('/mod_password', school_web_route.mod_password);
app.post('/get_all_student', school_web_route.get_all_student);
app.post('/reset_school_user_password', school_web_route.reset_school_user_password);
app.post('/get_remind_day', school_web_route.get_remind_day);
app.post('/get_default_class', school_web_route.get_default_class);
app.post('/get_download_list', school_web_route.get_download_list);
app.post('/get_upload_list', school_web_route.get_upload_list);
app.post('/get_download_detail', school_web_route.get_download_detail);

app.post('/add_free_test', school_web_route.add_free_test);
app.post('/del_free_test', school_web_route.del_free_test);
app.post('/get_free_test', school_web_route.get_free_test);
//------------------------------------------------------------------
app.post('/get_book_list', pad_route.get_book_list);
app.post('/pad_login', pad_route.pad_login);
app.post('/pad_init', pad_route.pad_init);
app.post('/pad_teacher_info', pad_route.pad_teacher_info);
app.post('/submit_report_forms', pad_route.submit_report_forms);
app.post('/get_test_report', pad_route.get_test_report);
app.post('/del_test_report', pad_route.del_test_report);
app.post('/get_test_detail', pad_route.get_test_detail);
app.post('/add_homework', pad_route.add_homework);
app.post('/mod_homework', pad_route.mod_homework);
app.post('/get_homework', pad_route.get_homework);
app.post('/detail_homework', pad_route.detail_homework);
app.post('/get_form', pad_route.get_form);
app.post('/get_history_form', pad_route.get_history_form);
app.post('/submit_to_school', pad_route.submit_to_school);
app.post('/get_form_list', pad_route.get_form_list);
app.post('/update_teacher_img', multipartMiddleware, pad_route.update_teacher_img);
app.post('/get_grade_sport_item', pad_route.get_grade_sport_item);
app.post('/save_test_report', pad_route.save_test_report);
app.post('/get_static_level', pad_route.get_static_level);

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		console.log(err.message);
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	console.log(err.message);
});


var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
}).on('error', function(err){
	console.log("SERVER ERROR:", err);
});;
