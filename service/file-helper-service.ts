
interface IFileSizeConfig {
  min?: string;
  max?: string;
}


export class FileHelperService {
  private _base64EncodingMultiplyer = 1.37;
  private _base64HeadersSize = 814;

  private readonly possibleExtensionToShowInBrowser = ['json', 'xml', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt',
    'mp4', 'webm', 'mp3', 'ogg'];

  public isFileSizeOk(file: File, fileSizeConfig: IFileSizeConfig): boolean {
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

  public convertFileSizeStringIntoBytes(fileSizeString: string): number|null {
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

  public convertBytesToFileSizeString(fileSizeInBytes: number) {
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

  public calculateBase64Size(originalSize: number): number {
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
      return splitRes[splitRes.length - 1];
    }

    return null;
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

  showFile(value: string, type: string, name: string) {
    if (value) {
      const blob = this.dataURItoBlob(value, type);

      const url = window.URL.createObjectURL(blob);
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
        this.showFile(value, type, name);
      } else {
        this.downloadFile(value, type, name);
      }
    }
  }
}


export const fileHelperService = new FileHelperService();
