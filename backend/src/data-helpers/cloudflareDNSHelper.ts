const request = require('request-promise');


export interface CloudflareAPIHelperConfig {
    apiKey: string;
    email: string;
    zone: string;
    zoneName: string;
    serverInternalAddress: string;
}


export class CloudflareDNSHelper {

    constructor(protected configuration: CloudflareAPIHelperConfig) {
        if (!configuration) {
            throw 'Configuration for CloudflareAPIHelperConfig is not provided'
        }
    }

    public async createCNAMEForSubDomain(subdomainName: string): Promise<any> {
        const requestParams = {
            url: this.getApiCallUrl(),
            method: 'POST',
            json: true,
            headers: this.prepareAuthHeaders(),
            body: {
                type: 'CNAME',
                name: subdomainName,
                content: this.configuration.serverInternalAddress,
                proxied: true,
                ttl: 1
            }
        };

        const data = await request(requestParams);

        if (!data?.success) {
            throw data;
        }
    }

    public async getCNAMERecord(subdomainName: string): Promise<any> {
        const requestParams = {
            url: this.getApiCallUrl(),
            method: 'GET',
            json: true,
            headers: this.prepareAuthHeaders(),
            qs: {
                name: `${subdomainName}.${this.configuration.zoneName}`,
            }
        };

        const data = await request(requestParams);

        if (!data?.success) {
            throw data;
        }

        return data?.result?.[0];
    }

    public async updateCNAMERecordName(cnameRecordId: string, newSubdomainName: string): Promise<void> {
        if (!cnameRecordId) {
            throw 'Unknown CNAME record ID to update';
        }

        if (!newSubdomainName) {
            throw 'Subdomain name is required for CNAME record';
        }

        const requestParams = {
            url: `${this.getApiCallUrl()}/${cnameRecordId}`,
            method: 'PATCH',
            json: true,
            headers: this.prepareAuthHeaders(),
            body: {
                name: newSubdomainName,
            }
        };

        const data = await request(requestParams);

        if (!data?.success) {
            throw data;
        }
    }

    public async deleteCNAMERecord(cnameRecordId: string): Promise<void> {
        if (!cnameRecordId) {
            throw 'Unknown CNAME record ID to remove';
        }

        const requestParams = {
            url: `${this.getApiCallUrl()}/${cnameRecordId}`,
            method: 'DELETE',
            json: true,
            headers: this.prepareAuthHeaders(),
        };

        const data = await request(requestParams);

        if (!data?.success) {
            throw data;
        }
    }

    private prepareAuthHeaders() {
        // return {
        //     'Authorization': `Bearer ${this.configuration.apiKey}`,
        // }
        return {
            'X-Auth-Email': this.configuration.email,
            'X-Auth-Key': this.configuration.apiKey
        };
    }

    private getApiCallUrl(): string {
        return `https://api.cloudflare.com/client/v4/zones/${this.configuration.zone}/dns_records`;
    }
}
