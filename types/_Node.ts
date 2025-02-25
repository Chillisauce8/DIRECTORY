export type Environment = 'development' | 'staging' | 'production';
export type UserType = 'system' | 'user' | 'admin';

/**
 * Base document type for database entities
 * All database documents extend from this interface
 */
export interface AuditRecord {
    readonly id: string;
    readonly name: string;
    readonly userType: UserType;
    readonly date: string;  // ISO 8601 date string
    readonly isTest: boolean;
    readonly environment: Environment;
}

export interface _Node {
    readonly _id: string;  // Mark as readonly since it shouldn't change
    readonly _type: string;
    readonly _hash?: number;
    readonly created: AuditRecord;
    readonly lastUpdated?: AuditRecord;
    readonly lastEdited?: AuditRecord;
    title: string;
}