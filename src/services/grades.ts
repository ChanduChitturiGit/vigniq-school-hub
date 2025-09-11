//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/syllabus/manage_syllabus';
const socketurl = '/syllabus/manage_whiteboard';


//get grades by teacher id
export const getGradeByTeacherId = async (schoolId : Number,teacherId : Number) => {
  const response = await api.get(baseurl+suburl+'/getGradeByTeacherId',{params : {school_id : schoolId,teacher_id : teacherId}});
  return response.data;
}

//get chapter wise data with topics data.
export const getProgressBySubject = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getChaptersProgressBySubject',{params : {...data}});
  return response.data;
}

//get chapter wise data with topics data.
//getChaptersTopicsBySubject
export const getGradeByChapter = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getSyllabusBySubject',{params : {...data}});
  return response.data;
}

//get lesson plan data with topics data.
export const getLessonPlanData = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getLessionPlan',{params : {...data}});
  return response.data;
}

//get lesson plan data with topics data.
export const getPrerequisitesData = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getPrerequisites',{params : {...data}});
  return response.data;
}

//get lesson plan data with topics data.
export const getLessonPlanDataByDay = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getLessonDayPlan',{params : {...data}});
  return response.data;
}

//getChapterDetailsById
export const getChapterDetailsById = async (data : any) => {
  const response = await api.get(baseurl+suburl+'/getChapterDetailsById',{params : {...data}});
  return response.data;
}

 
//generate lesson plan
export const generateLessonData = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/generateLessonPlan', data);
  return response.data;
};


//save lesson plan
export const saveLessonData = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/saveLessonPlan', data);
  return response.data;
};


//save sub topic per lesson
export const saveTopicByLesson = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/addSubTopic', data);
  return response.data;
};

//edit the sub topic by id
export const editTopicByLesson = async (data: any): Promise<any> => {
  const response = await api.put<any>(baseurl+suburl+'/editSubTopicById', data);
  return response.data;
};


// add prerequisite
export const savePrerequisite = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+suburl+'/addPrerequisite', data);
  return response.data;
}

//edit Prerequisite
export const editPrerequisiteByLesson = async (data: any): Promise<any> => {
  const response = await api.put<any>(baseurl+suburl+'/editPrerequisiteById', data);
  return response.data;
};


//whiteboard session create
export const createWhiteboardSession = async (data: any): Promise<any> => {
  const response = await api.post<any>(baseurl+socketurl+'/createWhiteboardSession', data);
  return response.data;
};

//updateLessonPlanDayStatus
export const updateLessonPlanDayStatus = async (data: any): Promise<any> => {
  const response = await api.put<any>(baseurl+socketurl+'/updateLessonPlanDayStatus', data);
  return response.data;
}

//getWhiteboardData
export const getWhiteboardData = async (data: any): Promise<any> => {
  const response = await api.get<any>(baseurl+socketurl+'/getWhiteboardData',{params : data});
  return response.data;
} 