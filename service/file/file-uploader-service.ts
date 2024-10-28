import { httpService, HttpService, OFetchOptions } from '~/service/http/http.service';


export type FileUploaderRequestData = {
  [prop: string]: string | number | Object | File;
};

export type FileUploaderConfig = {
  url: string;
  data: FileUploaderRequestData;
  method?: string;
  headers?: { [headerName: string]: string; }
  withCredentials?: boolean;
  responseType?: string;
  observe?: string;
};


export class FileUploaderService {
  private defaultHeaders = {
    'Accept': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    // 'Content-Type': 'multipart/form-data',
  };

  constructor(private http: HttpService) {
    //
  }

  async upload(config: FileUploaderConfig): Promise<boolean> {
    const requestOptions = this.createRequestOptions(config);

    return this.http.request(config.url, requestOptions)
      .then(result => result.data)
      .catch((error: any) => {
        this.processError(error);
      });
  }

  processError(error: any) {
    console.log(error);
  }

  private createRequestOptions(config: FileUploaderConfig): OFetchOptions {
    const requestHeaders = this.getHeadersObject(config.headers);
    const formData = this.prepareRequestFormData(config.data);
    // const withCredentials = config.withCredentials === undefined ? false : config.withCredentials;
    const method = config.method ? config.method : 'POST';

    const options: any = {
      headers: requestHeaders,
      // credentials: withCredentials
    };

    if (config.responseType) {
      options.responseType = config.responseType;
    }

    if (config.observe) {
      options.observe = config.observe;
    }

    return {method, body: formData, ...options};
  }

  private prepareRequestFormData(data: FileUploaderRequestData): FormData {
    const formData = new FormData();

    for (let key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      const value = data[key];

      if (typeof value === 'string' || typeof value === 'number') {
        formData.append(key, value.toString());
      } else if (value instanceof File) {
        const preparedValue = this.prepareFile(value);
        formData.append(key, preparedValue, preparedValue.name);
      } else if (value instanceof Object) {
        formData.append(key, JSON.stringify(value));
      }
    }

    return formData;
  }

  private prepareFile(file: File): File {
    const fileCopy: File = new File([file], file.name, {type: file.type});
    // @ts-ignore
    if (fileCopy && fileCopy['metadata']) {
      // @ts-ignore
      delete fileCopy['metadata'];
    }

    return fileCopy;
  }

  private getHeadersObject(customHeaders: any): any {
    return {...this.defaultHeaders, ...customHeaders};
  }
}


export const fileUploaderService = new FileUploaderService(httpService)
