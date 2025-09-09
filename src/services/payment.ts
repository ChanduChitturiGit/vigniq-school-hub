//teacher api handler.
import api from '../api/api';
import { environment } from '@/environment';

const baseurl = environment.baseurl;
const suburl = '/subscriptions/manage_packages';


//get plan packages
export const getPackages = async () => {
  const response = await api.get(baseurl+suburl+'/getPackages');
  return response.data;
}

