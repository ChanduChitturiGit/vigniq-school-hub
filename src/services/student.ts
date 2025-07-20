//user api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/student/manage_student';

//get students by school id
export const getStudentsBySchoolId = async (schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getStudentsBySchoolId',{params : {school_id : schoolId}});
  return response.data;
}

//add new student or create new student
export const addStudent = async (data : any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/createStudent', data);
  return response.data;
};

//get students by  id
export const getStudentsById = async (id : Number,schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getStudentById',{params : {student_id : id,school_id : schoolId}});
  return response.data;
}
