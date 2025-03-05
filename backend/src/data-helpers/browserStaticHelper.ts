import {existsSync, readFile} from 'fs';
import {join} from 'path';
import {DIST_FOLDER, isRequestToNuxtAppStatic, isRequestToNuxtStats} from '../utils/renderingHelperFunctions';
import {BrowserStaticManagement} from './browserStaticManagement';


const lockHelper = require('../utils/lockHelper');


export interface BrowserStaticFileWithMeta {
    data: Buffer;
    mimeType: string;
}


export class BrowserStaticHelper {
    constructor(private browserStaticManagement: BrowserStaticManagement,
                private mimeType: any,) {}

    public async get(req): Promise<BrowserStaticFileWithMeta> {
        const path = this.getFilePathFromRequest(req);

        const data = await this.browserStaticManagement.get(req, path);

        if (!data) {
            return null;
        }

        const mimeType = this.mimeType.lookup(req.url);

        return {data, mimeType};
    }

    public async storeIfPossible(req): Promise<void> {
        const path = this.getFilePathFromRequest(req);

        return lockHelper.processWithLock(path, lockHelper.DEFAULT_LOCK_TIME, async () => {
            const existingNode = await this.browserStaticManagement.get(req, path);

            if (existingNode) {
                return;
            }

            const fileExists = this.checkFileExistsOnDisk(path);

            if (!fileExists) {
                return;
            }

            const fileFromDisk = await this.readFileFromDiskByReq(path);

            if (!fileFromDisk) {
                return;
            }

            return this.browserStaticManagement.create(req, path, fileFromDisk);
        });
    }

    private getFilePathFromRequest(req): string {
        return req.url.split('?')[0];
    }

    public checkFileExistsOnDisk(path: string): boolean {
        let staticPath;

        if (isRequestToNuxtStats(path)) {
            staticPath = join(DIST_FOLDER, 'frontend', path);
        } else if (isRequestToNuxtAppStatic(path)) {
            staticPath = join(DIST_FOLDER, 'frontend', 'public', path);
        } else {
            staticPath = join(DIST_FOLDER, 'browser', path);
        }

        return existsSync(staticPath);

        // return new Promise<boolean>(res => exists(staticPath, (_exists => res(_exists))));
    }

    private async readFileFromDiskByReq(path): Promise<Buffer> {
        let staticPath;

        if (isRequestToNuxtStats(path)) {
            staticPath = join(process.cwd(), 'public', 'frontend', path);
        } else if (isRequestToNuxtAppStatic(path)) {
            staticPath = join(process.cwd(), 'public', 'frontend', 'public', path);
        } else {
            staticPath = join(DIST_FOLDER, 'browser', path);
        }

        let fileBuffer: Buffer;

        try {
            fileBuffer = await new Promise<Buffer>((res, rej) => {
                readFile(staticPath, (error, data) => {
                    if (error) {
                        return rej(error);
                    }

                    res(data);
                });
            });
        } catch (e) {
            console.log('Could not read file from disk:\n', e);

            return null;
        }

        return fileBuffer;
    }
}

