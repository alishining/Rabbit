var express = require('express');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var user_route = require('./routes/user');

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
app.post('/upload_img', user_route.upload_img);						 //上传头像

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
