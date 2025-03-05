import {CsBaseResetCDNCacheHelper, FastlyResetCDNCacheHelperConfig} from '../data-helpers/csBaseResetCDNCacheHelper';
const request = require('request-promise');


export class FastlyResetCDNCacheHelper extends CsBaseResetCDNCacheHelper<FastlyResetCDNCacheHelperConfig> {
    constructor(protected configuration: FastlyResetCDNCacheHelperConfig,
                protected siteUrl: string,) {
        super(configuration, siteUrl);

        if (!configuration) {
            throw 'Configuration for Fastly is not provided'
        }
    }

    public async resetUrlListCache(urlList: Array<string>, soft: boolean = true) {
        const errorList = [];

        for (const url of urlList) {
            try {
                await this.resetUrlCache(url, soft);
            } catch (requestData) {
                errorList.push({url, requestData});
            }
        }

        return errorList;
    }

    public async resetUrlCache(url: string, soft: boolean = true) {
        if (!this?.configuration?.apiKey) {
            throw 'No Fastly token';
        }

        const fullUrl = this.siteUrl + url;

        let request_options = {
            url: fullUrl,
            method: 'PURGE',
            json: true,
            headers: {
                'Fastly-Key': this.configuration.apiKey,
                'Fastly-Soft-Purge': soft ? 1 : 0
            }
        };

        const data = await request(request_options);

        if (data && data.status && data.status !== 'ok') {
            throw data;
        }
    }
}
