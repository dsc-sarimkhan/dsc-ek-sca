/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as log from 'N/log';
import { Search } from '../../Common/SearchRecord/Search';
import { Format } from '../../Common/Format/Format';
import { SearchFilter } from '../../Common/SearchRecord/SearchFilter';
import { SearchOperator } from '../../Common/SearchRecord/SearchOperator';
import { ReturnAuthorizationHandler } from '../ReturnAuthorization/ReturnAuthorization.Handler';
import {
    TransactionField,
    TransactionLine,
    Transaction,
    Fulfillment
} from '../../../ServiceContract/SC/Transaction/Transaction';
import { OrderHistory } from '../../../ServiceContract/SC/OrderHistory/OrderHistory';
import { RecordType } from '../../Common/ActiveRecord/ActiveRecord';
import {
    TransactionHandler,
    SearchOptions,
    TransactionFilterList
} from '../Transaction/Transaction.Handler';
import { SalesorderDao } from './RecordAccess/Salesorder.Dao';
import { Address } from '../Libraries/Address/Address';
import BigNumber from '../../third_parties/bignumber.js';
import { HttpClient, HttpHeaders } from '../../Common/HttpClient/HttpClient';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { WebsiteSetting } from '../../Common/Website/Website';

interface FullfillmentSearchResult {
    line: string;
    internalid: string;
    quantityshiprecv: string;
    date: string;
    shipmethod: string;
    trackingnumbers: string[];
    quantityuom: string;
    status: TransactionField;
    lines?: { internalid: string; quantity: number }[];
    quantity: number;
    item: string;
    shipto: string;
    trandate: string;
    shipaddress: string;
    shipaddress1: string;
    shipaddress2: string;
    shipaddressee: string;
    shipattention: string;
    shipcity: string;
    shipcountry: string;
    shipstate: string;
    shipzip: string;
    quantitypicked: string;
    quantitypacked: string;
}

export interface Tax {
    taxTypeId: string;
    taxTypeName: string;
    taxTotal: string;
}

enum FulfillmentChoices {
    SHIP = '1',
    PICKUP = '2',
    SHIPTEXT = 'ship',
    PICKUPTEXT = 'pickup'
}

export class OrderHistoryHandler extends TransactionHandler<SalesorderDao['schema']> {
    protected customColumnsKey = 'OrderHistory';

    protected dao = new SalesorderDao();

    protected schema = this.dao.getSchema();

    protected format = Format.getInstance();

    protected query: Search<OrderHistory>;

    protected currentRecordId: number;

    private isPickupInStoreEnabled: boolean =
        this.configuration.get('isPickupInStoreEnabled') &&
        this.runtime.isFeatureInEffect('STOREPICKUP');

    private pickPackShipIsEnabled: boolean = this.runtime.isFeatureInEffect('PICKPACKSHIP');

    protected addColumns(): void {
        super.addColumns();
        this.query.addColumn(this.schema.columns.trackingnumbers, {
            trackingnumbers: (value: string): string[] => value && value.split('<BR>')
        });
        if (this.isSCISIntegrationEnabled) {
            this.query.addColumn(this.schema.columns.formulatext, { origin: Number });
        }
    }

    protected getFilters(options: SearchOptions): Partial<TransactionFilterList> {
        const filterMap = super.getFilters(options);
        const { filters } = this.schema;
        const [filter] = options.filter || [null];

        if (filter === 'status:open') {
            filterMap.typeOperator = SearchOperator.Logical.AND;
            filterMap.type = new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                'SalesOrd'
            ]);
            filterMap.statusOperator = SearchOperator.Logical.AND;
            filterMap.status = new SearchFilter(filters.status, SearchOperator.Array.ANYOF, [
                'SalesOrd:A',
                'SalesOrd:B',
                'SalesOrd:D',
                'SalesOrd:E',
                'SalesOrd:F'
            ]);
        } else if (this.isSCISIntegrationEnabled) {
            const scisFilter = [
                SearchOperator.Logical.AND,
                new SearchFilter(filters.createdfromtype, SearchOperator.Array.NONEOF, [
                    'SalesOrd'
                ]),
                SearchOperator.Logical.AND,
                new SearchFilter(
                    this.schema.joins.location.filters.locationtype,
                    SearchOperator.String.IS,
                    this.configuration.get('locationTypeMapping.store.internalid')
                ),
                SearchOperator.Logical.AND,
                new SearchFilter(filters.source, SearchOperator.Array.ANYOF, ['@NONE@', 'SCIS'])
            ];

            if (filter === 'origin:instore') {
                // SCIS Integration enabled, only In Store
                // records (Including Sales Orders from SCIS)
                filterMap.scisrecordsOperator = SearchOperator.Logical.AND;
                scisFilter.unshift(
                    new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                        'CashSale',
                        'CustInvc',
                        'SalesOrd'
                    ])
                );
                filterMap.scisrecords = scisFilter;
            } else {
                // SCIS Integration enabled, all records
                delete filterMap.typeOperator;
                delete filterMap.type;
                filterMap.scisrecordsOperator = SearchOperator.Logical.AND;
                scisFilter.unshift(
                    new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                        'CashSale',
                        'CustInvc'
                    ])
                );
                filterMap.scisrecords = [
                    scisFilter,
                    SearchOperator.Logical.OR,
                    new SearchFilter(filters.type, SearchOperator.Array.ANYOF, ['SalesOrd'])
                ];
            }
        } else {
            // SCIS Integration is disabled, show all the Sales Orders
            filterMap.typeOperator = SearchOperator.Logical.AND;
            filterMap.type = new SearchFilter(filters.type, SearchOperator.Array.ANYOF, [
                'SalesOrd'
            ]);
        }

        const email: string = this.user.getEmail();
        const siteSettings = this.runtime
            .getCurrentWebsite()
            .getSiteSettings([WebsiteSetting.cartsharingmode]);
        if (siteSettings && siteSettings.cartsharingmode === 'PER_CONTACT' && email) {
            filterMap.emailOperator = SearchOperator.Logical.AND;
            filterMap.email = new SearchFilter(filters.email, SearchOperator.String.IS, email);
        }

        return filterMap;
    }

    public getRecordLines(): TransactionLine[] {
        const record = this.currentLoadedRecord;
        const lines = super.getRecordLines();
        const itemSublist = this.transactionSchema.sublists.item;
        for (let i = 0; i < lines.length; i++) {
            const item_fulfillment_choice = record.getSublistValue<string>(
                itemSublist.fields.itemfulfillmentchoice,
                lines[i].index - 1
            );
            lines[i].location = record.getSublistValue<string>(
                itemSublist.fields.location,
                lines[0].index - 1
            );
            if (item_fulfillment_choice) {
                if (item_fulfillment_choice === FulfillmentChoices.SHIP) {
                    lines[i].fulfillmentChoice = FulfillmentChoices.SHIPTEXT;
                } else if (item_fulfillment_choice === FulfillmentChoices.PICKUP) {
                    lines[i].fulfillmentChoice = FulfillmentChoices.PICKUPTEXT;
                }
            }
        }
        return lines;
    }

    private isSCISSource(source: string): boolean {
        return !source || source === 'SCIS';
    }

    public get(id: string, options: Listable<Transaction> & { recordtype?: string }): OrderHistory {
        this.currentRecordId = Number(id);
        const result: Partial<OrderHistory> = super.get(id, options);
        result.recordtype = this.schema.type;
        const { joins, fields } = this.schema;

        const createdFrom = _(result.receipts || []).pluck('internalid');

        createdFrom.push(result.internalid);

        result.returnauthorizations = new ReturnAuthorizationHandler().search({
            ...options,
            createdfrom: createdFrom,
            getLines: true
        }).records;

        let origin = 0;
        let appliedToTransaction: string[];
        const record = this.dao.loadRecord(Number(id), options);

        const source = record.getValue(fields.source);
        const locationResult = Search.lookupFields<{ locationtype: { value: string } }>(
            [joins.location.columns.locationtype],
            <RecordType>result.recordtype,
            Number(result.internalid)
        );
        if (
            this.isSCISIntegrationEnabled &&
            this.isSCISSource(source) &&
            record.getValue(fields.location) &&
            locationResult.locationtype &&
            locationResult.locationtype.value ===
                this.configuration.get('locationTypeMapping.store.internalid')
        ) {
            origin = 1; // store
        } else if (source) {
            origin = 2; // online
        }
        result.origin = origin;

        if (result.recordtype === 'salesorder') {
            appliedToTransaction = _(
                _.where(result.receipts || [], { recordtype: 'invoice' })
            ).pluck('internalid');
        } else if (result.recordtype === 'invoice') {
            appliedToTransaction = [result.internalid];
        }

        if (appliedToTransaction && appliedToTransaction.length) {
            this.getRecordAdjustments(
                {
                    paymentMethodInformation: true,
                    appliedToTransaction: appliedToTransaction
                },
                result.internalid
            );
        }

        result.fulfillments = [];

        if (options.recordtype !== 'salesorder') {
            const location = record.getValue(fields.location);
            result.lines.forEach(
                (line: TransactionLine): void => {
                    line.quantityfulfilled = line.quantity;
                    line.location = location;
                }
            );
        } else {
            const fulfillments = this.getFulfillments(Number(result.internalid));

            fulfillments.forEach(
                (fulfillment): void => {
                    const lineId = result.internalid + '_' + fulfillment.line;
                    const quantity = new BigNumber(fulfillment.quantity);
                    const zero = new BigNumber(0);
                    const fulfillmentId = fulfillment.internalid;

                    if (fulfillmentId) {
                        const addr: Address = new Address({
                            country: fulfillment.shipcountry,
                            state: fulfillment.shipstate,
                            city: fulfillment.shipcity,
                            zip: fulfillment.shipzip,
                            addr1: fulfillment.shipaddress1,
                            addr2: fulfillment.shipaddress2,
                            attention: fulfillment.shipaddressee,
                            addressee: fulfillment.shipaddressee
                        });
                        if (addr.getId()) {
                            result.addresses.push(addr.getAddressBook());
                        }
                        const existingFullfilment: FullfillmentSearchResult = _.findWhere(
                            fulfillments,
                            { internalid: fulfillment.internalid }
                        );

                        if (existingFullfilment) {
                            existingFullfilment.lines = existingFullfilment.lines || [];
                            existingFullfilment.lines.push({
                                internalid: lineId,
                                quantity: Number(quantity)
                            });
                        }

                        if (!result.fulfillments[fulfillmentId]) {
                            const newFulfillment: Fulfillment = {
                                internalid: fulfillmentId,
                                date: fulfillment.date,
                                lines: fulfillment.lines,
                                shipaddress: fulfillment.shipaddress,
                                shipmethod: fulfillment.shipmethod,
                                status: fulfillment.status,
                                trackingnumbers: fulfillment.trackingnumbers
                            };

                            result.fulfillments[fulfillmentId] = newFulfillment;
                        }
                    }

                    const existingLine: TransactionLine = _.findWhere(result.lines, {
                        internalid: lineId
                    });

                    if (existingLine) {
                        const quantityUom = fulfillment.quantityuom
                            ? new BigNumber(fulfillment.quantityuom)
                            : new BigNumber(0);
                        const quantityFulfilled = new BigNumber(fulfillment.quantityshiprecv);
                        const quantityPicked = new BigNumber(fulfillment.quantitypicked);
                        const quantityPacked = new BigNumber(fulfillment.quantitypacked);
                        const conversionUnits =
                            quantity.gt(zero) && quantityUom.gt(zero)
                                ? quantity.dividedBy(quantityUom)
                                : new BigNumber(1);
                        existingLine.quantityfulfilled = quantityFulfilled;

                        let existingLineQuantityPacked: typeof BigNumber;
                        let existingLineQuantityPicked: typeof BigNumber;
                        let existingLineQuantitybackordered: typeof BigNumber;
                        if (
                            existingLine.fulfillmentChoice &&
                            existingLine.fulfillmentChoice === 'pickup'
                        ) {
                            existingLineQuantityPicked = this.pickPackShipIsEnabled
                                ? quantityPicked.minus(quantityFulfilled)
                                : zero;
                            existingLineQuantitybackordered = quantity
                                .minus(quantityFulfilled)
                                .minus(existingLineQuantityPicked);
                        } else {
                            existingLineQuantityPacked = this.pickPackShipIsEnabled
                                ? quantityPacked.minus(quantityFulfilled)
                                : zero;
                            existingLineQuantityPicked = this.pickPackShipIsEnabled
                                ? quantityPicked
                                      .minus(existingLineQuantityPacked)
                                      .minus(quantityFulfilled)
                                : zero;
                            existingLineQuantitybackordered = quantity
                                .minus(quantityFulfilled)
                                .minus(existingLineQuantityPacked)
                                .minus(existingLineQuantityPicked);
                            existingLineQuantityPacked = existingLineQuantitybackordered
                                .dividedBy(conversionUnits)
                                .toNumber();
                        }

                        existingLine.quantityfulfilled = quantityFulfilled
                            .dividedBy(conversionUnits)
                            .toNumber();
                        existingLine.quantitypicked = existingLineQuantityPicked
                            .dividedBy(conversionUnits)
                            .toNumber();
                        existingLine.quantitybackordered = existingLineQuantitybackordered
                            .dividedBy(conversionUnits)
                            .toNumber(); // Add big number type here
                    }
                }
            );

            result.fulfillments = _.values(result.fulfillments);
        }

        result.ismultishipto = record.getValue(fields.ismultishipto);

        result.lines.forEach(
            (line): void => {
                let lineGroupId = '';

                if (result.recordtype === 'salesorder') {
                    if (
                        (this.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup') ||
                        (!result.ismultishipto && (!line.isfulfillable || !result.shipaddress)) ||
                        (result.ismultishipto && (!line.shipaddress || !line.shipmethod))
                    ) {
                        lineGroupId =
                            (this.isSCISIntegrationEnabled && result.origin === 1) ||
                            (this.isPickupInStoreEnabled && line.fulfillmentChoice === 'pickup')
                                ? 'instore'
                                : 'nonshippable';
                    } else {
                        lineGroupId = 'shippable';
                    }
                } else {
                    lineGroupId = 'instore';
                }

                line.linegroup = lineGroupId;
            }
        );

        result.receipts = super.search({
            createdfrom: result.internalid,
            filter: 'CustInvc,CashSale',
            order: 0,
            sort: null,
            from: null,
            to: null,
            page: null
        }).records;

        const statusId = record.getValue(fields.statusRef);
        result.isReturnable =
            result.recordtype === 'salesorder'
                ? statusId !== 'pendingFulfillment' &&
                  statusId !== 'pendingApproval' &&
                  statusId !== 'closed' &&
                  statusId !== 'canceled'
                : true;

        result.paymentevent =
            record.getValue(fields.paymethtype) === 'external_checkout'
                ? {
                      holdreason: record.getValue(fields.paymenteventholdreason),
                      redirecturl: this.generateUrl(result.internalid, result.recordtype)
                  }
                : {};
        result.isCancelable =
            result.recordtype === 'salesorder' && result.status.internalid === 'pendingApproval';
        return <OrderHistory>result;
    }

    protected getRecordTerms(): TransactionField {
        const fields = Search.lookupFields<{
            terms: { value: string; text: string };
        }>([this.schema.columns.terms], this.schema.type, this.currentRecordId);
        return (
            fields.terms &&
            fields.terms &&
            fields.terms.value && {
                internalid: fields.terms.value,
                name: fields.terms.text
            }
        );
    }

    private getFulfillments(id: number): FullfillmentSearchResult[] {
        const { filters, columns, joins } = this.schema;
        const search = this.dao.createSearch<FullfillmentSearchResult>();
        search.setFilters([
            new SearchFilter(filters.internalid, SearchOperator.String.IS, id),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.mainline, SearchOperator.String.IS, 'F'),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.shipping, SearchOperator.String.IS, 'F'),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.taxline, SearchOperator.String.IS, 'F')
        ]);
        const fulfilling = joins.fulfillingtransaction.columns;
        search.addColumn(columns.line);
        search.addColumn(columns.fulfillingtransaction, { internalid: this.format.toValue });
        search.addColumn(columns.quantityshiprecv);
        search.addColumn(columns.actualshipdate, { date: this.format.toValue });
        search.addColumn(columns.quantity, { quantity: Number });
        search.addColumn(fulfilling.item, { item: this.format.toValue });
        search.addColumn(fulfilling.shipmethod, { shipmethod: this.format.toValue });
        search.addColumn(fulfilling.shipto, { shipto: this.format.toValue });
        search.addColumn(fulfilling.trackingnumbers, {
            trackingnumbers: (value: string): string[] => (value ? value.split('<BR>') : null)
        });
        search.addColumn(fulfilling.trandate, { trandate: this.format.toValue });
        search.addColumn(fulfilling.status, { status: this.toTransactionField });
        search.addColumn(fulfilling.shipaddress, { shipaddress: this.format.toValue });
        search.addColumn(fulfilling.shipaddress1, { shipaddress1: this.format.toValue });
        search.addColumn(fulfilling.shipaddress2, { shipaddress2: this.format.toValue });
        search.addColumn(fulfilling.shipaddressee, { shipaddressee: this.format.toValue });
        search.addColumn(fulfilling.shipattention, { shipattention: this.format.toValue });
        search.addColumn(fulfilling.shipcity, { shipcity: this.format.toValue });
        search.addColumn(fulfilling.shipcountry, { shipcountry: this.format.toValue });
        search.addColumn(fulfilling.shipstate, { shipstate: this.format.toValue });
        search.addColumn(fulfilling.shipzip, { shipzip: this.format.toValue });

        if (this.pickPackShipIsEnabled) {
            search.addColumn(columns.quantitypicked);
            search.addColumn(columns.quantitypacked);
        }
        if (this.runtime.isFeatureInEffect('UNITSOFMEASURE')) {
            search.addColumn(columns.quantityuom);
        }
        const results: FullfillmentSearchResult[] = search.getAll();
        results.forEach(
            (result): void => {
                const fulfillmentAddress: Address = new Address({
                    country: result.shipcountry,
                    state: result.shipstate,
                    city: result.shipcity,
                    zip: result.shipzip,
                    addr1: result.shipaddress1,
                    addr2: result.shipaddress2,
                    attention: result.shipattention,
                    addressee: result.shipaddressee
                });
                result.shipaddress = fulfillmentAddress.getId();
            }
        );
        return results;
    }

    public getTaxes(id: string): Tax[] {
        let result: Tax[];
        try {
            const objRecord = this.dao.loadRecord(Number(id), {
                isDynamic: true
            });
            const taxTotals = objRecord.executeMacro<{ response: { taxTotals: Tax[] } }>(
                'getSummaryTaxTotals'
            );
            result =
                taxTotals && taxTotals.response && taxTotals.response.taxTotals
                    ? taxTotals.response.taxTotals
                    : [];
        } catch (error) {
            log.error({
                title: 'Load Record Error',
                details: 'You may need to enable Suite Tax Feature. ' + error
            });
        }
        return result;
    }

    public updateStatus(id: number, status: string, headers: HttpHeaders): string {
        let result = 'OK';

        if (status === 'cancelled') {
            const url =
                'https://' +
                this.runtime.getHost() +
                '/app/accounting/transactions/salesordermanager.nl?type=cancel&xml=T&id=' +
                id;
            const cancelResponse = new HttpClient().get(url, headers);

            if (cancelResponse.code === 206) {
                const fields = Search.lookupFields<{ statusRef: { value: string } }>(
                    [this.schema.columns.statusRef],
                    this.schema.type,
                    id
                );
                result =
                    fields.statusRef && fields.statusRef.value !== 'cancelled'
                        ? 'ERR_ALREADY_APPROVED_STATUS'
                        : 'ERR_ALREADY_CANCELLED_STATUS';
            }
        }

        return result;
    }
}