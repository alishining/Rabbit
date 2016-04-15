exports.get_current_time = function(){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1; 
	var day = date.getDate(); 
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if (hours < 10) 
		hours = '0'+hours;
	if (minutes < 10)
		minutes = '0'+minutes;
	if (seconds < 10)
		seconds = '0'+seconds;
	if (day < 10)
		day = '0' + day;
	if (month < 10)
	   month = '0' + month;	
	var current_time = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes+ ':' + seconds; 
	return current_time;
};

