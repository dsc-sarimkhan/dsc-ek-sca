/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { FieldValue } from '../ActiveRecord/ActiveRecord';

export class SchemaSublistField<T = FieldValue> {
    public fieldId: string;

    public sublistId: string;

    public constructor(fieldId: string, sublistId?: string) {
        this.fieldId = fieldId;
        this.sublistId = sublistId;
    }
}