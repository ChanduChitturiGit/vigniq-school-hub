//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/syllabus/manage_syllabus';


//get grades by teacher id
export const getGradeByTeacherId = async (schoolId : Number,teacherId : Number) => {
  const response = await api.get(baseurl+suburl+'/getGradeByTeacherId',{params : {school_id : schoolId,teacher_id : teacherId}});
  return response.data;
}


//get chapter wise data with topics data.
export const getGradeByChapter = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getChaptersTopicsBySubject',{params : {...data}});
  return response.data;
}

//get lesson plan data with topics data.
export const getLessonPlanData = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getLessionPlan',{params : {...data}});
  return response.data;
}

//get lesson plan data with topics data.
export const getPrerequisitesData = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getPrerequisites',{params : {...data}});
  return response.data;
}

