//school related api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/school';


//add new school or create new school
export const createSchool = async (schoolData: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/manage_school/create', schoolData);
  return response.data;
};


//get school list
export const getSchoolsList = async () => {
  const response = await api.get(baseurl+suburl+'/manage_school/school_list');
  return response.data;
};


