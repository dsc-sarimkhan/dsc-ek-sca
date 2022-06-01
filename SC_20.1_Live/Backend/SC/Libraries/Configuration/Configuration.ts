/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as search from 'N/search';
import * as log from 'N/log';
import { configurationManifest } from './configurationManifest';
import * as Utils from '../../../Common/SspLibraries/Utils';
import { getExtensionsDefaultValues } from '../../../Common/ActivationContext/ActivationContext';
import { Environment } from '../../../Common/Environment/Environment';

export class Configuration {
    private domain: string;

    private requestedUrl: string;

    private siteid: number;

    private values: object;

    private defaultValues: object;

    protected recordType: string = 'customrecord_ns_sc_configuration';

    private custrecordNsSccKey: string = 'custrecord_ns_scc_key';

    private custrecordNsSccValue: string = 'custrecord_ns_scc_value';

    private static instance: Configuration;

    private constructor() {}

    public static getInstance(): Configuration {
        if (!this.instance) {
            this.instance = new Configuration();
        }
        return this.instance;
    }

    public get(path?: string): any {
        return Utils.getPathFromObject(this.getValues(), path);
    }

    public set(path: string, value: any): void {
        Utils.setPathFromObject(this.getValues(), path, value);
    }

    public getDefault(path?: string): any {
        const defaultValues = this.getDefaultValues();
        return Utils.getPathFromObject(defaultValues, path);
    }

    private getDefaultValues(): object {
        if (!this.defaultValues) {
            this.defaultValues = Utils.deepExtend(
                configurationManifest(),
                getExtensionsDefaultValues(this.domain, this.requestedUrl)
            );
            this.adaptValuesByHost();
        }

        return this.defaultValues;
    }

    private getValues(): object {
        if (!this.values) {
            this.values = this.allConfigurations();
            this.adaptValuesByHost();
        }
        return this.values;
    }

    /**
     * Merge and return all default and custom configuration.
     */
    private allConfigurations(): object {
        const valuesFromModules = this.getDefaultValues();
        // from record (custom configuration):
        const customValuesFromRecord = this.getValuesFromRecord();

        return Utils.deepExtend(valuesFromModules, customValuesFromRecord);
    }

    private getValuesFromRecord(): object {
        const key = `${this.siteid}|${this.domain || 'all'}`;
        let configurationRecord: search.Result;
        // Search without SearchRecordHelper to avoid circular dependencies
        try {
            [configurationRecord] = search
                .create({
                    type: this.recordType,
                    columns: [search.createColumn({ name: this.custrecordNsSccValue })],
                    filters: [
                        search.createFilter({
                            name: this.custrecordNsSccKey,
                            operator: search.Operator.IS,
                            values: key
                        })
                    ]
                })
                .run()
                .getRange({ start: 0, end: 1 });
        } catch (e) {
            log.debug('No configuration record found', { key });
        }
        return configurationRecord
            ? JSON.parse(<string>configurationRecord.getValue(this.custrecordNsSccValue))
            : {};
    }

    private adaptValuesByHost(): void {
        interface Host {
            title: string;
            currencies: {
                host: string;
                title: string;
                code: string;
            }[];
            languages: Language[];
        }
        interface Language {
            domain?: string;
            host: string;
            locale: string;
            title: string;
        }
        const multiDomain: { hosts: Host } = this.get('multiDomain');
        if (multiDomain && multiDomain.hosts && multiDomain.hosts.languages) {
            const domainLanguages: Language[] = multiDomain.hosts.languages;
            domainLanguages.forEach(
                (language): void => {
                    const hosts: Host[] = this.get('hosts') || [];
                    const storedHost: Host = _.find(
                        hosts,
                        (host): boolean => host.title === language.host
                    );

                    const hostLanguaje: Language = {
                        title: language.title,
                        host: language.domain,
                        locale: language.locale
                    };

                    if (!storedHost) {
                        hosts.push({
                            title: language.host,
                            languages: [hostLanguaje],
                            currencies: _.filter(
                                this.get('multiDomain.hosts.currencies'),
                                (currency): boolean => currency.host === language.host
                            )
                        });
                    } else {
                        storedHost.languages.push(hostLanguaje);
                    }
                    this.set('hosts', hosts);
                }
            );

            if (!Environment.getInstance().isFeatureInEffect('COMMERCECATEGORIES')) {
                this.set('categories', false);
            }
        }
    }

    /**
     * We have no method in SS2 to get domain name and site id, which are
     * necessary to create the key that is related to the specific configuration record.
     *
     * Call this method to setup configuration with specific domain and site.
     */
    public setSiteAndDomain(siteid: number, domain: string, requestedUrl: string): void {
        this.siteid = siteid;
        this.domain = domain;
        this.requestedUrl = requestedUrl;
    }
}