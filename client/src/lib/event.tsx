export function getCategoryInThai(category: String) {
	switch (category) {
		case "UnitOFCurriculumAndSpecialPrograms":
			return "หน่วยกิจกรรมเสริมหลักสูตร และกิจการพิเศษ";
		case "UnitOfActivitiesForCharityAndAcademic":
			return "หน่วยกิจกรรมด้านบำเพ็ญประโยชน์และวิชาการ";
		case "UnitOfActivitiesSupport":
			return "หน่วยกิจกรรมสโมสรนิสิต";
		case "UnitOfCulturalAndSportsActivities":
			return "หน่วยกิจกรรมด้านศิลปวัฒนธรรมและกีฬา";
		case "UnitOfStudentOrganization":
			return "หน่วยส่งเสริมกิจกรรมองค์การนิสิต";
	}
}
