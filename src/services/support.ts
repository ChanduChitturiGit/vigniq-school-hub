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

//updateTicketStatus
export const updateTicketStatus = async (data : any) => {
  const response = await api.put(baseurl+suburl+'/updateTicketStatus',data);
  return response.data;
}

//getTicketAttachments
export const getTicketAttachments = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTicketAttachments',{params : data});
  return response.data;
}

//markMessageAsRead
export const markMessageAsRead = async (data : any) => {
  const response = await api.put(baseurl+suburl+'/markMessageAsRead',data);
  return response.data;
}

//getSupportNotifications
export const getSupportNotifications = async () => {
  const response = await api.get(baseurl+suburl+'/getSupportNotifications');
  return response.data;
}