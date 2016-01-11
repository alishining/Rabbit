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
app.post('/sms', user_route.sms);
app.post('/login', user_route.login);
app.post('/bind_student', user_route.bind_student);
app.post('/unbind_student', user_route.unbind_student);
app.post('/add_assist_account', user_route.add_assist_account);
app.post('/del_assist_account', user_route.del_assist_account);
app.post('/add_major_account', user_route.add_major_account);
app.post('/get_assist_account_list', user_route.get_assist_account_list);
app.post('/mod_genearch_info', user_route.mod_genearch_info);
app.post('/get_genearch_list', user_route.get_genearch_list);
app.post('/get_children_list', user_route.get_children_list);

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
