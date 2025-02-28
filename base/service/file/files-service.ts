import { type HttpRequestQueryParams, HttpService, httpService } from '~/service/http/http.service';
import type {FileType} from '~/service/file/file-helper-service';


export interface FileImageInfo {
    "width": string;
    "height": string;
    "aspectRatio": string;
}


export interface FileDbNode {
    _id: string;
    name: string;
    type: FileType;
    categories: any[],
    description: string;
    rating: 0 | 1 | 2 | 3 | 4 | 5;
    extension: string;
    size: string;
    imageInfo: FileImageInfo;
    data: string | Record<string, any>;
}


export class FilesService {
  constructor(private http: HttpService) {}

  async getFiles(params?: HttpRequestQueryParams): Promise<FileDbNode[]> {
    return this.http.get('/api/files', params)
      .then(res => res.data);
  }

  async deleteFile(fileId: string) {
    return this.http.delete('/api/files/' + fileId);
  }
}


export function useFilesService() {
  return new FilesService(httpService);
}


export const filesService = new FilesService(httpService);
