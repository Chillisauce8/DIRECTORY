// _Node.types.ts (or just _Node.ts)
interface AuditRecord {
    name: string;
    userType: string;
    date: string;
    isTest: boolean;
    environment: 'development' | 'staging' | 'production';
}

interface CreationRecord extends AuditRecord {
    id: string;
}

export interface _Node {
    _id: string;
    _type: string;
    _hash: number;  // Changed from string to number based on the example
    created: CreationRecord;  // Now properly typed
    lastUpdated: AuditRecord;  // Now properly typed
    lastEdited: AuditRecord;  // Now properly typed
    title: string;
}