//school related api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;


//add new school or create new school
export const createSchool = async (schoolData: any): Promise<any> => {
  const response = await api.post<any>(baseurl+'/school/manage_school/create', schoolData);
  return response.data;
};




