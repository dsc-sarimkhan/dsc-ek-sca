/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import '../../third_parties/underscore.js';
import * as log from 'N/log';
import * as Nerror from 'N/error';
import { ServerRequest, ServerResponse } from 'N/http';
import { HttpResponse } from './HttpResponse';
import {
    methodNotAllowedError,
    badRequestError,
    forbiddenError,
    missingWebsiteIdParameter,
    invalidOriginError
} from './RequestErrors';
import { Website } from '../Website/Website';
import { Environment } from '../Environment/Environment';

export interface ServiceContext {
    request: ServerRequest;
    response: ServerResponse;
}

interface ServiceError extends Nerror.SuiteScriptError {
    status: number;
    details: string;
    params: string;
}

export abstract class ServiceController {
    protected abstract readonly name: string;

    protected request: ServerRequest;

    protected response: ServerResponse;

    /**
     *
     * @deprecated
     * Use body parameter in method signature instead (You must add body type there).
     * Once removed, we must remove it from subscriptions also.
     */
    protected data: any;

    public constructor(context: ServiceContext) {
        this.response = context.response;
        this.request = context.request;
        try {
            // set the current website (this can be removed after we can get website id from backend
            // instead of an url parameter)
            const currentWebsite: Website = new Website(Number(this.request.parameters.n));
            const runtime = Environment.getInstance();
            runtime.setCurrentUrl(this.request.url);
            runtime.setCurrentWebsite(currentWebsite);
        } catch (ex) {
            log.debug('Error setting the environment', ex);
        }
    }

    public initialize(): void {
        try {
            this.handle();
        } catch (ex) {
            this.sendError(ex);
        }
    }

    protected getServiceAction(): string {
        const method = String(this.request.method).toLowerCase();
        return method === 'get' && (this.request.parameters && this.request.parameters.internalid)
            ? 'getById'
            : method;
    }

    protected checkOriginRequest(): boolean {
        return true;
    }

    protected handle(): void {
        if (!Environment.getInstance().getCurrentWebsite()) {
            throw missingWebsiteIdParameter;
        }

        const body = JSON.parse(this.request.body || '{}');
        const parameters = this.request.parameters || {};
        const serviceAction: string = this.getServiceAction();

        if (
            this.checkOriginRequest() &&
            (serviceAction === 'post' || serviceAction === 'put' || serviceAction === 'delete')
        ) {
            const xRequestedWith = this.request.headers['X-Requested-With'];

            if (xRequestedWith !== 'XMLHttpRequest') {
                throw invalidOriginError;
            }
        }

        this.data = body; // TODO: remove (we need to remove it in subscriptions also)

        let result: HttpResponse;

        switch (serviceAction) {
            case 'getById':
                result = this.getById(parameters.internalid, parameters);
                break;
            case 'get':
                result = this.get(parameters);
                break;
            case 'post':
                result = this.post(body, parameters);
                break;
            case 'put':
                result = this.put(body, parameters);
                break;
            case 'delete':
                result = this.delete(body, parameters);
                break;
            default:
                throw methodNotAllowedError;
        }

        this.sendContent(result);
    }

    public sendContent(response: HttpResponse): void {
        // TODO: review window.suiteLogs & Application events
        this.response.setHeader({
            name: 'Custom-Header-Status',
            value: String(response.getCustomStatus())
        });
        this.response.setHeader({
            name: 'Content-Type',
            value: response.getContentType()
        });
        // Set the response cache option
        const cache = response.getCache();
        if (cache) {
            this.response.setCdnCacheable({ type: cache });
        }
        this.response.write({ output: response.getBodyString() });
    }

    public sendError(error: Partial<ServiceError>): void {
        const status: number = error.status || badRequestError.status;
        const errorBody: {
            errorStatusCode: string;
            errorCode: string;
            errorMessage: string;
            errorDetails?: string;
            errorMessageParams?: string;
        } = {
            errorStatusCode: String(status),
            errorCode: error.name || 'UNKNOWN_ERROR',
            errorMessage: _.escape(error.message) || 'error'
        };

        if (error.details) {
            errorBody.errorDetails = error.details;
        }

        if (error.params) {
            errorBody.errorMessageParams = error.params;
        }
        const response = new HttpResponse(errorBody, { customStatus: status });
        this.sendContent(response);
    }

    public get(parameters: object): HttpResponse {
        throw forbiddenError;
    }

    public getById(id: string, parameters: object): HttpResponse {
        throw forbiddenError;
    }

    public post(body: object, parameters: object): HttpResponse {
        throw forbiddenError;
    }

    public put(body: object, parameters: object): HttpResponse {
        throw forbiddenError;
    }

    public delete(body: object, parameters: object): HttpResponse {
        throw forbiddenError;
    }
}