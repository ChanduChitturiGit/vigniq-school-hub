//user api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/core/user_profile';


//get teachers by school id
export const getUserByUserName = async (userName : string) => {
  const response = await api.get(baseurl+suburl+'/getUserByUserName',{params : {user_name : userName}});
  return response.data;
}

//edit profile
export const editProfile = async (data : any) => {
  const response = await api.put(baseurl+suburl+'/editUserByUserName',data);
  return response.data;
}