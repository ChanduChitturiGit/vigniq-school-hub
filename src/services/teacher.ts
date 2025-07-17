//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/teacher/manage_teacher';


//get teachers by school id
export const getTeachersBySchoold = async (schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getTeachersBySchoolId',{params : {school_id : schoolId}});
  return response.data;
}


//add new teacher or create new teacher
export const addTeacher = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/addTeacher', data);
  return response.data;
};







