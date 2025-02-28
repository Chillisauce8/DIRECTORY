import type { _Node } from '../_Node';
import type { _Card } from '../_Card';

export interface Event extends _Node, _Card {
    name: string;
    description?: string;
    vehicles?: { name: string }[];
    status?: string;
    files?: any[];  // Consider typing this more specifically if you know the file structure
    start?: string;
    end?: string;
    duration?: string;
    categories?: { name: string } | null;
    imageId?: string;
    loveable?: boolean;
}