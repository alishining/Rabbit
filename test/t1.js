
var xlsx = require("node-xlsx");

var list = xlsx.parse('/Users/ShinIng/Downloads/1.xls');



for (var i=0;i<list.length;i++){
	var student_list = list[i].data; 
	for (var j=1;j<student_list.length;j++){
		var record_list = student_list[j];
		if (record_list.length != 0){
			grade_id = record_list[0];
			class_id = record_list[1];
			cls = record_list[2];
			student_id = record_list[3];
			nationality = record_list[4];
			name = record_list[5];
			sex = record_list[6];
			brith = record_list[7];
			address = record_list[8];
			height = record_list[9];
			weight = record_list[10];
			lung = record_list[11];
			run50 = record_list[12]; 
			sit_reach = record_list[13];
			jump = record_list[14];
			situp = record_list[15];
			console.log(student_id);
		}
	}
}

