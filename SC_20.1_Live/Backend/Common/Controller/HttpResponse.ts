/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { CacheDuration } from 'N/http';

export class HttpResponse<T = unknown> {
    private customStatus: number;

    private body: T;

    private cache: CacheDuration;

    private contentType: string;

    private jsonpCallback: string;

    public constructor(
        body: T,
        options: Partial<{
            customStatus: number;
            cache: CacheDuration;
            jsonpCallback: string;
            contentType: string;
        }> = {}
    ) {
        this.body = body;
        this.customStatus = options.customStatus || 200;
        this.cache = options.cache;
        this.jsonpCallback = options.jsonpCallback;
        this.contentType =
            options.contentType || this.jsonpCallback
                ? 'application/x-javascript'
                : 'application/json';
    }

    public getBodyString(): string {
        const bodyString = JSON.stringify(this.body || {});
        return this.jsonpCallback ? `${this.jsonpCallback}(${bodyString})` : bodyString;
    }

    public getCustomStatus(): number {
        return this.customStatus;
    }

    public getContentType(): string {
        return this.contentType;
    }

    public getCache(): CacheDuration {
        return this.cache;
    }

    public setCustomStatus(statusCode: number): void {
        this.customStatus = statusCode;
    }

    public setBody(body: T): void {
        this.body = body;
    }
}