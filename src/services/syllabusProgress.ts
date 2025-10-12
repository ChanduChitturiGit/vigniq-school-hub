
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/reports/syllabus_reports';


//get class wise progress
export const getSyllabusProgressByClass = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusProgressByClass',{params : data});
  return response.data;
}

//getSyllabusProgressByClassSection
export const getSyllabusProgressByClassSection = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusProgressByClassSection',{params : data});
  return response.data;
}

//getSyllabusProgressBySubject
export const getSyllabusProgressBySubject = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusProgressBySubject',{params : data});
  return response.data;
}

//getLessonPlanByChapter
export const getLessonPlanByChapter = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getLessonPlanByChapter',{params : data});
  return response.data;
}

//getSyllabusProgressByTeacher
export const getSyllabusProgressByTeacher = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusProgressByTeacher',{params : data});
  return response.data;
}

//getSyllabusProgressByTeacherSubject
export const getSyllabusProgressByTeacherSubject = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusProgressByTeacherSubject',{params : data});
  return response.data;
}