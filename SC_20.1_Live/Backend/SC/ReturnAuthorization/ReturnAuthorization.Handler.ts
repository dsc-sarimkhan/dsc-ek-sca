/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Search } from '../../Common/SearchRecord/Search';
import { SearchFilter, SearchFilterExpressionArray } from '../../Common/SearchRecord/SearchFilter';
import { SearchOperator } from '../../Common/SearchRecord/SearchOperator';
import {
    Transaction,
    TransactionItem,
    TransactionLine,
    TransactionField
} from '../../../ServiceContract/SC/Transaction/Transaction';
import {
    ReturnAuthorization,
    ReturnAuthorizationFromRecord
} from '../../../ServiceContract/SC/ReturnAuthorization/ReturnAuthorization';
import { SchemaColumn } from '../../Common/Schema/SchemaColumn';
import {
    TransactionHandler,
    SearchOptions,
    TransactionFilterList,
    SearchTransactionOptions
} from '../Transaction/Transaction.Handler';
import { ReturnAuthorizationDao } from './RecordAccess/ReturnAuthorization.Dao';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { Format } from '../../Common/Format/Format';
import { StoreItem } from '../StoreItem/StoreItem';
import { SchemaField } from '../../Common/Schema/SchemaField';
import { Schema } from '../../Common/Schema/Schema';
import { HttpClient, HttpHeaders } from '../../Common/HttpClient/HttpClient';

export class ReturnAuthorizationHandler extends TransactionHandler<
    ReturnAuthorizationDao['schema']
> {
    protected customColumnsKey = 'ReturnAuthorization';

    protected dao = new ReturnAuthorizationDao();

    protected schema = this.dao.getSchema();

    protected format = Format.getInstance();

    protected query: Search<Transaction & ReturnAuthorization>;

    protected getFilters(options: SearchOptions): Partial<TransactionFilterList> {
        const filterMap = super.getFilters(options);
        const { filters, joins } = this.dao.getSchema();
        if (options.getLines) {
            filterMap.mainline = new SearchFilter(filters.shipping, SearchOperator.String.IS, '*');

            filterMap.shippingOperator = SearchOperator.Logical.AND;
            filterMap.shipping = new SearchFilter(filters.shipping, SearchOperator.String.IS, 'F');
            filterMap.taxlineOperator = SearchOperator.Logical.AND;
            filterMap.taxline = new SearchFilter(filters.taxline, SearchOperator.String.IS, 'F');
            filterMap.quantityOperator = SearchOperator.Logical.AND;
            filterMap.quantity = new SearchFilter(
                filters.quantity,
                SearchOperator.Number.NOTEQUALTO,
                0
            );
            filterMap.cogsOperator = SearchOperator.Logical.AND;
            filterMap.cogs = new SearchFilter(filters.cogs, SearchOperator.String.IS, 'F');
            filterMap.transactiondiscountOperator = SearchOperator.Logical.AND;
            filterMap.transactiondiscount = new SearchFilter(
                filters.transactiondiscount,
                SearchOperator.String.IS,
                'F'
            );
            filterMap.typeOperator = SearchOperator.Logical.AND;
            filterMap.type = new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                'RtnAuth'
            ]);
        }
        if (this.isSCISIntegrationEnabled) {
            filterMap.scisrecordsOperator = SearchOperator.Logical.AND;
            filterMap.scisrecords = [
                [
                    new SearchFilter(filters.type, SearchOperator.Array.ANYOF, ['CustCred']),
                    SearchOperator.Logical.AND,
                    new SearchFilter(
                        joins.location.filters.locationtype,
                        SearchOperator.String.IS,
                        this.configuration.get('locationTypeMapping.store.internalid')
                    ),
                    SearchOperator.Logical.AND,
                    new SearchFilter(filters.source, SearchOperator.String.IS, '@NONE@')
                ],
                SearchOperator.Logical.OR,
                new SearchFilter(filters.type, SearchOperator.Array.ANYOF, ['RtnAuth'])
            ];
        } else {
            filterMap.typeOperator = SearchOperator.Logical.AND;
            filterMap.type = new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                'RtnAuth'
            ]);
        }

        if (options.createdfrom) {
            filterMap.createdfromOperator = SearchOperator.Logical.OR;
            options.createdfrom = Array.isArray(options.createdfrom)
                ? options.createdfrom
                : options.createdfrom.split(',');
            const creatredFromFilters: SearchFilterExpressionArray = [
                [
                    new SearchFilter(
                        filters.createdfrom,
                        SearchOperator.Array.ANYOF,
                        options.createdfrom
                    ),
                    SearchOperator.Logical.AND,
                    new SearchFilter(filters.type, SearchOperator.Array.ANYOF, ['RtnAuth'])
                ]
            ];
            if (this.isSCISIntegrationEnabled) {
                creatredFromFilters.push(SearchOperator.Logical.OR);
                creatredFromFilters.push([
                    new SearchFilter(
                        new SchemaColumn('custbody_ns_pos_created_from'),
                        SearchOperator.Array.ANYOF,
                        options.createdfrom
                    ),
                    SearchOperator.Logical.AND,
                    [
                        new SearchFilter(filters.type, SearchOperator.Array.ANYOF, ['CustCred']),
                        SearchOperator.Logical.AND,
                        new SearchFilter(
                            joins.location.filters.locationtype,
                            SearchOperator.String.IS,
                            this.configuration.get('locationTypeMapping.store.internalid')
                        ),
                        SearchOperator.Logical.AND,
                        new SearchFilter(filters.source, SearchOperator.String.IS, '@NONE@')
                    ]
                ]);
                filterMap.createdfrom = creatredFromFilters;
            }
            const search = this.transactionDao.createSearch<Transaction>();
            search.setFilters(_.values(filterMap));
            search.addColumn(this.transactionSchema.columns.internalid);
            let internalIds = _(search.getAll()).pluck('internalid');
            if (options.ids && options.ids.length) {
                internalIds = _.intersection(internalIds, options.ids);
            }

            filterMap.internalidOperator = SearchOperator.Logical.AND;
            filterMap.internalid = new SearchFilter(
                filters.internalid,
                SearchOperator.Array.ANYOF,
                internalIds.length ? internalIds : [0]
            );
        }
        return filterMap;
    }

    protected addColumns(searchOptions: SearchOptions): void {
        super.addColumns(searchOptions);
        this.query.addColumn(this.schema.columns.mainline);
        if (searchOptions.getLines) {
            const { item } = this.schema.joins;
            this.query.sortBy('lines');
            this.query.addColumn(this.schema.columns.rate);
            this.query.addColumn(this.schema.columns.total);
            this.query.addColumn(this.schema.columns.options);
            this.query.addColumn(this.schema.columns.line);
            this.query.addColumn(this.schema.columns.quantity);
            this.query.addColumn(this.schema.columns.options);
            this.query.addColumn(this.schema.columns.amount);
            this.query.addColumn(this.schema.columns.taxtotal, {
                tax_amount: (value: string): number =>
                    this.format.toFloat(this.format.toCurrencyValue(Math.abs(Number(value))))
            });
            this.query.addColumn(item.columns.internalid, { internalid: this.format.toValue });
            this.query.addColumn(item.columns.type, { type: this.format.toValue });
            this.query.addColumn(item.columns.parent, { parent: this.format.toValue });
            this.query.addColumn(item.columns.displayname, { displayname: this.format.toValue });
            this.query.addColumn(item.columns.itemid, { itemid: this.format.toValue });
            this.query.addColumn(item.columns.storedisplayname, {
                storedisplayname: this.format.toValue
            });
        }
    }

    public search(
        options: Partial<Listable<Transaction>> & SearchTransactionOptions
    ): PaginationResponse<Transaction & ReturnAuthorization> {
        const searchPaginatedResult: PaginationResponse<
            Transaction & ReturnAuthorization
        > = super.search(options);
        const results: (Transaction & ReturnAuthorization)[] = searchPaginatedResult.records;
        if (options.getLines) {
            results.forEach(
                (result: ReturnAuthorization): void => {
                    const lines: Partial<TransactionLine>[] = result.lines || [];
                    if (result.type) {
                        const line: Partial<TransactionLine> = {
                            internalid: `${result.internalid}_${result.line}`,
                            quantity: Math.abs(result.quantity),
                            rate: this.format.toFloat(this.format.toCurrencyValue(result.rate)),
                            rate_formatted: `${this.currencySymbol}${result.rate}`,
                            tax_amount: this.format.toFloat(
                                this.format.toCurrencyValue(result.tax_amount)
                            ),
                            tax_amount_formatted: `${this.currencySymbol}${result.tax_amount}`,
                            amount: this.format.toFloat(
                                this.format.toCurrencyValue(Math.abs(result.amount))
                            ),
                            amount_formatted: `${this.currencySymbol}${Math.abs(result.amount)}`,
                            options: this.getOptions(String(result.options))
                        };
                        // preloadItems
                        if (result.internalid && line.internalid) {
                            const preloadedItem = StoreItem.getInstance().get(
                                result.internalid,
                                result.type
                            );
                            const item: Partial<TransactionItem> =
                                preloadedItem && preloadedItem.itemid
                                    ? preloadedItem
                                    : {
                                          internalid: Number(result.internalid),
                                          type: result.type,
                                          parent: result.parent,
                                          displayname: result.displayname,
                                          storedisplayname: result.storedisplayname,
                                          itemid: result.itemid
                                      };

                            item.storedisplayname2 =
                                item.storedisplayname2 || item.storedisplayname;
                            item.pricelevel1 = line.rate;
                            item.pricelevel1_formatted = line.rate_formatted;

                            // If itemimages_detail is not present frontend throws an error that prevent the page to load
                            // itemimages_detail field is not accesible in SS2.
                            // TODO: Remove this when we can close this issue
                            // Issue 570967
                            if (
                                !(
                                    item.itemimages_detail &&
                                    item.itemimages_detail.media &&
                                    item.itemimages_detail.media.urls &&
                                    item.itemimages_detail.media.urls[0] &&
                                    item.itemimages_detail.media.urls[0].url
                                )
                            ) {
                                item.itemimages_detail = {
                                    media: {
                                        urls: [
                                            {
                                                altimagetext: 'alt image text',
                                                url: ''
                                            }
                                        ]
                                    }
                                };
                            }
                            // Issue 570967

                            line.item = item;
                            lines.push(line);
                        }
                        result.lines = <TransactionLine[]>lines;
                    }
                }
            );
        } else if (searchPaginatedResult.records && searchPaginatedResult.records.length) {
            interface QuantitySearchResult {
                internalid: string;
                quantity: string;
            }
            const { filters } = this.schema;
            const quantityQuery = this.transactionDao.createSearch<QuantitySearchResult>();
            quantityQuery.addColumn(this.schema.columns.internalidgroup);
            quantityQuery.addColumn(this.schema.columns.quantitysum);

            quantityQuery.setFilters([
                new SearchFilter(
                    this.schema.filters.internalid,
                    SearchOperator.Array.ANYOF,
                    _.pluck(searchPaginatedResult.records, 'internalid')
                ),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.mainline, SearchOperator.String.IS, 'F'),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.shipping, SearchOperator.String.IS, 'F'),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.shipping, SearchOperator.String.IS, 'F'),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.taxline, SearchOperator.String.IS, 'F'),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.cogs, SearchOperator.String.IS, 'F')
            ]);

            const quantityResults: QuantitySearchResult[] = quantityQuery.getAll();

            searchPaginatedResult.records.forEach(
                (record: ReturnAuthorization): void => {
                    const quantityResult: QuantitySearchResult = _.find(quantityResults, {
                        internalid: record.internalid
                    });
                    record.quantity =
                        (quantityResult && Math.abs(Number(quantityResult.quantity))) || 0;
                }
            );
        }

        searchPaginatedResult.records = _.filter(results, (result): boolean => !!result.internalid);
        return searchPaginatedResult;
    }

    public get(
        id: string,
        options: Listable<Transaction> & { recordtype?: string }
    ): ReturnAuthorizationFromRecord {
        const result: Partial<ReturnAuthorizationFromRecord> = super.get(id, options);
        const { fields, sublists } = this.schema;
        result.isCancelable =
            result.recordtype === 'returnauthorization' &&
            result.status.internalid === 'pendingApproval';
        const amountremaining = this.format.toCurrencyValue(
            this.currentLoadedRecord.getValue(fields.amountremaining)
        );
        const amountpaid = this.format.toCurrencyValue(
            this.currentLoadedRecord.getValue(fields.amountpaid)
        );
        if (this.isSCISIntegrationEnabled && result.recordtype === 'creditmemo') {
            result.amountpaid = Number(amountpaid);
            result.amountpaid_formatted = `${this.currencySymbol}${amountpaid}`;
            result.amountremaining = Number(amountremaining);
            result.amountremaining_formatted = `${this.currencySymbol}${amountremaining}`;

            const ids = [];

            result.applies = {};

            const apply = sublists.apply.fields;
            for (let i = 1; i <= this.currentLoadedRecord.getLineCount(sublists.apply); i++) {
                if (this.currentLoadedRecord.getSublistValue(apply.apply, i) === 'T') {
                    const internalid = this.currentLoadedRecord.getSublistValue(
                        apply.internalid,
                        i
                    );

                    ids.push(internalid);

                    const amount: number = Math.abs(
                        this.currentLoadedRecord.getSublistValue(apply.amount, i)
                    );
                    result.applies[internalid] = {
                        line: i,
                        internalid: internalid,
                        tranid: this.currentLoadedRecord.getSublistValue(apply.refnum, i),
                        applydate: this.currentLoadedRecord.getSublistValue(apply.applydate, i),
                        recordtype: this.currentLoadedRecord.getSublistValue(apply.type, i),
                        currency: this.currentLoadedRecord.getSublistValue(apply.currency, i),
                        amount: amount,
                        amount_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                            amount
                        )}`
                    };
                }
            }

            ids.map(this.getTransactionTypeFromId).forEach(
                (type, index): void => {
                    result.applies[ids[index]].recordtype = type;
                }
            );

            // avoid duplicates
            result.applies = _.values(result.applies);
        }

        result.lines = _.reject(result.lines, function(line): boolean {
            return line.quantity === 0;
        });

        return <ReturnAuthorizationFromRecord>result;
    }

    protected getRecordCreatedFrom(): TransactionField {
        let createdFromInternalid: string;
        let createdFromName: string;

        const custField = new SchemaField('custbody_ns_pos_created_from');
        if (this.isSCISIntegrationEnabled && this.currentRecordResult.recordtype === 'creditmemo') {
            createdFromInternalid = this.currentLoadedRecord.getValue<string>(custField);
            createdFromName = this.currentLoadedRecord.getText<string>(custField);
        } else {
            const createdFromResult = Search.lookupFields<{
                internalid: { value: string; text: string };
            }>(
                [this.schema.columns.createdfrom],
                this.currentRecordResult.recordtype,
                Number(this.currentRecordResult.internalid)
            );
            createdFromInternalid = createdFromResult && createdFromResult.internalid.value;
            createdFromName = createdFromResult && createdFromResult.internalid.text;
        }

        const type: string = createdFromInternalid
            ? this.getTransactionTypeFromId(Number(createdFromInternalid))
            : '';
        const tranidResult =
            type &&
            Search.lookupFields<{ tranid: { value: string; text: string } }>(
                [this.schema.columns.tranid],
                type,
                Number(createdFromInternalid)
            );
        const tranid: string = tranidResult ? tranidResult.tranid.value : '';

        return {
            internalid: createdFromInternalid,
            name: createdFromName,
            recordtype: type,
            tranid: tranid
        };
    }

    public create(
        data: ReturnAuthorizationFromRecord & { id: string; type: string; comments: string }
    ): number {
        const { filters, columns, sublists } = this.schema;
        const returnAuthorization = this.dao.transformRecord({
            fromSchema: <Schema>{ type: data.type },
            id: Number(data.id)
        });
        const search = this.dao.createSearch<{ line: string; rate: string }>();
        const searchFilters: SearchFilterExpressionArray = [
            new SearchFilter(filters.mainline, SearchOperator.String.IS, 'F'),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.internalid, SearchOperator.String.IS, data.id)
        ];

        search.addColumn(columns.line, {
            line: (value: string): string => `${data.id}${this.format.toValue(value)}`
        });
        search.addColumn(columns.rate);
        search.setFilters(searchFilters);

        const transactionLines = search.getAll();
        let lineCount = returnAuthorization.getLineCount(sublists.item);
        let i = 0;

        while (i < lineCount) {
            const lineItemValue = returnAuthorization.getSublistValue(sublists.item.fields.id, i);
            const addLine: TransactionLine = _.findWhere(data.lines, {
                id: lineItemValue
            });
            if (addLine) {
                const transactionLine = _.findWhere(transactionLines, {
                    line: lineItemValue
                });
                returnAuthorization.selectLine(sublists.item, i);
                if (transactionLine) {
                    returnAuthorization.setCurrentSublistValue(
                        sublists.item.fields.rate,
                        transactionLine.rate
                    );
                }

                returnAuthorization.setCurrentSublistValue(
                    sublists.item.fields.quantity,
                    addLine.quantity
                );

                returnAuthorization.setCurrentSublistValue(
                    sublists.item.fields.description,
                    addLine.reason
                );

                returnAuthorization.commitLine(sublists.item);
                i++;
            } else {
                const itemType: string = returnAuthorization.getSublistValue(
                    sublists.item.fields.itemtype,
                    i
                );
                if (itemType === 'GiftCert') {
                    returnAuthorization.removeLine(sublists.item, i);
                    lineCount--;
                } else {
                    returnAuthorization.selectLine(sublists.item, i);
                    returnAuthorization.setCurrentSublistValue(sublists.item.fields.quantity, 0);
                    returnAuthorization.commitLine(sublists.item);
                    i++;
                }
            }
        }
        returnAuthorization.setValue(this.schema.fields.memo, data.comments);

        return returnAuthorization.save();
    }

    public updateStatus(id: number, status: string, headers: HttpHeaders): void {
        if (status === 'cancelled') {
            const url =
                'https://' +
                this.runtime.getHost() +
                '/app/accounting/transactions/returnauthmanager.nl?type=cancel&id=' +
                id;
            new HttpClient().get(url, headers);
        }
    }
}