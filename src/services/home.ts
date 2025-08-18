//school api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/core/dashboard';


//get Home page data
export const getHomePageData = async () => {
  const response = await api.get(baseurl+suburl+'/getDashboardData');
  return response.data;
};

