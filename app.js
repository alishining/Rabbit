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

var app = express();

app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
app.post('/score_input', school_web_route.score_input);
app.post('/add_student', school_web_route.add_student);
app.post('/del_student', school_web_route.del_student);
app.post('/mod_student', school_web_route.mod_student);
app.post('/get_student', school_web_route.get_student);

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
