//school api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/school/manage_school';


//add new school or create new school
export const createSchool = async (schoolData: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/create', schoolData);
  return response.data;
};


//get school list
export const getSchoolsList = async () => {
  const response = await api.get(baseurl+suburl+'/school_list');
  return response.data;
};


//get school by school id
export const getSchoolById = async (schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getSchoolById',{params : {school_id : schoolId}});
  return response.data;
}

//edit school
export const editSchool = async (schoolData : any) => {
  const response = await api.put(baseurl+suburl+'/updateSchoolById',schoolData);
  return response.data;
}


