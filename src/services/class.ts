//class api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/classes/class_manager';


//get classes by school id
export const getClassesBySchoold = async (schoolId : Number) => {
  const response = await api.get(baseurl+suburl+'/getAvailableClassList',{params : {school_id : schoolId}});
  return response.data;
}




