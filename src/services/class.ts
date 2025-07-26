//class api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/classes/class_manager';


//get classes by school id
export const getClassesBySchoolId = async (schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getClassesBySchoolId',{params : {school_id : schoolId}});
  return response.data;
}

//add new class or create new class
export const addClass = async (data: any) => {
  const response = await api.post<any>(baseurl+suburl+'/createClass', data);
  return response.data;
}

//get classes by class id
export const getClassesById = async (id: Number,schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getClassById',{params : {class_id : id,school_id : schoolId}});
  return response.data;
}
