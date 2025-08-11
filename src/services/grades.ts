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


//get grades by chapter
export const getGradeByChapter = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getChaptersProgressBySubject',{params : {...data}});
  return response.data;
}
