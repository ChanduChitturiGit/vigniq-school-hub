//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/teacher/manage_offline_exam';


//create new exam
export const createExam = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/createExam', data);
  return response.data;
}

//getExamCategories
export const getExamCategories = async (data) => {
  const response = await api.get(baseurl+suburl+'/getExamCategories',{params : data});
  return response.data;
}

//getExamsList
export const getExamsList = async (data) => {
  const response = await api.get(baseurl+suburl+'/getExamsList',{params : data});
  return response.data;
}

//getExamDetailsById
export const getExamDetailsById = async (data) => {
  const response = await api.get(baseurl+suburl+'/getExamDetailsById',{params : data});
  return response.data;
}

//manage_offline_exam
export const submitMarks = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/assignExamMarks', data);
  return response.data;
}

//getChapterExams
export const getChapterExams = async (data: any): Promise<any> => {
  const response = await api.get<any>(baseurl+suburl+'/getChapterExams', {params: data});
  return response.data;
}

//createChapterExam
export const createChapterExam = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/createChapterExam', data);
  return response.data;
}