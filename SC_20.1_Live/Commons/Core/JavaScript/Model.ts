/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Model"/>

import * as Backbone from './backbone/BackboneExtras';
import { ValidationConfig } from './backbone/BackboneValidationExtras';
import { Collection } from './Collection';

export interface ModelEventsDefinition<TModel, TServiceContract> {
    sync: (model: TModel, resp: TServiceContract) => void;
    change: (model: TModel) => void;
    destroy: (model: TModel) => void;
    invalid: (model: TModel) => void;
}
export class Model<
    TEntity,
    TServiceContract = TEntity,
    TEvents extends object = {}
> extends Backbone.Model<TEntity, TServiceContract, TEvents> {
    private operationIds: string[] = [];

    protected validation: ValidationConfig;

    public url = () => {
        let base = this.urlRoot();
        if (!base && this.collection instanceof Collection) {
            base = this.collection.url();
        }
        if (this.isNew()) {
            return base;
        }
        const sep = base.indexOf('?') === -1 ? '?' : '&';
        return base + sep + 'internalid=' + encodeURIComponent((<any>this).id);
    };

    protected urlRoot = () => '';

    // @method url SCA Overrides @?property Backbone.Model.idAttribute
    // to add model's 'internalid' as parameter @return {String}
    protected idAttribute: string = 'internalid';

    public deepCopy(): TEntity {
        return this.attributes;
    }

    public sync(
        method: Backbone.SyncMethod,
        model: this,
        options: Backbone.SyncOptions
    ): JQueryXHR {
        return Backbone.sync.call(this, method, model, options).always((body, status, xhr) => {
            try {
                if (xhr.getResponseHeader) {
                    this.addOperationId(xhr.getResponseHeader('x-n-operationid'));
                }
            } catch (e) {
                console.error('Error fetching Operation Id from header.');
            }
        });
    }

    public addOperationId(ids: string[]): void {
        if (Array.isArray(ids)) {
            this.operationIds = this.operationIds.concat(ids);
        } else {
            this.operationIds.push(ids);
        }
    }

    public getOperationIds() {
        return this.operationIds;
    }

    public getLatestOperationIds(lastOperationIdIndex: number): string[] {
        return this.getOperationIds().slice(lastOperationIdIndex);
    }
}
