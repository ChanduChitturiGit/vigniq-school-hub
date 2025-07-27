//user api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/syllabus/manage_ebook';


//upload books
export const uploadEbook = async (data : any) => {
  const response = await api.post(baseurl+suburl+'/uploadEbook',data,{ headers: {
      'Content-Type': 'multipart/form-data',   // 👈 important for file upload
    }});
  return response.data;
}


//get books
export const getEbookList = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getEbooks',{params : {...data}});
  return response.data;
}
