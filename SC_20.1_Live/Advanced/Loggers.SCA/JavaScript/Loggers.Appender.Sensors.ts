/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import { LoggersAppender } from '../../../Commons/Loggers/JavaScript/Loggers.Appender';

import { ItemTrack } from '../../../Commons/Instrumentation/JavaScript/APMTrackerParameters';

import { dataContractVersion } from './Logger.Appender.Sensor.DataContractVersion';
import { bundle } from './Loggers.Appender.Sensors.Bundle';
import { shopper } from './Loggers.Appender.Sensors.Shopper';
import { device } from './Loggers.Appender.Sensors.Device';
import { site } from './Loggers.Appender.Sensors.SiteData';
import { errorStatus } from './Loggers.Appender.Sensors.ErrorStatus';
import { customer } from './Loggers.Appender.Sensors.Customer';
import { cart } from './Loggers.Appender.Sensors.Cart';

interface LoggersOptions {
    baseLabel: string;
    buildNo: string;
    bundleId: string;
    bundleName: string;
    bundleVersion: string;
    currencyCode: string;
    customerSessionStatus: string;
    dateLabel: string;
    device: string;
    shopperInternalId: string;
    siteUrl: string;
    visitorId: string;
    dataContractVersion: number;
}

export interface NavigationLoggerOptionalsOptions {
    searchQuery: string;
    searchResultCount: number;
    searchPageNumber: number;
    itemId: number;
    displayedInModal: true;
}

interface StandardLoggerOptionsOptionals extends Partial<ItemTrack> {
    operationIds: string[];
    status: string;
    transactionId?: number;
}

interface NavigationLoggersOptions
    extends LoggersOptions,
        Partial<NavigationLoggerOptionalsOptions> {
    errorStatus: undefined | string;
    siteFragment: string;
    sitePage: string;
    sitePageDisplayName: string;
    showContentTime: number;
}

interface StandardLoggersOptions extends LoggersOptions, StandardLoggerOptionsOptionals {
    actionId: string;
    cartLines: string;
}

type LoggerEndOptions = Partial<NavigationLoggerOptionalsOptions> &
    Partial<StandardLoggerOptionsOptionals>;

export class LoggersAppenderSensors implements LoggersAppender {
    private static instance: LoggersAppenderSensors;

    private NLRUM: any;

    private firstTime: boolean = true;

    private applicationStartTime: number;

    private paramsMap = {};

    private enabled = !SC.isPageGenerator();

    private registerMap() {
        this.paramsMap = {
            status: {
                key: 'status',
                values: {
                    success: this.NLRUM.status.completed,
                    fail: this.NLRUM.status.incomplete,
                    cancelled: this.NLRUM.status.cancelled
                }
            }
        };
    }

    private mapParams(params: StandardLoggersOptions) {
        const mapped = {};

        _.mapObject(params, (value, key) => {
            if (this.paramsMap[key]) {
                mapped[this.paramsMap[key].key] =
                    this.paramsMap[key].values && this.paramsMap[key].values[value]
                        ? this.paramsMap[key].values[value]
                        : value;
            } else {
                mapped[key] = value;
            }
        });

        return mapped;
    }

    protected constructor() {
        // don't execute in Page Generator
        if (this.enabled) {
            this.NLRUM = (<any>window).NLRUM;

            if (this.NLRUM && this.NLRUM.addSCData) {
                this.applicationStartTime = (<any>window).applicationStartTime;
                this.NLRUM.setCommerceContext(this.NLRUM.commerceContext.SCA);
                this.registerMap();
            } else {
                this.enabled = false;
                console.log('nlRUM.js failed to load');
            }
        }
    }

    ready() {
        return this.enabled;
    }

    info() {}

    error() {}

    private startNavigation() {
        if (this.applicationStartTime) {
            const options: any = { action: 'Navigation' };
            if (this.firstTime) {
                this.firstTime = false;
                options.startTime = this.applicationStartTime;
            } else {
                this.NLRUM.markIndirectStart && this.NLRUM.markIndirectStart();
                options.startTime = Date.now();
            }
            return options;
        }
    }

    public start(action: string, _options: object) {
        if (action === 'Navigation') {
            return this.startNavigation();
        }
        const actionId = this.NLRUM.actionStart(action);
        return { actionId };
    }

    private endNavigation(
        options: Partial<NavigationLoggerOptionalsOptions> & { startTime: number }
    ) {
        if (this.applicationStartTime) {
            const showContentTime = Date.now() - options.startTime;

            const data: NavigationLoggersOptions = {
                ...bundle(),
                ...shopper(),
                ...customer(),
                ...device(),
                ...site(),
                ...errorStatus(),
                ...dataContractVersion(),
                showContentTime
            };
            if (options.itemId) {
                data.itemId = options.itemId;
            }
            if (options.searchQuery) {
                data.searchQuery = options.searchQuery;
            }
            if (options.searchResultCount !== undefined) {
                data.searchResultCount = options.searchResultCount;
            }
            if (options.searchPageNumber !== undefined) {
                data.searchPageNumber = options.searchPageNumber;
            }
            if (options.displayedInModal) {
                data.displayedInModal = options.displayedInModal;
            }
            this.NLRUM.addSCData(data);
        }
    }

    private extractOperationIds(options) {
        if (_.isString(options.operationIds)) {
            return [options.operationIds];
        }
        if (_.isArray(options.operationIds)) {
            return options.operationIds.slice(0);
        }
        return [];
    }

    end(dataStart, options?: LoggerEndOptions) {
        if (dataStart.action === 'Navigation') {
            dataStart = _.extend(dataStart, options);
            this.endNavigation(dataStart);
        } else {
            const trackOptions: StandardLoggersOptions = {
                actionId: dataStart.actionId,
                operationIds: this.extractOperationIds(options),
                status: options.status,
                ...shopper(),
                ...bundle(),
                ...cart(),
                ...site(),
                ...customer(),
                ...device(),
                ...dataContractVersion()
            };
            if (options.itemId) {
                trackOptions.itemId = options.itemId;
            }
            if (options.itemQuantity) {
                trackOptions.itemQuantity = options.itemQuantity;
            }
            if (options.transactionId) {
                trackOptions.transactionId = options.transactionId;
            }
            this.NLRUM.actionEnd(dataStart.actionId, this.mapParams(trackOptions));
        }
    }

    static getInstance() {
        if (!LoggersAppenderSensors.instance) {
            LoggersAppenderSensors.instance = new LoggersAppenderSensors();
        }
        return LoggersAppenderSensors.instance;
    }
}
