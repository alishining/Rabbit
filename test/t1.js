

var t = 30000;

delta = 0.3;
for (var i=0;i<100;i++){
	console.log(i+1, t*delta + t);
	t = t*delta + t;
}
