import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;

const passwordUrl = '/core/password_manager';


//add new school or create new school
// export const createSchool = async (schoolData: any): Promise<any> => {
//   const response = await api.post<any>(baseurl+suburl+'/manage_school/create', schoolData);
//   return response.data;
// };

//verify username and sends an otp the linked mail.
export const sentVerficationCode = async(userName : string) : Promise<any> => {
    const response = await api.post<any>(baseurl+passwordUrl+'/reset_password',{user_name : userName});
    return response.data;
}


//verify the otp.
export const verifyUsernameWithCode = async(user : any) : Promise<any> => {
    const response = await api.post<any>(baseurl+passwordUrl+'/verify_otp',user);
    return response.data;
}

//verify the otp.
export const resetPassword = async(user : any) : Promise<any> => {
    const response = await api.post<any>(baseurl+passwordUrl+'/change_or_set_password',user);
    return response.data;
}

