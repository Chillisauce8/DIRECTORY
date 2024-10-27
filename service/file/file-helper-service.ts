import EXIF from '~/service/file/exif';

interface IFileSizeConfig {
  min?: string;
  max?: string;
}


export enum FileType {
  Image= 'Image',
  Video = 'Video',
  Document = 'Document',
}



export interface IMediaProperties {
  width: number;
  height: number;
  aspectRatio: string|undefined;
}


export interface IMediaFileProperties extends IMediaProperties {
  name: string;
  fileFormat: string;
  size?: number;
}


export class FileHelperService {
  private _base64EncodingMultiplyer = 1.37;
  private _base64HeadersSize = 814;

  private readonly possibleExtensionToShowInBrowser = ['json', 'xml', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt',
    'mp4', 'webm', 'mp3', 'ogg'];

  isFileSizeOk(file: File, fileSizeConfig: IFileSizeConfig): boolean {
    if (!fileSizeConfig || !file) {
      return true;
    }

    const minBytes = fileSizeConfig.min ? this.convertFileSizeStringIntoBytes(fileSizeConfig.min) : 0;

    const maxBytes = fileSizeConfig.max ? this.convertFileSizeStringIntoBytes(fileSizeConfig.max) : Infinity;

    if (minBytes && file.size < minBytes) {
      return false;
    }

    if (maxBytes && file.size > maxBytes) {
      return false;
    }

    return true;
  }

  convertFileSizeStringIntoBytes(fileSizeString: string): number|null {
    let sizeConvertIncrement = {
      '': 1,
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024
    };

    let fileSizeRegExp = /^([0-9]+)(?:\s+)?(.*)$/;


    if (!fileSizeRegExp.test(fileSizeString)) {
      return null;
    }

    // @ts-ignore
    let maxFileSizeBase = parseInt(fileSizeRegExp.exec(fileSizeString)[1] || '1', 10);
    // @ts-ignore
    let maxFileSizeIncrementString = fileSizeRegExp.exec(fileSizeString)[2];
    // @ts-ignore
    let maxFileSizeIncrement = sizeConvertIncrement[maxFileSizeIncrementString.toLowerCase()];

    return maxFileSizeBase * maxFileSizeIncrement;
  }

  convertBytesToFileSizeString(fileSizeInBytes: number) {
    if (!fileSizeInBytes) {
      return '0B';
    }

    const sizeUnits = ['kB', 'MB', 'GB'];

    let i = -1;

    let fileInCurrentUnits = fileSizeInBytes;

    do {
      fileInCurrentUnits = fileInCurrentUnits / 1024;

      ++i;
    } while (fileInCurrentUnits > 1024);

    return Math.max(fileInCurrentUnits, 0.1).toFixed(1) + sizeUnits[i];
  }

  calculateBase64Size(originalSize: number): number {
    return originalSize * this._base64EncodingMultiplyer + this._base64HeadersSize;
  }

  dataURItoBlob(value: string, type: string) {
    const byteString = window.atob(value);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([int8Array], { type });
  }

  getFileExtension(fileName: string): string|null {
    const splitRes = fileName.split('.');

    if (splitRes.length > 1) {
      const ext = splitRes[splitRes.length - 1];
      if (ext && ext.length <= 5) {
        return ext;
      }
    }

    return null;
  }

  isFileImage(file: File): boolean {
    return file && file.type.split('/')[0] === 'image';
  }

  isFileVideo(file: File): boolean {
    return file && file.type.split('/')[0] === 'video';
  }

  getFileType(file: File): FileType {
    if (this.isFileImage(file)) {
      return FileType.Image;
    } else if (this.isFileVideo(file)) {
      return FileType.Video;
    }

    return FileType.Document;
   }

  calculateAspectRatio(width: number, height: number): string | undefined {

    function gcd(a: number, b: number): number {
      return (b === 0) ? a : gcd(b, a % b);
    }

    if (!width || !height) {
      return undefined;
    }

    const r = gcd(width, height);

    return width / r + ':' + height / r;
  }

  getMediaFileProperties(file: any): IMediaFileProperties {
    const width = file.metadata && file.metadata.width || 0;
    const height = file.metadata && file.metadata.height || 0;

    const size = file.size;

    return {
      name: file.name,
      fileFormat: file.type,
      width: width,
      height: height,
      size: size,
      aspectRatio: this.calculateAspectRatio(width, height)
    };
  }

  canShowFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);

    if (!extension) {
      return false;
    }

    return !!this.possibleExtensionToShowInBrowser.find((item: any) => {
      return item.toUpperCase() === extension.toUpperCase();
    });
  }

  getUrlForFileData(value: string, type: string) {
    if (value) {
      const blob = this.dataURItoBlob(value, type);
      return window.URL.createObjectURL(blob);
    }
  }

  showFile(value: string, type: string) {
    if (value) {
      const url = this.getUrlForFileData(value, type);
      window.open(url);
    }
  }

  downloadFile(value: string, type: string, name: string) {
    if (value) {
      const blob = this.dataURItoBlob(value, type);

      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';

      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = name;
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  showOrDownloadFile(value: string, type: string, name: string) {
    if (value) {
      if (this.canShowFile(name)) {
        this.showFile(value, type);
      } else {
        this.downloadFile(value, type, name);
      }
    }
  }

  async prepareFileToUploadWithExif(file: File, modelData: any) {
    return new Promise((resolve) => {
      const exif = new EXIF();
      exif.getData(file, function () {
        const metadata = exif.getAllTags(this);

        const data: any = {
          model: {
            ...modelData,
            data: metadata,
          },
          file,
        };

        resolve(data);
      });
    });
  }

  getBlobByImageEl(imageElement: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(imageElement, 0, 0);
    const blob = canvas.toDataURL('image/jpg');
    return blob.replace(/^data:image\/(png|jpg);base64,/, "");
  }
}


export const fileHelperService = new FileHelperService();
