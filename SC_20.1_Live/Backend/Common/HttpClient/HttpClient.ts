/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as Nhttp from 'N/http';
import * as Nhttps from 'N/https';

export interface HttpHeaders {
    [name: string]: string;
}

export class HttpClient {
    public get(url: string, headers: HttpHeaders): Nhttp.ClientResponse {
        return this.getConnectionModule(url).get({
            url: url,
            headers: headers
        });
    }

    private getConnectionModule(url: string): typeof Nhttps | typeof Nhttp {
        return /^https:/.test(url) ? Nhttps : Nhttp;
    }
}