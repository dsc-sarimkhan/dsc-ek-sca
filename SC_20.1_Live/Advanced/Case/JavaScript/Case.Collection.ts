/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Case.Collection"/>

import * as _ from 'underscore';
import { CaseModel } from './Case.Model';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import { Collection } from '../../../Commons/Core/JavaScript/Collection';

import { Case } from '../../../ServiceContract/SC/Case/Case';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';

import * as Backbone from '../../../Commons/Core/JavaScript/backbone/BackboneExtras';

interface CaseUpdate {
    filter: {
        filter: Function;
        name: string;
        selected: boolean;
        value: string;
    };
    killerId: string;
    order: number;
    page: number;
    range: {
        from: number | undefined;
        to: number | undefined;
    };
    sort: {
        name: string;
        selected: boolean;
        value: string;
    };
}

export class CaseCollection extends Collection<CaseModel, PaginationResponse<Case>, {}> {
    public url = (): string => Utils.getAbsoluteUrl('SC/Case/Case.ss', true);

    public totalRecordsFound: number = 0;

    public recordsPerPage: number = 0;

    public model: typeof CaseModel = CaseModel;

    public original: CaseCollection;

    public constructor(models: CaseModel[] = [], options?: never) {
        super(models, options);
        this.original = null;
    }

    public sync(
        method: Backbone.SyncMethod,
        model: this,
        options: Backbone.SyncOptions
    ): JQuery.jqXHR<PaginationResponse<Case>> {
        return super.sync(method, model, options).always(() => {
            try {
                if (!this.original) {
                    this.original = super.clone();
                }
            } catch (e) {
                console.error('Error cloning collection.');
            }
        });
    }

    public reset(models: CaseModel[], options?: Backbone.Silenceable): CaseModel[] {
        if (!this.original && (_.isArray(models) && models.length > 0)) {
            this.original = super.clone();
        }
        return super.reset(models, options);
    }

    protected parse(response: PaginationResponse<Case>): Case[] {
        this.totalRecordsFound = response.totalRecordsFound;
        this.recordsPerPage = response.recordsPerPage;
        return response.records;
    }

    public update(options: CaseUpdate): void {
        const filter: string | undefined =
            options.filter && options.filter.value ? options.filter.value : undefined;

        super.fetch({
            data: {
                filter: filter,
                sort: options.sort.value,
                order: options.order,
                page: options.page
            },
            reset: true,
            killerId: options.killerId
        });
    }
}
