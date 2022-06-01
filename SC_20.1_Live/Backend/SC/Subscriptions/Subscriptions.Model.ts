/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as search from 'N/search';
import * as record from 'N/record';
import * as format from 'N/format';
import * as file from 'N/file';
import * as runtime from 'N/runtime';
import { Configuration } from '../Libraries/Configuration/Configuration';
import { forbiddenError, unauthorizedError } from '../../Common/Controller/RequestErrors';

import SS2Utils = require('../../Common/SspLibraries/SS2Utils');

type FilterSubscription = (
    | string
    | (string | number)[]
    | (string | string[] | search.Operator)[])[];

interface SubscriptionBillingAccount {
    internalId: string;
    name: string;
}

export interface SubscriptionBillingAccounts {
    billingAccounts: SubscriptionBillingAccount[];
}

export type Subscription = any;

interface PricePlanTypeObj {
    pricePlanTypeText: string | string[];
    pricePlanTypeValue: record.FieldValue;
}

interface Plan {
    priceTiers;
    pricePlanType: number;
    pricePlanId: string;
    pricePlanTypeObj: PricePlanTypeObj;
}

interface Plans {
    [plans: string]: Plan;
}

export interface SubscriptionsSearch {
    subscriptions: any;
    totalRecordsFound: number;
    recordsPerPage: number;
}

export class SubscriptionsModel {
    public readonly name = 'SubscriptionsModel';

    private readonly subscriptionRecord: record.Record;

    private readonly plans: Plans;

    private configuration = Configuration.getInstance();

    public constructor(subscription_id?) {
        this.plans = {};
        if (subscription_id) {
            try {
                this.subscriptionRecord = record.load({
                    type: record.Type.SUBSCRIPTION,
                    id: subscription_id,
                    isDynamic: true
                });
                if (
                    parseInt(
                        this.subscriptionRecord.getValue({ fieldId: 'customer' }).toString()
                    ) !== runtime.getCurrentUser().id
                ) {
                    throw forbiddenError;
                }
            } catch (e) {
                throw forbiddenError;
            }
        }
    }

    private searchFilterSubscriptionBase(): FilterSubscription {
        return [
            ['status', search.Operator.ANYOF, ['ACTIVE', 'SUSPENDED']],
            'and',
            ['customer', search.Operator.IS, runtime.getCurrentUser().id]
        ];
    }

    public searchBillingAccounts(): SubscriptionBillingAccounts {
        const billingAccounts: SubscriptionBillingAccount[] = [];
        const billingAccountsIds: number[] = [];
        const columns: search.Column[] = [
            { name: 'name', join: 'billingaccount' },
            { name: 'billingaccount' }
        ];
        const filters: FilterSubscription = this.searchFilterSubscriptionBase();

        const result_search: search.ResultSet = search
            .create({
                type: search.Type.SUBSCRIPTION,
                columns: columns,
                filters: filters
            })
            .run();

        result_search.each(function(billing_account_row: search.Result): boolean {
            const billing_account: SubscriptionBillingAccount = {
                internalId: <string>billing_account_row.getValue('billingaccount'),
                name: <string>billing_account_row.getValue({
                    name: 'name',
                    join: 'billingaccount'
                })
            };

            if (billingAccountsIds[billing_account.internalId] === undefined) {
                billingAccountsIds[billing_account.internalId] = billing_account.internalId;
                billingAccounts.push(billing_account);
            }

            return true;
        });

        return { billingAccounts: billingAccounts };
    }

    public search(data: any): SubscriptionsSearch {
        const subscriptions = [];
        const columns: search.Column[] = [
            { name: 'nextbillcycledate', join: 'billingaccount' },
            { name: 'lastbilldate', join: 'billingaccount' },
            { name: 'nextrenewalstartdate' },
            { name: 'name', join: 'billingaccount' },
            { name: 'datecreated' },
            { name: 'enddate', sort: search.Sort.ASC },
            { name: 'subscriptionplan' },
            { name: 'internalid' },
            { name: 'name' },
            { name: 'startdate' },
            { name: 'status' }
        ];
        const filters: FilterSubscription = this.searchFilterSubscriptionBase();
        if (data.filter && data.filter !== 'all') {
            filters.push('and', ['billingaccount', search.Operator.ANYOF, data.filter.split(',')]);
        }

        const range_column = 'enddate';
        if (data.from && data.to) {
            data.from = data.from.split('-');
            data.to = data.to.split('-');

            filters.push('and', [
                'datecreated',
                search.Operator.WITHIN,
                format.format({
                    value: new Date(data.from[0], data.from[1] - 1, data.from[2]),
                    type: format.Type.DATE
                }),
                format.format({
                    value: new Date(data.to[0], data.to[1] - 1, data.to[2]),
                    type: format.Type.DATE
                })
            ]);
        } else if (data.from) {
            data.from = data.from.split('-');

            filters.push('and', [
                range_column,
                search.Operator.ONORAFTER,
                format.format({
                    value: new Date(data.from[0], data.from[1] - 1, data.from[2]),
                    type: format.Type.DATE
                })
            ]);
        } else if (data.to) {
            data.to = data.to.split('-');

            filters.push('and', [
                range_column,
                search.Operator.ONORBEFORE,
                format.format({
                    value: new Date(data.to[0], data.to[1] - 1, data.to[2]),
                    type: format.Type.DATE
                })
            ]);
        }

        if (data.sort) {
            _.each(data.sort.split(','), function(column_name: string) {
                const column: search.Column = columns.filter(col => col.name === column_name)[0];
                column.sort = data.order >= 0 ? search.Sort.ASC : search.Sort.DESC;
            });
        }

        const subscription_ids: number[] = [];

        const search_subscriptions = SS2Utils.iterateAllSearchResults(
            search.Type.SUBSCRIPTION,
            columns,
            filters,
            data.page,
            subscription => {
                subscription_ids.push(subscription.getValue({ name: 'internalid' }));

                const result = {
                    internalId: subscription.getValue({ name: 'internalid' }),
                    dateCreated: subscription.getValue({ name: 'datecreated' }),
                    startDate: subscription.getValue({ name: 'startdate' }),
                    endDate: subscription.getValue({ name: 'enddate' }),
                    name: subscription.getValue({ name: 'name' }),
                    status: subscription.getValue({ name: 'status' }),
                    subscriptionPlan: subscription.getValue({ name: 'subscriptionplan' }),
                    billingAccount: subscription.getValue({ name: 'billingaccount' }),
                    nextRenewalStartDate: subscription.getValue({ name: 'nextrenewalstartdate' }),
                    lastBillDate: subscription.getValue({
                        name: 'lastbilldate',
                        join: 'billingaccount'
                    }),
                    nextBillCycleDate: subscription.getValue({
                        name: 'nextbillcycledate',
                        join: 'billingaccount'
                    })
                };

                subscriptions.push(result);
            }
        );

        this.setProcessingSubscriptions(subscriptions, subscription_ids);

        return {
            subscriptions: subscriptions,
            totalRecordsFound: search_subscriptions,
            recordsPerPage: 20
        };
    }

    public get(subscription_id: number): Subscription {
        const lines_collection = [];
        const items_id_collection = [];
        const price_interval_collection: any = this.getPriceIntervals();

        // Get the change orders of the subscription into the lines
        const change_orders: any = this.searchExistingChangeOrders(null, true, null, true);

        const lines_changes = this.getLinesChanges(change_orders);

        const line_field_values = {
            billingMode: 'billingmode',
            catalogType: 'catalogtype',
            discount: 'discount',
            quantity: 'quantity',
            status: 'status',
            subscriptionLineType: 'subscriptionlinetype',
            lineNumber: 'linenumber',
            item: 'item',
            internalId: 'subscriptionline',
            prorateEndDate: 'prorateenddate',
            prorateStartDate: 'proratestartdate'
        };

        const line_field_texts = {
            endDate: 'enddate',
            startDate: 'startdate'
        };

        const line_field_texts_and_values = {
            subscriptionLineTypeObj: 'subscriptionlinetype'
        };

        SS2Utils.iterateSublist(this.subscriptionRecord, 'subscriptionline', () => {
            const serialized_record: any = SS2Utils.getFieldsAsObject(
                this.subscriptionRecord,
                line_field_values,
                line_field_texts,
                line_field_texts_and_values,
                'subscriptionline'
            );

            const price_intervals = price_interval_collection[serialized_record.lineNumber];
            const frequency = price_intervals.length ? price_intervals[0].frequency : null;

            if (serialized_record.item) {
                items_id_collection.push(serialized_record.item);
            }

            lines_collection.push(
                _.extend(serialized_record, {
                    priceIntervals: price_intervals,
                    isProrated:
                        serialized_record.prorateEndDate || serialized_record.prorateStartDate,
                    isProcessing: !!lines_changes[serialized_record.internalId],
                    subscriptionLineType: parseInt(serialized_record.subscriptionLineType),
                    canBeSuspended:
                        serialized_record.status === 'ACTIVE' &&
                        this.configuration.get('subscriptions.lineStatusChange') !==
                            "Don't Allow Status Changes" &&
                        frequency !== 'ONETIME' &&
                        (serialized_record.catalogType !== 'REQUIRED' ||
                            this.configuration.get(
                                'subscriptions.allowToCancelSuspendRequiredLines'
                            )) &&
                        !_.find(lines_changes[serialized_record.internalId], function(change) {
                            return change !== 'SUSPEND';
                        }),

                    canBeReactivated:
                        serialized_record.status === 'SUSPENDED' &&
                        this.configuration.get('subscriptions.lineStatusChange') ===
                            'Allow Suspending / Resuming' &&
                        !_.find(lines_changes[serialized_record.internalId], function(change) {
                            return change !== 'REACTIVATE';
                        }),

                    canChangeQuantity:
                        serialized_record.subscriptionLineType != 3 && // Usage
                        (!this.configuration.get('subscriptions.disallowUpgradeQuantity') ||
                            (!this.configuration.get('subscriptions.disallowDowngradeQuantity') &&
                                serialized_record.quantity > 1)) &&
                        !_.find(lines_changes[serialized_record.internalId], function(change) {
                            return (
                                change !== 'ACTIVATE' &&
                                change !== 'MODIFY_PRICING' &&
                                change !== 'REACTIVATE'
                            );
                        }),

                    pricePlanTypeObj:
                        price_intervals.length > 0 &&
                        price_intervals[0].pricePlan &&
                        price_intervals[0].pricePlan.pricePlanTypeObj
                            ? price_intervals[0].pricePlan.pricePlanTypeObj
                            : null,

                    frequencyObj:
                        price_intervals.length > 0 && price_intervals[0].frequencyObj
                            ? price_intervals[0].frequencyObj
                            : null
                })
            );
        });

        const items_collection = this.getItems(items_id_collection);

        _.each(lines_collection, function(line) {
            line.item = items_collection[line.item];
        });

        const valid_states = ['ACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION'];

        const required_lines_collection = _.filter(lines_collection, function(line: any) {
            return valid_states.indexOf(line.status) >= 0 && line.catalogType === 'REQUIRED';
        });

        const optional_lines_collection = _.filter(lines_collection, function(line: any) {
            return valid_states.indexOf(line.status) >= 0 && line.catalogType !== 'REQUIRED';
        });

        const non_included_lines_collection = _.filter(lines_collection, function(line: any) {
            return !(valid_states.indexOf(line.status) >= 0) && line.catalogType === 'OPTIONAL';
        });

        const sub_field_values = {
            internalId: 'internalid',
            name: 'name',
            billingAccount: 'billingaccount',
            status: 'billingsubscriptionstatus'
        };
        const sub_field_texts = {
            dateCreated: 'datecreated',
            startDate: 'startdate',
            endDate: 'enddate',
            nextBillCycleDate: 'nextbillcycledate',
            lastBillDate: 'lastbilldate',
            nextRenewalStartDate: 'nextrenewalstartdate'
        };

        const serialized_subscription: any = SS2Utils.getFieldsAsObject(
            this.subscriptionRecord,
            sub_field_values,
            sub_field_texts
        );

        const will_be_suspended = _.find(change_orders, co => {
            return (
                co.getValue({ fieldId: 'action' }) == 'SUSPEND' ||
                this.noActiveLinesInChangeOrder(co, 'SUSPEND')
            );
        });

        if (will_be_suspended) {
            // Although this will take affect tomorrow,
            // we need to give immediate feedback to the user
            serialized_subscription.status = 'SUSPENDED';
            serialized_subscription.isProcessing = true;
        }

        return _.extend(serialized_subscription, {
            optionalSubscriptionLines: optional_lines_collection,
            requiredSubscriptionLines: required_lines_collection,
            nonIncludedLinesCollection: non_included_lines_collection,

            canBeSuspended:
                serialized_subscription.status === 'ACTIVE' &&
                this.configuration.get('subscriptions.generalStatusChange') !==
                    "Don't Allow Status Changes" &&
                !will_be_suspended,

            canBeReactivated:
                serialized_subscription.status === 'SUSPENDED' &&
                this.configuration.get('subscriptions.generalStatusChange') ===
                    'Allow Suspending / Resuming' &&
                !_.find(change_orders, co => {
                    return (
                        co.getValue({ fieldId: 'action' }) !== 'REACTIVATE' ||
                        this.noActiveLinesInChangeOrder(co, 'REACTIVATE')
                    );
                })
        });
    }

    private noActiveLinesInChangeOrder(co, operation) {
        let status_from = 'ACTIVE';
        let status_to = 'SUSPENDED';
        if (operation == 'REACTIVATE') {
            status_from = 'SUSPENDED';
            status_to = 'ACTIVE';
        }
        let no_active_lines_in_change_order = true;
        SS2Utils.iterateSublist(co, 'subline', () => {
            const status = co.getCurrentSublistValue({
                sublistId: 'subline',
                fieldId: 'status'
            });

            const new_status = co.getCurrentSublistValue({
                sublistId: 'subline',
                fieldId: 'statusnew'
            });

            if (status == status_from && new_status != status_to) {
                no_active_lines_in_change_order = false;
            }
        });
        return no_active_lines_in_change_order;
    }

    public updateLine(data: any) {
        this.processLineAction(data);
    }

    public reactivateSubscription(data: any) {
        this.processSubscriptionAction('REACTIVATE');
    }

    public suspendLine(data: any) {
        this.processLineAction(_.extend(data, { action: 'SUSPEND' }));
    }

    public suspendSubscription() {
        this.processSubscriptionAction('SUSPEND');
    }

    private setProcessingSubscriptions(subscriptions, subscription_ids) {
        if (!subscriptions || !subscriptions.length) return;

        const change_orders = this.searchExistingChangeOrders(null, true, subscription_ids);
        _.each(subscriptions, function(result: any) {
            result.isProcessing =
                change_orders[result.internalId] && change_orders[result.internalId].length;
        });
    }

    private getPlanInformation(price_plan_id: string) {
        if (!price_plan_id) return;
        if (!this.plans[price_plan_id]) {
            const price_plan = record.load({
                type: record.Type.PRICE_PLAN,
                id: price_plan_id,
                isDynamic: true
            });
            const fields = {
                maxamount: 'maxamount',
                minamount: 'minamount',
                value: 'value',
                fromVal: 'fromval',
                pricingOption: 'pricingoption'
            };

            // type=2 => tiered, type=4 => volume
            const type: any = price_plan.getValue({ fieldId: 'priceplantype' });
            this.plans[price_plan_id] = {
                priceTiers: [],
                pricePlanType: parseInt(type),
                pricePlanTypeObj: {
                    pricePlanTypeText: price_plan.getText({ fieldId: 'priceplantype' }),
                    pricePlanTypeValue: price_plan.getValue({ fieldId: 'priceplantype' })
                },
                pricePlanId: price_plan_id
            };
            SS2Utils.iterateSublist(price_plan, 'pricetiers', () => {
                const serialized_tier: any = SS2Utils.getFieldsAsObject(
                    price_plan,
                    fields,
                    null,
                    null,
                    'pricetiers'
                );
                this.plans[price_plan_id].priceTiers.push(
                    _.extend(serialized_tier, {
                        showSingleValue:
                            serialized_tier.maxamount - serialized_tier.minamount === 1,
                        // TODO: Get currency
                        valueFormatted:
                            '$' +
                            format.format({
                                value: serialized_tier.value,
                                type: format.Type.CURRENCY
                            })
                    })
                );
            });
        }
        return this.plans[price_plan_id];
    }

    private getPriceIntervals() {
        const price_interval_collection = {};

        const fields = {
            status: 'status',
            line: 'linenumber',
            catalogType: 'catalogtype',
            chargeType: 'chargetype',
            discount: 'discount',
            frequency: 'frequency',
            includedQuantity: 'includedquantity',
            quantity: 'quantity',
            startOffsetUnit: 'startoffsetunit',
            recurringAmount: 'recurringamount',
            repeatEvery: 'repeatevery',
            pricePlan: 'priceplan',
            startDateValue: 'startdate'
        };
        const texts = {
            startDate: 'startdate'
        };
        const texts_and_fields = {
            frequencyObj: 'frequency'
        };

        SS2Utils.iterateSublist(this.subscriptionRecord, 'priceinterval', () => {
            const serialized_interval: any = SS2Utils.getFieldsAsObject(
                this.subscriptionRecord,
                fields,
                texts,
                texts_and_fields,

                'priceinterval'
            );
            if (!price_interval_collection[serialized_interval.line]) {
                price_interval_collection[serialized_interval.line] = [];
            }
            // For sorting
            serialized_interval.startDateInt = new Date(
                serialized_interval.startDateValue
            ).getTime();
            delete serialized_interval.startDateValue;
            price_interval_collection[serialized_interval.line].push(
                _.extend(serialized_interval, {
                    pricePlan: this.getPlanInformation(serialized_interval.pricePlan)
                })
            );
        });

        // Each line can have several prices chaning on the date.
        // We need to remove the outdated prices
        const now = new Date().getTime();
        const filtered_price_interval_collection = {};
        _.each(price_interval_collection, (value: [], key) => {
            // Sort in descending order
            const sorted_tiers = _.sortBy(value, 'startDateInt').reverse();
            let last_valid;
            _.each(sorted_tiers, (tier: any, i) => {
                if (now >= tier.startDateInt) {
                    last_valid = i;
                }
            });
            filtered_price_interval_collection[key] = _.first(
                sorted_tiers,
                last_valid + 1
            ).reverse();
        });

        return filtered_price_interval_collection;
    }

    private getItems(items_id_collection) {
        if (!items_id_collection || !items_id_collection.length) return {};
        const items_collection = {};

        const filters = [['internalid', search.Operator.ANYOF, items_id_collection]];

        const columns = [
            'internalid',
            'itemid',
            'storedisplayname',
            'cost',
            'storedisplayimage',
            'storedescription',
            'storedetaileddescription'
        ];

        SS2Utils.iterateAllSearchResults(search.Type.ITEM, columns, filters, '', result => {
            let store_display_image: string = <string>result.getValue('storedisplayimage');
            if (store_display_image !== '') {
                const fileObj = file.load({ id: store_display_image });
                store_display_image = fileObj.url;
            }

            if (!items_collection[result.id]) {
                items_collection[result.id] = {
                    id: result.id,
                    recordType: result.recordType,
                    cost: result.getValue('cost'),
                    storeDisplayName: result.getValue('storedisplayname'),
                    imageUrl: store_display_image,
                    storedetailedDescription: result.getValue('storedetaileddescription'),
                    storeDescription: result.getValue('storedescription'),
                    itemId: result.getValue('itemid')
                };
            }
        });
        return items_collection;
    }

    private getLinesChanges(change_orders) {
        const changes = {};
        _.each(change_orders, function(change_order: any) {
            const change_order_type = change_order.getValue({ fieldId: 'action' });

            SS2Utils.iterateSublist(change_order, 'subline', () => {
                const apply = change_order.getCurrentSublistValue({
                    sublistId: 'subline',
                    fieldId: 'apply'
                });

                if (!apply) return;

                const subscription_line = change_order.getCurrentSublistText({
                    sublistId: 'subline',
                    fieldId: 'subscriptionline'
                });

                if (!changes[subscription_line]) changes[subscription_line] = [];

                changes[subscription_line].push(change_order_type);
            });
        });
        return changes;
    }

    private processLineAction(data: any) {
        this.subscriptionRecord.selectLine({
            sublistId: 'subscriptionline',
            line: data.lineNumber - 1
        });

        const fields = {
            catalogType: 'catalogtype',
            subscriptionLine: 'subscriptionline',
            status: 'status',
            quantity: 'quantity',
            subscriptionLineType: 'subscriptionlinetype'
        };

        const serialized_line: any = SS2Utils.getFieldsAsObject(
            this.subscriptionRecord,
            fields,
            null,
            null,
            'subscriptionline'
        );

        if (
            data.action === 'SUSPEND' &&
            (!this.configuration.get('subscriptions.allowToCancelSuspendRequiredLines') &&
                serialized_line.catalogType === 'REQUIRED')
            /* ||
            frequency == 'ONETIME'*/
        ) {
            throw 'This line is required and cannot be cancelled. Please contact your sales representative.';
        }

        if (data.quantity && serialized_line.quantity !== data.quantity) {
            if (
                this.configuration.get('subscriptions.disallowUpgradeQuantity') &&
                serialized_line.quantity < data.quantity
            ) {
                throw 'You cannot upgrade your subscription. Please contact your sales representative.';
            }
            if (
                this.configuration.get('subscriptions.disallowDowngradeQuantity') &&
                serialized_line.quantity > data.quantity
            ) {
                throw 'You cannot downgrade your subscription. Please contact your sales representative.';
            }
        }

        if (serialized_line.status === 'NOT_INCLUDED' && data.action !== 'SUSPEND') {
            this.subscriptionRecord.setCurrentSublistValue({
                sublistId: 'subscriptionline',
                fieldId: 'isincluded',
                value: true
            });

            this.subscriptionRecord.commitLine({ sublistId: 'subscriptionline' });
            this.subscriptionRecord.save();
        } else if (serialized_line.status === 'SUSPENDED') {
            if (
                this.configuration.get('subscriptions.lineStatusChange') ===
                'Allow Suspending / Resuming'
            ) {
                this.performAction(
                    { lineNumber: data.lineNumber, action: 'REACTIVATE' },
                    serialized_line.subscriptionLine,
                    serialized_line.status
                );
            } else {
                throw 'Reactivation of lines is not allowed. Please contact your sales representative.';
            }
        }

        if (
            ['NOT_INCLUDED', 'DRAFT'].indexOf(serialized_line.status) >= 0 &&
            data.action !== 'SUSPEND'
        ) {
            record.submitFields({
                type: record.Type.SUBSCRIPTION_LINE,
                id: serialized_line.subscriptionLine,
                values: {
                    subscriptionlinestatus: 'PENDING_ACTIVATION'
                }
            });
        }

        if (data.action === 'SUSPEND') {
            this.performAction(
                { lineNumber: data.lineNumber, action: 'SUSPEND' },
                serialized_line.subscriptionLine,
                serialized_line.status
            );
        } else if (
            ['NOT_INCLUDED', 'DRAFT', 'PENDING_ACTIVATION'].indexOf(serialized_line.status) >= 0
        ) {
            this.performAction(
                { lineNumber: data.lineNumber, action: 'ACTIVATE' },
                serialized_line.subscriptionLine,
                serialized_line.status
            );
        } else if (
            data.quantity &&
            serialized_line.quantity !== data.quantity &&
            serialized_line.subscriptionLineType !== 3
        ) {
            this.performAction(
                { lineNumber: data.lineNumber, quantity: data.quantity, action: 'MODIFY_PRICING' },
                serialized_line.subscriptionLine,
                serialized_line.status
            );
        }
    }

    // Search for change orders for tomorrow and analyzing them if that is the case.
    private searchExistingChangeOrders(
        action: string,
        check_for_update: boolean,
        subscription_ids?: string[],
        load?: boolean
    ) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const matching_change_orders = [];
        const matching_change_orders_obj = {};
        const columns = ['internalid', 'effectivedate', 'action', 'subscription'];
        const filters = [
            [
                'subscription',
                subscription_ids ? search.Operator.ANYOF : search.Operator.IS,
                subscription_ids || [this.subscriptionRecord.id]
            ],
            'and',
            [
                'effectivedate',
                search.Operator.ON,
                format.format({
                    value: tomorrow,
                    type: format.Type.DATE
                })
            ]
        ];

        if (!check_for_update) {
            if (action === 'MODIFY_PRICING') {
                filters.push('and');
                filters.push([
                    'action',
                    search.Operator.NONEOF,
                    ['MODIFY_PRICING', 'ACTIVATE', 'REACTIVATE']
                ]);
            } else if (action) {
                filters.push('and');
                filters.push(['action', search.Operator.NONEOF, [action]]);
            }
        } else if (action) {
            filters.push('and');
            filters.push(['action', search.Operator.IS, [action]]);
        }

        SS2Utils.iterateAllSearchResults(
            search.Type.SUBSCRIPTION_CHANGE_ORDER,
            columns,
            filters,
            '',
            change_order => {
                const subscription_id = change_order.getValue('subscription').toString();
                if (load) {
                    change_order = record.load({
                        type: record.Type.SUBSCRIPTION_CHANGE_ORDER,
                        id: change_order.getValue('internalid').toString(),
                        isDynamic: true
                    });
                }

                if (subscription_ids) {
                    if (!matching_change_orders_obj[subscription_id]) {
                        matching_change_orders_obj[subscription_id] = [];
                    }
                    matching_change_orders_obj[subscription_id].push(change_order);
                } else {
                    matching_change_orders.push(change_order);
                }
            }
        );

        return subscription_ids ? matching_change_orders_obj : matching_change_orders;
    }

    // Checking if the line to be updated is applied in any change order found
    // If that is the case an exception is raised
    // TODO: Remove this function, reuse the lines_changes
    private checkChangeOrderIsNotForLine(
        change_order_internal_id: number,
        lineId: number,
        fail: boolean
    ) {
        const lines = [];
        const change_order = record.load({
            type: record.Type.SUBSCRIPTION_CHANGE_ORDER,
            id: change_order_internal_id,
            isDynamic: true
        });

        SS2Utils.iterateSublist(change_order, 'subline', () => {
            const subscriptionline = change_order.getCurrentSublistText({
                sublistId: 'subline',
                fieldId: 'subscriptionline'
            });

            if (parseInt(subscriptionline) === lineId) {
                const apply = change_order.getCurrentSublistValue({
                    sublistId: 'subline',
                    fieldId: 'apply'
                });

                if (apply) {
                    if (fail) {
                        throw new Error(
                            'Operation cannot be completed. Please contact your Sales Rep.'
                        );
                    } else {
                        lines.push(subscriptionline);
                    }
                }
            }
        });
        return lines;
    }

    private updateExistantChangeOrder(action, lineId) {
        const change_order = record.load({
            type: record.Type.SUBSCRIPTION_CHANGE_ORDER,
            id: action.changeOrderId,
            isDynamic: true
        });

        let line_updated = false;

        SS2Utils.iterateSublist(change_order, 'subline', () => {
            const subscriptionline: string = change_order.getCurrentSublistText({
                sublistId: 'subline',
                fieldId: 'subscriptionline'
            });

            if (lineId) {
                if (parseInt(subscriptionline) === parseInt(lineId)) {
                    if (action.quantity) {
                        change_order.setCurrentSublistValue({
                            sublistId: 'subline',
                            fieldId: 'quantitynew',
                            value: action.quantity
                        });
                    }

                    change_order.setCurrentSublistValue({
                        sublistId: 'subline',
                        fieldId: 'apply',
                        value: true
                    });

                    change_order.commitLine({ sublistId: 'subline' });
                    line_updated = true;

                    return false; // break
                }
            } else {
                const subscription_line_apply = change_order.getCurrentSublistValue({
                    sublistId: 'subline',
                    fieldId: 'apply'
                });

                if (!subscription_line_apply) {
                    change_order.setCurrentSublistValue({
                        sublistId: 'subline',
                        fieldId: 'apply',
                        value: true
                    });

                    line_updated = true;
                }
            }
        });

        if (line_updated) {
            change_order.save();
        }

        return line_updated;
    }

    private processSubscriptionAction(action: any) {
        const change_orders: any = this.searchExistingChangeOrders(null, true, null, true);
        const status = this.subscriptionRecord.getValue({ fieldId: 'billingsubscriptionstatus' });
        let change_order;
        let status_from;

        if (action === 'SUSPEND') {
            status_from = 'ACTIVE';
            const can_be_suspended =
                status === 'ACTIVE' &&
                this.configuration.get('subscriptions.generalStatusChange') !==
                    "Don't Allow Status Changes" &&
                !_.find(change_orders, co => {
                    return (
                        co.getValue({ fieldId: 'action' }) !== 'SUSPEND' ||
                        this.noActiveLinesInChangeOrder(co, 'SUSPEND')
                    );
                });
            if (!can_be_suspended) {
                throw 'This subscription cannot be suspended. Try again tomorrow or contact your sales representative.';
            }
            change_order = _.find(change_orders, function(co) {
                return co.getValue({ fieldId: 'action' }) === 'SUSPEND';
            });
        } else if (action === 'REACTIVATE') {
            status_from = 'SUSPENDED';
            const can_be_reactivated =
                status === 'SUSPENDED' &&
                this.configuration.get('subscriptions.generalStatusChange') ===
                    'Allow Suspending / Resuming' &&
                !_.find(change_orders, co => {
                    return (
                        co.getValue({ fieldId: 'action' }) !== 'REACTIVATE' ||
                        this.noActiveLinesInChangeOrder(co, 'REACTIVATE')
                    );
                });
            if (!can_be_reactivated) {
                throw 'This subscription cannot be reactivated. Try again tomorrow or contact your sales representative.';
            }
            change_order = _.find(change_orders, function(co) {
                return co.getValue({ fieldId: 'action' }) === 'REACTIVATE';
            });
        }

        if (!change_order) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            change_order = record.create({
                type: record.Type.SUBSCRIPTION_CHANGE_ORDER,
                isDynamic: true,
                defaultValues: {
                    action: action,
                    subscription: this.subscriptionRecord.id,
                    effectivedate: format.format({ value: tomorrow, type: format.Type.DATE })
                }
            });
        }

        const count = change_order.getLineCount({
            sublistId: 'subline'
        });

        for (let i = 0; i < count; i++) {
            change_order.selectLine({
                sublistId: 'subline',
                line: i
            });

            if (
                change_order.getCurrentSublistValue({
                    sublistId: 'subline',
                    fieldId: 'status'
                }) == status_from
            ) {
                change_order.setCurrentSublistValue({
                    sublistId: 'subline',
                    fieldId: 'apply',
                    value: true
                });

                change_order.commitLine({ sublistId: 'subline' });
            }
        }

        change_order.save();
    }

    private performAction(action_request: any, lineId: any, currentLineStatus: any) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const change_order_not_action = this.searchExistingChangeOrders(
            action_request.action,
            false
        );

        _.each(change_order_not_action, (change_order: any) => {
            this.checkChangeOrderIsNotForLine(change_order.getValue('internalid'), lineId, true);
        });

        const change_order_for_update: any = this.searchExistingChangeOrders(
            action_request.action,
            true
        );

        if (change_order_for_update && change_order_for_update.length > 0) {
            this.updateExistantChangeOrder(
                { changeOrderId: change_order_for_update[0].id, quantity: action_request.quantity },
                lineId
            );
        } else {
            let new_change_order;

            new_change_order = record.create({
                type: record.Type.SUBSCRIPTION_CHANGE_ORDER,
                isDynamic: true,
                defaultValues: {
                    action: action_request.action,
                    subscription: this.subscriptionRecord.id,
                    effectivedate: format.format({ value: tomorrow, type: format.Type.DATE })
                }
            });

            new_change_order.selectLine({
                sublistId: 'subline',
                line: action_request.lineNumber - 1
            });

            new_change_order.setCurrentSublistValue({
                sublistId: 'subline',
                fieldId: 'quantitynew',
                value: action_request.quantity
            });

            new_change_order.setCurrentSublistValue({
                sublistId: 'subline',
                fieldId: 'apply',
                value: true
            });

            new_change_order.commitLine({ sublistId: 'subline' });
            new_change_order.save();
        }
    }
}