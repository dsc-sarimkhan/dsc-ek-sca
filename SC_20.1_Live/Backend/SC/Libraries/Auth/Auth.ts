/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as runtime from 'N/runtime';
import { User } from './User';
import '../../../third_parties/underscore.js';

export const { Permission } = runtime;

type PermissionRule = { [K in runtime.Permission]: string[][] };

export interface PermissionList<T = runtime.Permission> {
    transaction: {
        tranCashSale: T;
        tranCustCred: T;
        tranCustDep: T;
        tranCustPymt: T;
        tranStatement: T;
        tranCustInvc: T;
        tranItemShip: T;
        tranSalesOrd: T;
        tranEstimate: T;
        tranRtnAuth: T;
        tranDepAppl: T;
        tranSalesOrdFulfill: T;
        tranFind: T;
        tranPurchases: T;
        tranPurchasesReturns: T;
    };
    lists: {
        regtAcctRec: T;
        regtNonPosting: T;
        listCase: T;
        listContact: T;
        listCustJob: T;
        listCompany: T;
        listIssue: T;
        listCustProfile: T;
        listExport: T;
        listFind: T;
        listCrmMessage: T;
    };
}

class Auth {
    private permissions: PermissionList<string[]> = {
        transaction: {
            tranCashSale: ['TRAN_CASHSALE'],
            tranCustCred: ['TRAN_CUSTCRED'],
            tranCustDep: ['TRAN_CUSTDEP'],
            tranCustPymt: ['TRAN_CUSTPYMT'],
            tranStatement: ['TRAN_STATEMENT'],
            tranCustInvc: ['TRAN_CUSTINVC'],
            tranItemShip: ['TRAN_ITEMSHIP'],
            tranSalesOrd: ['TRAN_SALESORD'],
            tranEstimate: ['TRAN_ESTIMATE'],
            tranRtnAuth: ['TRAN_RTNAUTH'],
            tranDepAppl: ['TRAN_DEPAPPL'],
            tranSalesOrdFulfill: ['TRAN_SALESORDFULFILL'],
            tranFind: ['TRAN_FIND'],
            tranPurchases: ['TRAN_SALESORD', 'TRAN_CUSTINVC', 'TRAN_CASHSALE'],
            tranPurchasesReturns: ['TRAN_RTNAUTH', 'TRAN_CUSTCRED']
        },
        lists: {
            regtAcctRec: ['REGT_ACCTREC'],
            regtNonPosting: ['REGT_NONPOSTING'],
            listCase: ['LIST_CASE'],
            listContact: ['LIST_CONTACT'],
            listCustJob: ['LIST_CUSTJOB'],
            listCompany: ['LIST_COMPANY'],
            listIssue: ['LIST_ISSUE'],
            listCustProfile: ['LIST_CUSTPROFILE'],
            listExport: ['LIST_EXPORT'],
            listFind: ['LIST_FIND'],
            listCrmMessage: ['LIST_CRMMESSAGE']
        }
    };

    private permissionRules: { [propertyKey: string]: PermissionRule } = { construct: {} };

    private partialPermissionRules: { [propertyKey: string]: PermissionRule } = { construct: {} };

    private loginRules: { [propertyKey: string]: boolean } = { construct: false };

    private user: User = User.getInstance();

    public addPartialPermissionRules(
        rule: PermissionRule,
        propertyKey: string = 'construct'
    ): void {
        this.partialPermissionRules[propertyKey] = rule;
    }

    public addPermissionRules(rule: PermissionRule, propertyKey: string = 'construct'): void {
        this.permissionRules[propertyKey] = rule;
    }

    public addLoginRules(propertyKey: string = 'construct'): void {
        this.loginRules[propertyKey] = true;
    }

    public validatePermissions(propertyKey: string): boolean {
        const evaluationsPartial = this.evaluate([
            this.partialPermissionRules[propertyKey],
            this.partialPermissionRules.construct
        ]);
        const evaluations = this.evaluate([
            this.permissionRules[propertyKey],
            this.permissionRules.construct
        ]);
        return (
            evaluations.every((evaluation: boolean): boolean => evaluation) &&
            (!evaluationsPartial.length ||
                evaluationsPartial.some((evaluation: boolean): boolean => evaluation))
        );
    }

    // eslint-disable-next-line class-methods-use-this
    private evaluate(rules: PermissionRule[]): boolean[] {
        return _.flatten(
            rules.map(
                (rule: PermissionRule): boolean[][] =>
                    _.map(
                        rule,
                        (permissionsArray: string[][], permissionLevel: string): boolean[] =>
                            // Check if all permissions in permissionsArray
                            // match the permissionLevel (for the
                            // propertyKey and the constructor)
                            permissionsArray.map(
                                (permission): boolean => {
                                    return (
                                        this.user.getPermission(permission) >=
                                        Number(permissionLevel)
                                    );
                                }
                            )
                    )
            )
        );
    }

    public validateLogin(propertyKey: string): boolean {
        const required = !!this.loginRules[propertyKey] || !!this.loginRules.construct;
        return required ? this.user.isLoggedIn() : true;
    }

    public getPermissions(): PermissionList<string[]> {
        return this.permissions;
    }
}

const auth = new Auth();

// permission decorator
export function requirePermissions(rule: PermissionRule): Function {
    return function(constructor: any, propertyKey?: string, descriptor?: PropertyDescriptor): void {
        auth.addPermissionRules(rule, propertyKey);
    };
}

// permission decorator
export function requireAtLeastOnePermission(rule: PermissionRule): Function {
    return function(constructor: any, propertyKey?: string, descriptor?: PropertyDescriptor): void {
        auth.addPartialPermissionRules(rule, propertyKey);
    };
}

// login decorator
export function requireLogin(): Function {
    return function(constructor: any, propertyKey?: string, descriptor?: PropertyDescriptor): void {
        auth.addLoginRules(propertyKey);
    };
}

export default auth;