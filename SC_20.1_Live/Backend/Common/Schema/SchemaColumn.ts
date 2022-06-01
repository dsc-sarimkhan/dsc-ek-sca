/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { FieldValue } from '../ActiveRecord/ActiveRecord';
import { SearchColumnSummary } from '../SearchRecord/Search';

export class SchemaColumn<T = FieldValue> {
    public columnName: string;

    public formula: string;

    public summary: SearchColumnSummary;

    public constructor(columnName: string, formula?: string, summary?: SearchColumnSummary) {
        this.columnName = columnName;
        this.formula = formula;
        this.summary = summary;
    }
}