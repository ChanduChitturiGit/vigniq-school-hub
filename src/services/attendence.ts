//school api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/student/manage_attendance';


//get attendence by class and section
export const getAttendenceData = async (data) => {
  const response = await api.get(baseurl+suburl+'/getAttendanceByClassSection',{params : data});
  return response.data;
}

//get attendence by class and section
export const getPastAttendenceData = async (data) => {
  const response = await api.get(baseurl+suburl+'/getPastAttendance',{params : data});
  return response.data;
}

//markAttendance
export const submitAttendence = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/markAttendance', data);
  return response.data;
};

//markHoliday
export const markAsHoiday = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/markHoliday', data);
  return response.data;
};


//unmarkHoliday
export const unmarkAsHoiday = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/unmarkHoliday', data);
  return response.data;
};
