/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.ElasticLogger.Tracker"/>
/**
 * Represents a time span being logged.
 * Provides functionality for tracking manipulation.
 */
export class Tracker {
    /**
     * Unique local action identifier
     */
    private readonly actionId: string;

    /**
     * Name of the log (component area)
     */
    private readonly actionName: string;

    /**
     * Start date/time
     */
    private begin: number;

    /**
     * Total tracked time
     */
    private totalTime: number;

    /**
     * Tracker constructor
     * @param actionName Name of the action to be tracked
     */
    public constructor(actionName: string) {
        this.actionName = actionName;
        this.actionId = Tracker.createGuid();
        this.begin = performance.timing.navigationStart + performance.now();
    }

    /**
     * Creates a version 4 uuid
     */
    public static createGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string): string {
            // eslint-disable-next-line no-bitwise
            const r: number = (Math.random() * 16) | 0;
            // eslint-disable-next-line no-bitwise
            const v: number = c === 'x' ? r : (r & 0x3) | 0x8;

            return v.toString(16);
        });
    }

    /**
     * Id getter
     */
    public getId(): string {
        return this.actionId;
    }

    /**
     * Total time getter
     */
    public getTotalTime(): number {
        return this.totalTime;
    }

    /**
     * Action name getter
     */
    public getActionName(): string {
        return this.actionName;
    }

    /**
     * Overrides the start time for the tracker. Useful for backdating.
     * @param startTime Start time/date to be overriden.
     */
    public setBegin(startTime?: number): Tracker {
        this.begin = startTime || performance.timing.navigationStart + performance.now();
        return this;
    }

    /**
     * Ends the tracking. If no endTime is provided, the present time will be used.
     * @param endTime End time/date to be overriden.
     */
    public endTracking(endTime?: number): Tracker {
        const end: number =
            <number>endTime || <number>performance.timing.navigationStart + performance.now();
        const delay: number = end - <number>this.begin;

        this.totalTime = Math.round(delay);

        return this;
    }
}
