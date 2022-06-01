/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Environment } from '../../Common/Environment/Environment';
import { TransactionDao } from './RecordAccess/Transaction.Dao';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { Search, SearchColumnSort } from '../../Common/SearchRecord/Search';
import { Format } from '../../Common/Format/Format';
import {
    SearchFilter,
    SearchFilterExpression,
    SearchFilterExpressionArray
} from '../../Common/SearchRecord/SearchFilter';
import {
    Transaction,
    TransactionField,
    TransactionFromRecord,
    TransactionLine,
    TransactionOption,
    TransactionItem,
    TransactionPaymentMethod,
    Promocode
} from '../../../ServiceContract/SC/Transaction/Transaction';
import { SearchOperator } from '../../Common/SearchRecord/SearchOperator';
import { User } from '../Libraries/Auth/User';
import { Configuration } from '../Libraries/Configuration/Configuration';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import { StoreItem } from '../StoreItem/StoreItem';
import { SalesorderDao } from '../OrderHistory/RecordAccess/Salesorder.Dao';
import { SchemaField } from '../../Common/Schema/SchemaField';
import { Schema } from '../../Common/Schema/Schema';
import { SchemaColumn } from '../../Common/Schema/SchemaColumn';
import { ActiveRecord } from '../../Common/ActiveRecord/ActiveRecord';
import { Address } from '../Libraries/Address/Address';
import { SchemaSublistField } from '../../Common/Schema/SchemaSublistField';
import { notFoundError } from '../../Common/Controller/RequestErrors';
import { TransactionSchema } from './RecordAccess/Transaction.Schema';

export interface SearchOptions extends SearchTransactionOptions {
    filter: string[];
    order: number;
    sort: (keyof Transaction)[];
    page: string;
    from?: string;
    to?: string;
}

export interface SearchTransactionOptions {
    getLines?: boolean;
    ids?: string[];
    createdfrom?: string[] | string;
}

interface TransactionAdjustment {
    internalid: string;
    total: string;
    tranid: string;
    trandate: string;
    paymentmethodstring: string;
    paymentmethod: TransactionPaymentMethod;
    ccnumber: string;
    ccexpdate: string;
    ccholdername: string;
    type: string;
    recordtype: string;
    amount: string;
    amount_formatted: string;
}

type TransactionFilterExpression = SearchFilterExpression | SearchFilterExpressionArray;

export interface TransactionFilterList {
    entity: TransactionFilterExpression;
    mainlineOperator: TransactionFilterExpression;
    mainline: TransactionFilterExpression;
    dateOperator: TransactionFilterExpression;
    date: TransactionFilterExpression;
    createdfromOperator: TransactionFilterExpression;
    createdfrom: TransactionFilterExpression;
    emailOperator: TransactionFilterExpression;
    email: TransactionFilterExpression;
    statusOperator: TransactionFilterExpression;
    status: TransactionFilterExpression;
    siteOperator: TransactionFilterExpression;
    site: TransactionFilterExpression;
    scisrecordsOperator: TransactionFilterExpression;
    scisrecords: TransactionFilterExpression;
    shippingOperator: TransactionFilterExpression;
    shipping: TransactionFilterExpression;
    taxlineOperator: TransactionFilterExpression;
    taxline: TransactionFilterExpression;
    quantityOperator: TransactionFilterExpression;
    quantity: TransactionFilterExpression;
    cogsOperator: TransactionFilterExpression;
    cogs: TransactionFilterExpression;
    transactiondiscountOperator: TransactionFilterExpression;
    transactiondiscount: TransactionFilterExpression;
    internalidOperator: TransactionFilterExpression;
    internalid: TransactionFilterExpression;
    typeOperator: TransactionFilterExpression;
    type: TransactionFilterExpression;
}

export abstract class TransactionHandler<S extends TransactionSchema | Schema = TransactionSchema> {
    protected dao: TransactionDao<S> = new TransactionDao();

    protected transactionDao: TransactionDao = new TransactionDao();

    protected transactionSchema = this.dao.getSchema();

    protected query: Search<Transaction> = this.dao.createSearch<Transaction>();

    protected runtime = Environment.getInstance();

    protected configuration = Configuration.getInstance();

    protected format = Format.getInstance();

    protected isMultiCurrency = this.runtime.isFeatureInEffect('MULTICURRENCY');

    protected isMultiSite = this.runtime.isFeatureInEffect('MULTISITE');

    protected currentRecordResult: Partial<TransactionFromRecord>;

    protected abstract customColumnsKey;

    protected isSCISIntegrationEnabled: boolean =
        this.configuration.get('isSCISIntegrationEnabled') &&
        !!Search.lookupFields(
            [new SchemaColumn('custbody_ns_pos_transaction_status')],
            new SalesorderDao().getSchema().type
        );

    protected currencySymbol = this.runtime.getCurrentWebsite().getCurrency().displaysymbol;

    protected currentLoadedRecord: ActiveRecord;

    protected user: User = User.getInstance();

    private transactionFields = this.transactionSchema.fields;

    protected getFilters(options: SearchOptions): Partial<TransactionFilterList> {
        const { filters } = this.transactionSchema;
        const filterMap: Partial<TransactionFilterList> = {};

        filterMap.entity = new SearchFilter(
            filters.entity,
            SearchOperator.String.IS,
            this.user.getId()
        );
        filterMap.mainlineOperator = SearchOperator.Logical.AND;
        filterMap.mainline = new SearchFilter(filters.mainline, SearchOperator.String.IS, 'T');

        if (options.from || options.to) {
            filterMap.dateOperator = SearchOperator.Logical.AND;
        }

        if (options.from && options.to) {
            filterMap.date = new SearchFilter(
                filters.trandate,
                SearchOperator.Date.WITHIN,
                options.from,
                options.to
            );
        } else if (options.from) {
            filterMap.date = new SearchFilter(
                filters.trandate,
                SearchOperator.Date.ONORAFTER,
                options.from
            );
        } else if (options.to) {
            filterMap.date = new SearchFilter(
                filters.trandate,
                SearchOperator.Date.ONORBEFORE,
                options.to
            );
        }

        if (options.createdfrom) {
            filterMap.createdfromOperator = SearchOperator.Logical.AND;
            filterMap.createdfrom = new SearchFilter(
                filters.createdfrom,
                SearchOperator.String.IS,
                options.createdfrom
            );
        }

        if (options.filter) {
            filterMap.typeOperator = SearchOperator.Logical.AND;
            filterMap.type = new SearchFilter(
                filters.type,
                SearchOperator.Array.ANYOF,
                options.filter
            );
        }

        if (this.isMultiSite) {
            const siteId = String(this.runtime.getCurrentWebsite().getId());
            const siteIds: string[] = [];
            const filterSite: string | string[] | { option: string; ids: string[] } =
                this.configuration.get('filterSite') || this.configuration.get('filter_site');

            if (filterSite === 'current') {
                siteIds.push(siteId);
                siteIds.push('@NONE@');
            } else if (Array.isArray(filterSite)) {
                siteIds.push(...filterSite);
                siteIds.push('@NONE@');
            } else if (filterSite && typeof filterSite === 'object' && filterSite.option) {
                switch (filterSite.option) {
                    case 'siteIds':
                        siteIds.push(...filterSite.ids);
                        break;
                    default:
                        // case 'current' (current site) is configuration default
                        siteIds.push(siteId);
                        siteIds.push('@NONE@');
                }
            }
            if (siteIds.length) {
                filterMap.siteOperator = SearchOperator.Logical.AND;
                filterMap.site = new SearchFilter(
                    filters.website,
                    SearchOperator.Array.ANYOF,
                    _.uniq(siteIds)
                );
            }
        }
        return filterMap;
    }

    protected toTransactionField(value: string, text: string): TransactionField {
        return {
            internalid: value,
            name: text
        };
    }

    protected addColumns(searchOptions?: SearchOptions): void {
        const { columns } = this.transactionSchema;

        if (this.isMultiCurrency) {
            this.query.addColumn(columns.currency, { currency: this.toTransactionField });
        }

        this.query.addColumn(columns.internalid);
        this.query.addColumn(columns.tranid);
        this.query.addColumn(columns.trandate, { trandate: this.format.toDateString });
        this.query.addColumn(columns.amount, {
            amount_formatted: (value: number): string =>
                this.format.toCurrencyValue(Math.abs(value)),
            amount: Math.abs
        });
        this.query.addColumn(columns.status, {
            status: (value: string, text: string): TransactionField =>
                this.toTransactionField(this.format.toCamelCase(value), text),
            recordtype: (value: string, text: string, type: string): string => type
        });
        this.dao.getCustomColumns(this.customColumnsKey).forEach(
            (column): void => {
                this.query.addColumn(column);
            }
        );
    }

    public search(
        options: Partial<Listable<Transaction>> & SearchTransactionOptions
    ): PaginationResponse<Transaction> {
        const from = options.from && options.from.split('-');
        const to = options.to && options.to.split('-');
        const filter = options.filter && options.filter.split(',');
        const sort = options.sort && <(keyof Transaction)[]>options.sort.split(',');
        const searchOptions: SearchOptions = {
            to: to && this.format.toDateString(to.join('/')),
            from: from && this.format.toDateString(from.join('/')),
            filter: filter,
            order: options.order,
            sort: sort || [],
            page: String(options.page),
            createdfrom: options.createdfrom,
            ids: options.ids,
            getLines: options.getLines
        };

        // add columns to search
        this.addColumns(searchOptions);
        // add filters to search
        this.query.setFilters(_.values(this.getFilters(searchOptions)));

        // search sort
        searchOptions.sort.forEach(
            (sortKey): void => {
                this.query.sortBy(
                    sortKey,
                    options.order > 0 ? SearchColumnSort.DESC : SearchColumnSort.ASC
                );
            }
        );

        // fetch the result
        const result = this.query.getPaginated(
            options.page,
            options.results_per_page || this.configuration.get('suitescriptResultsPerPage')
        );

        // add currency symbol here (because of multicurrency)
        result.records.forEach(
            (record): void => {
                record.amount_formatted = `${
                    this.runtime
                        .getCurrentWebsite()
                        .getCurrency(record.currency ? Number(record.currency.internalid) : null)
                        .displaysymbol
                }${record.amount_formatted}`;
            }
        );

        return result;
    }

    public get(
        id: string,
        options?: Listable<Transaction> & { recordtype?: string }
    ): Partial<TransactionFromRecord> {
        const { fields } = this.transactionSchema;
        this.currentLoadedRecord = this.dao.loadRecord(Number(id), {
            recordtype: options && options.recordtype
        });
        if (!id) {
            throw notFoundError;
        }
        let currency = this.runtime.getCurrentWebsite().getCurrency();

        this.currentRecordResult = {
            internalid: id,
            tranid: this.currentLoadedRecord.getValue<string>(fields.tranid),
            trandate: this.format.toDateString(this.currentLoadedRecord.getValue(fields.trandate)),
            memo: this.currentLoadedRecord.getValue<string>(fields.memo),
            addresses: []
        };

        if (this.isMultiCurrency) {
            this.currentRecordResult.currency = {
                internalid: this.currentLoadedRecord.getValue<string>(fields.currency),
                name: this.currentLoadedRecord.getValue<string>(fields.currencyname)
            };
            currency = this.runtime
                .getCurrentWebsite()
                .getCurrency(Number(this.currentRecordResult.currency.internalid));
            this.currentRecordResult.selected_currency = {
                internalid: String(currency.currency),
                symbol: currency.displaysymbol,
                code: currency.symbol,
                name: currency.name,
                currencyname: currency.name,
                isdefault: currency.isdefault ? 'T' : 'F',
                symbolplacement: currency.symbolplacement
            };
            this.currencySymbol = currency.displaysymbol;
        }

        this.currentRecordResult.createdfrom = this.getRecordCreatedFrom();
        this.currentRecordResult.status = this.getRecordStatus();
        this.currentRecordResult.summary = this.getRecordSummary();
        this.currentRecordResult.paymentmethods = this.getRecordPaymentMethods();
        this.currentRecordResult.promocodes = this.getRecordPromoCodes();

        // Purchase Order Number
        const otherrefnum = this.currentLoadedRecord.getValue(fields.otherrefnum);
        this.currentRecordResult.purchasenumber =
            otherrefnum === 'undefined' ? undefined : Number(otherrefnum) || null;

        // Record Addresses
        const billSubrecord = this.currentLoadedRecord.getSubrecord(fields.billingaddress);
        const billAddress: Address = new Address({
            country: billSubrecord.getValue<string>(fields.country),
            state: billSubrecord.getValue<string>(fields.state),
            city: billSubrecord.getValue<string>(fields.city),
            zip: billSubrecord.getValue<string>(fields.zip),
            addr1: billSubrecord.getValue<string>(fields.addr1),
            addr2: billSubrecord.getValue<string>(fields.addr2),
            phone: billSubrecord.getValue<string>(fields.addrphone),
            attention: billSubrecord.getValue<string>(fields.attention),
            addressee: billSubrecord.getValue<string>(fields.addressee)
        });
        if (billAddress.getId()) {
            this.currentRecordResult.addresses.push(billAddress.getAddressBook());
        }
        this.currentRecordResult.billaddress = billAddress.getId();

        const shipSubrecord = this.currentLoadedRecord.getSubrecord(fields.shippingaddress);
        const shipAddress: Address = new Address({
            country: shipSubrecord.getValue<string>(fields.country),
            state: shipSubrecord.getValue<string>(fields.state),
            city: shipSubrecord.getValue<string>(fields.city),
            zip: shipSubrecord.getValue<string>(fields.zip),
            addr1: shipSubrecord.getValue<string>(fields.addr1),
            addr2: shipSubrecord.getValue<string>(fields.addr2),
            phone: shipSubrecord.getValue<string>(fields.addrphone),
            attention: shipSubrecord.getValue<string>(fields.attention),
            addressee: shipSubrecord.getValue<string>(fields.addressee)
        });
        if (shipAddress.getId()) {
            this.currentRecordResult.addresses.push(shipAddress.getAddressBook());
        }
        this.currentRecordResult.shipaddress = shipAddress.getId();

        // Record Shipping Methods
        this.currentRecordResult.shipmethods = this.currentRecordResult.shipmethods || [];
        this.currentRecordResult.shipmethod =
            this.currentLoadedRecord.getValue<string>(fields.shipmethod) || null;
        const shipSublist = this.transactionSchema.sublists.shipgroup;
        const shipLineCount: number = this.currentLoadedRecord.getLineCount(shipSublist);
        const uniqueIdFlag = [];
        if (shipLineCount <= 0) {
            const shippingRate = this.currentLoadedRecord.getValue(fields.shipping_rate);
            const shipid = this.currentLoadedRecord.getValue<string>(fields.shipmethod);
            if (uniqueIdFlag.indexOf(shipid) < 0) {
                this.currentRecordResult.shipmethods.push({
                    internalid: shipid,
                    name: this.currentLoadedRecord.getText<string>(fields.shipmethod),
                    rate: Number(shippingRate || 0),
                    rate_formatted: `${this.format.toCurrency(shippingRate)}`,
                    shipcarrier: this.currentLoadedRecord.getValue<string>(fields.carrier)
                });
            }
            uniqueIdFlag.push(shipid);
        }

        for (let i = 0; i < shipLineCount; i++) {
            const shippingRate = this.currentLoadedRecord.getSublistValue(
                shipSublist.fields.shippingrate,
                i
            );
            const shipid = String(
                this.currentLoadedRecord.getSublistValue(shipSublist.fields.shippingmethodref, i)
            );
            if (uniqueIdFlag.indexOf(shipid) < 0) {
                this.currentRecordResult.shipmethods.push({
                    internalid: shipid,
                    name: String(
                        this.currentLoadedRecord.getSublistValue(
                            shipSublist.fields.shippingmethod,
                            i
                        )
                    ),
                    rate: Number(shippingRate),
                    rate_formatted: `${this.format.toCurrency(shippingRate)}`,
                    shipcarrier: String(
                        this.currentLoadedRecord.getSublistValue(
                            shipSublist.fields.shippingcarrier,
                            i
                        )
                    )
                });
            }
            uniqueIdFlag.push(shipid);
        }

        // getLines
        this.currentRecordResult.lines = this.getRecordLines();

        // Transaction Custom Fields:
        this.currentRecordResult.options = _.mapObject(
            this.getRecordCustomFieldIds(),
            (field: string): string => this.currentLoadedRecord.getValue(new SchemaField(field))
        );

        this.currentRecordResult.addresses = _.uniq(
            this.currentRecordResult.addresses,
            'internalid'
        );

        if (options && options.recordtype && !this.currentRecordResult.recordtype) {
            this.currentRecordResult.recordtype = options.recordtype;
        }
        return this.currentRecordResult;
    }

    protected getTransactionTypeFromId(id: number): string {
        let type = null;
        const fields = Search.lookupFields(
            [this.transactionSchema.columns.recordtype],
            this.transactionSchema.type,
            id
        );

        if (fields && fields[0]) {
            type = String(fields[0]);
        }
        return type;
    }

    protected getRecordCreatedFrom(): TransactionField {
        const createdFromId = this.currentLoadedRecord.getValue(this.transactionFields.createdfrom);
        return {
            internalid: String(createdFromId || ''),
            name:
                this.currentLoadedRecord.getText<string>(this.transactionFields.createdfrom) || '',
            recordtype: this.getTransactionTypeFromId(Number(createdFromId)) || ''
        };
    }

    protected getRecordStatus(): TransactionField {
        return {
            internalid: this.format.toCamelCase(
                this.currentLoadedRecord.getValue<string>(this.transactionFields.status)
            ),
            name: this.currentLoadedRecord.getText<string>(this.transactionFields.status)
        };
    }

    private getRecordSummary(): TransactionFromRecord['summary'] {
        const subtotal = this.currentLoadedRecord.getValue(this.transactionFields.subtotal);
        const taxtotal = this.currentLoadedRecord.getValue(this.transactionFields.taxtotal);
        const tax2total = this.currentLoadedRecord.getValue(this.transactionFields.tax2total);
        const shippingcost = this.currentLoadedRecord.getValue(this.transactionFields.shippingcost);
        const handlingcost = this.currentLoadedRecord.getValue(this.transactionFields.handlingcost);
        const discounttotal = this.currentLoadedRecord.getValue(
            this.transactionFields.discounttotal
        );
        const discountrate = this.currentLoadedRecord.getValue(this.transactionFields.discountrate);
        const giftcertapplied = this.currentLoadedRecord.getValue(
            this.transactionFields.giftcertapplied
        );
        const total = this.currentLoadedRecord.getValue(this.transactionFields.total);
        return {
            subtotal: this.format.toFloat(subtotal),
            subtotal_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(subtotal)}`,
            taxtotal: this.format.toFloat(taxtotal),
            taxtotal_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(taxtotal)}`,
            tax2total: this.format.toFloat(tax2total),
            tax2total_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(tax2total)}`,
            shippingcost: this.format.toFloat(shippingcost),
            shippingcost_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                shippingcost
            )}`,
            handlingcost: this.format.toFloat(handlingcost),
            handlingcost_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                handlingcost
            )}`,
            estimatedshipping: 0,
            estimatedshipping_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
            taxonshipping: 0,
            taxonshipping_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
            discounttotal: this.format.toFloat(discounttotal),
            discounttotal_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                discounttotal
            )}`,
            taxondiscount: 0,
            taxondiscount_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
            discountrate: this.format.toFloat(discountrate),
            discountrate_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
            discountedsubtotal: 0,
            discountedsubtotal_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
            giftcertapplied: this.format.toFloat(giftcertapplied),
            giftcertapplied_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                giftcertapplied
            )}`,
            total: this.format.toFloat(total),
            total_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(total)}`
        };
    }

    private getRecordPromoCodes(): Promocode[] {
        const promocodes: Promocode[] = [];

        const promocode = this.currentLoadedRecord.getValue(this.transactionFields.promocode);

        // If legacy behavior is present & a promocode is applied this IF will be true
        // In case stackable promotions are enable this.record.getFieldValue('promocode')
        // returns null
        if (promocode) {
            promocodes.push({
                internalid: String(promocode),
                code: this.currentLoadedRecord.getText<string>(this.transactionFields.couponcode),
                isvalid: true,
                discountrate_formatted: ''
            });
        }
        // otherwise we change for the list of stackable promotions. If it is the legacy
        // (not stackable promotions) code, the
        // this.record.getLineItemCount('promotions') will return 0
        const promoSublist = this.transactionSchema.sublists.promotions;
        for (let i = 0; i < this.currentLoadedRecord.getLineCount(promoSublist); i++) {
            if (
                this.currentLoadedRecord.getSublistValue(
                    promoSublist.fields.applicabilitystatus,
                    i
                ) !== 'NOT_APPLIED'
            ) {
                promocodes.push({
                    internalid: String(
                        this.currentLoadedRecord.getSublistValue(promoSublist.fields.couponcode, i)
                    ),
                    code: String(
                        this.currentLoadedRecord.getSublistValue(
                            promoSublist.fields.couponcode_display,
                            i
                        )
                    ),
                    isvalid:
                        this.currentLoadedRecord.getSublistValue(
                            promoSublist.fields.promotionisvalid,
                            i
                        ) === 'T',
                    discountrate_formatted: ''
                });
            }
        }
        return promocodes;
    }

    private getRecordPaymentMethods(): TransactionPaymentMethod[] {
        const paymentMethod: Partial<TransactionPaymentMethod> = {
            type: this.currentLoadedRecord.getValue<string>(this.transactionFields.paymentmethod),
            primary: true,
            name: this.currentLoadedRecord.getText<string>(this.transactionFields.paymentmethod)
        };
        const terms: TransactionField = this.getRecordTerms();
        const ccnumber = this.currentLoadedRecord.getValue<string>(this.transactionFields.ccnumber);
        const paymentOptions = this.currentLoadedRecord.getValue<string>(
            this.transactionFields.paymentoption
        );
        if (ccnumber) {
            paymentMethod.type = 'creditcard';
            paymentMethod.creditcard = {
                ccnumber: ccnumber,
                ccexpiredate: this.currentLoadedRecord.getValue<string>(
                    this.transactionFields.ccexpiredate
                ),
                ccname: this.currentLoadedRecord.getValue<string>(this.transactionFields.ccname),
                internalid: this.currentLoadedRecord.getValue<string>(
                    this.transactionFields.creditcard
                ),
                paymentmethod: {
                    ispaypal: 'F',
                    name: this.currentLoadedRecord.getText<string>(
                        this.transactionFields.paymentmethod
                    ),
                    creditcard: 'T',
                    internalid: this.currentLoadedRecord.getValue<string>(
                        this.transactionFields.paymentmethod
                    )
                }
            };
        }
        if (terms) {
            paymentMethod.type = 'invoice';
            paymentMethod.paymentterms = terms;
        }

        return paymentMethod.type ? [<TransactionPaymentMethod>paymentMethod] : [];
    }

    // eslint-disable-next-line class-methods-use-this
    protected getOptions(stringOptions: string): TransactionOption[] {
        const options: TransactionOption[] = [];
        if (stringOptions && stringOptions !== '- None -') {
            stringOptions.split(String.fromCharCode(4)).forEach(
                (optionLine: string): void => {
                    const lineArray = optionLine.split(String.fromCharCode(3));
                    options.push({
                        cartOptionId: lineArray[0].toLowerCase(),
                        label: lineArray[2],
                        value: {
                            label: lineArray[4],
                            internalid: lineArray[3]
                        },
                        ismandatory: lineArray[1] === 'T'
                    });
                }
            );
        }
        return options;
    }

    protected getRecordTerms(): TransactionField {
        const termsValue = this.currentLoadedRecord.getValue<string>(this.transactionFields.terms);
        return (
            termsValue && {
                internalid: termsValue,
                name: this.currentLoadedRecord.getText<string>(this.transactionFields.terms)
            }
        );
    }

    protected getRecordLines(): TransactionLine[] {
        const record = this.currentLoadedRecord;
        const recordAddressses: string[] = [];
        const addrSublist = this.transactionSchema.sublists.iladdrbook;
        for (let i = 0; i < record.getLineCount(addrSublist); i++) {
            // Adds all the addresses in the address book
            const shipaddr = record.getSublistValue(addrSublist.fields.shipaddr, i);

            const address: Address = new Address({
                country: record.getSublistValue<string>(addrSublist.fields.shipcountry, i),
                state: record.getSublistValue<string>(addrSublist.fields.shipstate, i),
                city: record.getSublistValue<string>(addrSublist.fields.shipcity, i),
                zip: record.getSublistValue<string>(addrSublist.fields.shipzip, i),
                addr1: record.getSublistValue<string>(addrSublist.fields.shipaddr1, i),
                addr2: record.getSublistValue<string>(addrSublist.fields.shipaddr2, i),
                phone: record.getSublistValue<string>(addrSublist.fields.shipphone, i),
                attention: record.getSublistValue<string>(addrSublist.fields.shipattention, i),
                addressee: record.getSublistValue<string>(addrSublist.fields.shipaddressee, i)
            });
            this.currentRecordResult.addresses.push(address.getAddressBook());
            recordAddressses[String(shipaddr)] = address.getId();
        }

        const { item } = this.transactionSchema.sublists;

        type TransactionLineToPreload = TransactionLine & { itemIdToPreload: string };
        const lines: { [key: string]: Partial<TransactionLineToPreload> } = {};

        const preloadedItems: Partial<TransactionItem>[] = [];
        const itemsToQuery: Partial<TransactionLineToPreload>[] = [];

        const numberId = Number(this.currentRecordResult.internalid);
        for (let i = 0; i < record.getLineCount(item); i++) {
            const itemtype = record.getSublistValue(item.fields.itemtype, i);
            const discline = record.getSublistValue(item.fields.discline, i);
            const amount = record.getSublistValue(item.fields.amount, i);
            const itemdisplay = record.getSublistValue(item.fields.itemdisplay, i);
            const lineItem = String(record.getSublistValue(item.fields.item, i));
            let lineId = String(record.getSublistValue(item.fields.id, i));

            if (itemtype === 'Discount' && discline) {
                lineId = `${this.currentRecordResult.internalid}_${discline}`;
                const parsedAmount = Math.abs(parseFloat(amount));
                lines[lineId] = lines[lineId] || {};
                lines[lineId].discount = lines[lineId].discount
                    ? lines[lineId].discount + parsedAmount
                    : parsedAmount;
                lines[lineId].total =
                    lines[lineId].amount + lines[lineId].tax_amount - lines[lineId].discount;
                lines[lineId].discount_name = String(itemdisplay);
            } else {
                const rate = record.getSublistValue(item.fields.rate, i);
                const tax1amt = record.getSublistValue(item.fields.tax1amt, i);
                const quantity = record.getSublistValue(item.fields.quantity, i);
                const taxrate1 = record.getSublistValue(item.fields.taxrate1, i);
                const fulfillable = record.getSublistValue(item.fields.fulfillable, i);
                const location = record.getSublistValue(item.fields.location, i);
                const options = record.getSublistValue(item.fields.options, i);
                const shipaddress = record.getSublistValue(item.fields.shipaddress, i);
                const shipmethod = record.getSublistValue(item.fields.shipmethod, i);
                const freegift = record.getSublistValue(item.fields.freegiftpromotion, i);
                const taxcodedisplay = record.getSublistValue(item.fields.taxcodedisplay, i);
                const amountValue = this.format.toFloat(Math.abs(Number(amount)));
                const taxAmountValue = this.format.toFloat(tax1amt);
                const rateValue = this.format.toFloat(rate);
                const totalValue = amountValue + taxAmountValue;
                lines[lineId] = {
                    internalid: lineId,
                    quantity: parseInt(String(quantity), 10),
                    rate: rateValue,
                    rate_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                        rateValue
                    )}`,
                    amount: amountValue,
                    amount_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                        amountValue
                    )}`,
                    tax_amount: taxAmountValue,
                    tax_amount_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                        taxAmountValue
                    )}`,
                    tax_rate: String(taxrate1),
                    tax_code: String(taxcodedisplay),
                    isfulfillable: Boolean(fulfillable),
                    location: location && location !== 'undefined' && String(location),
                    itemIdToPreload: lineItem,
                    discount: 0,
                    discount_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(0)}`,
                    total: totalValue,
                    total_formatted: `${this.currencySymbol}${this.format.toCurrencyValue(
                        totalValue
                    )}`,
                    type: String(itemtype),
                    options: this.getOptions(String(options)),
                    shipaddress: shipaddress ? recordAddressses[String(shipaddress)] : null,
                    shipmethod: String(shipmethod) || null,
                    index: i + 1,
                    free_gift: !!freegift
                };
            }

            // preloadItems
            if (lineItem) {
                const preloadedItem = StoreItem.getInstance().get(lineItem, lines[lineId].type);
                if (!preloadedItem || !preloadedItem.itemid) {
                    itemsToQuery.push(lines[lineId]);
                } else {
                    preloadedItems.push(preloadedItem);
                }
            }
        }
        preloadedItems.push(
            ...this.loadItemsWithSuiteScript(
                itemsToQuery || this.currentRecordResult.lines,
                numberId
            )
        );

        _.each(
            lines,
            // eslint-disable-next-line no-loop-func
            (line: TransactionLine & { itemIdToPreload: string }): void => {
                const itemObj: Partial<TransactionItem> = _.find(preloadedItems, {
                    internalid: Number(line.itemIdToPreload)
                });
                itemObj.storedisplayname2 = itemObj.storedisplayname2 || itemObj.storedisplayname;
                itemObj.pricelevel1 = line.rate;
                itemObj.pricelevel1_formatted = line.rate_formatted;

                line.item = itemObj;
                delete line.itemIdToPreload;
            }
        );
        return <TransactionLine[]>_.values(lines);
    }

    public loadItemsWithSuiteScript(
        lines: Partial<TransactionLine>[],
        transactionId: number
    ): TransactionItem[] {
        const search = this.transactionDao.createSearch<TransactionItem>();
        const schema = this.transactionDao.getSchema();
        search.setFilters([
            new SearchFilter(schema.filters.entity, SearchOperator.String.IS, this.user.getId()),
            SearchOperator.Logical.AND,
            new SearchFilter(schema.filters.internalid, SearchOperator.String.IS, transactionId),
            SearchOperator.Logical.AND,
            new SearchFilter(
                schema.joins.item.filters.internalid,
                SearchOperator.Array.ANYOF,
                _.pluck(lines, 'internalid')
            )
        ]);
        search.addColumn(schema.joins.item.columns.type, { itemtype: this.format.toValue });
        search.addColumn(schema.joins.item.columns.displayname, {
            displayname: this.format.toValue
        });
        search.addColumn(schema.joins.item.columns.storedisplayname, {
            storedisplayname2: this.format.toValue
        });
        search.addColumn(schema.joins.item.columns.internalid, { internalid: Number });
        search.addColumn(schema.joins.item.columns.itemid, { itemid: this.format.toValue });
        return search.getAll();
    }

    public getRecordAdjustments(
        options: {
            paymentMethodInformation?: boolean;
            types?: string[];
            appliedToTransaction?: string[];
        } = {},
        internalid: string
    ): TransactionAdjustment[] {
        const appliedToTransaction: string[] = options.appliedToTransaction || [internalid];
        const types =
            options.types && options.types.length
                ? ['CustCred', 'DepAppl', 'CustPymt']
                : options.types;
        const ids = [];
        const adjustments: { [internalid: string]: TransactionAdjustment } = {}; // it's an object because we need to handle duplicates.
        const { filters, columns } = this.transactionSchema;
        const search = this.transactionDao.createSearch<TransactionAdjustment>();
        search.setFilters([
            new SearchFilter(
                filters.appliedtotransaction,
                SearchOperator.Array.ANYOF,
                appliedToTransaction
            ),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.appliedtolinkamount, SearchOperator.Number.ISNOTEMPTY, null),
            SearchOperator.Logical.AND,
            new SearchFilter(filters.type, SearchOperator.Array.ANYOF, types)
        ]);
        search.sortBy('trandate');
        search.addColumn(columns.total);
        search.addColumn(columns.internalid);
        search.addColumn(columns.ccnumber);
        search.addColumn(columns.ccexpiredate); // ccexpdate
        search.addColumn(columns.ccholdername);
        search.addColumn(columns.paymentmethod, { paymentmethodstring: this.format.toText });
        search.addColumn(columns.tranid);
        search.addColumn(columns.trandate);
        search.addColumn(columns.type);
        search.addColumn(columns.appliedtolinkamount, {
            amount: this.format.toCurrencyValue,
            recordtype: (value: string, text: string, type: string): string => type,
            amount_formatted: (value: string): string =>
                `${this.currencySymbol}${this.format.toCurrencyValue(value)}`
        });
        const results = search.getAll();
        results.forEach(
            (result): void => {
                const duplicatedAdjustment = adjustments[result.internalid];

                if (options.paymentMethodInformation) {
                    ids.push(result.internalid);
                }

                if (!duplicatedAdjustment) {
                    adjustments[result.internalid] = result;
                } else {
                    duplicatedAdjustment.amount += result.amount;
                    duplicatedAdjustment.amount_formatted = `${this.currencySymbol}${
                        duplicatedAdjustment.amount
                    }`;
                }

                if (result.ccnumber && duplicatedAdjustment) {
                    duplicatedAdjustment.paymentmethod = {
                        internalid: result.tranid,
                        name: result.paymentmethodstring,
                        type: 'creditcard',
                        creditcard: {
                            ccnumber: result.ccnumber,
                            ccexpiredate: result.ccexpdate,
                            ccname: result.ccholdername,
                            paymentmethod: {
                                ispaypal: 'F',
                                name: result.paymentmethodstring,
                                creditcard: 'T',
                                internalid: result.tranid
                            }
                        }
                    };
                }
            }
        );
        return _.values(adjustments);
    }

    private setRecordPaymentMethods(paymentmethods: TransactionPaymentMethod[]): void {
        paymentmethods.forEach(
            (paymentMethod): void => {
                switch (paymentMethod.type.toUpperCase()) {
                    case 'INVOICE':
                        this.currentLoadedRecord.setValue(
                            this.transactionFields.terms,
                            paymentMethod.terms.internalid
                        );
                        this.currentLoadedRecord.setValue(
                            this.transactionFields.otherrefnum,
                            paymentMethod.purchasenumber
                        );
                        break;
                    case 'CREDITCARD':
                        if (this.runtime.isFeatureInEffect('PAYMENTINSTRUMENTS')) {
                            this.currentLoadedRecord.setValue(
                                this.transactionFields.paymentoption,
                                paymentMethod.creditcard.internalid
                            );
                        } else {
                            this.currentLoadedRecord.setValue(
                                this.transactionFields.creditcard,
                                paymentMethod.creditcard.internalid
                            );
                            this.currentLoadedRecord.setValue(
                                this.transactionFields.paymentmethod,
                                paymentMethod.creditcard.paymentmethod.internalid
                            );
                            this.currentLoadedRecord.setValue(
                                this.transactionFields.creditcardprocessor,
                                paymentMethod.creditcard.paymentmethod.merchantid
                            );
                        }

                        if (paymentMethod.creditcard.ccsecuritycode) {
                            this.currentLoadedRecord.setValue(
                                this.transactionFields.ccsecuritycode,
                                paymentMethod.creditcard.ccsecuritycode
                            );
                        }
                        break;
                    case 'EXTERNAL':
                        this.currentLoadedRecord.setValue(
                            this.transactionFields.paymentmethod,
                            paymentMethod.internalid
                        );
                        this.currentLoadedRecord.setValue(
                            this.transactionFields.creditcardprocessor,
                            paymentMethod.merchantid
                        );
                        this.currentLoadedRecord.setValue(
                            this.transactionFields.returnurl,
                            paymentMethod.returnurl
                        );
                        this.currentLoadedRecord.setValue(this.transactionFields.getauth, 'T');
                        break;
                    default:
                        break;
                }
            }
        );
    }

    private setLines(lines: TransactionLine[]): void {
        const sublist = this.transactionSchema.sublists.item;
        for (let i = 0; i < this.currentLoadedRecord.getLineCount(sublist); i++) {
            this.currentLoadedRecord.removeLine(sublist, i);
        }

        if (lines) {
            lines.forEach(
                (line): void => {
                    this.currentLoadedRecord.selectNewLine(sublist);
                    this.currentLoadedRecord.setCurrentSublistValue(
                        sublist.fields.item,
                        line.item.internalid
                    );
                    this.currentLoadedRecord.setCurrentSublistValue(
                        sublist.fields.quantity,
                        line.quantity
                    );
                    this.currentLoadedRecord.setCurrentSublistValue(
                        sublist.fields.itemtype,
                        line.item.type
                    );
                    this.currentLoadedRecord.setCurrentSublistValue(
                        sublist.fields.id,
                        line.internalid
                    );

                    _.each(
                        line.options,
                        (option): void => {
                            if (option.cartOptionId && option.value && option.value.internalid) {
                                this.currentLoadedRecord.setCurrentSublistValue(
                                    new SchemaSublistField(option.cartOptionId),
                                    option.value.internalid
                                );
                            }
                        }
                    );
                    this.currentLoadedRecord.commitLine(sublist);
                }
            );
        }
    }

    private getRecordCustomFieldIds(): string[] {
        return (this.configuration.get('customFields') || [])[String(this.dao.getSchema().type)];
    }

    public update(id: string, data: TransactionFromRecord): void {
        this.currentLoadedRecord = this.dao.loadRecord(Number(id), { isDynamic: true });

        this.currentLoadedRecord.setValue(this.transactionFields.paymentterms, null);
        this.currentLoadedRecord.setValue(this.transactionFields.paymentmethod, null);
        this.currentLoadedRecord.setValue(this.transactionFields.thankyouurl, null);
        this.currentLoadedRecord.setValue(this.transactionFields.errorurl, null);
        this.currentLoadedRecord.setValue(this.transactionFields.returnurl, null);
        this.currentLoadedRecord.setValue(this.transactionFields.terms, null);
        this.currentLoadedRecord.setValue(this.transactionFields.otherrefnum, null);
        this.currentLoadedRecord.setValue(this.transactionFields.creditcard, null);

        if (data.paymentmethods) {
            this.setRecordPaymentMethods(data.paymentmethods);
        }
        // We need to migrate this.setAddress address method for the next services
        // this.setAddress('ship', this.data.shipaddress, 'billaddress');
        // this.setAddress('bill', this.data.billaddress, 'shipaddress');

        this.setLines(data.lines);

        // Set Memo
        this.currentLoadedRecord.setValue(this.transactionFields.memo, null);
        if (data.memo) {
            this.currentLoadedRecord.setValue(this.transactionFields.memo, data.memo);
        }

        // Set custom fields
        _.each(
            data.options,
            (value, optionsId: string): void => {
                // only set a custom field to the model if was exposed in the configuration
                if (
                    _.find(
                        this.getRecordCustomFieldIds(),
                        (configFieldId): boolean => {
                            return optionsId === configFieldId;
                        }
                    )
                ) {
                    this.currentLoadedRecord.setValue(new SchemaField(optionsId), value);
                }
            }
        );
    }

    public generateUrl(id: string, recordTypeName: string): string {
        const parameters = [
            'nltranid=' + id,
            'orderId=' + id,
            'n=' + this.runtime.getCurrentWebsite().getId(),
            'recordType=' + recordTypeName,
            'goToExternalPayment=T'
        ];

        return this.runtime.getAbsoluteUrl('/external_payment.ssp?' + parameters.join('&'));
    }
}