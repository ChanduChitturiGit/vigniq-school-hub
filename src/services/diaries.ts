//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/teacher/manage_teacher_diary';


//get teachers diaries
export const getTeacherDiaries = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTeacherDiaryByTeacherAndDate',{params : data});
  return response.data;
}

//getTeacherDiaryKPIs
export const getTeacherDiaryKPIs = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTeacherDiaryKPIs',{params : data});
  return response.data;
}

//saveTeacherDiary
export const saveTeacherDiary = async (data : any) => {
  const response = await api.post(baseurl+suburl+'/saveTeacherDiary',data);
  return response.data;
}

//getTeacherDiaryByClassSectionAndDate
export const getTeacherDiariesByAdmin = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getTeacherDiaryByClassSectionAndDate',{params : data});
  return response.data;
}

//markDiaryAsReviewed
export const markDiaryAsReviewed = async (data : any) => {
  const response = await api.post(baseurl+suburl+'/markDiaryAsReviewed',data);
  return response.data;
}