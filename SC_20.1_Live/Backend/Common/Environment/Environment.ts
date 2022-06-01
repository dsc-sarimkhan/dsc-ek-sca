/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

/* eslint-disable class-methods-use-this */
import * as Nruntime from 'N/runtime';
import { Website } from '../Website/Website';

export class Environment {
    private currentUrl: string;

    private host: string;

    private static instance: Environment;

    // this and setCurrentWebsite method are needed because
    // current site id comes as an url parameter. (currentWebsite is set in the ServiceController)
    private currentWebsite: Website;

    private constructor() {}

    public static getInstance(): Environment {
        if (!this.instance) {
            this.instance = new Environment();
        }
        return this.instance;
    }

    public getCurrentScript(): Nruntime.Script {
        return Nruntime.getCurrentScript();
    }

    public isFeatureInEffect(name: string): boolean {
        return Nruntime.isFeatureInEffect({ feature: name });
    }

    public setCurrentUrl(currentUrl: string): void {
        this.currentUrl = currentUrl;
        this.host = this.currentUrl.replace(/^https?:\/\/([^/?#:]+).*$/, '$1');
    }

    public getCurrentUrl(): string {
        return this.currentUrl;
    }

    public getHost(): string {
        return this.host;
    }

    public getCurrentWebsite(): Website {
        return this.currentWebsite;
    }

    public setCurrentWebsite(website: any): void {
        this.currentWebsite = website;
    }

    public getAbsoluteUrl(path: string): string {
        const match = this.currentUrl.match(/https?[^$#]+/);
        let absoluteUrl = this.currentUrl;
        if (match && match[0]) {
            const urlArray = match[0].split('/');
            urlArray.pop();
            absoluteUrl = urlArray.join('/');
        }
        if (path[0] !== '/') {
            path = '/' + path;
        }
        return absoluteUrl + path;
    }
}