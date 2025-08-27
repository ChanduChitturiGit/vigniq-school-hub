//school api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/syllabus/manage_ai_chat';


// getAssistantChat
export const getChat = async (data) => {
  const response = await api.get(baseurl+suburl+'/getAssistantChat',{params : data});
  return response.data;
}


//chatWithAssistant
export const sendMessage = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/chatWithAssistant', data);
  return response.data;
};

