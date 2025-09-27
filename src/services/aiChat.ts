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

//clearAssistantChat
export const clearChat = async (data: any) => {
  const response = await api.delete<any>(baseurl+suburl+'/clearAssistantChat',{params : {...data}});
  return response.data;
}


// chatWithAssistant
// export const sendMessage = async (data: any): Promise<any> => {
//   const response = await api.post<any>(baseurl+suburl+'/chatWithAssistant', data);
//   return response.data;
// };

export const sendMessage = async (
  data: any,
  onStreamChunk: (chunk: string) => void,
  onStreamEnd: () => void,
  onError: (err: any) => void
) => {
  try {
    // Include access token like Axios interceptor
    const accessToken = sessionStorage.getItem("access_token");

    const response = await fetch(baseurl + suburl + "/chatWithAssistant", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      // Try parsing JSON error
      try {
        const errorJson = await response.json();
        onError(errorJson);
      } catch {
        onError({ message: "Unknown error from AI." });
      }
      return;
    }

    // streaming
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done && reader) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onStreamChunk(chunk);
      }
      done = readerDone;
    }

    onStreamEnd();
  } catch (err) {
    onError(err);
  }
};