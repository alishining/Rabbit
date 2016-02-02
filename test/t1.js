
var xlsx = require("node-xlsx");

var list = xlsx.parse('/Users/ShinIng/Downloads/1.xls')[0].data;



for (var i=0;i<list.length;i++)
	if (list.size() != 0)
		console.log(list[i]);

