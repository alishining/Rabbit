
var sql = {
	bind_student : 'insert into children_list(phone, student_id, name, img) values(?,?,?,?)',
	unbind_student : 'delete from children_list where phone=? and student_id=?',
	bind_assist   : 'insert into assist_list(phone, assist_phone, role, img) values(?,?,?,?)',
	unbind_assist : 'delete from assist_list where assist_phone=?',
	login : 'select child from genearch_info where phone=?',
	get_default_child : 'select child from genearch_info where phone=?',
	rate_total : 'select ds,count(*) as count from training_record WHERE student_id=? and ds like ? group by ds ORDER BY ds ASC',
	rate_finish : 'select ds,count(*) as count from training_record WHERE student_id=? and score!=\'\' and ds like ? group by ds ORDER BY ds ASC',
	get_student_info : 'select student_id, img, student_name, height, weight, bmi, bmi_type, score from student_info where student_id=?',
	get_children_list : 'select a.student_id, b.img, b.student_name, b.sex, b.school from children_list a left outer join student_info b on a.student_id=b.student_id WHERE b.student_id is not null group by student_id',
	get_genearch_info : 'select * from genearch_info where phone=?',
	check_student : 'select student_name, check_code, bind_status, img from student_info where student_id=?',
	update_student_status : 'update student_info set bind_status = ? where student_id=?',
	update_child : 'update genearch_info set child=? where phone=?',
	add_genearch_account : 'insert into genearch_info values(?,?,?,?,?,?)',
	del_genearch_account : 'delete from genearch_info where phone=?',
	get_assist_list : 'select * from assist_list where phone=?',
	mod_genearch_info : 'update genearch_info set name=?, role=? where phone=?',
	get_child_xeight : 'select score, ds from training_record where student_id=? and item=?',
	record_training_item : 'insert into training_record(id, student_id, item, score, ds) values(?,?,?,?,?)',
	update_training_item : 'update training_record set score=? where id=?',
	search_record : 'select id from training_record where id = ?',
	get_oneday_detail : 'select item, score from training_record where ds=? and student_id=?'
};

module.exports = sql;
