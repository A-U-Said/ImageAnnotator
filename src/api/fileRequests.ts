import { AxiosProgressEvent } from 'axios';
import client from './client';
import { PdfFileView } from 'api/types/fileRequests.views';


const splitPdf = (data: FormData, progress: (progressEvent: AxiosProgressEvent) => void) => {
  
  return new Promise<PdfFileView[]>((resolve, reject) => {
    client.post('files/splitPages', data, { headers: { "content-type": "multipart/form-data" }, onUploadProgress: progress })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}


const fileRequests = {
  splitPdf
};

export default fileRequests;
