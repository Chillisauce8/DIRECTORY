import {FastlyResetCDNCacheHelper} from '../utils/fastlyResetCDNCacheHelper';
import {CsBaseResetCDNCacheHelper} from './csBaseResetCDNCacheHelper';
import type {CsResetCDNCacheHelperConfig} from './csBaseResetCDNCacheHelper';
import {CloudflareResetCacheHelper} from './cloudflareResetCDNCacheHelper';


export class CsResetCDNCacheHelper extends CsBaseResetCDNCacheHelper<CsResetCDNCacheHelperConfig> {
    private resetCDNCacheHelper: CsBaseResetCDNCacheHelper<any>;

    constructor(configuration: CsResetCDNCacheHelperConfig,
                siteUrl: string,) {
        super(configuration, siteUrl);

        if (!this.configuration) {
            throw 'Configuration for CsResetCDNCacheHelper is not provided';
        }

        this.resetCDNCacheHelper = this.createResetCDNCacheHelper();
    }

    async resetUrlCache(url: string, soft?: boolean): Promise<any> {
        return this.resetCDNCacheHelper.resetUrlCache(url, soft);
    }

    async resetUrlListCache(urlList: string[], soft?: boolean): Promise<any> {
        return this.resetCDNCacheHelper.resetUrlListCache(urlList, soft);
    }

    private createResetCDNCacheHelper(): CsBaseResetCDNCacheHelper<any>|undefined {
        if (this.configuration.cdn === 'fastly') {
            return new FastlyResetCDNCacheHelper(this.configuration.fastlyConfig, this.siteUrl) as any;
        } else if (this.configuration.cdn === 'cloudflare') {
            return new CloudflareResetCacheHelper(this.configuration.cloudflareConfig, this.siteUrl) as any;
        }
    }
}
