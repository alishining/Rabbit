
var sql = {
	bind_student : 'insert into children_list(student_id, phone) values(?,?)',
	unbind_student : 'delete from children_list where phone=? and student_id=?',
	bind_assist   : 'insert into assist_list(phone, assist_phone, role, img) values(?,?,?,?)',
	unbind_assist : 'delete from assist_list where assist_phone=?',
	update_default_child : 'update genearch_info set child=? where child=?',
	login : 'select child from genearch_info where phone=?',
	get_default_child : 'select child from genearch_info where phone=?',
	rate_total : 'select ds,count(*) as count from training_record WHERE student_id=? and item in (?) and ds like ? group by ds ORDER BY ds ASC',
	rate_finish : 'select ds,count(*) as count from training_record WHERE student_id=? and item in (?) and score!=\'\' and ds like ? group by ds ORDER BY ds ASC',
	get_student_info : 'select student_id, sex, grade, img, student_name, score, school_id, class_id from student_info where student_id=?',
	get_student_height:'select score from training_record where item=2 and student_id=? group by ds desc limit 1',
	get_student_weight:'select score from training_record where item=7 and student_id=? group by ds desc limit 1',
	get_children_list : 'select a.student_id, b.student_number, b.img, b.student_name, b.sex, b.school from children_list a left outer join student_info b on a.student_id=b.student_id WHERE a.phone=? and b.student_id is not null group by student_id',
	mod_student_number : 'update student_info set student_number=? where student_id=?',
	get_genearch_info : 'select * from genearch_info where phone=?',
	check_student : 'select student_name, img from student_info where student_id=?',
	update_child : 'update genearch_info set child=? where phone=?',
	add_genearch_account : 'insert into genearch_info values(?,?,?,?,?,?)',
	del_genearch_account : 'delete from genearch_info where phone=?',
	get_assist_list : 'select * from assist_list where phone=?',
	get_genearch_role : 'select role from genearch_info where phone=?',
	mod_genearch_info : 'update genearch_info set role=? where phone=?',
	mod_genearch_name : 'update genearch_info set name=? where phone=?',
	get_child_xeight : 'select left(ds,7) as ds, sum(score)/count(*) as score from training_record where student_id=? and item=? and score!=\'\' GROUP BY left(ds,7)',
	get_avg_xeight : 'select left(ds,7) as ds, sum(score)/count(*) as score from training_record where item=? and score!=\'\' GROUP BY left(ds,7)',
	record_training_item : 'insert into training_record(id, student_id, item, score, level, score_list, hint, ds) values(?,?,?,?,?,?,?,?)',
	update_training_item : 'update training_record set score=?, level=?, score_list=concat(score_list, ?) where item=? and student_id=? and ds=?',
	get_history_record : 'select ds, score_list from training_record where student_id=? and item=? order by ds desc',
	del_history_record : 'update training_record set score=?, level=?, score_list=?  where item=? and student_id=? and ds=?',
	del_record : 'delete from training_record where student_id=? and item=? and ds=?',
	search_record : 'select * from training_record where item=? and ds=? and student_id=?',
	get_oneday_detail : 'select item, score, level, score_list, hint from training_record where ds=? and student_id=?',
	update_student_img : 'update student_info set img=? where student_id=?',
	update_genearch_img : 'update genearch_info set img=? where phone=?',
	get_sport_item_resource : 'select item_id,icon,unit,nb_icon,name,training_guide from training group by item_id',
	get_oil_table :'select level,record,score from score_level where item_id=? and sex=? and grade=? order by record',
	get_report : 'SELECT distinct score,item_id,record,level,year,term FROM report where student_id=? order by year desc,term desc,item_id asc',
	set_level : 'select * from score_level where item_id=? and grade=? and sex=? order by level',
	//------------------------------------------------------------------
	get_province : 'select distinct province from admin_code',
	get_city : 'select distinct city from admin_code where province=?',
	get_district : 'select adcode, district from admin_code where province=? and city=?',
	add_school : 'insert into school(school, admin_code, province, city, district, account, protocol_start, protocol_end, remind_day, status, is_tryout, is_cooperate, is_delete) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
	del_school : 'update school set is_delete = 1 where id=?',
	mod_school : 'update school set is_cooperate=?, school=? where id=?',
	get_school : 'select id, school, is_cooperate, province, city, district from school where province like ? and city like ? and district like ? and school like ? and is_delete=0',
	add_grade : 'insert into grade values(?,?)',
	del_grade : 'delete from grade where grade_id=?',
	get_grade : 'select * from grade',
	add_class : 'insert into class values(?,?,?)',
	del_class : 'delete from class where class_id=?',
	get_class : 'select * from class',
	
	del_contract : 'update school set is_cooperate=0 where id=?',
	mod_contract : 'update school set status=?, is_tryout=?, protocol_start=?, protocol_end=?, remind_day=? where id=?',
	get_contract : 'select * from school where province like ? and city like ? and district like ? and school like ? and is_cooperate=1 and is_delete=0',
	get_school_num : 'select count(*) as count from school where school=?',
	add_health_item : 'insert into health_item(health_item) values(?)',
	del_health_item : 'delete from health_item where id=?',
	get_health_item : 'select * from health_item',
	add_sport_item : 'insert into training(item_id,name,icon,nb_icon,unit,type,health_item,training_direction,training_guide) values(?,?,?,?,?,?,?,?,?)',
	del_sport_item : 'delete from training where id=?',
	mod_sport_item : 'update training set item_id=?, name=?, icon=?, nb_icon=?, unit=?, type=?, health_item=?, training_direction=?, training_guide=? where id=?',
	get_sport_item : 'select * from training where name like ?',
	add_score_level : 'insert into score_level(item_id, grade, sex, record, score, level, is_dev) values(?,?,?,?,?,?,?)',
	del_score_level : 'delete from score_level where id=?',
	mod_score_level : 'update score_level set item_id=?, grade=?, sex=?, record=?,score=?, level=?, is_dev=? where id=?',
	get_score_level : 'select * from score_level where item_id=?',
	//-------------------------------------------------------------------
	school_login     : 'select teacher_name, school_id, school, password, is_root from school_user where account=?',
	school_area		 : 'select * from school where id = ?',
	add_school_user  : 'insert into school_user(account, password, teacher_name, teacher_phone, school_id, school, class_list, is_root, is_delete,img) values(?,?,?,?,?,?,?,?,?,?)',
	reset_default_password   : 'update school_user set password=123456 where school_id=? and is_root=1',
	mod_password : 'update school_user set password=? where account=?',
	get_user_class : 'select class_list from school_user where account=?',
	get_default_class : 'select class_id from report WHERE year=? and term like ? and school_id = ? group by class_id',
	student_sport_report : 'select a.student_number, a.student_id, a.student_name, a.sex, b.item_id, b.item, b.record, b.score, b.level from student_info a left outer join report b on a.student_id = b.student_id and b.item_id in (?) and a.sex like ? and b.class_id=? and b.year=? and b.term=? and a.school_id=? where a.school_id = b.school_id and a.del = \'0\' and b.student_id is not null order by student_number,item_id',
	sport_item_report_rate : 'select b.item_id, b.item, sum(b.level=\'-1\') as negative, sum(b.level=\'-1\')/count(*)*100 as negative_rate, sum(b.level=\'3\') as three, sum(b.level=\'3\')/count(*)*100 as three_rate, sum(b.level=\'2\') as two, sum(b.level=\'2\')/count(*)*100 as two_rate, sum(b.level=\'1\') as one, sum(b.level=\'1\')/count(*)*100 as one_rate, sum(b.level=\'0\') as zero,sum(b.level=\'0\')/count(*)*100 as zero_rate, count(*) as total from student_info a left outer join report b on a.student_id = b.student_id and b.item_id in (?) and b.year=? and b.class_id like (?) and a.school_id=? and b.term=? where a.school_id = b.school_id and a.del = \'0\' and b.student_id is not null group by item',
	grade_sport_item_rank : 'select b.class_id,sum(b.score)/count(*) as avg,max(cast(b.score as DECIMAL)) as max from student_info a left outer join report b on a.student_id = b.student_id and b.year=? and b.item_id=? and b.class_id like (?) and a.school_id=? where a.school_id = b.school_id and a.del = \'0\' and b.student_id is not null group by b.class_id order by sum(b.score)/count(*) desc',
	class_level_chart : 'select b.level, a.sex, a.student_name from student_info a left outer join report b on a.student_id = b.student_id and b.year=? and b.term=? and b.class_id=? and b.item_id=? and a.school_id=? where a.school_id = b.school_id and a.del = \'0\' and b.student_id is not null',
	health_record : 'select distinct a.student_name, a.student_number, b.class_id, a.sex, a.birth, a.student_id, a.nationality, b.year, b.term, b.health_item, b.item, b.item_id, b.record, b.unit, b.score, b.level from student_info a left outer join report b on a.student_id = b.student_id and a.sex like ? and b.class_id=? and b.term=? and b.year=? and a.school_id=? where a.school_id = b.school_id and a.del = \'0\' and b.student_id is not null order by student_number, item_id',
	check_school_user : 'select account from school_user where account=?',
	del_school_user : 'update school_user set is_delete=\'1\' where id=?',
	mod_school_user : 'update school_user set account=?, teacher_phone=?, teacher_name=?,class_list=? where account=?',
	get_school_user : 'select * from school_user where is_delete=\'0\' and is_root=\'0\' and school_id=?',
	add_student : 'insert into student_info values ?',
	del_student : 'delete from  student_info where student_id = ?',
	mov_student : 'delete from student_info where student_id in (?)',
	mod_del_flag : 'update student_info set del = \'1\' where school_id = ?',
	mod_student : 'update student_info set student_id=?, student_name=?, sex=?, nationality=?, birth=?, address=? where student_id=?',
	get_student : 'select * from student_info where school_id=? and class_id=?',
	search_student : 'SELECT * FROM student_info where school_id = ? and (student_name like ? or student_id like ?) and grade like ? and class like ? and del like ? and del!=1',
	get_daily_training_rate : 'select ds, count(distinct student_id)/(select count(*) from student_info where class_id like ? and school_id=? and del=\'0\') as rate from training_record WHERE student_id in (select student_id from student_info where class_id like ? and school_id=? and del=\'0\') group by ds order by ds desc limit ?',
	add_report : 'insert into report(student_id,sex,school_id,class_id,item_id,item,health_item,record,unit,score,level,year,term) values ?',
	del_report : 'delete from report where year=? and term=? and school_id = ? and class_id like ?',
	del_form_report : 'delete from report where year=? and term=? and school_id = ? and class_id like ? and item_id in (?)',
	score_output : 'select class_number, grade, class_id, class, a.student_id, nationality, student_name, sex, birth, address, item_id, record from (select class_number, student_number, grade, class_id, class, student_id, nationality, student_name, sex, birth, address from student_info where school_id=?) a left outer join (select student_id, item_id, record from report where school_id=? and year=? and term=?) b on a.student_id = b.student_id where b.student_id is not null order by a.class_id, student_number, item_id',
	get_all_student : 'select * from student_info where school_id=? and del like ? and del!=1 order by student_id',
	get_class_list : 'select class_id from student_info where school_id=? and del=0 group by class_id',
	update_class_list : 'update school_user set class_list=? where account=?',
	get_all_score_level : 'select * from score_level order by item_id,grade,sex,level',
	reset_school_user_password : 'update school_user set password=123456 where account=?',
	load_sport_suggestion : 'select * from sport_suggestion',
	get_remind_day : 'select * from school where school=?',
	add_download_log : 'insert into download_list(file_name, year, opt_time, account, file_path) values (?,?,?,?,?)',
	add_upload_log : 'insert into upload_list(year, upload_time, account, file_name, file_path) values (?,?,?,?,?)',
	get_download_list : 'select * from download_list where account=? order by opt_time desc limit 10',
	get_upload_list : 'select * from upload_list where account=? order by upload_time desc limit 10',
	add_free_test : 'update student_info set del=2 where student_id=?',
	del_free_test : 'update student_info set del=0 where student_id=?',
	get_free_test : 'select * from student_info a left outer join free_test b on a.student_id = b.student_id where del=2 and a.school_id=? and grade like ? and class like ?',
	add_free_test_reason : 'insert into free_test(student_id, free_reason) values (?,?)',
	//-------------------------------------------------------------------
	pad_login : 'select * from school_user where account=? and is_delete=\'0\'',
	get_account_class_list : 'select class_list from school_user where account=?',
	get_class_student : 'select a.class_id as class_id, a.student_id as id, a.student_number as num, a.student_name as name, a.sex as sex, case when b.avg IS NULL then \'\' else b.avg  end as avg, a.del from student_info a left outer join (select student_id, GROUP_CONCAT(avg) as avg from (select student_id, CONCAT(item, \':\', sum(cast(score as DECIMAL(9,2)))/count(*)) as avg from training_record where ds like ? group by student_id, item) a group by student_id) b on a.student_id = b.student_id where a.class_id in (?) and school_id=? and del!=1 order by num',
	pad_teacher_info : 'select teacher_name, img from school_user where account=? and is_delete=\'0\'',
	add_test_report : 'insert into test_list(account, title, school_id, item_id, class_id, rate, create_time, update_time, is_submit,year,term) values (?,?,?,?,?,?,?,?,?,?,?)',
	add_student_test : 'insert into student_test(tid, student_id, del, student_number, student_name, sex, record, score, level) values ?',
	del_student_test : 'delete from student_test where student_id in (?) and tid=?',
	mov_student_test : 'delete from student_test where tid in (?)',
	update_test_report : 'update test_list set rate=?, update_time=?, is_submit=1  where id=?',
	get_test_report : 'select * from test_list where account=? and year = ? and term = ?',
	del_test_report : 'DELETE FROM TEST_LIST WHERE id in (?)',
	add_homework : 'insert into homework(school_id, class_id, item_list) values ?',
	get_homework : 'select * from homework where school_id = ? and class_id = ?',
	get_homework_rate : 'select b.item, sum(length(score_list)-length(replace(score_list,\',\',\'\'))+1) as count from student_info a left outer join training_record b on a.student_id = b.student_id where b.student_id is not null and a.class_id=? and a.school_id=? and b.ds=? and a.del=\'0\' GROUP BY b.item',
	count_student : 'select count(distinct student_id) as total from student_info where class_id=? and school_id=? and del=\'0\'',
	update_homework : 'update homework set item_list = ? where school_id = ? and class_id = ?',
	del_homework : 'delete from homework where school_id = ? and class_id in (?)',
	mov_homework : 'delete from homework where school_id = ? and class_id = ?',
	get_detail_homework : 'select student_name, student_number, sex, score_list from student_info a left outer join training_record b on a.student_id = b.student_id and b.item=? and ds=? where a.school_id=? and a.class_id=? and a.del=\'0\'',
	get_form : 'select * from current_form WHERE school_id=? and class_id=? order by item_id, num',
	get_history_form : 'select * from form WHERE school_id=? and class_id=? and tid = ?',
	get_form_list : 'select id,class_id,title,time,teacher from form_list where school_id=? and class_id=? and major=\'0\'',
	get_current_form : 'SELECT * FROM current_form WHERE school_id =? and class_id=? and item_id=?',
	del_current_form : 'delete from current_form where class_id = ? and school_id = ? and item_id in (?)',
	add_current_form : 'insert into current_form(student_id, del, num, name, sex, school_id, class_id, item_id, record, score, level) values ?',
	add_form_list : 'insert into form_list(school_id, class_id, title, teacher, time, major) values(?,?,?,?,?,?)',
	add_history_form : 'insert into form(tid, student_id, del, num, name, sex, school_id, class_id, item_id, record, score, level) values ?',
	get_test_detail : 'select * from student_test where tid = ?',
	update_teacher_img : 'update school_user set img=? where account=?',
	get_form_title : 'select * from form_list where major =\'1\' and school_id =? and class_id =? order by id desc limit 1',
	get_form_title_from_tid : 'select * from form_list where id = ?',
	//-------------------------------------------------------------------
	load_score_level : 'select * from score_level order by item_id, grade, sex, record',
	get_grade_sport_item : 'select item_list from sport_item where grade in (?) and type=0',
	update_all_school_grade : 'update student_info set grade=grade+1, class_id=class_id + 100',
	jump_addition : 'select record from score_level where item_id=\'8\' and sex=? and grade=? and score=\'100\'',
	update_total_score : 'update report set record=?, score=? where year=? and term=? and class_id=? and school_id=? and student_id = ? and item_id=16',
	update_bmi : 'update report set record=?, score=?, level=? where year=? and term=? and class_id=? and school_id=? and student_id = ? and item_id=-1',
	get_download_detail : 'select a.class_id, case when b.count is null then 0 else b.count end as count from (select class_id  from student_info where del=0  and school_id=? group by class_id)a left outer join (select class_id, count(*) as count from report WHERE school_id=?  and year=? and term=? and (record!=\'\' and record!=0)GROUP BY class_id) b on a.class_id = b.class_id order by class_id'
};

module.exports = sql;
