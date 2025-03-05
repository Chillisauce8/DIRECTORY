import {CsBaseResetCDNCacheHelper} from './csBaseResetCDNCacheHelper';
import type {CloudflareResetCacheHelperConfig} from './csBaseResetCDNCacheHelper';
const request = require('request-promise');


export class CloudflareResetCacheHelper extends CsBaseResetCDNCacheHelper<CloudflareResetCacheHelperConfig> {
    constructor(configuration: CloudflareResetCacheHelperConfig,
                siteUrl: string,) {
        super(configuration, siteUrl);

        if (!configuration) {
            throw 'Configuration for CloudflareResetCacheHelper is not provided'
        }
    }

    public async resetUrlCache(url: string, soft?: boolean): Promise<any> {
        return this.resetUrlListCache([url], soft);
    }

    public async resetUrlListCache(urlList: string[], soft?: boolean): Promise<any> {
        const requestParams = {
            url: this.getApiCallUrl(),
            method: 'POST',
            json: true,
            headers: this.prepareAuthHeaders(),
            body: {
                files: urlList.map(url => this.siteUrl + url),
            },
        };

        const data = await request(requestParams);

        if (!data?.success) {
            throw data;
        }
    }

    private prepareAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.configuration.apiKey}`,
        }
    }

    private getApiCallUrl(): string {
        return `https://api.cloudflare.com/client/v4/zones/${this.configuration.zone}/purge_cache`;
    }
}
