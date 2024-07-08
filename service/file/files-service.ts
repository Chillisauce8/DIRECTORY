import { HttpService, httpService } from '~/service/http/http.service';


export class FilesService {
  constructor(private http: HttpService) {
    //
  }

  async getFiles() {
    return this.http.get('/api/files')
      .then(res => res.data);
  }

  async deleteFile(fileId: string) {
    return this.http.delete('/api/files/' + fileId);
  }
}


export const filesService = new FilesService(httpService)
