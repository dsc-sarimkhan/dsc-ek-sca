/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.ElasticLogger"/>
/// <reference path="../../Utilities/JavaScript/GlobalDeclarations.d.ts" />

import { Tracker } from './Loggers.Appender.ElasticLogger.Tracker';
import { LoggersAppender } from './Loggers.Appender';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Utils = require('../../Utilities/JavaScript/Utils');
import * as _ from 'underscore';

export interface LoggersAppenderElasticLoggerData {
    suiteScriptAppVersion: string;
    message: string;
}

export class LoggersAppenderElasticLogger implements LoggersAppender {
    protected static instance: LoggersAppenderElasticLogger;

    /**
     * Param used to override the start date
     */
    public readonly START_PARAM = this.paramBackdatingStart();

    protected paramBackdatingStart(): string {
        return 'begin';
    }

    /**
     * Param used to override the end date
     */
    public readonly END_PARAM = this.paramBackdatingEnd();

    protected paramBackdatingEnd(): string {
        return 'end';
    }

    /**
     * Param used to provide the component area
     */
    public readonly COMPONENT_AREA_PARAM = this.paramComponentArea();

    protected paramComponentArea(): string {
        return 'componentArea';
    }

    /**
     * Param used to provide the time total
     */
    public readonly TIME_TOTAL_PARAM = this.paramTimeTotal();

    protected paramTimeTotal(): string {
        return 'totalTime';
    }

    /**
     * Collection of trackers in progress.
     */
    private trackersInProgress: Tracker[] = [];

    private queueErrorTemp = [];

    private queueInfoTemp = [];

    private isWaiting = false;

    private enabled = !SC.isPageGenerator();

    private clearQueues() {
        localStorage.setItem('queueError', JSON.stringify(this.queueErrorTemp));
        localStorage.setItem('queueInfo', JSON.stringify(this.queueInfoTemp));
        this.queueErrorTemp = [];
        this.queueInfoTemp = [];
        this.isWaiting = false;
    }

    private appendTemp() {
        if (this.queueErrorTemp.length > 0) {
            const stringQueueError = localStorage.getItem('queueError');
            const queueError = stringQueueError == null ? [] : JSON.parse(stringQueueError);
            localStorage.setItem(
                'queueError',
                JSON.stringify(queueError.concat(this.queueErrorTemp))
            );
        }
        if (this.queueInfoTemp.length > 0) {
            const stringQueueInfo = localStorage.getItem('queueInfo');
            const queueInfo = stringQueueInfo == null ? [] : JSON.parse(stringQueueInfo);
            localStorage.setItem('queueInfo', JSON.stringify(queueInfo.concat(this.queueInfoTemp)));
        }
        this.isWaiting = false;
    }

    private sendQueues(isAsync: boolean) {
        const { product } = SC.ENVIRONMENT.BuildTimeInf;
        const URL = Utils.getAbsoluteUrl(
            `Common/Loggers/ElasticLogger.ss?n=${SC.ENVIRONMENT.siteSettings.siteid}`, 
            true
        );

        const queueError = JSON.parse(localStorage.getItem('queueError'));
        const queueInfo = JSON.parse(localStorage.getItem('queueInfo'));
        if ((queueInfo && queueInfo.length > 0) || (queueError && queueError.length > 0)) {
            this.isWaiting = true;
            const data = {
                type: product,
                info: queueInfo,
                error: queueError
            };
            if (navigator.sendBeacon) {
                const status = navigator.sendBeacon(URL, JSON.stringify(data));
                if (status) {
                    this.clearQueues();
                } else {
                    this.appendTemp();
                }
            } else {
                jQuery
                    .ajax({
                        type: 'POST',
                        url: URL,
                        data: JSON.stringify(data),
                        contentType: 'text/plain; charset=UTF-8',
                        async: isAsync
                    })
                    .done(() => {
                        this.clearQueues();
                    })
                    .fail(() => {
                        this.appendTemp();
                    });
            }
        }
    }

    protected constructor() {
        if (this.enabled) {
            setInterval(() => {
                this.sendQueues(true);
            }, 60000);

            window.addEventListener('beforeunload', () => {
                this.sendQueues(false);
            });
        }
    }

    public ready(): boolean {
        return this.enabled;
    }

    public info(data: LoggersAppenderElasticLoggerData) {
        data.suiteScriptAppVersion = SC.ENVIRONMENT.RELEASE_METADATA.version;
        data.message = 'clientSideLogDateTime: ' + new Date().toISOString();
        if (this.isWaiting) {
            this.queueInfoTemp.push(data);
        } else {
            const queueInfo = JSON.parse(localStorage.getItem('queueInfo')) || [];
            queueInfo.push(data);
            localStorage.setItem('queueInfo', JSON.stringify(queueInfo));
        }
    }

    public error(data: LoggersAppenderElasticLoggerData) {
        data.suiteScriptAppVersion = SC.ENVIRONMENT.RELEASE_METADATA.version;
        data.message = 'clientSideLogDateTime: ' + new Date().toISOString();
        if (this.isWaiting) {
            this.queueErrorTemp.push(data);
        } else {
            const queueError = JSON.parse(localStorage.getItem('queueError')) || [];
            queueError.push(data);
            localStorage.setItem('queueError', JSON.stringify(queueError));
        }
    }

    public start(_action: string) {
        // Generate a new tracker for the action
        const tracker = new Tracker(_action);
        this.trackersInProgress.push(tracker);

        // Return the object expected by the facade
        return {
            actionId: tracker.getId()
        };
    }

    public end(_startOptions, _options) {
        // Find the tracker in progress and remove it from the collection
        const tracker: Tracker = _.find(this.trackersInProgress, function(item: Tracker): boolean {
            return item.getId() === _startOptions.actionId;
        });

        this.trackersInProgress = _.without<Tracker>(this.trackersInProgress, tracker);

        // Override the start time if provided
        if (!_.isUndefined(_options[this.START_PARAM])) {
            tracker.setBegin(_options[this.START_PARAM]);
        }

        // End the tracking
        if (_.isUndefined(_options[this.END_PARAM])) {
            tracker.endTracking();
        } else {
            // Override the end date if provided
            tracker.endTracking(_options[this.END_PARAM]);
        }

        // Generate data object including user provided parameters
        const data: LoggersAppenderElasticLoggerData = _.extend(
            {
                [this.COMPONENT_AREA_PARAM]: tracker.getActionName(),
                [this.TIME_TOTAL_PARAM]: tracker.getTotalTime()
            },
            _options
        );

        // Post to ES as info log
        this.info(data);
    }

    public static getInstance() {
        if (!LoggersAppenderElasticLogger.instance) {
            LoggersAppenderElasticLogger.instance = new LoggersAppenderElasticLogger();
        }

        return LoggersAppenderElasticLogger.instance;
    }
}
