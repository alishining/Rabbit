
var sql = {
	login : 'select children_list from genearch_info where phone=?',
	get_student_info : 'select * from student_info where student_id=?',
	check_student : 'select student_name, check_code, bind_status from student_info where student_id=?',
	update_student_status : 'update student_info set bind_status = ? where student_id=?',
	bind_student : 'update genearch_info set children_list = concat(children_list, ?) where phone=?',
	unbind_student : 'update genearch_info set children_list = replace(children_list, ?, \'\') where phone=?',
	add_genearch_account : 'insert into genearch_info values(?,?,?,?,?,?,?)',
	del_genearch_account : 'delete from genearch_info where phone=?',
	get_children_list : 'select children_list from genearch_info where phone=?',
	get_assist_list : 'select genearch_list from genearch_info where phone=?',
	get_genearch_list : 'select role, phone, img from genearch_info where children_list like ?',
	get_class_student : 'select student_id,  student_name, student_number,img from student_info where school=? and class=?',
	add_genearch_to_list : 'update genearch_info set genearch_list = concat(genearch_list, ?) where phone=?',
	del_genearch_to_list : 'update genearch_info set genearch_list = replace(genearch_list, ?, \'\') where phone=?',
	mod_genearch_info : 'update genearch_info set name=?, role=? where phone=?',
};

module.exports = sql;
