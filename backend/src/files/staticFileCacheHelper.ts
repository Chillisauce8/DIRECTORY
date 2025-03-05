// import {join} from 'path';
// import {readFile, stat} from 'fs';
// import * as mime from 'mime-types';
// import { CacheHelper } from '../cache/cacheHelper';
// import { coreServiceLocator } from '../serviceLocator';
// import { RequestHelper } from '../utils';
//
//
// export class StaticFileCacheHelper {
//   private readonly cacheKeyPrefix = '@STATIC_FILE_DATA';
//   private privateSettings= coreServiceLocator.get('privateSettings');
//
//   constructor(private cacheHelper: CacheHelper,
//               private requestHelper: RequestHelper,
//               private mimeType: any,
//               private readonly storeTimeSec?: number) {
//
//     if (!this.storeTimeSec) {
//       this.storeTimeSec = this.privateSettings.STATIC_FILES_CACHE ?
//           this.privateSettings.STATIC_FILES_CACHE.ttl : 0;
//     }
//   }
//
//   async storeIfNeeded(req: Request): Promise<void> {
//     if (!this.storeTimeSec) {
//       return;
//     }
//
//     const fileCacheExists = await this.checkFileCacheExits(req);
//
//     if (fileCacheExists) {
//       return;
//     }
//
//     await this.store(req);
//   }
//
//   async checkFileCacheExits(req: Request): Promise<boolean> {
//     if (!this.storeTimeSec) {
//       return false;
//     }
//
//     if (!this.requestHelper.isRequestToStatic(req.url)) {
//       return false;
//     }
//
//     const distFolder = this.appFolderHelper.getDistFolder(req);
//     const filePath = join(distFolder, req.url);
//     return this.checkFileCacheExitsByPath(req, filePath);
//   }
//
//   async checkFileCacheExitsByPath(req: Request, filePath: string): Promise<boolean> {
//     if (!this.storeTimeSec) {
//       return false;
//     }
//
//     // if (!this.requestHelper.isRequestToStatic(req.url)) {
//     //   return false;
//     // }
//
//     const cacheKey = this.createCacheKeyForFile(req, filePath).replace(/\\/g, '\\\\');
//
//     let ttl;
//     try {
//       ttl = await this.cacheHelper.getTTLByKey(cacheKey)
//     } catch (e) {
//       this.logError('Could not get TTL of file cache', e);
//
//       ttl = -2;
//     }
//
//     return ttl > 0
//   }
//
//   async store(req: Request): Promise<void> {
//     if (!this.storeTimeSec) {
//       return;
//     }
//
//     if (!this.requestHelper.isRequestToStatic(req.url)) {
//       return;
//     }
//
//     const fileBuffer = await this.readFileFromDiskIfExists(req);
//
//     if (!fileBuffer) {
//       const filePath = join(this.appFolderHelper.getDistFolder(req), req.url);
//       this.logError('File not found on a disk', filePath);
//
//       return;
//     }
//
//     return this.storeFileInCache(req, fileBuffer);
//   }
//
//   async storeByPath(req: Request, filePath: string, cachePath?: string): Promise<void> {
//     if (!this.storeTimeSec) {
//       return;
//     }
//
//     cachePath = cachePath || filePath;
//
//     const exists = await this.checkFileCacheExitsByPath(req, cachePath);
//
//     if (exists) {
//       return;
//     }
//
//     let fileBuffer: Buffer;
//
//     try {
//       fileBuffer = await this.readFileFromDisk(filePath);
//     } catch (e) {
//       const filePath = join(this.appFolderHelper.getDistFolder(req), req.url);
//       this.logError('File not found on a disk', filePath);
//       return null;
//     }
//
//     return this.storeFileInCache(req, fileBuffer, cachePath);
//   }
//
//   async get(req: Request): Promise<{data: Buffer, filetype: string}> {
//     if (!this.storeTimeSec) {
//       return;
//     }
//
//     if (!this.requestHelper.isRequestToStatic(req.url)) {
//       return;
//     }
//
//     const fileHex = await this.readFileFromCache(req);
//
//     if (!fileHex) {
//       return null;
//     }
//
//     return {
//       data: Buffer.from(fileHex, 'hex'),
//       filetype: this.mimeType.lookup(req.url),
//     };
//   }
//
//   async getByPath(req: Request, filePath: string): Promise<{data: Buffer, filetype: string}> {
//     if (!this.storeTimeSec) {
//       return;
//     }
//
//     const fileHex = await this.readFileFromCache(req, filePath);
//
//     if (!fileHex) {
//       return null;
//     }
//
//     return {
//       data: Buffer.from(fileHex, 'hex'),
//       filetype: this.mimeType.lookup(filePath),
//     };
//   }
//
//   private createCacheKeyForFile(req: Request, filePath: string): string {
//     return this.cacheHelper.createCustomCacheKey(this.cacheKeyPrefix, filePath);
//   }
//
//   private async readFileFromDiskIfExists(req: Request): Promise<Buffer> {
//     const distFolder = this.appFolderHelper.getDistFolder(req);
//     const filePath = req.url.split('?')[0];
//     const fullPath = join(distFolder, filePath);
//
//     if (!await this.checkFileExistsOnDisk(fullPath)) {
//       return null;
//     }
//
//     let fileBuffer: Buffer;
//
//     try {
//       fileBuffer = await this.readFileFromDisk(fullPath);
//     } catch (e) {
//       this.logError('Could not read file from disk:\n', e);
//
//       return null;
//     }
//
//     return fileBuffer;
//   }
//
//   private async readFileFromDisk(path: string): Promise<Buffer> {
//     return new Promise<Buffer>((res, rej) => {
//       readFile(path, (error, data) => {
//         if (error) {
//           return rej(error);
//         }
//
//         res(data);
//       });
//     });
//   }
//
//   private checkFileExistsOnDisk(fullPath: string): Promise<boolean> {
//     return new Promise<boolean>((resolve, reject) => {
//       stat(fullPath, function (err, stat) {
//         if (err == null) {
//           resolve(true);
//         } else if (err.code === 'ENOENT') {
//           resolve(false);
//         } else {
//           reject(err);
//         }
//       });
//     });
//   }
//
//   private async storeFileInCache(req: Request, fileBuffer: Buffer, path?: string) {
//     const dataToStore = fileBuffer.toString('hex');
//
//     const distFolder = this.appFolderHelper.getDistFolder(req);
//     path = path || join(distFolder, req.url);
//     const cacheKey = this.createCacheKeyForFile(req, path);
//
//     try {
//       await this.cacheHelper.writeToCache(req, cacheKey, dataToStore, this.storeTimeSec);
//     } catch (e) {
//       this.logError('File wasn\'t stored in the cache:\n', e);
//     }
//   }
//
//   private async readFileFromCache(req: Request, filePath?: string) {
//     const distFolder = this.appFolderHelper.getDistFolder(req);
//     filePath = filePath || join(distFolder, req.url);
//
//     const cacheKey = this.createCacheKeyForFile(req, filePath);
//
//     let dataFromCache;
//
//     try {
//       dataFromCache = await this.cacheHelper.readFromCache(req, cacheKey);
//     } catch (e) {
//       this.logError('Could not read file from cache:\n', e);
//     }
//
//     if (!dataFromCache) {
//       return null;
//     }
//
//     return dataFromCache;
//   }
//
//   private logError(...messageArgs: any[]) {
//     console.error('#STATIC_FILE_CACHE_HELPER#:', ...messageArgs);
//   }
// }
//
//
// export function staticFileCacheHelperFactory(cacheHelper: CacheHelper, appFolderHelper: AppFolderHelper,
//                                              requestHelper: RequestHelper, storeTimeSec?: number): StaticFileCacheHelper {
//   return new StaticFileCacheHelper(cacheHelper, appFolderHelper, requestHelper, mime, storeTimeSec);
// }
