import type { _Node } from '../_Node';

import type { _Join } from '../_Join';

export type FileType = 'Image' | 'Video' | 'Document';

export interface Files extends _Node{
    type: FileType;
    extension: string;
    size: number;
    imageInfo: object;
    data: object;
}
