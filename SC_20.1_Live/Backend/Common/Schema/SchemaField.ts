/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { FieldValue } from '../ActiveRecord/ActiveRecord';

export class SchemaField<T = FieldValue> {
    public fieldId: string;

    public constructor(fieldId: string) {
        this.fieldId = fieldId;
    }
}