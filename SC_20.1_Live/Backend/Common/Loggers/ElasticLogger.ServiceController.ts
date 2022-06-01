/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as loggerFactory from 'N/internal/elasticLogger';

import { ServiceController, ServiceContext } from '../Controller/ServiceController';
import { HttpResponse } from '../Controller/HttpResponse';

interface LogData {
    type: string;
    info: object[];
    error: object[];
}

interface ResultElasticLogger {
    success: boolean;
    error: string;
}

class ElasticLoggerServiceController extends ServiceController {
    public readonly name = 'ElasaticLogger.ServiceController2';

    protected checkOriginRequest(): boolean {
        return false;
    }

    public post(body: LogData): HttpResponse<ResultElasticLogger> {
        const result: ResultElasticLogger = { success: true, error: null };
        let response = new HttpResponse(result);
        try {
            if (!body) {
                throw new Error('No data on body request');
            }

            ElasticLoggerServiceController.logData(body);
        } catch (e) {
            result.success = false;
            result.error = e.message;
            response = new HttpResponse(result, { customStatus: 500 });
        }
        return response;
    }

    private static logData(data: LogData): void {
        let application_type;

        if (data.type === 'SCA') {
            application_type = loggerFactory.Type.SCA;
        } else if (data.type === 'SCS') {
            application_type = loggerFactory.Type.SCS;
        } else {
            application_type = loggerFactory.Type.SCIS;
        }

        const logger = loggerFactory.create({
            type: application_type
        });

        if (data.info) {
            for (let i = 0; i < data.info.length; i++) {
                logger.info(data.info[i]);
            }
        }

        if (data.error) {
            for (let i = 0; i < data.error.length; i++) {
                logger.error(data.error[i]);
            }
        }
    }
}

export = {
    service: function(ctx: ServiceContext): void {
        new ElasticLoggerServiceController(ctx).initialize();
    }
};