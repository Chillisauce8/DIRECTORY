export abstract class CsBaseResetCDNCacheHelper<CONFIG> {
    public abstract resetUrlCache(url: string, soft?: boolean): Promise<any>;
    public abstract resetUrlListCache(urlList: string[], soft?: boolean): Promise<any>;

    protected constructor(protected configuration: CONFIG,
                          protected siteUrl: string,) {}
}


export interface FastlyResetCDNCacheHelperConfig {
    apiKey: string;
}


export interface CloudflareResetCacheHelperConfig {
    apiKey: string;
    zone: string;
}


export interface CsResetCDNCacheHelperConfig {
    cdn: 'cloudflare' | 'fastly';
    fastlyConfig: FastlyResetCDNCacheHelperConfig;
    cloudflareConfig: CloudflareResetCacheHelperConfig;
}