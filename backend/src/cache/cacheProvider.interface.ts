

export interface ICacheProvider {
    init();
    read(key: string): Promise<any>;
    write(key: string, value, seconds: number): Promise<any>;
    remove(key: string | Array<string>): Promise<any>;
    keys(prefix): Promise<any>;
    invalidate(prefix): Promise<any>;
}