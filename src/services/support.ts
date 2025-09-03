//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/core/support';


//get isue types
export const getIssueTypes = async () => {
  const response = await api.get(baseurl+suburl+'/getIssueTypes');
  return response.data;
}


//getAvailableModules
export const getAvailableModules = async () => {
  const response = await api.get(baseurl+suburl+'/getAvailableModules');
  return response.data;
}

//create ticket or raise issue
export const createTicket = async (data : any) => {
  const response = await api.post(baseurl+suburl+'/createTicket',data,{ headers: {
      'Content-Type': 'multipart/form-data',
    }});
  return response.data;
}

//getTickets
export const getTickets = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTickets',{params : data});
  return response.data;
}

//getTicketById
export const getTicketById = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTicketById',{params : data});
  return response.data;
}

//respondToTicket
export const respondToTicket = async (data : any) => {
  const response = await api.post(baseurl+suburl+'/respondToTicket',data,{ headers: {
      'Content-Type': 'multipart/form-data',
    }});
  return response.data;
}