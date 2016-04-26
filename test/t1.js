


var schedule = require("node-schedule");
var date = new Date(2016,4,13,12,26,0);
var j = schedule.scheduleJob(date, function(){
	console.log("执行任务");
});
j.cancel();
